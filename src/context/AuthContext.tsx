import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  id: string;
  username: string;
  email: string;
  exp: number;
}

interface User {
  id: string;
  username: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (userData: User, token?: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  login: () => {},
  logout: () => {}
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // 验证JWT令牌是否有效
  const validateToken = (token: string): JwtPayload | null => {
    try {
      const decoded = jwtDecode<JwtPayload>(token);
      
      // 检查令牌是否过期
      if (decoded.exp && decoded.exp * 1000 < Date.now()) {
        console.log('Token has expired');
        return null;
      }
      
      return decoded;
    } catch (error) {
      console.error('Failed to decode token:', error);
      return null;
    }
  };

  useEffect(() => {
    // 从localStorage加载token和用户信息
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (token) {
      // 验证token有效性
      const decodedToken = validateToken(token);
      
      if (decodedToken) {
        // Token有效，使用token中的用户信息
        const tokenUser: User = {
          id: decodedToken.id,
          username: decodedToken.username,
          email: decodedToken.email
        };
        
        setUser(tokenUser);
        setIsAuthenticated(true);
        
        // 更新localStorage中的用户信息，确保一致性
        localStorage.setItem('user', JSON.stringify(tokenUser));
      } else {
        // Token无效，清除存储的认证信息
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    } else if (storedUser) {
      // 没有token但有用户信息，尝试使用用户信息
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Failed to parse user data:', error);
        localStorage.removeItem('user');
      }
    }
  }, []);

  const login = (userData: User, token?: string) => {
    // 如果提供了token，则解析它并使用token中的用户信息
    if (token) {
      const decodedToken = validateToken(token);
      
      if (decodedToken) {
        // 使用token中的用户信息，确保数据一致性
        const tokenUser: User = {
          id: decodedToken.id,
          username: decodedToken.username,
          email: decodedToken.email
        };
        
        setUser(tokenUser);
        setIsAuthenticated(true);
        localStorage.setItem('user', JSON.stringify(tokenUser));
        localStorage.setItem('token', token);
      } else {
        // Token无效，使用提供的用户数据
        console.warn('Provided token is invalid, using provided user data instead');
        setUser(userData);
        setIsAuthenticated(true);
        localStorage.setItem('user', JSON.stringify(userData));
      }
    } else {
      // 没有提供token，使用提供的用户数据
      setUser(userData);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(userData));
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};