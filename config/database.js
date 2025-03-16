import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// 创建Sequelize实例
const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '111111',
  database: process.env.DB_NAME || 'sellertool',
  logging: process.env.ENABLE_SQL_LOGGING === 'true' ? console.log : false, // 根据环境变量控制日志输出
  define: {
    timestamps: true,
    underscored: false
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

// 测试数据库连接
export const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('PostgreSQL连接成功');
    return true;
  } catch (error) {
    console.error('PostgreSQL连接失败:', error);
    return false;
  }
};

export default sequelize;