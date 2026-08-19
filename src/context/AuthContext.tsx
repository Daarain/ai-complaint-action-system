import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  role: UserRole;
  isLoading: boolean;
  login: (credentials: { identifier?: string; phone?: string; email?: string; password?: string }) => Promise<void>;
  register: (data: { name: string; phone: string; email: string; role?: string }) => Promise<void>;
  logout: () => void;
  switchDemoRole: (role: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = api.getToken();
      if (savedToken) {
        setToken(savedToken);
        try {
          const profile = await api.auth.me();
          setUser(profile);
        } catch {
          // Token expired or invalid, reset to default citizen
          api.auth.logout();
          setToken(null);
          await switchDemoRole('citizen');
        }
      } else {
        // Default login as citizen demo
        await switchDemoRole('citizen');
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials: { identifier?: string; phone?: string; email?: string; password?: string }) => {
    setIsLoading(true);
    try {
      const res = await api.auth.login(credentials);
      setUser(res.user);
      setToken(res.token);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: { name: string; phone: string; email: string; role?: string }) => {
    setIsLoading(true);
    try {
      const res = await api.auth.register(data);
      setUser(res.user);
      setToken(res.token);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    api.auth.logout();
    setUser(null);
    setToken(null);
  };

  const switchDemoRole = async (targetRole: UserRole) => {
    setIsLoading(true);
    try {
      let identifier = 'mohammed@civic.org';
      if (targetRole === 'officer') identifier = 'davis@metro.gov';
      if (targetRole === 'admin') identifier = 'hayes@metro.gov';

      const res = await api.auth.login({ identifier });
      setUser(res.user);
      setToken(res.token);
    } catch {
      // fallback manual mock if API hasn't booted
      const fallbackUser: User = {
        id: targetRole === 'admin' ? 'usr_admin_1' : targetRole === 'officer' ? 'usr_officer_1' : 'usr_citizen_1',
        name: targetRole === 'admin' ? 'Director Robert Hayes' : targetRole === 'officer' ? 'Officer Marcus Davis' : 'Mohammed Ali',
        phone: '+1 (555) 019-2831',
        email: `${targetRole}@metro.gov`,
        role: targetRole,
        created_at: new Date().toISOString(),
      };
      setUser(fallbackUser);
    } finally {
      setIsLoading(false);
    }
  };

  const role: UserRole = user?.role || 'citizen';

  return (
    <AuthContext.Provider value={{ user, token, role, isLoading, login, register, logout, switchDemoRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
