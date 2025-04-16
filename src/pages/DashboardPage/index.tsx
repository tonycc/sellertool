import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Typography, Spin, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { FileTextOutlined, UploadOutlined, UserOutlined, SettingOutlined } from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import MainLayout from '../../components/layout/MainLayout';
import './style.css';

const { Title } = Typography;

interface DashboardStats {
  totalReports: number;
  recentReports: number;
  pendingAnalysis: number;
}

const DashboardPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({ totalReports: 0, recentReports: 0, pendingAnalysis: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardStats();
    }
  }, [isAuthenticated]);

  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      // 这里可以替换为实际的API调用
      // const response = await apiClient.get('/api/dashboard/stats');
      // setStats(response.data);
      
      // 模拟数据
      setTimeout(() => {
        setStats({
          totalReports: 24,
          recentReports: 5,
          pendingAnalysis: 2
        });
        setLoading(false);
      }, 1000);
    } catch (error: any) {
      message.error('获取数据失败，请稍后重试');
      setLoading(false);
    }
  };



  return (
    <MainLayout>
      <div className="dashboard-container">
        <Title level={3} className="dashboard-title">控制台概览</Title>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '50px' }}>
              <Spin size="large" />
            </div>
          ) : (
            <>
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={8}>
                  <Card>
                    <Statistic
                      title="总报表数"
                      value={stats.totalReports}
                      valueStyle={{ color: '#3f8600' }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={8}>
                  <Card>
                    <Statistic
                      title="最近上传"
                      value={stats.recentReports}
                      valueStyle={{ color: '#1890ff' }}
                      suffix="份"
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={8}>
                  <Card>
                    <Statistic
                      title="待分析"
                      value={stats.pendingAnalysis}
                      valueStyle={{ color: stats.pendingAnalysis > 0 ? '#faad14' : '#52c41a' }}
                      suffix="份"
                    />
                  </Card>
                </Col>
              </Row>

              <div className="dashboard-actions">
                <Title level={4}>快捷操作</Title>
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12} md={8} lg={6}>
                    <Card hoverable onClick={() => navigate('/reports')}>
                      <div className="action-card">
                        <FileTextOutlined className="action-icon" />
                        <div className="action-title">查看报表</div>
                      </div>
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} md={8} lg={6}>
                    <Card hoverable onClick={() => navigate('/reports')}>
                      <div className="action-card">
                        <UploadOutlined className="action-icon" />
                        <div className="action-title">上传报表</div>
                      </div>
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} md={8} lg={6}>
                    <Card hoverable onClick={() => navigate('/profile')}>
                      <div className="action-card">
                        <UserOutlined className="action-icon" />
                        <div className="action-title">个人中心</div>
                      </div>
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} md={8} lg={6}>
                    <Card hoverable onClick={() => navigate('/settings')}>
                      <div className="action-card">
                        <SettingOutlined className="action-icon" />
                        <div className="action-title">系统设置</div>
                      </div>
                    </Card>
                  </Col>
                </Row>
              </div>

              <div className="dashboard-recent">
                <Title level={4}>最近活动</Title>
                <Card>
                  <p>暂无最近活动</p>
                </Card>
              </div>
            </>
          )}
        </div>
    </MainLayout>
  );
};

export default DashboardPage;