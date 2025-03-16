import React from 'react'
import { Typography, Row, Col, Card, Button, Divider, Space } from 'antd'
import { BarChartOutlined, RiseOutlined, ToolOutlined, CloudUploadOutlined } from '@ant-design/icons'
import HeroBanner from './components/HeroBanner'
import FeatureCard from './components/FeatureCard'
import './style.css'

const { Title, Paragraph } = Typography

const HomePage: React.FC = () => {
  return (
    <div className="home-page">
      <HeroBanner />
      
      {/* 核心价值部分 */}
      <section className="core-value-section">
        <div className="container">
          <Title level={2} className="section-title text-center">
            亚马逊卖家的数据分析利器
          </Title>
          <Paragraph className="section-description text-center">
            SellerTool通过强大的数据分析和AI技术，帮助亚马逊卖家优化运营策略、提升销售业绩
          </Paragraph>
          
          <Row gutter={[24, 24]} className="mt-3">
            <Col xs={24} sm={12} lg={8}>
              <FeatureCard 
                icon={<BarChartOutlined />}
                title="多维度数据分析"
                description="全方位分析广告系列绩效、关键词效果、产品表现等多个维度的数据"
              />
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <FeatureCard 
                icon={<RiseOutlined />}
                title="优化建议生成"
                description="基于AI分析，提供个性化的广告优化建议，帮助提升广告效果"
              />
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <FeatureCard 
                icon={<ToolOutlined />}
                title="一站式工具平台"
                description="集成多种亚马逊卖家工具，满足运营全流程的各类需求"
              />
            </Col>
          </Row>
        </div>
      </section>
      
      {/* 核心功能部分 */}
      <section className="core-feature-section">
        <div className="container">
          <Title level={2} className="section-title text-center">
            亚马逊广告报表分析
          </Title>
          <Paragraph className="section-description text-center">
            上传您的亚马逊广告报表，获取专业的数据分析和优化建议
          </Paragraph>
          
          <Row gutter={[32, 32]} className="mt-3">
            <Col xs={24} md={12}>
              <Card className="feature-detail-card">
                <Title level={4}>
                  <CloudUploadOutlined /> 报表上传与解析
                </Title>
                <Paragraph>
                  支持上传亚马逊广告报表（CSV/Excel格式），系统自动识别报表类型并解析数据。
                </Paragraph>
                <ul className="feature-list">
                  <li>支持多种报表格式</li>
                  <li>自动识别报表类型</li>
                  <li>快速解析数据</li>
                  <li>历史数据存储与管理</li>
                </ul>
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card className="feature-detail-card">
                <Title level={4}>
                  <BarChartOutlined /> 多维度数据分析
                </Title>
                <Paragraph>
                  通过多维度分析，深入了解广告表现，发现优化机会。
                </Paragraph>
                <ul className="feature-list">
                  <li>广告系列绩效分析（ACOS、ROAS、CTR等）</li>
                  <li>关键词效果分析（转化率、点击成本等）</li>
                  <li>产品广告表现分析</li>
                  <li>时间趋势分析（日/周/月）</li>
                </ul>
              </Card>
            </Col>
          </Row>
          
          <div className="text-center mt-3">
            <Button type="primary" size="large">
              立即体验
            </Button>
          </div>
        </div>
      </section>
      
      {/* 技术优势部分 */}
      <section className="tech-advantage-section">
        <div className="container">
          <Title level={2} className="section-title text-center">
            技术优势
          </Title>
          
          <Row gutter={[24, 24]} className="mt-3">
            <Col xs={24} sm={12} md={8}>
              <Card className="tech-card">
                <Title level={4}>现代化前端架构</Title>
                <Paragraph>
                  基于React.js + TypeScript构建，使用Ant Design组件库，提供流畅的用户体验
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Card className="tech-card">
                <Title level={4}>高性能后端服务</Title>
                <Paragraph>
                  采用Node.js + Express.js构建API服务，确保数据处理的高效性和稳定性
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Card className="tech-card">
                <Title level={4}>专业数据存储方案</Title>
                <Paragraph>
                  使用PostgreSQL存储结构化数据，支持复杂查询和数据分析需求
                </Paragraph>
              </Card>
            </Col>
          </Row>
        </div>
      </section>
      
      {/* 行动召唤部分 */}
      <section className="cta-section">
        <div className="container">
          <Card className="cta-card">
            <Title level={2} className="text-center">准备好提升您的亚马逊广告效果了吗？</Title>
            <Paragraph className="text-center cta-description">
              立即注册SellerTool，开始使用我们的广告报表分析工具，发现优化机会，提升广告ROI
            </Paragraph>
            <div className="text-center">
              <Space size="large">
                <Button type="primary" size="large">
                  免费注册
                </Button>
                <Button size="large">
                  了解更多
                </Button>
              </Space>
            </div>
          </Card>
        </div>
      </section>
    </div>
  )
}

export default HomePage