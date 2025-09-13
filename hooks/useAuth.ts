'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient, User, AuthResponse } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (username: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is already authenticated on mount
    const checkAuth = async () => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        const response = await apiClient.getCurrentUser();
        if (response.data) {
          setUser(response.data.user);
        } else {
          // Invalid token, clear it
          apiClient.clearTokens();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (username: string, password: string) => {
    setLoading(true);
    const credentials = { username, password };
    const response = await apiClient.login(credentials);
    
    if (response.data) {
      apiClient.setTokens(response.data.access_token, response.data.refresh_token);
      setUser(response.data.user);
      setLoading(false);
      return { success: true };
    } else {
      setLoading(false);
      return { success: false, error: response.error || 'Login failed' };
    }
  };

  const register = async (username: string, email: string, password: string) => {
    setLoading(true);
    const response = await apiClient.register({ username, email, password });
    
    if (response.data) {
      // Auto-login after successful registration
      const loginResult = await login(username, password);
      return loginResult;
    } else {
      setLoading(false);
      return { success: false, error: response.error || 'Registration failed' };
    }
  };

  const logout = () => {
    apiClient.clearTokens();
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return React.createElement(AuthContext.Provider, { value }, children);
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
