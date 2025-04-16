import express from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import ReportFile from '../models/ReportFile.js';
import SearchTermReport from '../models/SearchTermReport.js';
import { Op } from 'sequelize';

const router = express.Router();

// 获取搜索词四象限分析数据
router.get('/quadrant-analysis/:id', authenticate, async (req, res) => {
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
    
    // 获取搜索词报告数据
    const searchTerms = await SearchTermReport.findAll({
      where: { reportFileId: reportId },
      attributes: [
        'id', 'customerSearchTerm', 'impressions', 'clicks', 'orders',
        'ctr', 'conversionRate', 'spend', 'sales'
      ]
    });
    
    // 按搜索词维度合并数据
    const mergedSearchTerms = [];
    const searchTermMap = new Map();
    
    // 第一步：按搜索词分组并累加数据
    searchTerms.forEach(term => {
      const keyword = term.customerSearchTerm;
      const termData = {
        id: term.id,
        customerSearchTerm: keyword,
        impressions: parseInt(term.impressions) || 0,
        clicks: parseInt(term.clicks) || 0,
        orders: parseInt(term.orders) || 0,
        spend: parseFloat(term.spend) || 0,
        sales: parseFloat(term.sales) || 0
      };
      
      if (searchTermMap.has(keyword)) {
        // 合并相同搜索词的数据
        const existingTerm = searchTermMap.get(keyword);
        existingTerm.impressions += termData.impressions;
        existingTerm.clicks += termData.clicks;
        existingTerm.orders += termData.orders;
        existingTerm.spend += termData.spend;
        existingTerm.sales += termData.sales;
      } else {
        // 新增搜索词
        searchTermMap.set(keyword, termData);
      }
    });
    
    // 第二步：重新计算合并后的点击率和转化率
    searchTermMap.forEach((term) => {
      // 计算点击率 (CTR)
      term.ctr = term.impressions > 0 ? term.clicks / term.impressions : 0;
      
      // 计算转化率 (CVR)
      term.conversionRate = term.clicks > 0 ? term.orders / term.clicks : 0;
      
      mergedSearchTerms.push(term);
    });
    
    // 使用固定值作为CTR和CVR的基准线
    // CTR基准: 0.1 (10%)
    // CVR基准: 0.1 (10%)
    
    // 对搜索词进行四象限分类
    const quadrantData = {
      starKeywords: [], // 高点击率，高转化率（明星词）
      problemKeywords: [], // 高点击率，低转化率（问题词）
      potentialKeywords: [], // 低点击率，高转化率（潜力词）
      ineffectiveKeywords: [], // 低点击率，低转化率（无效词）
    };
    
    mergedSearchTerms.forEach(term => {
      // 只处理有效的数据点
      if (term.impressions > 0) {
        const termCTR = term.ctr;
        const termCVR = term.conversionRate;
        
        const termData = {
          id: term.id,
          keyword: term.customerSearchTerm,
          impressions: term.impressions,
          clicks: term.clicks,
          orders: term.orders,
          ctr: termCTR,
          cvr: termCVR,
          spend: term.spend,
          sales: term.sales
        };
        
        // 使用固定基准值0.1(10%)进行四象限分类
        // 高点击率和高转化率（明星词）
        if (termCTR >= 0.1 && termCVR >= 0.1) {
          quadrantData.starKeywords.push(termData);
        }
        // 高点击率和低转化率（问题词）
        else if (termCTR >= 0.1 && termCVR < 0.1) {
          quadrantData.problemKeywords.push(termData);
        } 
        // 低点击率和高转化率（潜力词）
        else if (termCTR < 0.1 && termCVR >= 0.1) {
          quadrantData.potentialKeywords.push(termData);
        }
        // 低点击率和低转化率（无效词）
        else {
          quadrantData.ineffectiveKeywords.push(termData);
        }
       
      }
    });
    
    // 不再计算各象限的汇总数据，前端可以根据需要自行计算
    
    res.json({
      report: {
        id: report.id,
        fileName: report.fileName,
        fileType: report.reportType,
        reportDateRange: report.reportDateRange || '未知日期',
        uploadedAt: report.createdAt
      },
      quadrantData,
      //summary
    });
  } catch (error) {
    console.error('获取搜索词四象限分析失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

// 获取搜索词与广告组映射关系数据
router.get('/keyword-campaign-mapping/:id', authenticate, async (req, res) => {
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
    
    // 获取搜索词报告数据
    const searchTerms = await SearchTermReport.findAll({
      where: { reportFileId: reportId },
      attributes: [
        'id', 'customerSearchTerm', 'campaignName'
      ]
    });
    
    // 按搜索词维度构建映射关系
    const keywordMap = new Map();
    
    searchTerms.forEach(term => {
      const keyword = term.customerSearchTerm;
      const campaignName = term.campaignName;
      
      if (!keywordMap.has(keyword)) {
        keywordMap.set(keyword, new Set());
      }
      
      keywordMap.get(keyword).add(campaignName);
    });
    
    // 构建响应数据
    const keywordMappings = [];
    let multiCampaignKeywords = 0;
    let maxCampaignCount = 0;
    
    keywordMap.forEach((campaigns, keyword) => {
      const campaignCount = campaigns.size;
      
      if (campaignCount > 1) {
        multiCampaignKeywords++;
      }
      
      if (campaignCount > maxCampaignCount) {
        maxCampaignCount = campaignCount;
      }
      
      keywordMappings.push({
        keyword,
        campaignCount,
        campaigns: Array.from(campaigns)
      });
    });
    
    // 按照关联广告组数量降序排序
    keywordMappings.sort((a, b) => b.campaignCount - a.campaignCount);    
    res.json({
      report: {
        id: report.id,
        fileName: report.fileName,
        fileType: report.reportType,
        reportDateRange: report.reportDateRange || '未知日期',
        uploadedAt: report.createdAt
      },
      keywordMappingStats: {
        totalKeywords: keywordMap.size,
        multiCampaignKeywords,
        maxCampaignCount,
        keywordMappings
      }
    });
  } catch (error) {
    console.error('获取搜索词与广告组映射关系失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

// 获取多广告组搜索词详细数据
router.get('/multi-campaign-keywords/:id', authenticate, async (req, res) => {
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
    
    // 获取搜索词报告数据
    const searchTerms = await SearchTermReport.findAll({
      where: { reportFileId: reportId },
      attributes: [
        'id', 'customerSearchTerm', 'campaignName', 'impressions', 'clicks', 'orders',
        'ctr', 'conversionRate', 'spend', 'sales'
      ]
    });
    
    // 按搜索词和广告组维度构建映射关系
    const keywordCampaignMap = new Map();
    
    searchTerms.forEach(term => {
      const keyword = term.customerSearchTerm;
      const campaignName = term.campaignName;
      
      if (!keywordCampaignMap.has(keyword)) {
        keywordCampaignMap.set(keyword, new Map());
      }
      
      const campaignMap = keywordCampaignMap.get(keyword);
      
      if (!campaignMap.has(campaignName)) {
        campaignMap.set(campaignName, {
          campaignName,
          impressions: 0,
          clicks: 0,
          orders: 0,
          spend: 0,
          sales: 0,
          ctr: 0,
          cvr: 0,
          acos: 0,
          roas: 0,
          conversionRate: 0
        });
      }
      
      const campaignData = campaignMap.get(campaignName);
      campaignData.impressions += parseInt(term.impressions) || 0;
      campaignData.clicks += parseInt(term.clicks) || 0;
      campaignData.orders += parseInt(term.orders) || 0;
      campaignData.spend += parseFloat(term.spend) || 0;
      campaignData.sales += parseFloat(term.sales) || 0;
    });
    
    // 构建多广告组搜索词数据
    const multiCampaignKeywords = [];
    const allKeywordsWithOrders = [];
    
    keywordCampaignMap.forEach((campaignMap, keyword) => {
      const campaignDetails = [];
      let hasOrders = false;
      
      campaignMap.forEach(campaignData => {
        // 计算指标
        campaignData.ctr = campaignData.impressions > 0 ? 
          (campaignData.clicks / campaignData.impressions) : 0;
        
        campaignData.conversionRate = campaignData.clicks > 0 ? 
          (campaignData.orders / campaignData.clicks) : 0;
        
        campaignData.acos = campaignData.sales > 0 ? 
          (campaignData.spend / campaignData.sales) : 0;
        
        campaignData.roas = campaignData.spend > 0 ? 
          (campaignData.sales / campaignData.spend) : 0;
        
        campaignData.cvr = campaignData.conversionRate;
        
        campaignDetails.push(campaignData);
        
        // 检查是否有订单
        if (campaignData.orders > 0) {
          hasOrders = true;
        }
      });
      
      // 按照花费降序排序
      campaignDetails.sort((a, b) => b.spend - a.spend);
      
      // 基础关键词数据结构
      const keywordData = {
        keyword,
        campaignCount: campaignMap.size,
        campaignDetails
      };
      
      // 添加到适当的数组中
      if (campaignMap.size > 1) {
        multiCampaignKeywords.push(keywordData);
      }
      
      // 如果有订单，添加到所有出单关键词
      if (hasOrders) {
        allKeywordsWithOrders.push(keywordData);
      }
    });
    
    // 按照关联广告组数量降序排序
    multiCampaignKeywords.sort((a, b) => b.campaignCount - a.campaignCount);
    
    // 按照订单数量排序(通过计算总订单)
    allKeywordsWithOrders.sort((a, b) => {
      const aOrders = a.campaignDetails.reduce((sum, detail) => sum + detail.orders, 0);
      const bOrders = b.campaignDetails.reduce((sum, detail) => sum + detail.orders, 0);
      return bOrders - aOrders;
    });
    
    res.json({
      report: {
        id: report.id,
        fileName: report.fileName,
        fileType: report.reportType,
        reportDateRange: report.reportDateRange || '未知日期',
        uploadedAt: report.createdAt
      },
      multiCampaignKeywords,
      allKeywordsWithOrders
    });
  } catch (error) {
    console.error('获取多广告组搜索词详细数据失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

export default router;