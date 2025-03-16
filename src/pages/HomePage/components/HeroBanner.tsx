import React from 'react'
import { Typography, Button, Row, Col } from 'antd'
import './HeroBanner.css'

const { Title, Paragraph } = Typography

const HeroBanner: React.FC = () => {
  return (
    <div className="hero-banner">
      <div className="container">
        <Row align="middle" gutter={[32, 32]}>
          <Col xs={24} md={12}>
            <div className="hero-content">
              <Title level={1} className="hero-title">
                亚马逊卖家工具平台
              </Title>
              <Paragraph className="hero-description">
                通过数据分析和AI技术，帮助亚马逊卖家优化运营策略、提升销售业绩
              </Paragraph>
              <div className="hero-buttons">
                <Button type="primary" size="large" className="mr-3">
                  立即开始
                </Button>
                <Button size="large">了解更多</Button>
              </div>
            </div>
          </Col>
          <Col xs={24} md={12}>
            <div className="hero-image">
              <img src="/src/assets/images/hero-image.svg" alt="亚马逊卖家工具平台" />
            </div>
          </Col>
        </Row>
      </div>
    </div>
  )
}

export default HeroBanner