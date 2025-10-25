// hooks/AuthContext.tsx
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Config } from '../constants/Config';
import { jwtDecode } from 'jwt-decode';
import { Alert } from 'react-native';

interface ApiResponse<T> {
  code: number;
  message: string;
  result: T | null;
}

interface JwtResponse {
  token: string;
}

export interface User {
  userName: string;
  role: string;
  accountId?: number;
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
      const response = await axios.get<ApiResponse<User>>(`${Config.API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.code === 1000) {
        return response.data.result;
      } else {
        throw new Error(response.data.message || 'Failed to fetch user');
      }
    } catch (error) {
      console.error('Fetch user error:', error);
      return null;
    }
  }, []);

  const login = useCallback(async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsInitializing(true);

      const response = await axios.post<ApiResponse<JwtResponse>>(`${Config.API_URL}/auth/login`, {
        userName: username,
        password,
      });

      if (response.data.code !== 1000) {
        throw new Error(response.data.message || 'Login failed');
      }

      const token = response.data.result?.token;
      if (!token || token.split('.').length !== 3) {
        throw new Error('Invalid JWT token received');
      }

      await SecureStore.setItemAsync('jwt_token', token);
      const userData = await fetchUser(token);

      if (!userData) {
        throw new Error('Failed to fetch user data');
      }

      setUser(userData);
      setIsInitializing(false);

      return { success: true };
    } catch (error: any) {
      setUser(null);
      setIsInitializing(false);
      const errorMessage = error.response?.data?.message || error.message || 'Invalid credentials';
      Alert.alert(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [fetchUser]);

  const register = useCallback(async (
    email: string,
    password: string,
    fullName: string,
    phoneNumber: string,
    dateOfBirth: string,
    gender: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await axios.post<ApiResponse<string>>(`${Config.API_URL}/auth/register`, {
        email,
        password,
        fullName,
        phoneNumber,
        dateOfBirth,
        gender,
      });

      if (response.data.code !== 1000) {
        throw new Error(response.data.message || 'Registration failed');
      }

      return { success: true };
    } catch (error: any) {
      // console.error('Register error:', error);
      Alert.alert("Đăng kí không thành công");
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
      return { success: false, error: errorMessage };
    }
  }, []);

  const logout = useCallback(async () => {
    await SecureStore.deleteItemAsync('jwt_token');
    setUser(null);
    setIsInitializing(false);
  }, []);

  const getToken = useCallback(async () => {
    const token = await SecureStore.getItemAsync('jwt_token');
    return token;
  }, []);

  // Initialize auth - chỉ chạy 1 lần
  useEffect(() => {
    const initializeAuth = async () => {
      if (hasInitialized) return;

      setIsInitializing(true);
      
      // Get token directly instead of calling getToken()
      const token = await SecureStore.getItemAsync('jwt_token');

      if (token) {
        const userData = await fetchUser(token);

        if (userData) {
          setUser(userData);
        } else {
          await SecureStore.deleteItemAsync('jwt_token');
          setUser(null);
        }
      } else {
        setUser(null);
      }

      setIsInitializing(false);
      setHasInitialized(true);
    };

    initializeAuth();
  }, [fetchUser]);

  const value: AuthContextType = {
    user,
    isInitializing,
    login,
    register,
    logout,
    getToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};