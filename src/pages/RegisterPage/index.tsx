import React, { useState } from 'react';
import { Form, Input, Button, Typography, Card, Alert, Checkbox, Divider } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { post } from '../../api/client';
import './style.css';

const { Title, Paragraph } = Typography;

const RegisterPage: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [error, setError] = useState('');

  const onFinish = async (values: any) => {
    setLoading(true);
    setError('');
    
    try {
      const response = await post('/auth/register', {
        username: values.username,
        email: values.email,
        password: values.password
      });

      // 明确检查响应状态
      if (!response.success) {
        throw {
          response: {
            data: {
              errorType: response.errorType,
              message: response.message
            }
          }
        };
      }
      
      setRegistered(true);
    } catch (err: any) {
      //console.error('Registration error:', err);
      let errorMessage = '注册失败，请稍后重试';

      // 确保处理409状态码
      if (err.response?.status === 409 || err.response?.data?.errorType === 'email_conflict') {
        errorMessage = '该邮箱已被注册，请使用其他邮箱或找回密码';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }

      setError(errorMessage);
      setLoading(false);
      return;
    }
    
    setLoading(false);
  };

  if (registered) {
    return (
      <div className="register-page">
        <div className="container">
          <Card className="register-card">
            <div className="register-success">
              <Title level={2}>注册成功!</Title>
              <Paragraph>
                我们已向您的邮箱发送了一封验证邮件，请查收并点击邮件中的链接完成验证。
              </Paragraph>
              <Paragraph>
                验证完成后，您可以 <Link to="/login">登录</Link> 您的账户。
              </Paragraph>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="register-page">
      <div className="container">
        <Card className="register-card">
          <Title level={2} className="text-center">创建账户</Title>
          <Paragraph className="text-center description">
            注册SellerTool账户，开启您的亚马逊卖家数据分析之旅
          </Paragraph>
          
          {error && <Alert message={error} type="error" showIcon className="error-alert" />}
          
          <Form
            form={form}
            name="register"
            layout="vertical"
            onFinish={onFinish}
            scrollToFirstError
          >
            <Form.Item
              name="username"
              rules={[
                { required: true, message: '请输入用户名' },
                { min: 3, message: '用户名至少3个字符' },
                { max: 20, message: '用户名最多20个字符' }
              ]}
            >
              <Input prefix={<UserOutlined />} placeholder="用户名" />
            </Form.Item>

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
              rules={[
                { required: true, message: '请输入密码' },
                { min: 8, message: '密码至少8个字符' },
                {
                  pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
                  message: '密码必须包含大小写字母和数字'
                }
              ]}
              hasFeedback
            >
              <Input.Password prefix={<LockOutlined />} placeholder="密码" />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              dependencies={['password']}
              hasFeedback
              rules={[
                { required: true, message: '请确认密码' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('两次输入的密码不一致'));
                  },
                }),
              ]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="确认密码" />
            </Form.Item>

            <Form.Item
              name="agreement"
              valuePropName="checked"
              rules={[
                {
                  validator: (_, value) =>
                    value ? Promise.resolve() : Promise.reject(new Error('请阅读并同意用户协议')),
                },
              ]}
            >
              <Checkbox>
                我已阅读并同意 <Link to="/terms">用户协议</Link> 和 <Link to="/privacy">隐私政策</Link>
              </Checkbox>
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" className="register-button" loading={loading} block>
                注册
              </Button>
            </Form.Item>

            <Divider plain>已有账户?</Divider>
            
            <div className="text-center">
              <Link to="/login" className="login-link">登录账户</Link>
            </div>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default RegisterPage;