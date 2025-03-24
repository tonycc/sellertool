import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

class SearchTermReport extends Model {}

SearchTermReport.init({
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
  date:{
    type: DataTypes.DATE,
    allowNull: false
  },
  adPortfolioName: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: '默认产品组合'
  },
  Currency: {
    type: DataTypes.STRING,
    allowNull: false
  },
  campaignName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  adGroupName:{
    type: DataTypes.STRING,
    allowNull: false
  },
  targeting: {
    type: DataTypes.STRING,
    allowNull: false
  },
  matchType: {
    type: DataTypes.STRING,
    allowNull: false
  },
  customerSearchTerm: {
    type: DataTypes.STRING,
    allowNull: false
  },
 
  impressions: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  clicks: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  ctr: {
    type: DataTypes.DECIMAL(10, 4),
    allowNull: false
  },
  cpc: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  spend: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  sales: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  acos: {
    type: DataTypes.DECIMAL(10, 4),
    allowNull: false
  },
  roas: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  orders: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  unitsSold: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  
  conversionRate: {
    type: DataTypes.DECIMAL(10, 4),
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'SearchTermReport',
  tableName: 'SearchTermReports', // 添加明确的表名
  timestamps: true
});

// 添加关联关系
SearchTermReport.associate = (models) => {
  SearchTermReport.belongsTo(models.ReportFile, { foreignKey: 'reportFileId' });
};

export default SearchTermReport;
