import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    logging: false,
    define: {
      freezeTableName: false,
      underscored: false
    },
    dialectOptions: {
      // PostgreSQL默认使用UTF-8，不需要指定charset和collate
      // 移除MySQL特有的设置
      useUTC: false,
      timezone: '+08:00'
    }
  }
);

export const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('PostgreSQL连接成功');
    return true;
  } catch (error) {
    console.error('无法连接到数据库:', error);
    return false;
  }
};

export default sequelize;