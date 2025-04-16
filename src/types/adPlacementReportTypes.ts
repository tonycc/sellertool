export interface PlacementData {
  placement: string;
  impressions: number;
  clicks: number;
  spend: number;
  sales: number;
  orders: number;
  acos: number;
  roas: number;
  ctr: number;
  conversionRate: number;
}

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
  placements?: string[];
  // 广告位逐行显示相关字段
  placement?: string;
  placementDisplay?: string;
  isFirstPlacement?: boolean;
  placementCount?: number;
}

export interface ReportDetail {
  id: string;
  fileName: string;
  fileType: string;
  uploadedAt: string;
  reportDateRange: string;
}

export interface SummaryData {
  totalImpressions: number;
  totalClicks: number;
  totalSpend: number;
  totalSales: number;
  totalOrders: number;
  ctr: number;
  acos: number;
  roas: number;
  conversionRate: number;
  cpc: number;
}