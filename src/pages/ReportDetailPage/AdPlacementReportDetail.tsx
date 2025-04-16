import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Spin, Empty, Button } from 'antd';
import { ArrowLeftOutlined, LineChartOutlined, EyeOutlined, PlusOutlined, MinusOutlined } from '@ant-design/icons';
import { ProCard, ProTable, ActionType } from '@ant-design/pro-components';

import MainLayout from '../../components/layout/MainLayout';
import './style.css';

// 引入自定义hook和配置
import { formatCurrency } from '../../utils/formatters';
import AdPlacementAnalysisChart from '../../components/report/AdPlacementAnalysisChart';
import { useAdPlacementReportData } from '../../hooks/useAdPlacementReportData';
import { placementColumns, campaignColumns, subColumns } from '../../config/adPlacementReportColumns';
import { getDefaultTableConfig, useTableState } from '../../config/tableConfig';
import AdPlacementStatsCard from '../../components/report/AdPlacementStatsCard';
import type { CampaignData, PlacementData } from '../../types/adPlacementReportTypes';


const AdPlacementReportDetail: React.FC = () => {
  const navigate = useNavigate();
  const {
    report,
    placementData,
    campaignData,
    summary,
    mainLoading,
    campaignLoading,
    getPlacementCampaigns
  } = useAdPlacementReportData();
  
  const [activeTab, setActiveTab] = useState<string>('overview');
  const placementTableActionRef = useRef<ActionType>();
  const campaignTableActionRef = useRef<ActionType>();
  const {
    paginationConfig
  } = useTableState();    // 使用整合后的表格状态管理hook


  // 渲染逻辑

  if (mainLoading) {
    return (
      <MainLayout>
        <div className="loading-container">
          <Spin size="large" />
        </div>
      </MainLayout>
    );
  }

  if (!placementData.length) {
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
              {report?.fileName || '广告位报表详情'}
            </div>
          }
          subTitle={report?.reportDateRange || '未设置日期区间'}
        >
          <Empty 
            description="未找到广告位数据" 
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </ProCard>
      </MainLayout>
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
            {report?.fileName}
          </div>
        }
        subTitle={report?.reportDateRange || '未设置日期区间'}
        tabs={{
          type: 'card',
          activeKey: activeTab,
          onChange: setActiveTab,
          className: "report-tabs",
          size: 'small',
          items: [
            {
              key: 'overview',
              label: '概览',
              children: campaignLoading ? (
                <div className="loading-container">
                  <Spin size="large" />
                </div>
              ) : (
                <>
                  {/* 统计卡片和性能指标区域 - 响应式布局 */}
                  {summary && (
                    <ProCard 
                      gutter={[0, 0]} 
                      className="summary-section" 
                      style={{ 
                        marginBottom: 16, 
                        overflowX: 'auto', 
                        padding: 0,
                        margin: 0,
                        border: 'none'
                      }}
                    >
                      <div className="stats-row">
                        <AdPlacementStatsCard
                          title="总展示量"
                          value={summary.totalImpressions}
                          prefix={<EyeOutlined />}
                        />
                        <AdPlacementStatsCard
                          title="总点击量"
                          value={summary.totalClicks}
                          prefix={<LineChartOutlined />}
                        />
                        <AdPlacementStatsCard
                          title="总花费"
                          value={summary.totalSpend}
                          precision={2}
                          prefix="¥"
                          formatter={formatCurrency}
                        />
                        <AdPlacementStatsCard
                          title="总销售额"
                          value={summary.totalSales}
                          precision={2}
                          prefix="¥"
                          formatter={formatCurrency}
                        />
                        <AdPlacementStatsCard
                          title="点击率 (CTR)"
                          value={summary.ctr * 100}
                          precision={2}
                          suffix="%"
                        />
                        <AdPlacementStatsCard
                          title="转化率"
                          value={summary.conversionRate * 100}
                          precision={2}
                          suffix="%"
                        />
                        <AdPlacementStatsCard
                          title="平均点击成本"
                          value={summary.cpc}
                          precision={2}
                          formatter={formatCurrency}
                        />
                        <AdPlacementStatsCard
                          title="平均ACOS"
                          value={summary.acos * 100}
                          precision={2}
                          suffix="%"
                        />
                      </div>
                    </ProCard>
                  )}
                  
                  <ProTable<CampaignData>
                    actionRef={campaignTableActionRef}
                    columns={campaignColumns}
                    dataSource={campaignData}
                    rowKey={(record) => `${record.campaignName}-${record.placement || ''}`}
                    {...getDefaultTableConfig()}
                    pagination={paginationConfig}
                    headerTitle="广告活动数据"
                    cardProps={{ bodyStyle: { padding: '12px' } }}
                    loading={campaignLoading}
                  />
                </>
              ),
            },
            {
              key: 'campaign',
              label: '广告活动分析',
              children: (
                <>
                  {/* 图表区域 */}
                  <ProCard
                    title=""
                    className="chart-container"
                    style={{ marginBottom: 16 }}
                  >
                    <AdPlacementAnalysisChart 
                      placementData={placementData} 
                      height={350} 
                      key={`chart-${activeTab}`}
                    />
                  </ProCard>
                  
                  {/* 表格区域 */}
                  <ProTable<PlacementData>
                    actionRef={placementTableActionRef}
                    columns={placementColumns}
                    dataSource={placementData}
                    rowKey="placement"
                    {...getDefaultTableConfig()}
                    pagination={paginationConfig}
                    headerTitle=""
                    cardProps={{ bodyStyle: { padding: '12px' } }}
                    expandable={{
                      expandedRowRender: (record) => {
                        // 获取该广告位下的广告活动数据
                        const campaigns = getPlacementCampaigns(record.placement);
                        
                        if (campaigns.length === 0) {
                          return (
                            <div style={{ padding: '16px 0', textAlign: 'center' }}>
                              {campaignData.length === 0 ? (
                                <Spin size="small" />
                              ) : (
                                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无广告活动数据" />
                              )}
                            </div>
                          );
                        }
                        
                       
                        
                        return (
                          <ProTable
                            columns={subColumns}
                            dataSource={campaigns}
                            rowKey={(record) => `${record.campaignName}-${record.placement || ''}`}
                            pagination={false}
                            search={false}
                            options={false}
                            bordered
                            size="small"
                            className="nested-table"
                          />
                        );
                      },
                      rowExpandable: (record) => true,
                      expandRowByClick: true,
                      expandIcon: ({ expanded, onExpand, record }) => 
                        expanded ? (
                          <MinusOutlined onClick={e => onExpand(record, e)} />
                        ) : (
                          <PlusOutlined onClick={e => onExpand(record, e)} style={{ color: '#1890ff' }} />
                        ),
                    }}
                  />
                </>
              ),
            },
           
          ],
        }}
      />
    </MainLayout>
  );
};

export default AdPlacementReportDetail;

