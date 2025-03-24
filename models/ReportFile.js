import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

class ReportFile extends Model {}

ReportFile.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id',
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    }
  },
  fileName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  reportCategory: {
    type: DataTypes.STRING,
    allowNull: true
  },
  reportType: {
    type: DataTypes.STRING,
    allowNull: true
  },
  reportDateRange: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: '报告的日期区间，格式为：YYYY-MM-DD至YYYY-MM-DD'
  },
  content: {
    type: DataTypes.JSONB,
    allowNull: false
  },
  
  uploadedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  sequelize,
  modelName: 'ReportFile',
  tableName: 'ReportFiles', // 添加明确的表名
  timestamps: true
});

// 添加关联关系
ReportFile.associate = (models) => {
  ReportFile.belongsTo(models.User, { foreignKey: 'userId' });
  ReportFile.hasMany(models.SearchTermReport, { foreignKey: 'reportFileId' });
};

export default ReportFile;
