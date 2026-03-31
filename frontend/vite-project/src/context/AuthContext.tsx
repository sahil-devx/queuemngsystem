// AuthContext.tsx (simplified)
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import api from '../api/client';
import type { AuthResponse, AuthUser, UserRole } from '../types';

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

interface LoginPayload {
  email: string;
  password: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<AuthUser>;
  register: (payload: RegisterPayload) => Promise<void>;
  refreshMe: () => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<AuthUser | null>>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [user, setUser] = useState<AuthUser | null>(() => {
    const raw = localStorage.getItem('user');
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  const saveAuth = (data: AuthResponse) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
  };

  const login = async (payload: LoginPayload) => {
    const res = await api.post<AuthResponse>('/auth/login', payload);
    saveAuth(res.data);
    return res.data.user;
  };

  const register = async (payload: RegisterPayload) => {
    const res = await api.post<AuthResponse>('/auth/register', payload);
    saveAuth(res.data);
  };

  const refreshMe = async () => {
    if (!token) return;
    const res = await api.get<{ user: AuthUser }>('/auth/me');
    setUser(res.data.user);
    localStorage.setItem('user', JSON.stringify(res.data.user));
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      isLoading,
      login,
      register,
      refreshMe,
      setUser,
      logout
    }),
    [token, user, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}