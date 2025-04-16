import express from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import ReportFile from '../models/ReportFile.js';
import AdPlacementReport from '../models/AdPlacementReport.js';

const router = express.Router();

// 获取广告位广告报表分析数据
router.get('/placement-analysis/:id', authenticate, async (req, res) => {
  try {
    const reportId = req.params.id;
    
    // 获取报告文件信息
    const report = await ReportFile.findOne({
      where: { 
        id: reportId,
        userId: req.user.id 
      },
      attributes: ['id', 'fileName', 'reportCategory', 'reportType', 'reportDateRange', 'createdAt']
    });
    
    if (!report) {
      return res.status(404).json({ message: '报告不存在' });
    }
    
    // 获取广告位广告报表数据
    const placements = await AdPlacementReport.findAll({
      where: { reportFileId: reportId },
      attributes: [
        'id', 'placement', 'impressions', 'clicks', 'orders',
        'spend', 'sales', 'acos', 'roas'
      ]
    });
    
    // 按广告位维度合并数据
    const mergedPlacements = [];
    const placementMap = new Map();
    
    // 第一步：按广告位分组并累加数据
    placements.forEach(placement => {
      const placementName = placement.placement;
      const placementData = {
        id: placement.id,
        placement: placementName,
        impressions: parseInt(placement.impressions) || 0,
        clicks: parseInt(placement.clicks) || 0,
        orders: parseInt(placement.orders) || 0,
        spend: parseFloat(placement.spend) || 0,
        sales: parseFloat(placement.sales) || 0,
        acos: parseFloat(placement.acos) || 0,
        roas: parseFloat(placement.roas) || 0
      };
      
      if (placementMap.has(placementName)) {
        // 合并相同广告位的数据
        const existingPlacement = placementMap.get(placementName);
        existingPlacement.impressions += placementData.impressions;
        existingPlacement.clicks += placementData.clicks;
        existingPlacement.orders += placementData.orders;
        existingPlacement.spend += placementData.spend;
        existingPlacement.sales += placementData.sales;
      } else {
        // 新增广告位
        placementMap.set(placementName, placementData);
      }
    });
    
    // 第二步：重新计算合并后的指标
    placementMap.forEach((placement) => {
      // 计算点击率 (CTR)
      placement.ctr = placement.impressions > 0 ? placement.clicks / placement.impressions : 0;
      
      // 计算转化率 (CVR)
      placement.conversionRate = placement.clicks > 0 ? placement.orders / placement.clicks : 0;
      
      // 重新计算ACOS
      placement.acos = placement.sales > 0 ? (placement.spend / placement.sales) * 100 : 0;
      
      // 重新计算ROAS
      placement.roas = placement.spend > 0 ? placement.sales / placement.spend : 0;
      
      mergedPlacements.push(placement);
    });
    
    // 计算汇总数据
    const summary = mergedPlacements.reduce((acc, placement) => {
      acc.totalImpressions += placement.impressions;
      acc.totalClicks += placement.clicks;
      acc.totalOrders += placement.orders;
      acc.totalSpend += placement.spend;
      acc.totalSales += placement.sales;
      return acc;
    }, {
      totalImpressions: 0,
      totalClicks: 0,
      totalOrders: 0,
      totalSpend: 0,
      totalSales: 0
    });
    
    // 计算派生指标
    summary.ctr = summary.totalImpressions > 0 
      ? ((summary.totalClicks / summary.totalImpressions) * 100).toFixed(2) + '%'
      : '0.00%';
      
    summary.acos = summary.totalSales > 0
      ? ((summary.totalSpend / summary.totalSales) * 100).toFixed(2) + '%'
      : '0.00%';
      
    summary.conversionRate = summary.totalClicks > 0
      ? ((summary.totalOrders / summary.totalClicks) * 100).toFixed(2) + '%'
      : '0.00%';
      
    summary.cpc = summary.totalClicks > 0
      ? (summary.totalSpend / summary.totalClicks).toFixed(2)
      : '0.00';
    
    // 格式化报告信息
    const reportInfo = {
      id: report.id,
      fileName: report.fileName,
      fileType: report.reportType,
      reportDateRange: report.reportDateRange || '未知日期',
      uploadedAt: report.createdAt
    };
    
    res.json({
      report: reportInfo,
      placements: mergedPlacements,
      summary
    });
  } catch (error) {
    console.error('获取广告位广告报表分析失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

// 获取按广告活动汇总的广告位报表数据
router.get('/placement-campaign-summary/:id', authenticate, async (req, res) => {
  try {
    const reportId = req.params.id;
    
    // 获取报告文件信息
    const report = await ReportFile.findOne({
      where: { 
        id: reportId,
        userId: req.user.id 
      },
      attributes: ['id', 'fileName', 'reportCategory', 'reportType', 'reportDateRange', 'createdAt']
    });
    
    if (!report) {
      return res.status(404).json({ message: '报告不存在' });
    }
    
    // 获取广告位广告报表数据
    const placements = await AdPlacementReport.findAll({
      where: { reportFileId: reportId },
      attributes: [
        'campaignName', 'placement', 'impressions', 'clicks', 'spend', 'sales', 'orders', 'acos', 'roas'
      ]
    });
    
    // 按广告活动名称和广告位分组并汇总数据
    const campaignPlacementSummary = {};
    
    placements.forEach(placement => {
      const campaignName = placement.campaignName;
      const placementName = placement.placement;
      
      // 初始化广告活动数据
      if (!campaignPlacementSummary[campaignName]) {
        campaignPlacementSummary[campaignName] = {
          campaignName,
          placements: {},
          totalImpressions: 0,
          totalClicks: 0,
          totalSpend: 0,
          totalSales: 0,
          totalOrders: 0
        };
      }
      
      // 初始化广告位数据
      if (!campaignPlacementSummary[campaignName].placements[placementName]) {
        campaignPlacementSummary[campaignName].placements[placementName] = {
          placementName,
          impressions: 0,
          clicks: 0,
          spend: 0,
          sales: 0,
          orders: 0
        };
      }
      
      // 累加数据
      const campaignData = campaignPlacementSummary[campaignName];
      const placementData = campaignData.placements[placementName];
      
      // 更新广告位数据
      placementData.impressions += parseInt(placement.impressions) || 0;
      placementData.clicks += parseInt(placement.clicks) || 0;
      placementData.spend += parseFloat(placement.spend) || 0;
      placementData.sales += parseFloat(placement.sales) || 0;
      placementData.orders += parseInt(placement.orders) || 0;
      
      // 更新广告活动汇总数据
      campaignData.totalImpressions += parseInt(placement.impressions) || 0;
      campaignData.totalClicks += parseInt(placement.clicks) || 0;
      campaignData.totalSpend += parseFloat(placement.spend) || 0;
      campaignData.totalSales += parseFloat(placement.sales) || 0;
      campaignData.totalOrders += parseInt(placement.orders) || 0;
    });
    
    // 转换为数组并计算派生指标
    const campaignSummary = Object.values(campaignPlacementSummary).map(campaign => {
      // 计算广告活动级别的派生指标
      const campaignMetrics = {
        campaignName: campaign.campaignName,
        impressions: campaign.totalImpressions,
        clicks: campaign.totalClicks,
        spend: campaign.totalSpend,
        sales: campaign.totalSales,
        orders: campaign.totalOrders,
        ctr: campaign.totalImpressions > 0 ? (campaign.totalClicks / campaign.totalImpressions) : 0,
        cpc: campaign.totalClicks > 0 ? (campaign.totalSpend / campaign.totalClicks) : 0,
        acos: campaign.totalSales > 0 ? (campaign.totalSpend / campaign.totalSales) * 100 : 0,
        roas: campaign.totalSpend > 0 ? (campaign.totalSales / campaign.totalSpend) : 0,
        conversionRate: campaign.totalClicks > 0 ? (campaign.totalOrders / campaign.totalClicks) : 0
      };
      
      // 转换广告位数据为数组并计算派生指标
      const placementMetrics = Object.values(campaign.placements).map(placement => {
        return {
          placementName: placement.placementName,
          impressions: placement.impressions,
          clicks: placement.clicks,
          spend: placement.spend,
          sales: placement.sales,
          orders: placement.orders,
          ctr: placement.impressions > 0 ? (placement.clicks / placement.impressions) : 0,
          cpc: placement.clicks > 0 ? (placement.spend / placement.clicks) : 0,
          acos: placement.sales > 0 ? (placement.spend / placement.sales) * 100 : 0,
          roas: placement.spend > 0 ? (placement.sales / placement.spend) : 0,
          conversionRate: placement.clicks > 0 ? (placement.orders / placement.clicks) : 0
        };
      });
      
      return {
        ...campaignMetrics,
        placements: placementMetrics
      };
    });
    
    // 计算总体汇总数据
    const summary = campaignSummary.reduce((acc, campaign) => {
      acc.totalImpressions += campaign.impressions;
      acc.totalClicks += campaign.clicks;
      acc.totalSpend += campaign.spend;
      acc.totalSales += campaign.sales;
      acc.totalOrders += campaign.orders;
      return acc;
    }, {
      totalImpressions: 0,
      totalClicks: 0,
      totalSpend: 0,
      totalSales: 0,
      totalOrders: 0
    });
    
    // 计算派生指标
    summary.ctr = summary.totalImpressions > 0 
      ? ((summary.totalClicks / summary.totalImpressions) * 100).toFixed(2) + '%'
      : '0.00%';
      
    summary.acos = summary.totalSales > 0
      ? ((summary.totalSpend / summary.totalSales) * 100).toFixed(2) + '%'
      : '0.00%';
      
    summary.conversionRate = summary.totalClicks > 0
      ? ((summary.totalOrders / summary.totalClicks) * 100).toFixed(2) + '%'
      : '0.00%';
      
    summary.cpc = summary.totalClicks > 0
      ? (summary.totalSpend / summary.totalClicks).toFixed(2)
      : '0.00';
    
    // 格式化报告信息
    const reportInfo = {
      id: report.id,
      fileName: report.fileName,
      fileType: report.reportType,
      reportDateRange: report.reportDateRange || '未知日期',
      uploadedAt: report.createdAt
    };
    
    res.json({
      report: reportInfo,
      campaigns: campaignSummary,
      summary
    });
  } catch (error) {
    console.error('获取广告位广告报表活动汇总失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

export default router;