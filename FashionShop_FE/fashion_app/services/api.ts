import axios from 'axios';
import { Config } from '@/constants';
import * as SecureStore from 'expo-secure-store';
import {jwtDecode} from 'jwt-decode';

const api = axios.create({
  baseURL: Config.API_URL,//'http://192.168.2.26:8085/api'
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor để thêm token JWT vào header Authorization
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('jwt_token');
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  console.log(error);
  return Promise.reject(error);
});

export { api };