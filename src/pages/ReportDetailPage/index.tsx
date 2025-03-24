import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Typography, Card, Table, Row, Col, Statistic, Button, Spin, Empty, message, Tabs } from 'antd';
import { ArrowLeftOutlined, LineChartOutlined, EyeOutlined } from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/client';
import { formatPercentage, formatCurrency } from '../../utils/formatters';
import CampaignPerformanceChart from '../../components/report/CampaignPerformanceChart';
import './style.css';


const { Title } = Typography;

interface CampaignData {
  campaignName: string;
  impressions: number;
  clicks: number;
  spend: number;
  sales: number;
  orders: number;
  acos: number;
  roas: number;
  ctr: number;
  conversionRate: number;
  cpc: number;
}

interface ReportSummary {
  totalImpressions: number;
  totalClicks: number;
  totalSpend: number;
  totalSales: number;
  totalOrders: number;
  ctr: string;
  acos: string;
  conversionRate: string;
  cpc: string;
}

interface ReportDetail {
  id: string;
  fileName: string;
  fileType: string;
  uploadedAt: string;
  reportDateRange: string;
}

interface KeywordData {
  id: string;
  keyword: string;
  impressions: number;
  clicks: number;
  orders: number;
  ctr: number;
  cvr: number;
  spend: number;
  sales: number;
}

interface QuadrantData {
  starKeywords: KeywordData[];
  problemKeywords: KeywordData[];
  potentialKeywords: KeywordData[];
  ineffectiveKeywords: KeywordData[];
  avgCTR: number;
  avgCVR: number;
}

const ReportDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [report, setReport] = useState<ReportDetail | null>(null);
  const [campaignData, setCampaignData] = useState<CampaignData[]>([]);
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [quadrantData, setQuadrantData] = useState<QuadrantData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [quadrantLoading, setQuadrantLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [campaignPageSize, setCampaignPageSize] = useState<number>(10);
  const [campaignCurrentPage, setCampaignCurrentPage] = useState<number>(1);
  const [keywordPageSize, setKeywordPageSize] = useState<number>(10);
  const [keywordCurrentPage, setKeywordCurrentPage] = useState<number>(1);

  useEffect(() => {
    if (isAuthenticated && id) {
      fetchReportDetail(id);
    }
  }, [isAuthenticated, id]);
  
  useEffect(() => {
    if (activeTab === 'quadrant' && isAuthenticated && id && !quadrantData) {
      fetchQuadrantData(id);
    }
  }, [activeTab, isAuthenticated, id, quadrantData]);


  const fetchQuadrantData = async (reportId: string) => {
    setQuadrantLoading(true);
    try {
      const response = await apiClient.get(`/api/search-terms/quadrant-analysis/${reportId}`);
      setQuadrantData(response.data.quadrantData);
      
    } catch (error: any) {
      if (error.response) {
        const status = error.response.status;
        const errorData = error.response.data;
        
        if (status === 404) {
          message.error('报表不存在或已被删除');
        } else if (status === 403) {
          message.error('您没有权限查看此报表');
        } else if (status === 401) {
          message.error('登录已过期，请重新登录');
        } else {
          message.error(errorData?.message || '获取搜索词四象限分析失败');
        }
      } else if (error.request) {
        message.error('服务器无响应，请检查网络连接');
      } else {
        message.error('请求配置错误，请稍后重试');
      }
    } finally {
      setQuadrantLoading(false);
    }
  };
  
  const fetchReportDetail = async (reportId: string) => {
    setLoading(true);
    try {
      const response = await apiClient.get(`/api/reports/campaign-summary/${reportId}`);
      
      // 添加数据预处理：转换数值字段
      const processedData = response.data.campaignData.map((item: any) => ({
        ...item,
        spend: Number(item.spend),
        sales: Number(item.sales),
        acos: Number(item.acos),
        conversionRate: Number(item.conversionRate)
      }));

      setReport(response.data.report);
      setCampaignData(processedData);
      setSummary(response.data.summary);
    } catch (error: any) {
      if (error.response) {
        // 服务器返回了错误响应
        const status = error.response.status;
        const errorData = error.response.data;
        
        if (status === 404) {
          message.error('报表不存在或已被删除');
        } else if (status === 403) {
          message.error('您没有权限查看此报表');
        } else if (status === 401) {
          message.error('登录已过期，请重新登录');
          // 可能需要重定向到登录页面
        } else {
          message.error(errorData?.message || '获取报表详情失败');
        }
      } else if (error.request) {
        // 请求已发出但没有收到响应
        message.error('服务器无响应，请检查网络连接');
      } else {
        // 请求配置出错
        message.error('请求配置错误，请稍后重试');
      }
      
      navigate('/reports');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: '广告活动',
      dataIndex: 'campaignName',
      key: 'campaignName',
      width: '20%',
      minWidth: 160,
      maxWidth: 240,
      ellipsis: true,
      fixed: 'left' as const,
    },
    {
      title: '展示量',
      dataIndex: 'impressions',
      key: 'impressions',
      align: 'right' as const,
      width: '8%',
      minWidth: 80,
      maxWidth: 120,
      sorter: (a: CampaignData, b: CampaignData) => a.impressions - b.impressions,
    },
    {
      title: '点击量',
      dataIndex: 'clicks',
      key: 'clicks',
      align: 'right' as const,
      sorter: (a: CampaignData, b: CampaignData) => a.clicks - b.clicks,
    },
    {
      title: '点击率',
      dataIndex: 'ctr',
      key: 'ctr',
      align: 'right' as const,
      render: (text: any) => formatPercentage(text),
      sorter: (a: CampaignData, b: CampaignData) => a.ctr - b.ctr,
    },
    {
      title: '花费',
      dataIndex: 'spend',
      key: 'spend',
      align: 'right' as const,
      render: (text: any) => formatCurrency(text),
      sorter: (a: CampaignData, b: CampaignData) => a.spend - b.spend,
    },
    {
      title: '销售额',
      dataIndex: 'sales',
      key: 'sales',
      align: 'right' as const,
      render: (text: any) => formatCurrency(text),
      sorter: (a: CampaignData, b: CampaignData) => a.sales - b.sales,
    },
    {
      title: '订单数',
      dataIndex: 'orders',
      key: 'orders',
      align: 'right' as const,
      sorter: (a: CampaignData, b: CampaignData) => a.orders - b.orders,
    },
    {
      title: 'ACOS',
      dataIndex: 'acos',
      key: 'acos',
      align: 'right' as const,
      render: (text: any) => formatPercentage(text),
      sorter: (a: CampaignData, b: CampaignData) => a.acos - b.acos,
    },
    {
      title: 'ROAS',
      dataIndex: 'roas',
      key: 'roas',
      align: 'right' as const,
      render: (text: any) => text,
      sorter: (a: CampaignData, b: CampaignData) => a.roas - b.roas,
    },
    {
      title: '转化率',
      dataIndex: 'conversionRate',
      key: 'conversionRate',
      align: 'right' as const,
      render: (text: any) => formatPercentage(text),
      sorter: (a: CampaignData, b: CampaignData) => a.conversionRate - b.conversionRate,
    },
    {
      title: 'CPC',
      dataIndex: 'cpc',
      key: 'cpc',
      align: 'right' as const,
      render: (text: any) => `¥${text}`,
      sorter: (a: CampaignData, b: CampaignData) => a.cpc - b.cpc,
    },
  ];

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" />
      </div>
    );
  }

  if (!report || !summary) {
    return (
      <Empty 
        description="未找到报表数据" 
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    );
  }

  return (
    <div className="report-detail-page">
      <div className="page-header">
        <Button 
          type="link" 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate('/reports')}
          className="back-button"
        >
          返回报表列表
        </Button>
        <Title level={5}>       
          {report.fileName}{' ---  '}
          日期区间: {report.reportDateRange || '未设置日期区间'}
        </Title>
      </div>
      
      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        className="report-tabs"
        type="card"
        items={[
          {
            key: 'overview',
            label: '概览',
            children: (
              <>
                <Row gutter={[24, 24]} className="summary-section">
                  <Col xs={24} sm={12} md={6}>
                    <Card>
                      <Statistic 
                        title="总展示量" 
                        value={summary.totalImpressions} 
                        prefix={<EyeOutlined />} 
                      />
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Card>
                      <Statistic 
                        title="总点击量" 
                        value={summary.totalClicks} 
                        prefix={<LineChartOutlined />} 
                      />
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Card>
                      <Statistic 
                        title="总花费" 
                        value={summary.totalSpend} 
                        precision={2} 
                        prefix="¥" 
                      />
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Card>
                      <Statistic 
                        title="总销售额" 
                        value={summary.totalSales} 
                        precision={2} 
                        prefix="¥" 
                      />
                    </Card>
                  </Col>
                </Row>

                <Row gutter={[24, 24]}>
                  <Col span={24}>
                    <Card title="性能指标" className="metrics-card">
                      <Row gutter={[16, 16]}>
                        <Col xs={12} sm={6}>
                          <Statistic 
                            title="点击率 (CTR)" 
                            value={summary.ctr} 
                            suffix="%"
                          />
                        </Col>
                        <Col xs={12} sm={6}>
                          <Statistic 
                            title="转化率" 
                            value={summary.conversionRate} 
                            suffix="%"
                          />
                        </Col>
                        <Col xs={12} sm={6}>
                          <Statistic 
                            title="平均点击成本" 
                            value={summary.cpc} 
                            prefix="¥" 
                            precision={2}
                          />
                        </Col>
                        <Col xs={12} sm={6}>
                          <Statistic 
                            title="平均ACOS" 
                            value={summary.acos} 
                            suffix="%"
                          />
                        </Col>
                      </Row>
                    </Card>
                  </Col>
                </Row>
              </>
            )
          },
          {
            key: 'details',
            label: '广告活动汇总',
            children: (
              <>
                <Row gutter={[24, 24]}>
                  <Col span={24}>   
                  <Card className="chart-container">
                    <CampaignPerformanceChart 
                      campaignData={campaignData} 
                      height={450} 
                      key={`chart-${activeTab}`} // 添加key属性，确保在Tab切换时重新渲染
                    />
                  </Card>                 
                    
                  </Col>
                </Row>

                <Card className="data-table-card">
                  <Table 
                    dataSource={campaignData} 
                    columns={columns} 
                    rowKey="campaignName"
                    pagination={{ 
                      pageSize: campaignPageSize,
                      current: campaignCurrentPage,
                      showSizeChanger: true,
                      pageSizeOptions: [10, 20, 50, 100],
                      showTotal: (total) => `共 ${total} 条记录`,
                      onChange: (page, size) => {
                    
                        setCampaignCurrentPage(page);
                        setCampaignPageSize(size);
                      }
                    }}
                    scroll={{ x: 1200 }}
                  />
                </Card>
              </>
            )
          },
          {
            key: 'quadrant',
            label: '用户搜索词分析',
            children: quadrantLoading ? (
              <div className="loading-container">
                <Spin size="large" />
              </div>
            ) : quadrantData ? (
              <>
                <Row gutter={[24, 24]}>
                  <Col span={24}>
                    <Card  className="data-table-card">
                      {quadrantData && (
                        <Table 
                          dataSource={[
                            ...quadrantData.starKeywords.map((item: KeywordData) => ({ ...item, quadrant: '明星词', quadrantColor: '#52c41a' })),
                            ...quadrantData.problemKeywords.map((item: KeywordData) => ({ ...item, quadrant: '问题词', quadrantColor: '#fa8c16' })),
                            ...quadrantData.potentialKeywords.map((item: KeywordData) => ({ ...item, quadrant: '潜力词', quadrantColor: '#1890ff' })),
                            ...quadrantData.ineffectiveKeywords.map((item: KeywordData) => ({ ...item, quadrant: '无效词', quadrantColor: '#bfbfbf' }))
                          ]} 
                          rowKey="id"
                          pagination={{ 
                            pageSize: keywordPageSize,
                            current: keywordCurrentPage,
                            showSizeChanger: true,
                            pageSizeOptions: [10, 20, 50, 100],
                            showTotal: (total) => `共 ${total} 条记录`,
                            onChange: (page, size) => {
                          
                              setKeywordCurrentPage(page);
                              setKeywordPageSize(size);
                            }
                          }}
                          scroll={{ x: 1200 }}
                          columns={[
                            {
                              title: '用户搜索词',
                              dataIndex: 'keyword',
                              key: 'keyword',
                              width: '20%',
                              ellipsis: true,
                              fixed: 'left' as const,
                            },
                            
                            {
                              title: '展示量',
                              dataIndex: 'impressions',
                              key: 'impressions',
                              align: 'right' as const,
                              width: '8%',
                              minWidth: 80,
                              sorter: (a, b) => a.impressions - b.impressions,
                            },
                            {
                              title: '点击量',
                              dataIndex: 'clicks',
                              key: 'clicks',
                              align: 'right' as const,
                              sorter: (a, b) => a.clicks - b.clicks,
                            },
                            {
                              title: '点击率',
                              dataIndex: 'ctr',
                              key: 'ctr',
                              align: 'right' as const,
                              render: (text) => {
                                const value = typeof text === 'number' ? text : parseFloat(text);
                                return isNaN(value) ? '0.00%' : `${(value * 100).toFixed(2)}%`;
                              },
                              sorter: (a, b) => a.ctr - b.ctr,
                            },
                            {
                              title: '转化率',
                              dataIndex: 'cvr',
                              key: 'cvr',
                              align: 'right' as const,
                              render: (text) => {
                                const value = typeof text === 'number' ? text : parseFloat(text);
                                return isNaN(value) ? '0.00%' : `${(value * 100).toFixed(2)}%`;
                              },
                              sorter: (a, b) => a.cvr - b.cvr,
                            },
                            {
                              title: '订单数',
                              dataIndex: 'orders',
                              key: 'orders',
                              align: 'right' as const,
                              sorter: (a, b) => a.orders - b.orders,
                            },
                            {
                              title: '花费',
                              dataIndex: 'spend',
                              key: 'spend',
                              align: 'right' as const,
                              render: (text) => {
                                const value = typeof text === 'number' ? text : parseFloat(text);
                                return isNaN(value) ? '¥0.00' : `¥${value.toFixed(2)}`;
                              },
                              sorter: (a, b) => a.spend - b.spend,
                            },
                            {
                              title: '销售额',
                              dataIndex: 'sales',
                              key: 'sales',
                              align: 'right' as const,
                              render: (text) => {
                                const value = typeof text === 'number' ? text : parseFloat(text);
                                return isNaN(value) ? '¥0.00' : `¥${value.toFixed(2)}`;
                              },
                              sorter: (a, b) => a.sales - b.sales,
                            },
                            {
                              title: 'ACOS',
                              dataIndex: 'acos',
                              key: 'acos',
                              align: 'right' as const,
                              render: (_, record) => {
                                const acos = record.sales > 0 ? (record.spend / record.sales * 100).toFixed(2) : '0.00';
                                return `${acos}%`;
                              },
                              sorter: (a, b) => {
                                const acosA = a.sales > 0 ? a.spend / a.sales * 100 : 0;
                                const acosB = b.sales > 0 ? b.spend / b.sales * 100 : 0;
                                return acosA - acosB;
                              },
                            },
                            {
                              title: '搜索词分类',
                              dataIndex: 'quadrant',
                              key: 'quadrant',
                              width: '6%',
                              align:'center',
                              fixed: 'right',
                              filters: [
                                { text: '明星词', value: '明星词' },
                                { text: '问题词', value: '问题词' },
                                { text: '潜力词', value: '潜力词' },
                                { text: '无效词', value: '无效词' },
                              ],
                              onFilter: (value, record) => record.quadrant === value,
                              render: (text, record) => (
                                <span style={{ color: record.quadrantColor, fontWeight: 'bold' }}>
                                  {text}
                                </span>
                              ),
                            },
                          ]}
                        />
                      )}
                    </Card>
                  </Col>
                </Row>
              </>
            ) : (
              <Empty description="暂无搜索词四象限分析数据" />
            )
          }
        ]}
      />
    </div>
  );
};

export default ReportDetailPage;


