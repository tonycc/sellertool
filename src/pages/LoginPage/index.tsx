import React, { useState } from 'react';
import { Form, Input, Button, Checkbox, Typography, Card, Alert, Divider } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { post } from '../../api/client';
import './style.css';

const { Title, Paragraph } = Typography;

// 定义登录API返回的数据结构
interface LoginResponse {
  user: {
    id: string;
    username: string;
    email: string;
  };
  token: string;
}

const LoginPage: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  
  // 获取重定向路径，如果存在的话
  const from = location.state?.from?.pathname || '/';

  const onFinish = async (values: any) => {
    setLoading(true);
    setError('');
    
    try {
      // 调用登录API
      const data = await post<LoginResponse>('/api/auth/login', {
        email: values.email,
        password: values.password
      });
      
      // 登录成功后保存用户信息并跳转到原来的页面
      login(data.user, data.token);
      navigate(from, { replace: true });
    } catch (err: any) {
      // 统一错误处理逻辑
      if (err.response) {
        const errorData = err.response.data;
        if (errorData && errorData.errorType) {
          switch(errorData.errorType) {
            case 'invalid_password':
              setError('邮箱或密码错误，请重新输入');
              break;
            case 'email_not_found':
              setError('该邮箱未注册');
              break;
            case 'email_not_verified':
              setError('您的邮箱尚未验证，请查收验证邮件');
              break;
            default:
              setError(errorData.message || '登录失败，请检查邮箱和密码');
          }
        } else {
          setError('服务器连接失败，请稍后重试');
        }
      } else if (err.errorType) {
        // 处理从client.ts拦截器中返回的错误对象
        switch(err.errorType) {
          case 'invalid_password':
            setError('邮箱或密码错误，请重新输入');
            break;
          case 'email_not_found':
            setError('该邮箱未注册');
            break;
          case 'email_not_verified':
          case 'forbidden':
            setError('您的邮箱尚未验证，请查收验证邮件');
            break;
          case 'network_error':
            setError('服务器无响应，请检查网络连接');
            break;
          case 'request_error':
            setError('请求配置错误，请稍后重试');
            break;
          default:
            setError(err.message || '登录失败，请检查邮箱和密码');
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