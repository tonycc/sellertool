import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Result, Button, Spin, Typography } from 'antd';
import { get } from '../../api/client';
import './style.css';

const { Paragraph } = Typography;

const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setError('验证链接无效，缺少验证令牌');
        setLoading(false);
        return;
      }

      try {
        // 调用验证API
        await get(`/auth/verify-email/${token}`);
        setVerified(true);
      } catch (err: any) {
        if (err.response) {
          setError(err.response.data.message || '验证失败，请重试');
        } else {
          console.error('验证错误:', err);
          setError('服务器错误，请稍后重试');
        }
      } finally {
        setLoading(false);
      }
    };

    verifyEmail();
  }, [token]);

  if (loading) {
    return (
      <div className="verify-email-page">
        <div className="container">
          <div className="verify-email-card">
            <div className="loading-container">
              <Spin size="large" />
              <Paragraph className="loading-text">正在验证您的邮箱...</Paragraph>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (verified) {
    return (
      <div className="verify-email-page">
        <div className="container">
          <div className="verify-email-card">
            <Result
              status="success"
              title="邮箱验证成功"
              subTitle="您的邮箱已成功验证，现在可以登录您的账户了。"
              extra={[
                <Link key="login" to="/login">
                  <Button type="primary" size="large">立即登录</Button>
                </Link>
              ]}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="verify-email-page">
      <div className="container">
        <div className="verify-email-card">
          <Result
            status="error"
            title="验证失败"
            subTitle={error || '验证链接无效或已过期'}
            extra={[
              <Link key="resend" to="/login">
                <Button type="primary" size="large">返回登录</Button>
              </Link>
            ]}
          />
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;