export interface CampaignData {
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

export interface ReportSummary {
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

export interface ReportDetail {
  id: string;
  fileName: string;
  fileType: string;
  uploadedAt: string;
  reportDateRange: string;
}

export interface KeywordData {
  id: string;
  keyword: string;
  impressions: number;
  clicks: number;
  orders: number;
  ctr: number;
  cvr: number;
  spend: number;
  sales: number;
  quadrant?: string;
  quadrantColor?: string;
}

export interface QuadrantData {
  starKeywords: KeywordData[];
  problemKeywords: KeywordData[];
  potentialKeywords: KeywordData[];
  ineffectiveKeywords: KeywordData[];
  avgCTR: number;
  avgCVR: number;
}

export interface KeywordCampaignMapping {
  keyword: string;
  campaignCount: number;
  campaigns: string[];
}

export interface KeywordMappingStats {
  totalKeywords: number;
  multiCampaignKeywords: number;
  maxCampaignCount: number;
}


export interface MultiCampaignKeyword {
  keyword: string;
  campaignName: string; // 保留以兼容现有代码
  campaignCount: number; // 搜索词出现在多少个广告组中
  campaigns: string[]; // 搜索词出现的广告组列表
  impressions: number;
  clicks: number;
  orders: number;
  spend: number;
  sales: number;
  ctr: number;
  cvr: number;
  acos: number;
  roas: number;
  conversionRate: number;
  campaignDetails: {
    campaignName: string;
    impressions: number;
    clicks: number;
    orders: number;
    spend: number;
    sales: number;
    ctr: number;
    cvr: number;
    acos: number;
    roas: number;
    conversionRate: number;
  }[];
}

// 扩展MultiCampaignKeyword接口，用于多广告组搜索词表格
export interface ExtendedMultiCampaignKeyword extends MultiCampaignKeyword {
  totalImpressions: number;
  totalClicks: number;
  totalOrders: number;
  totalSpend: number;
  totalSales: number;
  avgCtr: number;
  avgCvr: number;
  avgAcos: number;
}