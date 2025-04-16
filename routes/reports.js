import express from 'express';
import multer from 'multer';
import { parse } from 'csv-parse';
import { Readable } from 'stream';
import ExcelJS from 'exceljs';
import path from 'path';
import ReportFile from '../models/ReportFile.js';
import SearchTermReport from '../models/SearchTermReport.js';
import AdPlacementReport from '../models/AdPlacementReport.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

// 获取报告列表
router.get('/list', authenticate, async (req, res) => {
  try {
    const reports = await ReportFile.findAll({
      where: { userId: req.user.id },
      attributes: ['id', 'fileName', 'reportCategory', 'reportType', 'reportDateRange', 'createdAt']
    });
    
    // 将createdAt映射为uploadedAt以匹配前端期望的字段
    const formattedReports = reports.map(report => {
      const reportObj = report.toJSON();
      reportObj.uploadedAt = reportObj.createdAt;
      return reportObj;
    });
    
    res.json({ reports: formattedReports });
  } catch (error) {
    console.error('获取报告列表失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

// 获取报告原始数据
router.get('/raw-data/:id', authenticate, async (req, res) => {
  try {
    const reportId = req.params.id;
    const report = await ReportFile.findOne({
      where: { id: reportId, userId: req.user.id },
      attributes: ['id', 'fileName', 'content']
    });
    if (!report) {
      return res.status(404).json({ message: '报表不存在或已被删除' });
    }
    
    res.json({ rawData: report.content });
  } catch (error) {
    console.error('获取报表原始数据失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});


// 配置文件上传
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 限制10MB
  }
});

// 上传并解析报告
router.post('/upload', authenticate, upload.single('file'), async (req, res) => {
  
  try {
    const { buffer, originalname } = req.file;
    const userId = req.user.id; // 假设使用了认证中间件
    const fileExtension = path.extname(originalname).toLowerCase();
    
    let records = [];
    
    // 根据文件扩展名选择解析方法
    if (fileExtension === '.csv') {
      // 解析CSV文件
      const parser = parse({
        columns: true,
        skip_empty_lines: true
      });

      // 将buffer转换为可读流
      const stream = Readable.from(buffer.toString());

      // 处理解析后的数据
      for await (const record of stream.pipe(parser)) {
        records.push(record);
      }
    } else if (fileExtension === '.xlsx' || fileExtension === '.xls') {
      // 解析Excel文件
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer);
      
      // 获取第一个工作表
      const worksheet = workbook.worksheets[0];
      
      // 将工作表转换为JSON
      records = [];
      // 获取表头行
      const headerRow = worksheet.getRow(1);
      const headers = [];
      headerRow.eachCell((cell, colNumber) => {
        headers[colNumber - 1] = cell.value;
      });
      
      // 从第二行开始读取数据
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1) { // 跳过表头行
          const rowData = {};
          row.eachCell((cell, colNumber) => {
            rowData[headers[colNumber - 1]] = cell.value;
          });
          records.push(rowData);
        }
      });
    } else {
      throw new Error('不支持的文件格式');
    }

    // 处理文件名编码问题
    // 检查是否是URL编码的文件名（来自请求体）
    let fileName = originalname;
    if (req.body.fileName && req.body.fileName.includes('%')) {
      try {
        // 从请求体获取正确的URL编码文件名并解码
        fileName = decodeURIComponent(req.body.fileName);
        console.log('从请求体解码的文件名:', fileName);
      } catch (e) {
        console.error('文件名解码错误:', e);
      }
    }
    
    // 提取报表日期区间信息
    let reportDateRange = null;
    
    // 尝试从所有记录中提取日期信息
    if (records.length > 0) {
      // 常见的日期字段名称
      const dateFieldNames = [
        'Date', 'date', 'Report Date', 'report date', 'Date Range', 'date range',
        'Start Date', 'start date', 'End Date', 'end date',
        '日期', '报告日期', '日期范围', '开始日期', '结束日期'
      ];
      
      let startDate = null;
      let endDate = null;
      
      // 遍历所有记录，找出最早和最晚的日期
      for (const record of records) {
        // 检查记录中的所有字段，寻找日期信息
        for (const key in record) {
          // 检查字段名是否包含日期相关关键词
          const isDateField = dateFieldNames.some(name => 
            key.toLowerCase().includes(name.toLowerCase()));
            
          if (isDateField) {
            const dateValue = record[key];
            if (dateValue) {
              try {
                // 尝试解析日期值
                const parsedDate = new Date(dateValue);
                if (!isNaN(parsedDate.getTime())) {
                  // 有效日期
                  if (!startDate || parsedDate < startDate) {
                    startDate = parsedDate;
                  }
                  if (!endDate || parsedDate > endDate) {
                    endDate = parsedDate;
                  }
                }
              } catch (e) {
                console.log(`无法解析日期字段 ${key}: ${dateValue}`);
              }
            }
          }
        }
      }
      
      // 格式化日期区间
      if (startDate && endDate) {
        const formatDate = (date) => {
          return date.toISOString().split('T')[0]; // YYYY-MM-DD 格式
        };
        reportDateRange = `${formatDate(startDate)}至${formatDate(endDate)}`;
      }
    }
    
    // 存储原始文件数据
    const reportFile = await ReportFile.create({
      userId,
      fileName: fileName,
      reportCategory: req.body.reportCategory || 'sp',
      reportType: req.body.reportType || 'SEARCH_TERM_REPORT',
      reportDateRange: reportDateRange, // 添加日期区间信息
      content: records
    });

    // 根据报表类型处理数据
    if (req.body.reportType === 'AD_PLACEMENT_REPORT') {
      // 处理广告位广告报表数据
      const adPlacementData = records.map(record => {
        // 安全解析数值，避免NaN值
        const safeParseInt = (value) => {
          const parsed = parseInt(value, 10);
          return isNaN(parsed) ? 0 : parsed;
        };
        
        const safeParseFloat = (value) => {
          const parsed = parseFloat(value);
          return isNaN(parsed) ? 0 : parsed;
        };

        // 处理中英文字段名称映射
        const getField = (names, defaultValue = '') => {
          // 扩展字段别名映射
          const fieldAliases = {
            '总订单数': ['Total Orders', 'Orders', '订单总数', '7天总订单数(#)'],
            '总销售量': ['Total Units', 'Units Sold', 'Units', '总销售量', '7天总销售量(#)']
          };

          // 优先处理字段别名
          const allNames = names.reduce((acc, name) => {
            const aliases = fieldAliases[name] || [];
            return acc.concat(name, ...aliases);
          }, []);

          // 查找第一个有效字段
          const validName = allNames.find(name => record[name] !== undefined && record[name] !== '');
          
          // 数值字段特殊处理：空值时返回默认值
          return validName ? record[validName] : defaultValue;
        };
        
        // 从记录中解析日期
        const recordDate = record['Date'] || record['日期'] || record['Report Date'];
        let parsedRecordDate = null;
        if (recordDate) {
          try {
            parsedRecordDate = new Date(recordDate);
            if (isNaN(parsedRecordDate.getTime())) parsedRecordDate = null;
          } catch (e) {
            console.log(`无法解析日期字段: ${recordDate}`);
          }
        }

        // 解析开始日期和结束日期
        let startDate = null;
        let endDate = null;
        
        const startDateField = record['Start Date'] || record['开始日期'];
        const endDateField = record['End Date'] || record['结束日期'];
        
        if (startDateField) {
          try {
            startDate = new Date(startDateField);
            if (isNaN(startDate.getTime())) startDate = null;
          } catch (e) {
            console.log(`无法解析开始日期字段: ${startDateField}`);
          }
        }
        
        if (endDateField) {
          try {
            endDate = new Date(endDateField);
            if (isNaN(endDate.getTime())) endDate = null;
          } catch (e) {
            console.log(`无法解析结束日期字段: ${endDateField}`);
          }
        }

        return {
          reportFileId: reportFile.id,
          date: parsedRecordDate || startDate,
          startDate: startDate,
          endDate: endDate,
          campaignName: getField(['Campaign Name', '广告活动名称'], '未知活动'),
          adPortfolioName: getField(['Portfolio Name', '广告组合名称'], '默认广告组合'),
          retailer: getField(['Retailer', '零售商'], ''),
          region: getField(['Region', '国家/地区'], ''),
          biddingStrategy: getField(['Bidding Strategy', '竞价策略'], ''),
          placement: getField(['Placement', '广告位', '放置'], '未知广告位'),
          Currency: getField(['Currency', '货币'], 'USD'),
          
          // 数值字段
          impressions: safeParseInt(record['Impressions'] || record['展示量']),
          clicks: safeParseInt(record['Clicks'] || record['点击量']),
          cpc: safeParseFloat(record['CPC'] || record['每次点击成本(CPC)']),
          spend: safeParseFloat(record['Spend'] || record['花费']),
          sales: safeParseFloat(record['Sales'] || record['7天总销售额']),
          acos: safeParseFloat(record['ACOS'] || record['广告投入产出比 (ACOS) 总计']),
          roas: safeParseFloat(record['ROAS'] || record['总广告投资回报率 (ROAS)']),
          orders: safeParseInt(getField(['Orders', '总订单数', '7天总订单数(#)'], 0)),
          unitsSold: safeParseInt(getField(['Units Sold', '总销售量', '总销量', '7天总销售量(#)'], 0))
        };
      });

      // 检查是否有数据
      if (adPlacementData.length === 0) {
        throw new Error('没有有效的数据记录');
      }
      
      try {
        await AdPlacementReport.bulkCreate(adPlacementData);
        
        res.status(200).json({
          success: true,
          message: '广告位报告上传成功',
          reportId: reportFile.id
        });
      } catch (dbError) {
        console.error('数据库插入错误:', dbError);
        // 删除已创建的报告文件记录
        await ReportFile.destroy({ where: { id: reportFile.id } });
        throw new Error(`数据库插入失败: ${dbError.message}`);
      }
    } else {
      // 处理搜索词报告数据（原有逻辑）
      const searchTermData = records.map(record => {
        // 安全解析数值，避免NaN值
        const safeParseInt = (value) => {
          const parsed = parseInt(value, 10);
          return isNaN(parsed) ? 0 : parsed;
        };
        
        const safeParseFloat = (value) => {
          const parsed = parseFloat(value);
          return isNaN(parsed) ? 0 : parsed;
        };

        // 处理中英文字段名称映射
        const getField = (names, defaultValue = '') => {
          // 扩展字段别名映射
          const fieldAliases = {
            '总订单数': ['Total Orders', 'Orders', '订单总数', '7天总订单数(#)'],
            '总销售量': ['Total Units', 'Units Sold', 'Units', '总销售量' , '7天总销售量(#)']
          };

          // 优先处理字段别名
          const allNames = names.reduce((acc, name) => {
            const aliases = fieldAliases[name] || [];
            return acc.concat(name, ...aliases);
          }, []);

          // 查找第一个有效字段
          const validName = allNames.find(name => record[name] !== undefined && record[name] !== '');
          
          // 数值字段特殊处理：空值时返回默认值
          return validName ? record[validName] : defaultValue;
        };
        
        // 从记录中解析日期
        const recordDate = record['Date'] || record['日期'] || record['Report Date'];
        let parsedRecordDate = null;
        if (recordDate) {
          try {
            parsedRecordDate = new Date(recordDate);
            if (isNaN(parsedRecordDate.getTime())) parsedRecordDate = null;
          } catch (e) {
            console.log(`无法解析日期字段: ${recordDate}`);
          }
        }

        return {
          reportFileId: reportFile.id,
          date: parsedRecordDate || startDate,
          campaignName: getField(['Campaign Name', '广告活动名称'], '未知活动'),
          adPortfolioName: getField(['Portfolio Name', '广告组合名称'], '默认广告组合'),
          adGroupName: getField(['Ad Group Name', '广告组名称'], ''),
          targeting: getField(['targeting', '投放'], ''),
          matchType: getField(['Match Type', '匹配类型'], 'exact'),
          customerSearchTerm: getField(['Customer Search Term', '客户搜索词'], '未知搜索词'),
          Currency: getField(['Currency', '货币'], 'USD'),
          
          // 数值字段
          impressions: safeParseInt(record['Impressions'] || record['展示量']),
          clicks: safeParseInt(record['Clicks'] || record['点击量']),
          ctr: safeParseFloat(record['CTR'] || record['点击率(CTR)']),
          cpc: safeParseFloat(record['CPC'] || record['每次点击成本(CPC)']),
          spend: safeParseFloat(record['Spend'] || record['花费']),
          sales: safeParseFloat(record['Sales'] || record['7天总销售额']),
          acos: safeParseFloat(record['ACOS'] || record['广告成本销售比(ACOS)']),
          roas: safeParseFloat(record['ROAS'] || record['投入产出比(ROAS)']),
          orders: safeParseInt(getField(['Orders', '总订单数'], 0)),
          unitsSold: safeParseInt(getField(['Units Sold', '总销售量', '总销量'], 0)),
          conversionRate: safeParseFloat(record['Conversion Rate'] || record['7天的转化率'])
        };
      });

      // 添加数据验证日志
      //console.log(`处理了 ${searchTermData.length} 条记录`);
      
      // 检查是否有数据
      if (searchTermData.length === 0) {
        throw new Error('没有有效的数据记录');
      }
      
      try {
        await SearchTermReport.bulkCreate(searchTermData);
        
        res.status(200).json({
          success: true,
          message: '报告上传成功',
          reportId: reportFile.id
        });
      } catch (dbError) {
        console.error('数据库插入错误:', dbError);
        // 删除已创建的报告文件记录
        await ReportFile.destroy({ where: { id: reportFile.id } });
        throw new Error(`数据库插入失败: ${dbError.message}`);
      }
    }
  } catch (error) {
    console.error('报告上传失败:', error);
    
    // 提供更详细的错误信息
    let errorMessage = '报告上传失败，请确保文件格式正确';
    
    if (error.message.includes('数据库插入失败')) {
      errorMessage = '数据处理失败，请检查报表数据格式';
    } else if (error.message === '没有有效的数据记录') {
      errorMessage = '上传的报表没有有效数据记录';
    } else if (error.message === '不支持的文件格式') {
      errorMessage = '不支持的文件格式，请上传CSV或Excel文件';
    }
    
    res.status(500).json({
      success: false,
      message: errorMessage
    });
  }
});



// 获取按广告活动汇总的报告数据
router.get('/campaign-summary/:id', authenticate, async (req, res) => {
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
        'campaignName', 'impressions', 'clicks', 'spend', 'sales', 'orders', 'acos', 'roas'
      ]
    });
    
    // 按广告活动名称分组并汇总数据
    const campaignSummary = searchTerms.reduce((acc, term) => {
      const campaignName = term.campaignName || '未知活动';
      
      if (!acc[campaignName]) {
        acc[campaignName] = {
          campaignName,
          impressions: 0,
          clicks: 0,
          spend: 0,
          sales: 0,
          orders: 0,
          acos: 0,
          roas: 0
        };
      }
      
      acc[campaignName].impressions += term.impressions;
      acc[campaignName].clicks += term.clicks;
      acc[campaignName].spend += parseFloat(term.spend);
      acc[campaignName].sales += parseFloat(term.sales);
      acc[campaignName].orders += term.orders;
      
      return acc;
    }, {});
    
    // 转换为数组并计算派生指标
    const campaignData = Object.values(campaignSummary).map(campaign => {
      // 修复浮点数精度问题
      campaign.spend = Number(campaign.spend.toFixed(2));
      campaign.sales = Number(campaign.sales.toFixed(2));
      
      // 计算点击率 (CTR)
      campaign.ctr = campaign.impressions > 0 
        ? (campaign.clicks / campaign.impressions).toFixed(4)
        : 0;
      
      // 计算ACOS
      campaign.acos = campaign.sales > 0 
        ? (campaign.spend / campaign.sales).toFixed(4)
        : 0;
      
      // 计算转化率
      campaign.conversionRate = campaign.clicks > 0 
        ? (campaign.orders / campaign.clicks).toFixed(4)
        : 0;
      
      // 计算CPC
      campaign.cpc = campaign.clicks > 0 
        ? (campaign.spend / campaign.clicks).toFixed(2)
        : 0;
      
      // 计算ROAS
      campaign.roas = campaign.spend > 0 
        ? (campaign.sales / campaign.spend).toFixed(2)
        : 0;
      
      return campaign;
    });
    
    // 计算总体汇总数据
    const totalSummary = campaignData.reduce((acc, campaign) => {
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
    
    // 计算总体派生指标
    totalSummary.ctr = totalSummary.totalImpressions > 0 
      ? ((totalSummary.totalClicks / totalSummary.totalImpressions) * 100).toFixed(2) + '%'
      : '0.00%';
      
    totalSummary.acos = totalSummary.totalSales > 0
      ? ((totalSummary.totalSpend / totalSummary.totalSales) * 100).toFixed(2) + '%'
      : '0.00%';
      
    totalSummary.conversionRate = totalSummary.totalClicks > 0
      ? ((totalSummary.totalOrders / totalSummary.totalClicks) * 100).toFixed(2) + '%'
      : '0.00%';
      
    totalSummary.cpc = totalSummary.totalClicks > 0
      ? (totalSummary.totalSpend / totalSummary.totalClicks).toFixed(2)
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
      campaignData,
      summary: totalSummary
    });
  } catch (error) {
    console.error('获取广告活动汇总数据失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

export default router;
