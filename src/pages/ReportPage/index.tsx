import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Upload, Button, Card, Table, message, Spin, Empty, Cascader, Layout, Modal, Select } from 'antd';
import { InboxOutlined, FileTextOutlined, BarChartOutlined, SearchOutlined } from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/client';
import reportCategories from '../../../config/reportCategories';
import './style.css';

const { Dragger } = Upload;
const { Content } = Layout;

import { ColumnType } from 'antd/es/table';

interface ReportFile {
  id: string;
  fileName: string;
  reportCategory: string;
  reportType: string;
  reportDateRange?: string; // 新增报告日期区间字段
  uploadedAt: string;
  createdAt?: string; // 可选字段，后端可能返回
}

const ReportPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState<ReportFile[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedReportCategory, setSelectedReportCategory] = useState<string>('');
  const [selectedReportType, setSelectedReportType] = useState<string>('');
  const [filteredReports, setFilteredReports] = useState<ReportFile[]>([]);
  const [uploadModalVisible, setUploadModalVisible] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string[]>([]);



  const data = [
    { campaignName: '活动1', spend: 100, sales: 200 },
    { campaignName: '活动2', spend: 150, sales: 300 },
    { campaignName: '活动3', spend: 200, sales: 400 },
  ];
 

  useEffect(() => {
    if (isAuthenticated) {
      fetchReports();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    setFilteredReports(reports);
  }, [reports]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/api/reports/list'); 
      // 检查返回的数据是否为空或未定义
      if (!response.data || !response.data.reports) {
        setReports([]);
        setFilteredReports([]);
        return;
      }
      // 对报告按上传时间倒序排序
      const sortedReports = [...response.data.reports].sort((a, b) => 
        new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
      );
      setReports(sortedReports);
      setFilteredReports(sortedReports);
    } catch (error: any) {
      // 根据错误类型静默处理
      if (error.errorType === 'not_found') {
        setReports([]);
        setFilteredReports([]);
      } else {
        setReports([]);
        setFilteredReports([]);
      }
    } finally {
      setLoading(false);
    }
  };



  const filterReports = (category: string, type: string) => {
    const filtered = reports.filter(report => {
      const matchCategory = category ? report.reportCategory === category : true;
      const matchType = type ? report.reportType === type : true;
      return matchCategory && matchType;
    });
    // 确保过滤后的报告仍然按上传时间倒序排序
    const sortedFiltered = [...filtered].sort((a, b) => 
      new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    );
    setFilteredReports(sortedFiltered);
  };

  const showUploadModal = () => {
    setUploadModalVisible(true);
  };

  const handleUploadModalCancel = () => {
    setUploadModalVisible(false);
    setSelectedCategory([]);
    setSelectedReportCategory('');
    setSelectedReportType('');
  };

  const uploadProps = {
    name: 'file',
    multiple: false,
    action: `${apiClient.defaults.baseURL}/api/reports/upload`, // 路径已包含/api前缀，不需要重复添加
    accept: '.csv,.xlsx,.xls',
    showUploadList: false,
    data: (file: any) => ({
      reportCategory: selectedCategory[0] || '',
      reportType: selectedCategory[1] || '',
      fileName: encodeURIComponent(file.name || '') // 安全处理文件名
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

  const columns: ColumnType<ReportFile>[] = [
    {
      title: '报表名称',
      dataIndex: 'fileName',
      key: 'fileName',
      render: (text: string) => (
        <span>
          <FileTextOutlined style={{ marginRight: 8 }} />
          {text}
        </span>
      )
    },
    {
      title: '报表类别',
      dataIndex: 'reportCategory',
      key: 'reportCategory',
      render: (text: string) => {
        const categoryMap: Record<string, string> = {
          'advertising': '广告报告',
          'sales': '销售报告',
          'performance': '绩效报告'
        };
        return categoryMap[text] || text;
      }
    },
    {
      title: '报表类型',
      dataIndex: 'reportType',
      key: 'reportType',
      render: (text: string) => {
        const typeMap: Record<string, string> = {
          'SEARCH_TERM_REPORT': '搜索词报告',
          'CAMPAIGN_REPORT': '广告活动报告',
          'TARGETING_REPORT': '定向报告',
          'BUSINESS_REPORT': '业务报告',
          'INVENTORY_REPORT': '库存报告',
          'PERFORMANCE_REPORT': '绩效概览报告',
          'TRAFFIC_REPORT': '流量报告'
        };
        return typeMap[text] || text;
      }
    },
    {
      title: '日期区间',
      dataIndex: 'reportDateRange',
      key: 'reportDateRange',
      render: (text: string) => text || '未知日期'
    },
    {
      title: '上传时间',
      dataIndex: 'uploadedAt',
      key: 'uploadedAt',
      render: (text: string) => new Date(text).toLocaleString('zh-CN'),
      sorter: (a: ReportFile, b: ReportFile) => new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime(),
      defaultSortOrder: 'descend' as 'descend'
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: ReportFile) => (
        <Button 
          type="link" 
          icon={<BarChartOutlined />}
          onClick={() => handleViewReport(record.id)}
        >
          查看分析
        </Button>
      )
    }
  ];

  const handleViewReport = (reportId: string) => {
    // 使用navigate函数替代window.location.href
    navigate(`/report/detail/${reportId}`);
  };



  return (
    <Layout className="report-page">
     
      <Content className="report-content">
        <Card className="reports-card">
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
                <Col>
                  <Row gutter={[16, 8]} align="middle">
                    <Col flex="none">
                      <Select
                        placeholder="选择报告类别"
                        style={{ width: 180 }}
                        value={selectedReportCategory}
                        onChange={(value) => setSelectedReportCategory(value)}
                        options={reportCategories.map(cat => ({ value: cat.value, label: cat.label }))}
                      />
                    </Col>
                    <Col flex="none">
                      <Select
                        placeholder="选择报告类型"
                        style={{ width: 180 }}
                        value={selectedReportType}
                        onChange={(value) => setSelectedReportType(value)}
                        options={selectedReportCategory 
                          ? reportCategories
                              .find(cat => cat.value === selectedReportCategory)?.children || []
                          : []}
                        notFoundContent={!selectedReportCategory ? "请先选择报告类别" : "无可用报告类型"}
                        disabled={!selectedReportCategory}
                        allowClear
                        popupMatchSelectWidth={true}
                        showSearch={false}
                      />
                    </Col>
                    <Col flex="none">
                      <Button 
                        type="primary" 
                        icon={<SearchOutlined />}
                        onClick={() => filterReports(selectedReportCategory, selectedReportType)}
                      >
                        查询
                      </Button>
                    </Col>
                  </Row>
                </Col>
                <Col>
                  <Button type="primary" icon={<InboxOutlined />} onClick={showUploadModal}>
                    上传报表
                  </Button>
                </Col>
              </Row>
            </Col>
            <Col span={24}>
              {loading ? (
                <div className="loading-container">
                  <Spin size="large" />
                </div>
              ) : filteredReports.length > 0 ? (
                <Table 
                  dataSource={filteredReports} 
                  columns={columns} 
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                />
              ) : (
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
              )}
            </Col>
          </Row>
        </Card>

        <Modal
          title="上传报表"
          open={uploadModalVisible}
          onCancel={handleUploadModalCancel}
          footer={null}
          width={520}
        >
          <div style={{ marginBottom: 16 }}>
            <Cascader
              options={reportCategories}
              placeholder="请选择报告分类"
              value={selectedCategory}
              onChange={(value) => setSelectedCategory(value as string[])}
              expandTrigger="hover"
              style={{ width: '100%' }}
            />
          </div>
          <Dragger {...uploadProps} className="report-uploader">
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
            <p className="ant-upload-hint">
              支持Excel和CSV格式的报表文件上传，请确保文件格式正确
            </p>
          </Dragger>
        </Modal>
      </Content>
    </Layout>
  );
};

export default ReportPage;