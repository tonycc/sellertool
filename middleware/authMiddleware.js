import { verifyToken, extractTokenFromHeader } from '../utils/jwtService.js';

/**
 * 认证中间件 - 验证用户是否已登录
 * 通过验证请求头中的JWT令牌来确认用户身份
 */
export const authenticate = (req, res, next) => {
  try {
    // 从请求头中提取令牌
    const token = extractTokenFromHeader(req);
    
    if (!token) {
      return res.status(401).json({
        success: false,
        errorType: 'authentication_required',
        message: '请先登录'
      });
    }
    
    // 验证令牌
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({
        success: false,
        errorType: 'invalid_token',
        message: '登录已过期，请重新登录'
      });
    }
    
    // 将解码后的用户信息添加到请求对象中
    req.user = decoded;
    
    // 继续处理请求
    next();
  } catch (error) {
    console.error('认证中间件错误:', error);
    return res.status(500).json({
      success: false,
      errorType: 'server_error',
      message: '服务器错误，请稍后重试'
    });
  }
};

/**
 * 可选认证中间件 - 如果用户已登录则提供用户信息，但不要求必须登录
 */
export const optionalAuthenticate = (req, res, next) => {
  try {
    // 从请求头中提取令牌
    const token = extractTokenFromHeader(req);
    
    if (token) {
      // 验证令牌
      const decoded = verifyToken(token);
      if (decoded) {
        // 将解码后的用户信息添加到请求对象中
        req.user = decoded;
      }
    }
    
    // 无论是否有有效令牌，都继续处理请求
    next();
  } catch (error) {
    // 出错时也继续处理请求，但不设置用户信息
    next();
  }
};