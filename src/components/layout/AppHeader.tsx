import React from 'react'
import { Layout, Menu, Dropdown, Avatar, Button, Badge, Tooltip, Space } from 'antd'
import { Link, useNavigate } from 'react-router-dom'
import { UserOutlined, LogoutOutlined, SettingOutlined, BellOutlined } from '@ant-design/icons'
import { useAuth } from '../../context/AuthContext'
import './AppHeader.css'

const { Header } = Layout

const AppHeader: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const userMenu = [
    {
      key: 'profile',
      label: <Link to="/profile">个人中心</Link>,
      icon: <UserOutlined style={{ color: '#1890ff' }} />
    },
    {
      key: 'settings',
      label: <Link to="/settings">账户设置</Link>,
      icon: <SettingOutlined style={{ color: '#52c41a' }} />
    },
    {
      key: 'divider',
      type: 'divider'
    },
    {
      key: 'logout',
      label: <span onClick={handleLogout}>退出登录</span>,
      icon: <LogoutOutlined style={{ color: '#ff4d4f' }} />
    }
  ]

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
            <Dropdown 
              menu={{ items: userMenu }} 
              placement="bottomRight"
              arrow
            >
              <Button type="text" className="user-dropdown-btn">
                <Avatar size="small" icon={<UserOutlined />} />
                <span className="username">{user?.username}</span>
              </Button>
            </Dropdown>
          )}
        </div>
      </div>
    </Header>
  );
};

export default AppHeader;