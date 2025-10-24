// lib/api.ts
import axios from 'axios';
import { Config } from '@/constants';
import * as SecureStore from 'expo-secure-store';

export interface ApiResponse<T> {
  code: number;
  message: string;
  result: T | null;
}

const api = axios.create({
  baseURL: Config.API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor: Gắn token
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('jwt_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor: Xử lý lỗi ApiResponse
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.data) {
      const { code, message } = error.response.data;
      error.message = message || 'Request failed';
      error.code = code;
    }
    return Promise.reject(error);
  }
);

export { api };