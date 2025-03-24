import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// 从环境变量获取JWT密钥，如果不存在则使用默认值
const JWT_SECRET = process.env.JWT_SECRET || 'sellertool_jwt_secret_key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * 生成JWT令牌
 * @param {Object} payload - 要编码到令牌中的数据
 * @returns {string} JWT令牌
 */
export const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

/**
 * 验证JWT令牌
 * @param {string} token - 要验证的JWT令牌
 * @returns {Object|null} 解码后的令牌数据或null（如果无效）
 */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    console.error('JWT验证错误:', error.message);
    return null;
  }
};

/**
 * 从请求头中提取JWT令牌
 * @param {Object} req - Express请求对象
 * @returns {string|null} 提取的令牌或null（如果不存在）
 */
export const extractTokenFromHeader = (req) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  return authHeader.split(' ')[1];
};