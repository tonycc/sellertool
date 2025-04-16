import React, { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Modal } from 'antd';
import { useAuth } from '../../context/AuthContext';

interface PrivateRouteProps {
  element: React.ReactNode;
  requireAuth?: boolean;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ element, requireAuth = true }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    if (requireAuth && !isAuthenticated) {
      setShowLoginModal(true);
    } else {
      setShowLoginModal(false);
    }
  }, [requireAuth, isAuthenticated]);

  const handleLoginConfirm = () => {
    setShowLoginModal(false);
    // 将当前路径保存在state中，以便登录后可以重定向回来
    navigate('/login', { state: { from: location } });
  };

  if (requireAuth && !isAuthenticated) {
    return (
      <>
        <Modal
          title="需要登录"
          open={showLoginModal}
          onOk={handleLoginConfirm}
          onCancel={() => navigate('/')}
          okText="去登录"
          cancelText="返回首页"
        >
          <p>您需要登录后才能访问此页面</p>
        </Modal>
        {/* 显示空白页面，等待用户操作Modal */}
        <div style={{ height: '100vh' }}></div>
      </>
    );
  }

  return <>{element}</>;
};

export default PrivateRoute;