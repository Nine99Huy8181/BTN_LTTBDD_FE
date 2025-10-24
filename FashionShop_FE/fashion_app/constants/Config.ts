// src/Config.ts (hoặc constants/Config.ts)
import Constants from 'expo-constants';

export const Config = {
  API_URL: Constants.expoConfig?.extra?.apiUrl,
  JWT_STORAGE_KEY: 'jwt_token', // Key lưu token trong AsyncStorage
  DEFAULT_PAGE_SIZE: 10, // Số item per page cho pagination
};