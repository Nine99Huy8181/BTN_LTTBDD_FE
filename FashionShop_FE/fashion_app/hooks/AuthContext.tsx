// hooks/AuthContext.tsx
import Toast from 'react-native-toast-message';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { Config } from '../constants/Config';

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
  //Chu y
  customerId?: number;
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
      console.log('Fetch user error:', error);
      Toast.show({type: "error", text1: "Hết hạn đăng nhập", text2: "Vui lòng đăng nhập lại"})
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
      // console.log('Saved token:', token); // Debug
      // console.log('Decoded token:', jwtDecode(token));
      const userData = await fetchUser(token);

      if (!userData) {
        throw new Error('Failed to fetch user data');
      }

      console.log('Login user response:', userData);
      setUser(userData);
      setIsInitializing(false);

      return { success: true };
    } catch (error: any) {
      // console.log('Login error:', error);
      setUser(null);
      setIsInitializing(false);
      const errorMessage = error.response?.data?.message || error.message || 'Invalid credentials';
      Toast.show({type: "error", text1: "Error", text2: "Email và passwpord không hợp lệ"})
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
      console.log('Register error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
      return { success: false, error: errorMessage };
    }
  }, []);

  const logout = useCallback(async () => {
    console.log('Logging out, clearing token and user state');
    await SecureStore.deleteItemAsync('jwt_token');
    setUser(null);
    setIsInitializing(false);
  }, []);

  const getToken = useCallback(async () => {
    const token = await SecureStore.getItemAsync('jwt_token');
    console.log('Retrieved token:', token ? 'Token exists' : 'No token');
    return token;
  }, []);

  // Initialize auth - chỉ chạy 1 lần
  useEffect(() => {
    const initializeAuth = async () => {
      if (hasInitialized) return;

      setIsInitializing(true);
      
      // Get token directly instead of calling getToken()
      const token = await SecureStore.getItemAsync('jwt_token');
      console.log('Retrieved token:', token ? 'Token exists' : 'No token');

      if (token) {
        const userData = await fetchUser(token);

        if (userData) {
          console.log('Initialized user:', userData);
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