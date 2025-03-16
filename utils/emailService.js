import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// 创建邮件传输器
const createTransporter = async () => {
  // 使用环境变量中的邮件配置
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  return transporter;
};

// 发送验证邮件
export const sendVerificationEmail = async (to, token) => {
  try {
    const transporter = await createTransporter();
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const verificationUrl = `${frontendUrl}/verify-email?token=${token}`;

    const mailOptions = {
      from: `"SellerTool" <${process.env.EMAIL_USER}>`,
      to,
      subject: '请验证您的SellerTool账户邮箱',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">验证您的邮箱地址</h2>
          <p>感谢您注册SellerTool。请点击下面的按钮验证您的邮箱地址：</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="background-color: #1890ff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">验证邮箱</a>
          </div>
          <p>或者，您可以复制以下链接到浏览器地址栏：</p>
          <p style="word-break: break-all;">${verificationUrl}</p>
          <p>此链接将在24小时后过期。</p>
          <p>如果您没有注册SellerTool账户，请忽略此邮件。</p>
          <hr style="border: 1px solid #eee; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">© ${new Date().getFullYear()} SellerTool. 保留所有权利。</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`验证邮件已发送至 ${to}`);
    return true;
  } catch (error) {
    console.error('发送验证邮件失败:', error);
    throw error;
  }
};

// 发送密码重置邮件
export const sendPasswordResetEmail = async (to, token) => {
  try {
    const transporter = await createTransporter();
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password?token=${token}`;

    const mailOptions = {
      from: `"SellerTool" <${process.env.EMAIL_USER}>`,
      to,
      subject: '重置您的SellerTool账户密码',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">重置您的密码</h2>
          <p>您收到此邮件是因为您（或其他人）请求重置您的SellerTool账户密码。</p>
          <p>请点击下面的按钮设置新密码：</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #1890ff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">重置密码</a>
          </div>
          <p>或者，您可以复制以下链接到浏览器地址栏：</p>
          <p style="word-break: break-all;">${resetUrl}</p>
          <p>此链接将在1小时后过期。</p>
          <p>如果您没有请求重置密码，请忽略此邮件，您的密码将保持不变。</p>
          <hr style="border: 1px solid #eee; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">© ${new Date().getFullYear()} SellerTool. 保留所有权利。</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`密码重置邮件已发送至 ${to}`);
    return true;
  } catch (error) {
    console.error('发送密码重置邮件失败:', error);
    throw error;
  }
};