import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

class AdPlacementReport extends Model {}

AdPlacementReport.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  reportFileId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'ReportFiles',
      key: 'id',
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    }
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '开始日期'
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '结束日期'
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: '报告日期'
  },
  adPortfolioName: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: '默认广告组合',
    comment: '广告组合名称'
  },
  Currency: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: '货币'
  },
  campaignName: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: '广告活动名称'
  },
  retailer: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: '零售商'
  },
  region: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: '国家/地区'
  },
  biddingStrategy: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: '竞价策略'
  },
  placement: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: '广告位'
  },
  impressions: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '展示量'
  },
  clicks: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '点击量'
  },
  cpc: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: '每次点击成本(CPC)'
  },
  spend: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: '花费'
  },
  sales: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: '7天总销售额'
  },
  acos: {
    type: DataTypes.DECIMAL(10, 4),
    allowNull: false,
    comment: '广告投入产出比 (ACOS) 总计'
  },
  roas: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: '总广告投资回报率 (ROAS)'
  },
  orders: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '7天总订单数(#)'
  },
  unitsSold: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '7天总销售量(#)'
  }
}, {
  sequelize,
  modelName: 'AdPlacementReport',
  tableName: 'AdPlacementReports', // 添加明确的表名
  timestamps: true
});

// 添加关联关系
AdPlacementReport.associate = (models) => {
  AdPlacementReport.belongsTo(models.ReportFile, { foreignKey: 'reportFileId' });
};

export default AdPlacementReport;