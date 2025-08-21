import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { message } from 'antd';
import { authService } from '../services/authService';

interface User {
  id: number;
  username: string;
  email?: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const userData = await authService.getCurrentUser();
          setUser(userData);
        } catch (error) {
          localStorage.removeItem('token');
          setToken(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [token]);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await authService.login(username, password);
      setToken(response.token);
      setUser(response.user);
      localStorage.setItem('token', response.token);
      message.success('登录成功！');
      return true;
    } catch (error: any) {
      message.error(error.response?.data?.error || '登录失败');
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    message.success('已退出登录');
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
