import React from 'react'
import { Layout, Menu, Button, Space } from 'antd'
import { Link } from 'react-router-dom'
import { UserOutlined } from '@ant-design/icons'
import { useAuth } from '../../context/AuthContext'
import './AppHeader.css'

const { Header } = Layout

const AppHeader: React.FC = () => {
  const { isAuthenticated } = useAuth()
  return (
    <Header className="app-header">
      <div className="container header-container">
        <div className="logo">
          <Link to="/">SellerTool</Link>
        </div>  
        <Menu 
          mode="horizontal" 
          className="main-menu"
          items={[
            {
              key: 'home',
              label: <Link to="/">首页</Link>,
            },

            {
              key: 'about',
              label: <Link to="/about">关于</Link>,
            },
            {
              key: 'contact',
              label: <Link to="/contact">联系我们</Link>,
            }
          ]}
        />        
        <div className="header-right">
          {!isAuthenticated ? (
            <Space>
              <Button type="link">
                <Link to="/login">登录</Link>
              </Button>
              <Button type="primary">
                <Link to="/register">注册</Link>
              </Button>
            </Space>
          ) : (
            <Button 
              type="primary" 
              className="user-dropdown-btn"
              icon={<UserOutlined />}
              size="middle"
            >
              <Link to="/dashboard" style={{ color: '#fff' }}>
                进入操作中心
              </Link>
            </Button>
          )}
        </div>
      </div>
    </Header>
  );
};

export default AppHeader;