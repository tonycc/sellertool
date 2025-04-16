import React from 'react';
import { Layout, Dropdown, Avatar, Space } from 'antd';
import { UserOutlined, DownOutlined, LogoutOutlined, SettingOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './TopNavigation.css';

const { Header } = Layout;

interface TopNavigationProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const TopNavigation: React.FC<TopNavigationProps> = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <Header className="top-navigation">
      <div className="top-navigation-content">
        <div className="top-navigation-left">
          <div className="app-title">SellerTool</div>
        </div>
        <div className="top-navigation-right">
          <Dropdown 
            menu={{
              items: [
                {
                  key: 'profile',
                  icon: <UserOutlined />,
                  label: '个人中心',
                  onClick: () => navigate('/profile')
                },
                {
                  key: 'settings',
                  icon: <SettingOutlined />,
                  label: '系统设置',
                  onClick: () => navigate('/settings')
                },
                {
                  type: 'divider'
                },
                {
                  key: 'logout',
                  icon: <LogoutOutlined />,
                  label: '退出登录',
                  onClick: () => logout()
                }
              ]
            }}
          >
            <Space className="user-dropdown">
              <Avatar icon={<UserOutlined />} />
              <span className="username">{user?.username || '用户'}</span>
              <DownOutlined />
            </Space>
          </Dropdown>
        </div>
      </div>
    </Header>
  );
};

export default TopNavigation;