import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import sequelize, { testConnection } from './config/database.js';

// 加载环境变量
dotenv.config();

// 初始化Express应用
const app = express();
const PORT = process.env.PORT || 5000;

// 中间件
app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// 路由
app.use('/api/auth', authRoutes);

// 数据库连接测试
testConnection()
  .then(async connected => {
    if (!connected) {
      console.error('无法连接到数据库，请检查配置');
      process.exit(1);
    }
    
    // 导入模型
    import('./models/User.js')
      .then(async () => {
        try {
          // 同步数据库模型
          await sequelize.sync({ alter: true });
          console.log('数据库表同步成功');
        } catch (error) {
          console.error('数据库表同步失败:', error);
        }
      });
  });

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
});