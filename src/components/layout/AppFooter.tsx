import React from 'react'
import { Layout, Typography, Row, Col, Space } from 'antd'
import { Link } from 'react-router-dom'
import './AppFooter.css'

const { Footer } = Layout
const { Text, Title } = Typography

const AppFooter: React.FC = () => {
  return (
    <Footer className="app-footer">
      <div className="container">
        <Row gutter={[32, 24]}>
          <Col xs={24} sm={12} md={8}>
            <div className="footer-section">
              <Title level={4} className="footer-title">SellerTool</Title>
              <Text className="footer-description">
                专为亚马逊卖家打造的综合工具平台，助力卖家优化运营策略、提升销售业绩
              </Text>
            </div>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <div className="footer-section">
              <Title level={4} className="footer-title">快速链接</Title>
              <ul className="footer-links">
                <li><Link to="/">首页</Link></li>
              </ul>
            </div>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <div className="footer-section">
              <Title level={4} className="footer-title">联系我们</Title>
              <ul className="footer-links">
                <li>邮箱：contact@sellertool.com</li>
                <li>电话：400-123-4567</li>
              </ul>
            </div>
          </Col>
        </Row>
        <div className="footer-bottom">
          <Text>© {new Date().getFullYear()} SellerTool. 保留所有权利</Text>
        </div>
      </div>
    </Footer>
  )
}

export default AppFooter