import { api } from './api';
import { Account } from '@/types';

export const accountService = {
  // Lấy tất cả tài khoản
  getAllAccounts: async (): Promise<Account[]> => {
    const response = await api.get('/accounts');
    return response.data;
  },
};