import React from 'react';
import type { ProColumns } from '@ant-design/pro-components';
import { formatPercentage, formatCurrency } from '../utils/formatters';
import { CampaignData, KeywordData, ExtendedMultiCampaignKeyword } from '../types/searchTermReportTypes';

// 多广告组搜索词表格列配置
export const multiCampaignKeywordColumns: ProColumns<ExtendedMultiCampaignKeyword>[] = [
    {
      title: '搜索词',
      dataIndex: 'keyword',
      key: 'keyword',
      width: '15%',
      ellipsis: true,
      fixed: 'left',
      search: false,
      render: (text) => (
        <div style={{ fontWeight: 'bold' }}>{text}</div>
      ),
    },
    {
      title: '出现广告组数',
      dataIndex: 'campaignCount',
      key: 'campaignCount',
      width: '5%',
      align: 'center',
      search: false,
    },
    {
      title: '总展示量',
      dataIndex: 'totalImpressions',
      key: 'totalImpressions',
      align: 'right',
      sorter: (a, b) => a.totalImpressions - b.totalImpressions,
      search: false,
    },
    {
      title: '总点击量',
      dataIndex: 'totalClicks',
      key: 'totalClicks',
      align: 'right',
      sorter: (a, b) => a.totalClicks - b.totalClicks,
      search: false,
    },
    {
      title: '总订单数',
      dataIndex: 'totalOrders',
      key: 'totalOrders',
      align: 'right',
      sorter: (a, b) => a.totalOrders - b.totalOrders,
      search: false,
    },
    {
      title: '总花费',
      dataIndex: 'totalSpend',
      key: 'totalSpend',
      align: 'right',
      render: (text) => formatCurrency(text),
      sorter: (a, b) => a.totalSpend - b.totalSpend,
      search: false,
    },
    {
      title: '总销售额',
      dataIndex: 'totalSales',
      key: 'totalSales',
      align: 'right',
      render: (text) => formatCurrency(text),
      sorter: (a, b) => a.totalSales - b.totalSales,
      search: false,
    },
    {
      title: '平均点击率',
      dataIndex: 'avgCtr',
      key: 'avgCtr',
      align: 'right',
      render: (text) => formatPercentage(text),
      sorter: (a, b) => a.avgCtr - b.avgCtr,
      search: false,
    },
    {
      title: '平均转化率',
      dataIndex: 'avgCvr',
      key: 'avgCvr',
      align: 'right',
      render: (text) => formatPercentage(text),
      sorter: (a, b) => a.avgCvr - b.avgCvr,
      search: false,
    },
    {
      title: '平均ACOS',
      dataIndex: 'avgAcos',
      key: 'avgAcos',
      align: 'right',
      render: (text) => formatPercentage(text),
      sorter: (a, b) => a.avgAcos - b.avgAcos,
      search: false,
    },                                  
]


// 多广告组搜索词表格列配置--子表格
export const multiCampaignKeywordSubColumns: ProColumns<ExtendedMultiCampaignKeyword['campaignDetails'][0]>[] = [
    {
      title: '广告组',
      dataIndex: 'campaignName',
      key: 'campaignName',
      width: '20%',
      search: false,
    },
    {
      title: '展示量',
      dataIndex: 'impressions',
      key: 'impressions',
      align: 'right',
      search: false,
    },
    {
      title: '点击量',
      dataIndex: 'clicks',
      key: 'clicks',
      align: 'right',
      search: false,
    },
    {
      title: '点击率',
      dataIndex: 'ctr',
      key: 'ctr',
      align: 'right',
      render: (text) => formatPercentage(text),
      search: false,
    },
    {
      title: '订单数',
      dataIndex: 'orders',
      key: 'orders',
      align: 'right',
      search: false,
    },
    {
      title: '转化率',
      dataIndex: 'cvr',
      key: 'cvr',
      align: 'right',
      render: (text) => formatPercentage(text),
      search: false,
    },
    {
      title: '花费',
      dataIndex: 'spend',
      key: 'spend',
      align: 'right',
      render: (text) => formatCurrency(text),
      search: false,
    },
    {
      title: '销售额',
      dataIndex: 'sales',
      key: 'sales',
      align: 'right',
      render: (text) => formatCurrency(text),
      search: false,
    },
    {
      title: 'ACOS',
      dataIndex: 'acos',
      key: 'acos',
      align: 'right',
      render: (text) => formatPercentage(text),
      search: false,
    }, 
]


// 广告活动汇总页面表格列配置
export const campaignColumns: ProColumns<CampaignData>[] = [
  {
    title: '广告活动',
    dataIndex: 'campaignName',
    key: 'campaignName',
    width: '20%',
    ellipsis: true,
    fixed: 'left',
    search: false,
  },
  {
    title: '展示量',
    dataIndex: 'impressions',
    key: 'impressions',
    align: 'right',
    width: '8%',
    sorter: (a, b) => a.impressions - b.impressions,
    search: false,
  },
  {
    title: '点击量',
    dataIndex: 'clicks',
    key: 'clicks',
    align: 'right',
    sorter: (a, b) => a.clicks - b.clicks,
    search: false,
  },
  {
    title: '点击率',
    dataIndex: 'ctr',
    key: 'ctr',
    align: 'right',
    render: (text: any) => formatPercentage(text),
    sorter: (a, b) => a.ctr - b.ctr,
    search: false,
  },
  {
    title: '花费',
    dataIndex: 'spend',
    key: 'spend',
    align: 'right',
    sorter: (a, b) => a.spend - b.spend,
    search: false,
  },
  {
    title: '销售额',
    dataIndex: 'sales',
    key: 'sales',
    align: 'right',
    sorter: (a, b) => a.sales - b.sales,
    search: false,
  },
  {
    title: '订单数',
    dataIndex: 'orders',
    key: 'orders',
    align: 'right',
    sorter: (a, b) => a.orders - b.orders,
    search: false,
  },
  {
    title: 'ACOS',
    dataIndex: 'acos',
    key: 'acos',
    align: 'right',
    render: (text: any) => formatPercentage(text),
    sorter: (a, b) => a.acos - b.acos,
    search: false,
  },
  {
    title: 'ROAS',
    dataIndex: 'roas',
    key: 'roas',
    align: 'right',
    render: (text: any) => text,
    sorter: (a, b) => a.roas - b.roas,
    search: false,
  },
  {
    title: '转化率',
    dataIndex: 'conversionRate',
    key: 'conversionRate',
    align: 'right',
    render: (text: any) => formatPercentage(text),
    sorter: (a, b) => a.conversionRate - b.conversionRate,
    search: false,
  },
  {
    title: 'CPC',
    dataIndex: 'cpc',
    key: 'cpc',
    align: 'right',
    sorter: (a, b) => a.cpc - b.cpc,
    search: false,
  },
];

export const keywordColumns: ProColumns<KeywordData>[] = [
  {
    title: '用户搜索词',
    dataIndex: 'keyword',
    key: 'keyword',
    width: '20%',
    ellipsis: true,
    fixed: 'left',
    search: false,
  },
  {
    title: '展示量',
    dataIndex: 'impressions',
    key: 'impressions',
    align: 'right',
    width: '8%',
    sorter: (a, b) => a.impressions - b.impressions,
    search: false,
  },
  {
    title: '点击量',
    dataIndex: 'clicks',
    key: 'clicks',
    align: 'right',
    sorter: (a, b) => a.clicks - b.clicks,
    search: false,
  },
  {
    title: '点击率',
    dataIndex: 'ctr',
    key: 'ctr',
    align: 'right',
    render: (text) => formatPercentage(text),
    sorter: (a, b) => a.ctr - b.ctr,
    search: false,
  },
  {
    title: '转化率',
    dataIndex: 'cvr',
    key: 'cvr',
    align: 'right',
    render: (text) => formatPercentage(text),
    sorter: (a, b) => a.cvr - b.cvr,
    search: false,
  },
  {
    title: '订单数',
    dataIndex: 'orders',
    key: 'orders',
    align: 'right',
    sorter: (a, b) => a.orders - b.orders,
    search: false,
  },
  {
    title: '花费',
    dataIndex: 'spend',
    key: 'spend',
    align: 'right',
    render: (text: any) => formatCurrency(text),
    sorter: (a, b) => a.spend - b.spend,
    search: false,
  },
  {
    title: '销售额',
    dataIndex: 'sales',
    key: 'sales',
    align: 'right',
    render: (text: any) => formatCurrency(text),
    sorter: (a, b) => a.sales - b.sales,
    search: false,
  },
  {
    title: 'ACOS',
    dataIndex: 'acos',
    key: 'acos',
    align: 'right',
    render: (_, record) => {
      const acos = record.sales > 0 ? (record.spend / record.sales * 100).toFixed(2) : '0.00';
      return `${acos}%`;
    },
    sorter: (a, b) => {
      const acosA = a.sales > 0 ? a.spend / a.sales * 100 : 0;
      const acosB = b.sales > 0 ? b.spend / b.sales * 100 : 0;
      return acosA - acosB;
    },
    search: false,
  },
  {
    title: '搜索词分类',
    dataIndex: 'quadrant',
    key: 'quadrant',
    width: '6%',
    align: 'center',
    fixed: 'right',
    filters: [
      { text: '明星词', value: '明星词' },
      { text: '问题词', value: '问题词' },
      { text: '潜力词', value: '潜力词' },
      { text: '无效词', value: '无效词' },
    ],
    onFilter: (value, record) => record.quadrant === value,
    search: false,
    render: (text: React.ReactNode, record: KeywordData) => (
      <span style={{ color: record.quadrantColor, fontWeight: 'bold' }}>
        {text}
      </span>
    )
  },
];

