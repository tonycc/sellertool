import React, { useState } from 'react';
import { Form, Input, Button, Typography, Card, Alert, Result } from 'antd';
import { MailOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { post } from '../../api/client';
import './style.css';

const { Title, Paragraph } = Typography;

const ForgotPasswordPage: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const onFinish = async (values: any) => {
    setLoading(true);
    setError('');
    
    try {
      // 调用忘记密码API
      await post('/auth/forgot-password', {
        email: values.email
      });
      
      // 提交成功后显示成功信息
      setSubmitted(true);
    } catch (err: any) {
      if (err.response) {
        setError(err.response.data.message || '发送重置密码邮件失败，请稍后重试');
      } else {
        setError('服务器连接失败，请稍后重试');
        }
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="forgot-password-page">
        <div className="container">
          <Card className="forgot-password-card">
            <Result
              status="success"
              title="重置密码邮件已发送"
              subTitle={`我们已向您的邮箱发送了一封重置密码的邮件，请查收并按照邮件中的指引完成密码重置。`}
              extra={[
                <Link key="login" to="/login">
                  <Button type="primary">返回登录</Button>
                </Link>,
              ]}
            />
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="forgot-password-page">
      <div className="container">
        <Card className="forgot-password-card">
          <Title level={2} className="text-center">找回密码</Title>
          <Paragraph className="text-center description">
            请输入您注册时使用的邮箱地址，我们将向该邮箱发送重置密码的链接
          </Paragraph>
          
          {error && <Alert message={error} type="error" showIcon className="error-alert" />}
          
          <Form
            form={form}
            name="forgot-password"
            layout="vertical"
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

            <Form.Item>
              <Button type="primary" htmlType="submit" className="submit-button" loading={loading} block>
                发送重置链接
              </Button>
            </Form.Item>

            <div className="text-center links-container">
              <Link to="/login" className="back-link">返回登录</Link>
            </div>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;