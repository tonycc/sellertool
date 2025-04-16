import React, { useState, useEffect, useRef } from 'react';
import { Spin, Empty, Button } from 'antd';
import { ArrowLeftOutlined, LineChartOutlined, EyeOutlined } from '@ant-design/icons';
import { ProCard, ProTable } from '@ant-design/pro-components';
import type { ActionType } from '@ant-design/pro-components';
import { useNavigate } from 'react-router-dom';

import MainLayout from '../../components/layout/MainLayout'; // 自定义布局组件
import './style.css';

import CampaignPerformanceChart from '../../components/report/CampaignPerformanceChart'; // 自定义图表组件
import OrderKeywordChart from '../../components/report/OrderKeywordChart'; // 自定义出单关键词图表组件
import { useSearchTermReportData } from '../../hooks/useSearchTermReportData';  // 自定义hook
import { formatCurrency } from '../../utils/formatters';  // 自定义格式化函数
import SearchTermStatsCard from '../../components/report/SearchTermStatsCard';  // 自定义卡片组件
import { campaignColumns, keywordColumns,multiCampaignKeywordColumns, multiCampaignKeywordSubColumns } from '../../config/searchTermReportColumns.tsx';   // 列定义
import { CampaignData, KeywordData, ExtendedMultiCampaignKeyword } from '../../types/searchTermReportTypes';  //接口定义
import { useTableState, getDefaultTableConfig } from '../../config/tableConfig';  // 表格配置

const ReportDetailPage: React.FC = () => {
  
  const navigate = useNavigate();
  const {
    report,
    campaignData,
    summary,
    quadrantData,
    keywordMappingStats,
    multiCampaignKeywords,
    allKeywordsWithOrders,
    mainLoading,
    quadrantLoading,
    mappingLoading,
    multiKeywordsLoading,
    allKeywordsLoading,
    fetchQuadrantData
  } = useSearchTermReportData();    // 自定义hook
  const [activeTab, setActiveTab] = useState<string>('overview');  
  const campaignTableActionRef = useRef<ActionType>();    // 表格操作引用
  const keywordTableActionRef = useRef<ActionType>();
  const [expandedKeywords, setExpandedKeywords] = useState<string[]>([]);  // 控制搜索词表格展开行
  const {
    paginationConfig
  } = useTableState();    // 使用整合后的表格状态管理hook

  useEffect(() => {
    if (activeTab === 'quadrant' && !quadrantData) {
      fetchQuadrantData().catch(error => {
        console.error('Failed to fetch quadrant data:', error);
        // 可以添加错误提示组件或状态
      });
    }
  }, [activeTab, quadrantData, fetchQuadrantData]);

  // 简化的加载状态组件
  const LoadingContainer = ({ loading, children }: { loading: boolean, children: React.ReactNode }) => {
    if (loading) {
      return (
        <div className="loading-container">
          <Spin size="small" />
        </div>
      );
    }
    return <>{children}</>;
  };

  if (mainLoading) {
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
    <MainLayout>
      <ProCard
        className="report-detail-page"
        headerBordered
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Button
              type="link"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate(-1)}
              style={{ marginRight: '8px' }}
            />
            {report.fileName}
          </div>
        }
        subTitle={report.reportDateRange}
        tabs={{
          type: 'card',
          activeKey: activeTab,
          onChange: setActiveTab,
          className: "report-tabs",
          items: [
            {
              key: 'overview',
              label: '概览',
              children: (
                <>
                  {/* 统计卡片和性能指标区域 - 响应式布局 */}
                  <ProCard 
                    gutter={[0, 0]} 
                    className="summary-section" 
                  >
                    <div className="stats-row">
                      <SearchTermStatsCard
                        title="总展示量"
                        value={summary.totalImpressions}
                        prefix={<EyeOutlined />}
                      />
                      <SearchTermStatsCard
                        title="总点击量"
                        value={summary.totalClicks}
                        prefix={<LineChartOutlined />}
                      />
                      <SearchTermStatsCard
                        title="总花费"
                        value={summary.totalSpend}
                        precision={2}
                        prefix="¥"
                        formatter={formatCurrency}
                      />
                      <SearchTermStatsCard
                        title="总销售额"
                        value={summary.totalSales}
                        precision={2}
                        prefix="¥"
                        formatter={formatCurrency}
                      />
                      <SearchTermStatsCard
                        title="点击率 (CTR)"
                        value={parseFloat(summary.ctr)}
                        precision={2}
                        suffix="%"
                      />
                      <SearchTermStatsCard
                        title="转化率"
                        value={parseFloat(summary.conversionRate)}
                        precision={2}
                        suffix="%"
                      />
                      <SearchTermStatsCard
                        title="平均点击成本"
                        value={parseFloat(summary.cpc)}
                        precision={2}
                        prefix="¥"
                      />
                      <SearchTermStatsCard
                        title="平均ACOS"
                        value={parseFloat(summary.acos)}
                        precision={2}
                        suffix="%"
                      />
                    </div>
                  </ProCard>
                  
                  {/* 搜索词与广告组映射关系统计 */}
                  {mappingLoading ? (
                    <div className="loading-container">
                      <Spin size="small" />
                    </div>
                  ) : keywordMappingStats ? (
                    <>
                        {/* 出单关键词柱状图 */}
                      <ProCard>
                        <LoadingContainer loading={allKeywordsLoading}>
                          {allKeywordsWithOrders && allKeywordsWithOrders.length > 0 ? (
                            <>
                              <OrderKeywordChart 
                                keywordsData={allKeywordsWithOrders.filter((k) => k && k.totalOrders > 0)}
                                height={350}
                                title="产生订单最多的搜索词"
                              />
                            </>
                          ) : (
                            <div style={{ height: 350, display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#999' }}>
                              暂无出单关键词数据
                            </div>
                          )}
                        </LoadingContainer>
                      </ProCard>
                      <ProCard
                        title=""
                        headerBordered
                      >
                        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                          <SearchTermStatsCard
                            title="搜索词总数"
                            value={keywordMappingStats.totalKeywords}
                            valueStyle={{ color: '#1890ff' }}
                            colSpan={1} 
                            style={{ flex: '1 1 25%', minWidth: '150px' }}
                          />
                          <SearchTermStatsCard
                            title="多广告组搜索词数"
                            value={keywordMappingStats.multiCampaignKeywords}
                            valueStyle={{ color: '#52c41a' }}
                            colSpan={1}
                            style={{ flex: '1 1 25%', minWidth: '150px' }}
                          />
                          <SearchTermStatsCard
                            title="最大关联广告组数"
                            value={keywordMappingStats.maxCampaignCount}
                            valueStyle={{ color: '#fa8c16' }}
                            colSpan={1}
                            style={{ flex: '1 1 25%', minWidth: '150px' }}
                          />
                          <SearchTermStatsCard
                            title="单广告组搜索词数"
                            value={keywordMappingStats.totalKeywords - keywordMappingStats.multiCampaignKeywords}
                            valueStyle={{ color: '#722ed1' }}
                            colSpan={1}
                            style={{ flex: '1 1 25%', minWidth: '150px' }}
                          />
                        </div>
                      </ProCard>
                      
                  
                      
                      {/* 多广告组搜索词表格 */}
                      {keywordMappingStats?.multiCampaignKeywords > 0 && (
                        <LoadingContainer loading={multiKeywordsLoading}>
                          {multiCampaignKeywords && multiCampaignKeywords.length > 0 ? (
                            <>
                              {/* 按搜索词维度分组显示的表格 */}
                              <ProTable<ExtendedMultiCampaignKeyword>
                                columns={multiCampaignKeywordColumns}
                                dataSource={multiCampaignKeywords}
                                rowKey="keyword"
                                {...getDefaultTableConfig()}
                                pagination={paginationConfig}
                                headerTitle="多广告组搜索词表现"
                                tooltip="此表格按搜索词维度分组显示，可以直观查看每个搜索词在不同广告组的整体表现"
                                expandable={{
                                  expandedRowRender: (record) => (
                                    <ProTable
                                      columns={multiCampaignKeywordSubColumns}
                                      dataSource={record.campaignDetails}
                                      rowKey="campaignName"
                                      pagination={false}
                                      search={false}
                                      options={false}
                                      bordered
                                      size="small"
                                      style={{ marginBottom: 0 }}
                                    />
                                  ),
                                  expandedRowKeys: expandedKeywords,
                                  onExpand: (expanded, record) => {
                                    if (expanded) {
                                      setExpandedKeywords(prev => [...prev, record.keyword]);
                                    } else {
                                      setExpandedKeywords(prev => prev.filter(key => key !== record.keyword));
                                    }
                                  },
                                }}
                                rowClassName={() => 'keyword-row'}
                                tableLayout="fixed"
                                style={{ marginBottom: 24 }}
                              />
                            </>
                          ) : (
                            <Empty description="暂无多广告组搜索词数据" />
                          )}
                        </LoadingContainer>
                      )}
                    </>
                  ) : null}
                </>
              )
            },
            {
              key: 'details',
              label: '广告活动汇总',
              children: (
                <>
                  {/* 图表区域 */}
                  <div className="chart-container" style={{ marginBottom: 24 }}>
                    <CampaignPerformanceChart
                      campaignData={campaignData}
                      height={450}
                      key={`chart-${activeTab}`}
                    />
                  </div>

                  {/* 表格区域 */}
                  <ProTable<CampaignData>
                    actionRef={campaignTableActionRef}
                    columns={campaignColumns}
                    dataSource={campaignData}
                    rowKey="campaignName"                  
                    {...getDefaultTableConfig()}
                    pagination={paginationConfig}
                    headerTitle="广告活动数据"
                  />
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
                  {/* 四象限分析统计卡片 - 使用单层结构 */}
                  <ProCard
                    title="搜索词四象限分析"
                    headerBordered
                    style={{ marginBottom: 24 }}
                  >
                    <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                      <SearchTermStatsCard
                        title="明星词数量"
                        value={quadrantData.starKeywords.length}
                        valueStyle={{ color: '#52c41a' }}
                        colSpan={1}
                        style={{ flex: '1 1 25%', minWidth: '150px' }}
                      />
                      <SearchTermStatsCard
                        title="问题词数量"
                        value={quadrantData.problemKeywords.length}
                        valueStyle={{ color: '#fa8c16' }}
                        colSpan={1}
                        style={{ flex: '1 1 25%', minWidth: '150px' }}
                      />
                      <SearchTermStatsCard
                        title="潜力词数量"
                        value={quadrantData.potentialKeywords.length}
                        valueStyle={{ color: '#1890ff' }}
                        colSpan={1}
                        style={{ flex: '1 1 25%', minWidth: '150px' }}
                      />
                      <SearchTermStatsCard
                        title="无效词数量"
                        value={quadrantData.ineffectiveKeywords.length}
                        valueStyle={{ color: '#bfbfbf' }}
                        colSpan={1}
                        style={{ flex: '1 1 25%', minWidth: '150px' }}
                      />
                    </div>
                  </ProCard>

                  {/* 搜索词表格 */}
                  <ProTable<KeywordData>
                    actionRef={keywordTableActionRef}
                    columns={keywordColumns}
                    dataSource={[
                      ...quadrantData.starKeywords.map((item: KeywordData) => ({ ...item, quadrant: '明星词', quadrantColor: '#52c41a' })),
                      ...quadrantData.problemKeywords.map((item: KeywordData) => ({ ...item, quadrant: '问题词', quadrantColor: '#fa8c16' })),
                      ...quadrantData.potentialKeywords.map((item: KeywordData) => ({ ...item, quadrant: '潜力词', quadrantColor: '#1890ff' })),
                      ...quadrantData.ineffectiveKeywords.map((item: KeywordData) => ({ ...item, quadrant: '无效词', quadrantColor: '#bfbfbf' }))
                    ]}
                    rowKey="id"
                   
                    {...getDefaultTableConfig()}
                    pagination={paginationConfig}   
                    //pagination={getTablePaginationConfig({
                     // pageSize: keywordTable.pageSize,
                     // currentPage: keywordTable.currentPage,
                     // onChange: keywordTable.handlePaginationChange
                    //})}
                    //scroll={{ x: 1200 }}
                    //dateFormatter="string"
                    headerTitle="搜索词数据"
                  />
                </>
              ) : (
                <Empty description="暂无搜索词四象限分析数据" />
              )
            },
               

          ]
        }}
      />
    </MainLayout>
  );
};

export default ReportDetailPage;