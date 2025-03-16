import express from 'express';
import crypto from 'crypto';
import { Op } from 'sequelize';
import User from '../models/User.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/emailService.js';

const router = express.Router();

// 注册新用户
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // 严格检查邮箱是否已存在
    const existingEmail = await User.findOne({
      where: { email }
    });

    if (existingEmail) {
      return res.status(409).json({
        success: false,
        errorType: 'email_conflict',
        message: '该邮箱已被注册',
        field: 'email'
      });
    }

    // 检查用户名是否已存在
    const existingUsername = await User.findOne({
      where: { username }
    });

    if (existingUsername) {
      return res.status(409).json({
        success: false,
        errorType: 'username_conflict',
        message: '该用户名已被使用',
        field: 'username'
      });
    }

    // 创建验证令牌
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    const emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24小时后过期

    // 创建新用户
    const newUser = await User.create({
      username,
      email,
      password,
      emailVerificationToken,
      emailVerificationExpires
    });

    // 发送验证邮件
    await sendVerificationEmail(email, emailVerificationToken);

    // 注册成功响应也增加success字段
    res.status(200).json({ 
      success: true,
      message: '注册成功，请查收验证邮件' 
    });
  } catch (error) {
    console.error('注册错误:', error);
    
    // 数据库唯一性约束错误也改为200
    if (error.name === 'SequelizeUniqueConstraintError') {
      const uniqueField = error.errors[0].path;
      return res.status(409).json({
        success: false,
        errorType: 'email_conflict',
        message: '该邮箱已被注册',
        field: 'email'
      });
    }

    // 只有真正的服务器错误才返回500
    res.status(500).json({ 
      success: false,
      errorType: 'server_error',
      message: '服务器错误，请稍后重试' 
    });
  }
});


// 验证邮箱
router.get('/verify-email/:token', async (req, res) => {
  try {
    const { token } = req.params;

    // 查找具有该验证令牌且未过期的用户
    const user = await User.findOne({
      where: {
        emailVerificationToken: token,
        emailVerificationExpires: { [Op.gt]: Date.now() }
      }
    });

    if (!user) {
      return res.status(400).json({ message: '验证链接无效或已过期' });
    }

    // 更新用户验证状态
    await user.update({
      isEmailVerified: true,
      emailVerificationToken: null,
      emailVerificationExpires: null
    });

    res.status(200).json({ message: '邮箱验证成功' });
  } catch (error) {
    console.error('邮箱验证错误:', error);
    res.status(500).json({ message: '服务器错误，请稍后重试' });
  }
});

// 登录
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 查找用户
    const user = await User.findOne({
      where: { email }
    });
    if (!user) {
      return res.status(401).json({ message: '邮箱或密码不正确' });
    }

    // 验证密码
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: '邮箱或密码不正确' });
    }

    // 检查邮箱是否已验证
    if (!user.isEmailVerified) {
      return res.status(403).json({ message: '请先验证您的邮箱' });
    }

    // 创建用户会话或JWT令牌（这里简化处理，实际应用中应使用JWT或会话）
    res.status(200).json({
      message: '登录成功',
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({ message: '服务器错误，请稍后重试' });
  }
});

// 忘记密码 - 发送重置邮件
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    // 查找用户
    const user = await User.findOne({
      where: { email }
    });
    if (!user) {
      // 出于安全考虑，即使用户不存在也返回成功
      return res.status(200).json({ message: '如果该邮箱已注册，我们将发送密码重置邮件' });
    }

    // 创建重置令牌
    const resetPasswordToken = crypto.randomBytes(32).toString('hex');
    const resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1小时后过期

    // 更新用户的重置令牌
    await user.update({
      resetPasswordToken: resetPasswordToken,
      resetPasswordExpires: resetPasswordExpires
    });

    // 发送重置密码邮件
    await sendPasswordResetEmail(email, resetPasswordToken);

    res.status(200).json({ message: '如果该邮箱已注册，我们将发送密码重置邮件' });
  } catch (error) {
    console.error('忘记密码错误:', error);
    res.status(500).json({ message: '服务器错误，请稍后重试' });
  }
});

// 重置密码
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;

    // 查找具有该重置令牌且未过期的用户
    const user = await User.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { [Op.gt]: Date.now() }
      }
    });

    if (!user) {
      return res.status(400).json({ message: '重置链接无效或已过期' });
    }

    // 更新密码
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: '密码重置成功，请使用新密码登录' });
  } catch (error) {
    console.error('重置密码错误:', error);
    res.status(500).json({ message: '服务器错误，请稍后重试' });
  }
});

export default router;