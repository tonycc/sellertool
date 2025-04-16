import React from 'react';
import { Card, Typography, Descriptions, Avatar, Button, Row, Col, Divider } from 'antd';
import { UserOutlined, MailOutlined, EditOutlined } from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import './style.css';

const { Title, Paragraph } = Typography;

const ProfilePage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="profile-page">
      <div className="container">
        <Title level={2}>个人中心</Title>
        <Paragraph>管理您的个人信息和账户设置</Paragraph>

        <Row gutter={[24, 24]}>
          <Col xs={24} md={8}>
            <Card className="profile-card">
              <div className="profile-avatar-container">
                <Avatar size={100} icon={<UserOutlined />} className="profile-avatar" />
                <Title level={4} className="profile-name">{user?.username || '用户'}</Title>
                <Paragraph className="profile-email">{user?.email || 'email@example.com'}</Paragraph>
              </div>
              <Divider />
              <Button type="primary" icon={<EditOutlined />} block>
                编辑个人资料
              </Button>
            </Card>
          </Col>
          
          <Col xs={24} md={16}>
            <Card title="账户信息" className="account-info-card">
              <Descriptions bordered column={1}>
                <Descriptions.Item label="用户名">{user?.username || '未设置'}</Descriptions.Item>
                <Descriptions.Item label="邮箱">{user?.email || '未设置'}</Descriptions.Item>
                <Descriptions.Item label="账户ID">{user?.id || '未知'}</Descriptions.Item>
                <Descriptions.Item label="注册时间">2023年1月1日</Descriptions.Item>
                <Descriptions.Item label="账户状态">正常</Descriptions.Item>
              </Descriptions>
            </Card>

            <Card title="安全设置" className="security-card" style={{ marginTop: 24 }}>
              <div className="security-item">
                <div className="security-item-info">
                  <Title level={5}>账户密码</Title>
                  <Paragraph>定期更改密码可以保护您的账户安全</Paragraph>
                </div>
                <Button type="primary" ghost>修改密码</Button>
              </div>
              
              <Divider style={{ margin: '16px 0' }} />
              
              <div className="security-item">
                <div className="security-item-info">
                  <Title level={5}>邮箱验证</Title>
                  <Paragraph>验证您的邮箱以接收重要通知</Paragraph>
                </div>
                <Button type="primary" ghost>验证邮箱</Button>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default ProfilePage;