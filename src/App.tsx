import React from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Layout } from 'antd'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import VerifyEmailPage from './pages/VerifyEmailPage'
import ReportPage from './pages/ReportPage'
import SearchTermReportDetail from './pages/ReportDetailPage/SearchTermReportDetail'
import AdPlacementReportDetail from './pages/ReportDetailPage/AdPlacementReportDetail'
import RawDataPage from './pages/RawDataPage'
import DashboardPage from './pages/DashboardPage'
import ProfilePage from './pages/ProfilePage'
import AppHeader from './components/layout/AppHeader'
import AppFooter from './components/layout/AppFooter'
import { AuthProvider } from './context/AuthContext'
import PrivateRoute from './components/auth/PrivateRoute'
import { useAuth } from './context/AuthContext'
import './App.css'

// 用于已登录用户的自动重定向组件
const AuthRedirect: React.FC = () => {
  const { isAuthenticated, isActiveLogin } = useAuth();
  const location = useLocation();
  
  // 只有在用户主动登录且访问首页、登录页或注册页时，才重定向到操作中台
  // isActiveLogin标志用于区分是用户主动登录还是通过localStorage恢复的登录状态
  if (isAuthenticated && isActiveLogin && ["/", "/login", "/register"].includes(location.pathname)) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return null;
};

// 公共页面布局组件
const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Layout className="app-layout">
    <AppHeader />
    <Layout.Content className="app-content">
      {children}
    </Layout.Content>
    <AppFooter />
  </Layout>
);

const App: React.FC = () => {
  return (
    <AuthProvider>
      {/* 自动重定向组件 */}
      <AuthRedirect />
      
      <Routes>
        {/* 公共页面 */}
        <Route path="/" element={
          <PublicLayout>
            <HomePage />
          </PublicLayout>
        } />
        <Route path="/login" element={
          <PublicLayout>
            <LoginPage />
          </PublicLayout>
        } />
        <Route path="/register" element={
          <PublicLayout>
            <RegisterPage />
          </PublicLayout>
        } />
        <Route path="/forgot-password" element={
          <PublicLayout>
            <ForgotPasswordPage />
          </PublicLayout>
        } />
        <Route path="/verify-email" element={
          <PublicLayout>
            <VerifyEmailPage />
          </PublicLayout>
        } />
        
        {/* 操作中台 - 不使用公共布局，因为它有自己的布局 */}
        <Route path="/dashboard" element={<PrivateRoute element={<DashboardPage />} />} />
        <Route path="/profile" element={<PrivateRoute element={<ProfilePage />} />} />
        <Route path="/reports" element={<PrivateRoute element={<ReportPage />} />} />
        <Route path="/report/st-detail/:id" element={<PrivateRoute element={<SearchTermReportDetail />} />} />
        <Route path="/report/ad-placement/:id" element={<PrivateRoute element={<AdPlacementReportDetail />} />} />
        <Route path="/report/raw-data/:id" element={<PrivateRoute element={<RawDataPage />} />} />
        
        {/* 404页面 */}
        <Route path="*" element={
          <PublicLayout>
            <Navigate to="/" replace />
          </PublicLayout>
        } />
      </Routes>
    </AuthProvider>
  )
}

export default App