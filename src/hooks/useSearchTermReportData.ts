import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { searchTermReportApi } from '../api/searchTermReportApi';
import {
  CampaignData,
  ReportSummary,
  ReportDetail,
  QuadrantData,
  KeywordMappingStats,
  MultiCampaignKeyword,
  ExtendedMultiCampaignKeyword,
} from '../types/searchTermReportTypes';

export const useSearchTermReportData = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // 统一状态管理
  const [reportData, setReportData] = useState<{
    report: ReportDetail | null;
    campaignData: CampaignData[];
    summary: ReportSummary | null;
    quadrantData: QuadrantData | null;
    keywordMappingStats: KeywordMappingStats | null;
    multiCampaignKeywords: ExtendedMultiCampaignKeyword[];
    allKeywordsWithOrders: ExtendedMultiCampaignKeyword[];
  }>({
    report: null,
    campaignData: [],
    summary: null,
    quadrantData: null,
    keywordMappingStats: null,
    multiCampaignKeywords: [],
    allKeywordsWithOrders: []
  });

  // 统一加载状态管理
  const [loadingState, setLoadingState] = useState<{
    mainLoading: boolean;
    quadrantLoading: boolean;
    mappingLoading: boolean;
    multiKeywordsLoading: boolean;
    allKeywordsLoading: boolean;
  }>({
    mainLoading: true,
    quadrantLoading: false,
    mappingLoading: false,
    multiKeywordsLoading: false,
    allKeywordsLoading: false
  });

  // 处理多广告组搜索词数据，预先计算扩展属性
  const processMultiCampaignKeywords = (keywords: MultiCampaignKeyword[]): ExtendedMultiCampaignKeyword[] => {
    return keywords.map(keyword => {
      // 计算每个搜索词的汇总数据
      const totalImpressions = keyword.campaignDetails.reduce((sum, detail) => sum + detail.impressions, 0);
      const totalClicks = keyword.campaignDetails.reduce((sum, detail) => sum + detail.clicks, 0);
      const totalOrders = keyword.campaignDetails.reduce((sum, detail) => sum + detail.orders, 0);
      const totalSpend = keyword.campaignDetails.reduce((sum, detail) => sum + detail.spend, 0);
      const totalSales = keyword.campaignDetails.reduce((sum, detail) => sum + detail.sales, 0);
      
      // 计算平均值
      const avgCtr = totalImpressions > 0 ? (totalClicks / totalImpressions) : 0;
      const avgCvr = totalClicks > 0 ? (totalOrders / totalClicks) : 0;
      const avgAcos = totalSales > 0 ? (totalSpend / totalSales) : 0;
      
      return {
        ...keyword,
        totalImpressions,
        totalClicks,
        totalOrders,
        totalSpend,
        totalSales,
        avgCtr,
        avgCvr,
        avgAcos
      };
    });
  };

  // 统一数据获取方法
  const fetchAllData = async () => {
    try {
      setLoadingState(prev => ({...prev, mainLoading: true}));
      
      const [detailRes, mappingRes] = await Promise.all([
        searchTermReportApi.fetchReportDetail(id!),
        searchTermReportApi.fetchKeywordCampaignMapping(id!)
      ]);

      setReportData({
        report: detailRes.report,
        campaignData: detailRes.campaignData,
        summary: detailRes.summary,
        quadrantData: null,
        keywordMappingStats: mappingRes,
        multiCampaignKeywords: [],
        allKeywordsWithOrders: []
      });

      // 如果有多广告组搜索词，立即获取详细数据
      if (mappingRes && mappingRes.multiCampaignKeywords > 0) {
        fetchMultiCampaignKeywords();
      }

    } catch (error) {
      navigate('/reports');
    } finally {
      setLoadingState(prev => ({...prev, mainLoading: false}));
    }
  };

  // 获取多广告组搜索词详细数据
  const fetchMultiCampaignKeywords = async () => {
    if (!id) return;
    
    try {
      setLoadingState(prev => ({
        ...prev, 
        multiKeywordsLoading: true,
        allKeywordsLoading: true
      }));
      
      const response = await searchTermReportApi.fetchMultiCampaignKeywords(id);
      
      // 处理多广告组关键词
      const processedMultiCampaignKeywords = processMultiCampaignKeywords(response.multiCampaignKeywords || []);
      
      // 处理所有出单关键词
      const processedAllKeywords = processMultiCampaignKeywords(response.allKeywordsWithOrders || []);
      
      setReportData(prev => ({
        ...prev, 
        multiCampaignKeywords: processedMultiCampaignKeywords,
        allKeywordsWithOrders: processedAllKeywords
      }));
    } catch (error) {
      console.error('获取关键词数据失败', error);
      // 出错时设置为空数组
      setReportData(prev => ({
        ...prev, 
        multiCampaignKeywords: [],
        allKeywordsWithOrders: []
      }));
    } finally {
      setLoadingState(prev => ({
        ...prev, 
        multiKeywordsLoading: false,
        allKeywordsLoading: false
      }));
    }
  };

  // 四象限数据获取
  const fetchQuadrantData = async () => {
    if (!id) return;
    
    try {
      setLoadingState(prev => ({...prev, quadrantLoading: true}));
      const data = await searchTermReportApi.fetchQuadrantData(id);
      setReportData(prev => ({...prev, quadrantData: data}));
    } finally {
      setLoadingState(prev => ({...prev, quadrantLoading: false}));
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
    fetchQuadrantData
  };
};