import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Spin, Empty, message, Button } from 'antd';
import { ArrowLeftOutlined, FileTextOutlined } from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/client';
import MainLayout from '../../components/layout/MainLayout';
import './style.css';

// 引入 Ant Design Pro 组件
import { ProTable } from '@ant-design/pro-components';
import type { ProColumns, ActionType } from '@ant-design/pro-components';
import { formatNumber } from '../../utils/formatters';

interface ReportDetail {
  id: string;
  fileName: string;
  fileType: string;
  uploadedAt: string;
  reportDateRange: string;
  reportCategory: string;
  reportType: string;
}

// 原始数据接口，使用动态类型因为原始数据结构不固定
interface RawData {
  [key: string]: any;
}

const RawDataPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const actionRef = useRef<ActionType>();
  const [report, setReport] = useState<ReportDetail | null>(null);
  const [rawData, setRawData] = useState<RawData[]>([]);
  const [rawDataColumns, setRawDataColumns] = useState<ProColumns<RawData>[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  useEffect(() => {
    if (isAuthenticated && id) {
      fetchReportData();
    }
  }, [isAuthenticated, id]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(`/api/reports/raw-data/${id}`);
      
      // 处理报表元数据
      if (response.data?.report) {
        setReport(response.data.report);
      } else {
        setReport({
          id: id || '',
          fileName: '报表数据',
          fileType: '',
          uploadedAt: '',
          reportDateRange: '',
          reportCategory: '',
          reportType: ''
        });
      }

      // 处理原始数据
      if (response.data?.rawData && Array.isArray(response.data.rawData)) {
        setRawData(response.data.rawData); 
        if (response.data.rawData.length > 0) {
          const firstRow = response.data.rawData[0];
          const columns: ProColumns<RawData>[] = Object.keys(firstRow).map(key => {
            return ({
              title: key,
              dataIndex: key,
              key: key,
              ellipsis: true,
              width: 150,
              render: (value) => {                
                // 如果是React元素，尝试获取其实际值
                if (React.isValidElement(value)) {                  
                  // 尝试从React元素的props中获取实际值
                  // 先检查children属性
                  if (value.props?.children !== undefined) {
                    const reactValue = value.props.children; 
                    // 只处理数值类型
                    if (typeof reactValue === 'number') {
                      return formatNumber(reactValue, key);
                    } 
                    /*else if (typeof reactValue === 'string' && !isNaN(parseFloat(reactValue)) && reactValue.trim() !== '') {
                      // 只有能转换为数值的字符串才格式化
                      return formatNumber(parseFloat(reactValue), key);
                    } */
                    else {
                      // 非数值类型直接返回原值
                      return reactValue;
                    }
                  }
                  
                  // 检查value属性
                  if (value.props?.value !== undefined) {
                    const reactValue = value.props.value;                    
                    // 只处理数值类型
                    if (typeof reactValue === 'number') {
                      return formatNumber(reactValue, key);
                    } 
                    /*else if (typeof reactValue === 'string' && !isNaN(parseFloat(reactValue)) && reactValue.trim() !== '') {
                      // 只有能转换为数值的字符串才格式化
                      return formatNumber(parseFloat(reactValue), key);
                    } */
                    else {
                      // 非数值类型直接返回原值
                      return reactValue;
                    }
                  }
                  
                  // 如果无法获取值，则返回原始元素的字符串表示
                  return '[React元素]';
                }
                
                // 如果是null或undefined，返回'-'
                if (value === null || value === undefined) {
                  return '-';
                }
                
                // 处理数字类型
                if (typeof value === 'number') {
                  return formatNumber(value, key);
                }

                // 处理可以转换为数字的字符串
                if (typeof value === 'string' && !isNaN(parseFloat(value)) && value.trim() !== '') {
                  try {
                    const numValue = parseFloat(value);
                    return formatNumber(numValue, key);
                  } catch (e) {
                    // 转换失败时返回原始值
                    return value;
                  }
                }

                // 处理对象和其他类型，直接返回原始值
                return typeof value === 'object' 
                  ? JSON.stringify(value)
                  : String(value);
              },
              sorter: (a, b) => {
                if (typeof a[key] === 'number' && typeof b[key] === 'number') {
                  return a[key] - b[key];
                }
                if (typeof a[key] === 'string' && typeof b[key] === 'string') {
                  return a[key].localeCompare(b[key]);
                }
                return 0;
              },
            });
          });
          setRawDataColumns(columns);
          }
      } else {
        setRawData([]);
        setRawDataColumns([]);
      }

    } catch (error: any) {
      message.error('获取数据失败');
      console.error('Error fetching combined data:', error);
      setReport(null);
      setRawData([]);
      setRawDataColumns([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/reports');
  };

  return (
    <MainLayout title="" subTitle="查看报表原始数据">
      <div className="report-detail-container">
        <div className="report-header">
          <Button 
            type="link" 
            icon={<ArrowLeftOutlined />} 
            onClick={handleBack}
            style={{ marginRight: '10px' }}
          >
            返回报表列表
          </Button>
          {report && (
            <h2>
              <FileTextOutlined style={{ marginRight: '8px' }} />
              {report.fileName}
            </h2>
          )}
        </div>

        {loading ? (
          <div className="loading-container">
            <Spin size="large" />
            <p>加载数据中...</p>
          </div>
        ) : rawData.length > 0 ? (
          <div className="raw-data-table">
            <ProTable<RawData>
              headerTitle="原始数据"
              actionRef={actionRef}
              rowKey={(record) => {
                if (record?.id) return record.id.toString();
                if (record?.key) return record.key.toString();
                if (record?.uuid) return record.uuid.toString();
                
                const objKeys = Object.keys(record);
                if (objKeys.length > 0) {
                  const combinedValues = objKeys.slice(0, 5).map(k => record[k] || '').join('_');
                  const hashValue = Array.from(combinedValues).reduce((acc, char) => acc + char.charCodeAt(0), 0);
                  return `${combinedValues}_${hashValue.toString(36).slice(-6)}`;
                }
                return Math.random().toString(36).substr(2, 9);
              }}
              search={false}
              options={{
                density: false,
                fullScreen: true,
                reload: () => fetchReportData(),
                setting: true,
              }}
              pagination={{
                pageSize: pageSize,
                current: currentPage,
                showSizeChanger: true,
                showQuickJumper: true,
                pageSizeOptions: [10, 20, 50, 100],
                showTotal: (total) => `共 ${total} 条记录`,
                onChange: (page, size) => {
                  // 处理页码和每页条数变化
                  setCurrentPage(page);
                  setPageSize(size);
                  // 使用actionRef重新加载数据或更新视图
                  actionRef.current?.reload();
                }
              }}
              scroll={{ x: 'max-content' }}
              dataSource={rawData}
              columns={rawDataColumns}
              dateFormatter="string"
            />
          </div>
        ) : (
          <Empty description="暂无原始数据" />
        )}
      </div>
    </MainLayout>
  );
};

export default RawDataPage;