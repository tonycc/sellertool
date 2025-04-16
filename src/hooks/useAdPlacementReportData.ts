import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import { message } from 'antd';
import { PlacementData, CampaignData, ReportDetail, SummaryData } from '../types/adPlacementReportTypes';

export const useAdPlacementReportData = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // 统一状态管理
  const [reportData, setReportData] = useState<{
    report: ReportDetail | null;
    placementData: PlacementData[];
    campaignData: CampaignData[];
    placementCampaignMap: Record<string, CampaignData[]>;
    summary: SummaryData | null;
  }>({
    report: null,
    placementData: [],
    campaignData: [],
    placementCampaignMap: {},
    summary: null
  });

  // 统一加载状态管理
  const [loadingState, setLoadingState] = useState<{
    mainLoading: boolean;
    campaignLoading: boolean;
  }>({
    mainLoading: true,
    campaignLoading: false
  });

  // 获取报表详情
  const fetchReportDetail = async (reportId: string) => {
    try {
      const response = await apiClient.get(`/api/reports/campaign-summary/${reportId}`);
      setReportData(prev => ({
        ...prev,
        report: response.data.report
      }));
      return response.data.report;
    } catch (error: any) {
      handleApiError(error, '获取报表详情失败');
      return null;
    }
  };

  // 获取广告位数据
  const fetchPlacementData = async (reportId: string) => {
    try {
      const response = await apiClient.get(`/api/ad-placements/placement-analysis/${reportId}`);
      
      // 处理广告位数据
      const processedData = response.data.placements.map((item: any) => ({
        ...item,
        spend: Number(item.spend),
        sales: Number(item.sales),
        acos: Number(item.acos) / 100, // 将acos转换为小数形式
        conversionRate: Number(item.conversionRate)
      }));

      // 计算汇总数据
      const summary = calculateSummary(processedData);

      setReportData(prev => ({
        ...prev,
        placementData: processedData,
        summary
      }));

      return { placementData: processedData, summary };
    } catch (error: any) {
      handleApiError(error, '获取广告位分析数据失败');
      return { placementData: [], summary: null };
    }
  };

  // 获取广告活动数据
  const fetchCampaignData = async (reportId: string) => {
    setLoadingState(prev => ({ ...prev, campaignLoading: true }));
    try {
      const response = await apiClient.get(`/api/ad-placements/placement-campaign-summary/${reportId}`);
      
      // 获取原始数据，并处理用于单元格合并
      // 将广告活动和广告位数据展开为扁平结构
      const flattenedData: CampaignData[] = [];
      
      // 用于跟踪每个广告活动名称的出现次数
      const campaignCounts: Record<string, number> = {};
      
      // 第一次遍历：计算每个广告活动的广告位数量
      response.data.campaigns.forEach((campaign: any) => {
        const placementCount = campaign.placements && campaign.placements.length > 0 ? 
          campaign.placements.length : 1;
        campaignCounts[campaign.campaignName] = placementCount;
      });
      
      // 第二次遍历：创建数据并添加合并标记
      response.data.campaigns.forEach((campaign: any) => {
        // 如果广告活动没有广告位数据，添加一条广告活动记录
        if (!campaign.placements || campaign.placements.length === 0) {
          flattenedData.push({
            campaignName: campaign.campaignName,
            placement: '-',
            impressions: Number(campaign.impressions),
            clicks: Number(campaign.clicks),
            spend: Number(campaign.spend),
            sales: Number(campaign.sales),
            orders: Number(campaign.orders),
            acos: Number(campaign.acos) / 100,
            roas: Number(campaign.roas),
            ctr: Number(campaign.ctr),
            conversionRate: Number(campaign.conversionRate),
            cpc: Number(campaign.cpc),
            isFirstPlacement: true,
            placementCount: 1
          });
        } else {
          // 为每个广告位创建一条记录
          campaign.placements.forEach((placement: any, index: number) => {
            flattenedData.push({
              campaignName: campaign.campaignName,
              placement: placement.placementName,
              impressions: Number(placement.impressions),
              clicks: Number(placement.clicks),
              spend: Number(placement.spend),
              sales: Number(placement.sales),
              orders: Number(placement.orders),
              acos: Number(placement.acos) / 100,
              roas: Number(placement.roas),
              ctr: Number(placement.ctr),
              conversionRate: Number(placement.conversionRate),
              cpc: Number(placement.clicks > 0 ? placement.spend / placement.clicks : 0),
              isFirstPlacement: index === 0, // 标记是否是该广告活动的第一个广告位
              placementCount: campaignCounts[campaign.campaignName] // 该广告活动的广告位总数
            });
          });
        }
      });

      // 按广告位分组
      const groupedData: Record<string, CampaignData[]> = {};
      flattenedData.forEach(campaign => {
        if (campaign.placement) {
          if (!groupedData[campaign.placement]) {
            groupedData[campaign.placement] = [];
          }
          groupedData[campaign.placement].push(campaign);
        }
      });

      setReportData(prev => ({
        ...prev,
        campaignData: flattenedData,
        placementCampaignMap: groupedData
      }));

      return { campaignData: flattenedData, placementCampaignMap: groupedData };
    } catch (error: any) {
      handleApiError(error, '获取广告活动分析数据失败');
      return { campaignData: [], placementCampaignMap: {} };
    } finally {
      setLoadingState(prev => ({ ...prev, campaignLoading: false }));
    }
  };

  // 统一数据获取方法
  const fetchAllData = async () => {
    if (!id) return;
    
    setLoadingState(prev => ({ ...prev, mainLoading: true }));
    try {
      const report = await fetchReportDetail(id);
      if (!report) {
        navigate('/reports');
        return;
      }
      
      const { placementData } = await fetchPlacementData(id);
      if (placementData.length === 0) {
        setLoadingState(prev => ({ ...prev, mainLoading: false }));
        return;
      }
      
      await fetchCampaignData(id);
    } finally {
      setLoadingState(prev => ({ ...prev, mainLoading: false }));
    }
  };

  // 计算广告位数据的汇总指标
  const calculateSummary = (data: PlacementData[]): SummaryData | null => {
    if (!data.length) return null;
    
    const totalImpressions = data.reduce((sum, item) => sum + item.impressions, 0);
    const totalClicks = data.reduce((sum, item) => sum + item.clicks, 0);
    const totalSpend = data.reduce((sum, item) => sum + item.spend, 0);
    const totalSales = data.reduce((sum, item) => sum + item.sales, 0);
    const totalOrders = data.reduce((sum, item) => sum + item.orders, 0);
    
    return {
      totalImpressions,
      totalClicks,
      totalSpend,
      totalSales,
      totalOrders,
      ctr: totalImpressions > 0 ? totalClicks / totalImpressions : 0,
      acos: totalSales > 0 ? totalSpend / totalSales : 0,
      roas: totalSpend > 0 ? totalSales / totalSpend : 0,
      conversionRate: totalClicks > 0 ? totalOrders / totalClicks : 0,
      cpc: totalClicks > 0 ? totalSpend / totalClicks : 0
    };
  };

  // 获取特定广告位下的广告活动数据
  const getPlacementCampaigns = (placement: string) => {
    return reportData.placementCampaignMap[placement] || [];
  };

  // 处理API错误
  const handleApiError = (error: any, defaultMessage: string) => {
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
        message.error(errorData?.message || defaultMessage);
      }
    } else if (error.request) {
      message.error('服务器无响应，请检查网络连接');
    } else {
      message.error('请求配置错误，请稍后重试');
    }
  };

  useEffect(() => {
    if (id) {
      fetchAllData();
    }
  }, [id]);

  return {
    ...reportData,
    ...loadingState,
    getPlacementCampaigns,
    fetchCampaignData
  };
};