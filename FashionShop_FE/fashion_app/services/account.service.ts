import { Account } from '@/types';
import * as SecureStore from 'expo-secure-store';
import { api } from './api';

export const accountService = {
  // 🧾 Lấy tất cả tài khoản
  async getAllAccounts(): Promise<Account[]> {
    const res = await api.get('/accounts');
    return res.data;
  },

  // 👤 Lấy tài khoản theo email (có token + log chi tiết)
  async getAccountByEmail(email: string): Promise<Account> {
    console.log('🚀 Gọi API lấy tài khoản theo email:', email);

    try {
      const token = await SecureStore.getItemAsync('jwt_token');
      console.log('🔑 Token từ SecureStore:', token ? token : 'Không có token');

      if (!token) {
        console.warn('⚠️ Không có token, cần đăng nhập lại');
        throw new Error('No token found');
      }

      const res = await api.get(`/accounts/email/${email}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('✅ Status code:', res.status);
      console.log('📦 Response data từ backend:', res.data); 

      return res.data;
    } catch (error: any) {
      if (error.response) {
        console.error('❌ Lỗi khi gọi API getAccountByEmail:');
        console.error('Status code:', error.response.status);
        console.error('Response data:', error.response.data);
      } else {
        console.error('⚠️ Lỗi không có response:', error.message);
      }
      throw error;
    }
  },
  // Cập nhật account (dùng để cập nhật avatar hoặc các trường khác)
  async updateAccount(accountID: number, payload: Partial<Account>): Promise<Account> {
    try {
      const res = await api.put(`/accounts/${accountID}`, payload);
      return res.data;
    } catch (error: any) {
      if (error.response) {
        console.error('❌ Lỗi khi gọi API updateAccount:');
        console.error('Status code:', error.response.status);
        console.error('Response data:', error.response.data);
      } else {
        console.error('⚠️ Lỗi không có response:', error.message);
      }
      throw error;
    }
  },
};
