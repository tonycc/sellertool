import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { Layout } from 'antd'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import VerifyEmailPage from './pages/VerifyEmailPage'
import AppHeader from './components/layout/AppHeader'
import AppFooter from './components/layout/AppFooter'
import { AuthProvider } from './context/AuthContext'
import './App.css'

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Layout className="app-layout">
        <AppHeader />
        <Layout.Content className="app-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
          </Routes>
        </Layout.Content>
        <AppFooter />
      </Layout>
    </AuthProvider>
  )
}

export default App