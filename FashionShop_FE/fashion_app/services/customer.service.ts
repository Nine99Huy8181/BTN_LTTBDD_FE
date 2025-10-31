// services/customer.service.ts
import { Customer } from '@/types';
import { api } from './api';

export const customerService = {
  // Lấy customer theo accountId
  getCustomersByAccountId: async (accountId: number): Promise<Customer[]> => {
    const response = await api.get(`/customers/account/${accountId}`);
    return response.data;
  },

  // Lấy customer theo ID
  getCustomerById: async (customerId: number): Promise<Customer> => {
    const response = await api.get(`/customers/${customerId}`);
    return response.data;
  },
};