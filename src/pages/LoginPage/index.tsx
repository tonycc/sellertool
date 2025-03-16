import React, { useState } from 'react';
import { Form, Input, Button, Checkbox, Typography, Card, Alert, Divider } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { post } from '../../api/client';
import './style.css';

const { Title, Paragraph } = Typography;

const LoginPage: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const onFinish = async (values: any) => {
    setLoading(true);
    setError('');
    
    try {
      // 调用登录API
      const data = await post('/auth/login', {
        email: values.email,
        password: values.password
      });
      
      // 登录成功后保存用户信息并跳转到首页
      login(data.user);
      navigate('/');
    } catch (err: any) {
      // 统一错误处理逻辑
      if (err.response) {
        if (err.response.status === 403 && err.response.data.message === '请先验证您的邮箱') {
          setError('您的邮箱尚未验证，请查收验证邮件');
        } else {
          setError(err.response.data.message || '登录失败，请检查邮箱和密码');
        }
      } else {
        setError('服务器连接失败，请稍后重试');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="container">
        <Card className="login-card">
          <Title level={2} className="text-center">登录账户</Title>
          <Paragraph className="text-center description">
            登录SellerTool，访问您的亚马逊卖家数据分析工具
          </Paragraph>
          
          {error && <Alert message={error} type="error" showIcon className="error-alert" />}
          
          <Form
            form={form}
            name="login"
            layout="vertical"
            initialValues={{ remember: true }}
            onFinish={onFinish}
          >
            <Form.Item
              name="email"
              rules={[
                { required: true, message: '请输入邮箱地址' },
                { type: 'email', message: '请输入有效的邮箱地址' }
              ]}
            >
              <Input prefix={<MailOutlined />} placeholder="邮箱地址" />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="密码" />
            </Form.Item>

            <Form.Item>
              <div className="login-options">
                <Form.Item name="remember" valuePropName="checked" noStyle>
                  <Checkbox>记住我</Checkbox>
                </Form.Item>

                <Link to="/forgot-password" className="forgot-password">
                  忘记密码?
                </Link>
              </div>
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" className="login-button" loading={loading} block>
                登录
              </Button>
            </Form.Item>

            <Divider plain>还没有账户?</Divider>
            
            <div className="text-center">
              <Link to="/register" className="register-link">创建新账户</Link>
            </div>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;