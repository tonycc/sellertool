import React from 'react';
import { Layout, Menu, Typography, Button } from 'antd';
import { AppstoreOutlined, MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import reportCategories from '../../../config/reportCategories';
import './ReportSidebar.css';

const { Sider } = Layout;
const { Title } = Typography;

interface ReportSidebarProps {
  collapsed: boolean;
  onCollapse: (value: boolean) => void;
  onMenuClick: (categoryValue: string, typeValue: string) => void;
  currentCategory: string;
  currentType: string;
}

const ReportSidebar: React.FC<ReportSidebarProps> = ({
  collapsed,
  onCollapse,
  onMenuClick,
  currentCategory,
  currentType
}) => {
  // 生成菜单项
  const generateMenuItems = () => {
    return reportCategories.map(category => {
      return {
        key: category.value,
        icon: <AppstoreOutlined />,
        label: category.label,
        children: category.children.map(type => ({
          key: `${category.value}-${type.value}`,
          label: type.label,
          onClick: () => onMenuClick(category.value, type.value)
        }))
      };
    });
  };

  return (
    <Sider 
      width={200} 
      className="report-sider"
      collapsible
      collapsed={collapsed}
      onCollapse={onCollapse}
      theme="light"
      trigger={null}
    >
      <div className="collapse-button">
        <Button 
          type="text" 
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={() => onCollapse(!collapsed)}
        />
      </div>
      <Menu
        mode="inline"
        theme="light"
        defaultOpenKeys={['sp', 'sb']}
        items={generateMenuItems()}
        className="report-menu"
        selectedKeys={currentCategory && currentType ? [`${currentCategory}-${currentType}`] : []}
      />
    </Sider>
  );
};

export default ReportSidebar;