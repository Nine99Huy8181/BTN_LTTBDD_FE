// hooks/AuthContext.tsx
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Config } from '../constants/Config';
import { jwtDecode } from 'jwt-decode';

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
      const userResponse = await axios.get<User>(`${Config.API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return userResponse.data;
    } catch (error) {
      console.error('Fetch user error:', error);
      return null;
    }
  }, []);

  const login = useCallback(async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsInitializing(true);

      const response = await axios.post<LoginResponse>(`${Config.API_URL}/auth/login`, {
        userName: username,
        password,
      });

      const { token } = response.data;

      if (!token || token.split('.').length !== 3) {
        throw new Error('Invalid JWT token received');
      }

      await SecureStore.setItemAsync('jwt_token', token);
      console.log('Saved token:', token); // Debug
      console.log('Decoded token:', jwtDecode(token));
      const userData = await fetchUser(token);

      if (!userData) {
        throw new Error('Failed to fetch user data');
      }

      console.log('Login user response:', userData);
      setUser(userData);
      setIsInitializing(false);

      return { success: true };
    } catch (error: any) {
      console.error('Login error:', error);
      setUser(null);
      setIsInitializing(false);

      const errorMessage = error.response?.data || 'Invalid credentials';
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
      await axios.post(`${Config.API_URL}/auth/register`, {
        email,
        password,
        fullName,
        phoneNumber,
        dateOfBirth,
        gender,
      });
      return { success: true };
    } catch (error: any) {
      console.error('Register error:', error);
      const errorMessage = error.response?.data || 'Registration failed';
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