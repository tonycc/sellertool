import { message } from 'antd';
import apiClient from './client';

type ErrorHandlerConfig = {
  defaultError?: string;
  authError?: string;
  notFoundError?: string;
};

const handleApiError = (error: any, config?: ErrorHandlerConfig) => {
  if (error.response) {
    const status = error.response.status;
    const errorData = error.response.data;

    if (status === 404) {
      message.error(config?.notFoundError || '资源不存在');
    } else if (status === 403) {
      message.error(config?.authError || '没有访问权限');
    } else if (status === 401) {
      message.error('登录已过期，请重新登录');
    } else {
      message.error(errorData?.message || config?.defaultError || '请求失败');
    }
  } else if (error.request) {
    message.error('服务器无响应，请检查网络连接');
  } else {
    message.error('请求配置错误，请稍后重试');
  }
};

export const searchTermReportApi = {
  fetchMultiCampaignKeywords: async (reportId: string) => {
    try {
      const response = await apiClient.get(`/api/search-terms/multi-campaign-keywords/${reportId}`);     
      return {
        ...response.data,
        allKeywordsWithOrders: response.data.allKeywordsWithOrders || response.data.multiCampaignKeywords || []
      };
    } catch (error) {
      handleApiError(error, {
        defaultError: '获取多广告组搜索词失败',
        notFoundError: '报表不存在或已被删除'
      });
      throw error;
    }
  },

  fetchKeywordCampaignMapping: async (reportId: string) => {
    try {
      const response = await apiClient.get(`/api/search-terms/keyword-campaign-mapping/${reportId}`);
      return response.data.keywordMappingStats;
    } catch (error) {
      handleApiError(error, {
        defaultError: '获取搜索词映射关系失败',
        notFoundError: '报表不存在或已被删除'
      });
      throw error;
    }
  },

  fetchQuadrantData: async (reportId: string) => {
    try {
      const response = await apiClient.get(`/api/search-terms/quadrant-analysis/${reportId}`);
      return response.data.quadrantData;
    } catch (error) {
      handleApiError(error, {
        defaultError: '获取四象限分析数据失败',
        notFoundError: '报表不存在或已被删除'
      });
      throw error;
    }
  },

  fetchReportDetail: async (reportId: string) => {
    try {
      const response = await apiClient.get(`/api/reports/campaign-summary/${reportId}`);
      return {
        report: response.data.report,
        campaignData: response.data.campaignData.map(processCampaignData),
        summary: response.data.summary
      };
    } catch (error) {
      handleApiError(error, {
        defaultError: '获取报表详情失败',
        notFoundError: '报表不存在或已被删除'
      });
      throw error;
    }
  }
};

const processCampaignData = (item: any) => ({
  ...item,
  spend: Number(item.spend),
  sales: Number(item.sales),
  acos: Number(item.acos),
  conversionRate: Number(item.conversionRate)
});