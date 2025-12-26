import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

interface AuthContextType {
  user: any;
  loading: boolean;
  login: (data: any) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const userData = await authService.checkAuth();
      if (userData && userData.user) {
        setUser(userData.user);
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (data: any) => {
    const response = await authService.login(data);
    setUser(response.user);
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
