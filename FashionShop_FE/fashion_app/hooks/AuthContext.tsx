// hooks/AuthContext.tsx
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { api } from '../services/api';
import { jwtDecode } from 'jwt-decode';

interface ApiResponse<T> {
  code: number;
  message: string;
  result: T | null;
}

interface LoginResponse {
  token: string;
}

export interface User {
  userName: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isInitializing: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, fullName: string, phoneNumber: string, dateOfBirth: string, gender: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  getToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [hasInitialized, setHasInitialized] = useState(false);

  const fetchUser = useCallback(async (token: string): Promise<User | null> => {
    try {
      const response = await api.get<ApiResponse<User>>('/auth/me');
      return response.data.result;
    } catch (error: any) {
      console.error('Fetch user error:', error);
      return null;
    }
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    try {
      setIsInitializing(true);
      const response = await api.post<ApiResponse<LoginResponse>>('/auth/login', {
        userName: username,
        password,
      });

      const token = response.data.result?.token;
      if (!token) throw new Error('No token received');

      await SecureStore.setItemAsync('jwt_token', token);
      const userData = await fetchUser(token);
      if (!userData) throw new Error('Failed to load user info');

      setUser(userData);
      return { success: true };
    } catch (error: any) {
      const msg = error.response?.data?.message || error.message || 'Login failed';
      return { success: false, error: msg };
    } finally {
      setIsInitializing(false);
    }
  }, [fetchUser]);

  const register = useCallback(async (
    email: string, password: string, fullName: string,
    phoneNumber: string, dateOfBirth: string, gender: string
  ) => {
    try {
      await api.post<ApiResponse<any>>('/auth/register', {
        email, password, fullName, phoneNumber, dateOfBirth, gender,
      });
      return { success: true };
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Registration failed';
      return { success: false, error: msg };
    }
  }, []);

  const logout = useCallback(async () => {
    await SecureStore.deleteItemAsync('jwt_token');
    setUser(null);
  }, []);

  const getToken = useCallback(async () => {
    return await SecureStore.getItemAsync('jwt_token');
  }, []);

  // Khởi tạo auth
  useEffect(() => {
    if (hasInitialized) return;
    const init = async () => {
      const token = await SecureStore.getItemAsync('jwt_token');
      if (token) {
        const userData = await fetchUser(token);
        setUser(userData || null);
        if (!userData) await SecureStore.deleteItemAsync('jwt_token');
      }
      setIsInitializing(false);
      setHasInitialized(true);
    };
    init();
  }, [fetchUser, hasInitialized]);

  return (
    <AuthContext.Provider value={{ user, isInitializing, login, register, logout, getToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};