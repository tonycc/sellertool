import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { theme } from 'antd';
import { DashboardOutlined, FileTextOutlined, MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import { ProLayout, PageContainer } from '@ant-design/pro-components';
import './MainLayout.css';

interface MainLayoutProps {
  children: React.ReactNode;
  title?: string;
  subTitle?: string;
  pageName?: string;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, title = '', pageName }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(true);

  // 使用antd的主题
  const { token } = theme.useToken();
  
  // 定义路由和菜单项
  const routes = {
    path: '/',
    routes: [
      {
        path: '/dashboard',
        name: '控制台',
        icon: <DashboardOutlined />
      },
      {
        path: '/reports',
        name: '报表管理',
        icon: <FileTextOutlined />
      },
     
    ],
  };

  // 组件挂载时强制设置并保存折叠状态
  /*useEffect(() => {
    setCollapsed(true);
    localStorage.setItem('sidebarCollapsed', 'true');
  }, []);*/
  
  // 当折叠状态改变时，保存到localStorage
  /*useEffect(() => {
    localStorage.setItem('sidebarCollapsed', String(collapsed));
  }, [collapsed]);*/

  // 确保组件挂载时应用正确的折叠状态
  /*React.useEffect(() => {
    const event = new Event('resize');
    window.dispatchEvent(event); // 触发resize事件，强制ProLayout重新计算布局
  }, [collapsed]);*/

  return (
    <ProLayout
      title="SellerTool"
      //logo="/src/assets/images/default-avatar.svg"
      layout="mix"
      fixSiderbar
      fixedHeader
      collapsed={collapsed}
      defaultCollapsed={true}
      breakpoint={false}
      collapsedButtonRender={false}
      //styles={{ content: { padding: 0, margin: 0 } }}
      location={{
        pathname: location.pathname,
      }}
      route={routes}
      
      token={{
        ...token,
        header: {
          colorBgHeader: '#fff',
          colorHeaderTitle: token.colorPrimary,
        },
        sider: {
          colorMenuBackground: '#fff',
          colorMenuItemDivider: token.colorBorderSecondary,
          colorTextMenu: token.colorTextSecondary,
          colorTextMenuSelected: token.colorPrimary,
          colorTextMenuItemHover: token.colorPrimary,
        },
        colorPrimary: token.colorPrimary
      }}
      avatarProps={{
        src: '/src/assets/images/default-avatar.svg',
        size: 'small',
        //title: '用户',
        render: (props, dom) => {
        return (
          <div
            style={{
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            }}
            onClick={() => navigate('/profile')}
          >
            {dom}
            <span style={{ marginLeft: 8 }}></span>
          </div>
         );
        },
      }}
      headerTitleRender={(logo, title) => {
        return (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
            }}
            onClick={() => navigate('/dashboard')}
          >
            {logo}
            <span style={{ marginLeft: 8, fontSize: '18px', fontWeight: 'bold' }}>{title}</span>
          </div>
        );
      }}
           
      pageTitleRender={() => {
        return pageName || title;
      }}
      onMenuHeaderClick={() => navigate('/dashboard')}
      
      menuItemRender={(item, dom) => (
        <div onClick={() => navigate(item.path || '/')}>
          {dom}
        </div>
      )}
            
      menuFooterRender={() => (
        <div
          style={{
            textAlign: 'left',
            paddingBlockStart: 12,
            paddingBlockEnd: 12,
            cursor: 'pointer',
            borderTop: `1px solid ${token.colorBorderSecondary}`,
          }}
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          {!collapsed && <span style={{ marginLeft: 8 }}></span>}
        </div>
      )}
      waterMarkProps={{
        content: 'SellerTool',
        fontColor: 'rgba(0,0,0,0.06)',
      }}
    >
      <PageContainer
        style={{
          //border: '2px solid #008978',
          margin: 0,
          borderRadius: 20,
        }}
      >
        
        {children}
      </PageContainer>
    </ProLayout>
  );
};
export default MainLayout;