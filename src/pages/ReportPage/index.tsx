import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Button, message, Empty } from 'antd';
import { InboxOutlined, FileTextOutlined, BarChartOutlined, FileSearchOutlined } from '@ant-design/icons';
import { ProTable, ModalForm, ProFormCascader } from '@ant-design/pro-components';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/client';
import reportCategories from '../../../config/reportCategories';
import MainLayout from '../../components/layout/MainLayout';
import './style.css';

const { Dragger } = Upload;

interface ReportFile {
  id: string;
  fileName: string;
  reportCategory: string;
  reportType: string;
  reportDateRange?: string;
  uploadedAt: string;
  createdAt?: string;
}

const ReportPageWithLayout: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const actionRef = useRef<ActionType>();
  const [reports, setReports] = useState<ReportFile[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [uploadModalVisible, setUploadModalVisible] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string[]>([]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchReports();
    }
  }, [isAuthenticated]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/api/reports/list'); 
      if (!response.data || !response.data.reports) {
        setReports([]);
        return;
      }
      const sortedReports = [...response.data.reports].sort((a, b) => 
        new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
      );
      setReports(sortedReports);
    } catch (error: any) {
      if (error.errorType === 'not_found') {
        setReports([]);
      } else {
        setReports([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const showUploadModal = () => {
    setUploadModalVisible(true);
  };

  const handleUploadModalCancel = () => {
    setUploadModalVisible(false);
    setSelectedCategory([]);
  };

  const uploadProps = {
    name: 'file',
    multiple: false,
    action: `${apiClient.defaults.baseURL}/api/reports/upload`,
    accept: '.csv,.xlsx,.xls',
    showUploadList: false,
    data: (file: any) => ({
      reportCategory: selectedCategory[0] || '',
      reportType: selectedCategory[1] || '',
      fileName: encodeURIComponent(file.name || '')
    }),
    beforeUpload: (file: File) => {
      const isValidType = file.type === 'text/csv' || 
                         file.name.endsWith('.csv') ||
                         file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                         file.type === 'application/vnd.ms-excel' ||
                         file.name.endsWith('.xlsx') ||
                         file.name.endsWith('.xls');
                         
      if (!isValidType) {
        message.error('只能上传 Excel 或 CSV 文件!');
        return Upload.LIST_IGNORE;
      }
      if (selectedCategory.length < 2) {
        message.error('请先选择报告类别和类型!');
        return Upload.LIST_IGNORE;
      }
      return true;
    },
    onChange: (info: any) => {
      if (info.file.status === 'uploading') {
        setLoading(true);
        return;
      }
      if (info.file.status === 'done') {
        setLoading(false);
        message.success(`${info.file.name} 上传成功`);
        handleUploadModalCancel();
        fetchReports();
        actionRef.current?.reload();
      } else if (info.file.status === 'error') {
        setLoading(false);
        const errorMessage = info.file.response?.message || '上传失败';
        message.error(`${info.file.name} ${errorMessage}`);
      }
    },
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  };

  const handleViewReport = (reportId: string) => {
    const report = reports.find(r => r.id === reportId);
    
    if (report) {
      if (report.reportType === 'AD_PLACEMENT_REPORT') {
        navigate(`/report/ad-placement/${reportId}`);
      } else if (report.reportType === 'SEARCH_TERM_REPORT')  {
        navigate(`/report/st-detail/${reportId}`);
      }
    } else {
      navigate(`/report/st-detail/${reportId}`);
    }
  };

  // 处理查看原始数据
  const handleViewRawData = (reportId: string) => {
    // 根据报表ID跳转到原始数据页面
    // 这里假设所有报表类型都使用同一个原始数据查看路径
    navigate(`/report/raw-data/${reportId}`);
  };

  // 定义ProTable的列
  const columns: ProColumns<ReportFile>[] = [
    {
      title: '报表名称',
      dataIndex: 'fileName',
      width: '25%',
      valueType: 'text',
      fieldProps: {
        prefix: <FileTextOutlined />
      },
      ellipsis: {
        showTitle: true
      },
    },
    {
      title: '报表类别',
      dataIndex: 'reportCategory',
      valueEnum: {
        'sp': { text: '商品推广' },
        'sb': { text: '品牌推广' },
        'sd': { text: '展示型推广' }
      },
      filters: true,
      filterMultiple: true,
      valueType: 'text',
      fieldProps: {
        options: reportCategories.map(cat => ({ value: cat.value, label: cat.label }))
      }
    },
    {
      title: '报表类型',
      dataIndex: 'reportType',
      valueEnum: {
        'SEARCH_TERM_REPORT': { text: '搜索词报告' },
        'CAMPAIGN_REPORT': { text: '广告活动报告' },
        'TARGETING_REPORT': { text: '定向报告' },
        'BUSINESS_REPORT': { text: '业务报告' },
        'INVENTORY_REPORT': { text: '库存报告' },
        'PERFORMANCE_REPORT': { text: '绩效概览报告' },
        'TRAFFIC_REPORT': { text: '流量报告' },
        'AD_PLACEMENT_REPORT': { text: '广告位报告' },
      },
      filters: true,
      filterMultiple: false,
      valueType: 'text',
      fieldProps: {
        options: reportCategories.flatMap(cat => 
          cat.children?.map(type => ({ value: type.value, label: type.label })) || []
        )
      }
    },
    {
      title: '日期区间',
      dataIndex: 'reportDateRange',
      width: '20%',
      valueType: 'text',
      ellipsis: {
        showTitle: true
      },
    },
    {
      title: '上传时间',
      dataIndex: 'uploadedAt',
      width: '18%',
      valueType: 'dateTime',
      sorter: true,
      defaultSortOrder: 'descend',
    },
    {
      title: '操作',
      valueType: 'option',
      render: (_, record) => [
        <Button 
        key="rawData"
        type="link" 
        icon={<FileSearchOutlined />}
        onClick={() => handleViewRawData(record.id)}
        >
        原始数据
        </Button>,
        <Button 
          key="view"
          type="link" 
          icon={<BarChartOutlined />}
          onClick={() => handleViewReport(record.id)}
        >
          查看分析
        </Button>,
       
      ],
    },
  ];
  return (
    <MainLayout title="" subTitle="查看和管理您的所有报表">
          <ProTable<ReportFile>
            headerTitle="报表列表"
            actionRef={actionRef}
            rowKey="id"
            search={false}
            options={{
              density: false,
              fullScreen: false,
              reload: false,
              setting: true,
            }}
            cardProps={{
              bodyStyle: { padding: '0px', margin: 0,},
              style: { padding:0,margin:0,},
            }}
            toolBarRender={() => [
              <Button 
                key="upload" 
                type="primary" 
                icon={<InboxOutlined />} 
                onClick={showUploadModal}
              >
                上传报表
              </Button>,
            ]}
            dataSource={reports}
            columns={columns}
            loading={loading}
            onChange={(_, _filter, sorter) => {
              // 处理排序逻辑
              if (sorter && typeof sorter === 'object' && !Array.isArray(sorter)) {
                const { field, order } = sorter;
                const sortedData = [...reports];
                if (field === 'uploadedAt') {
                  sortedData.sort((a, b) => {
                    const aTime = new Date(a.uploadedAt || a.createdAt || '').getTime();
                    const bTime = new Date(b.uploadedAt || b.createdAt || '').getTime();
                    return order === 'ascend' ? aTime - bTime : bTime - aTime;
                  });
                  setReports(sortedData);
                }
              }
            }}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
            }}
            dateFormatter="string"
           
            locale={{
              emptyText: (
                <Empty 
                  description={
                    <span>
                      暂无报表数据
                      <br />
                      <Button type="link" onClick={showUploadModal}>
                        点击上传报表
                      </Button>
                    </span>
                  }
                  image={Empty.PRESENTED_IMAGE_SIMPLE} 
                />
              )
            }}
          />
       

        <ModalForm
          title="上传报表"
          open={uploadModalVisible}
          onOpenChange={setUploadModalVisible}
          submitter={false}
          modalProps={{
            destroyOnClose: true,
            onCancel: handleUploadModalCancel,
            width: 520,
          }}
        >
          <ProFormCascader
            name="reportCategory"
            label="报告分类"
            placeholder="请选择报告分类"
            fieldProps={{
              options: reportCategories,
              expandTrigger: 'hover',
              value: selectedCategory,
              onChange: (value) => setSelectedCategory(value as string[]),
              style: { width: '100%' },
            }}
            rules={[{ required: true, message: '请选择报告分类' }]}
          />
          
          <div style={{ marginTop: 16 }}>
            <Dragger {...uploadProps} className="report-uploader">
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
              <p className="ant-upload-hint">
                支持Excel和CSV格式的报表文件上传，请确保文件格式正确
              </p>
            </Dragger>
          </div>
        </ModalForm>
    </MainLayout>
  );
};

export default ReportPageWithLayout;