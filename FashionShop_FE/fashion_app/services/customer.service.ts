// services/customer.service.ts
import { Customer, UpdateCustomerRequest } from '@/types';
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

  updateCustomer: async (
    customerId: number,
    customerDetails: UpdateCustomerRequest | any // Thêm any để tránh lỗi type tạm thời
  ): Promise<Customer> => {
    try {
      // Gọi PUT /customers/{id}
      const response = await api.put(`/customers/${customerId}`, customerDetails);
      return response.data;
    } catch (error: any) {
      if (error.response) {
        console.error('❌ Lỗi khi cập nhật customer:');
        console.error('Status code:', error.response.status);
        console.error('Response data:', error.response.data);
      } else {
        console.error('⚠️ Lỗi không có response:', error.message);
      }
      throw error;
    }
  },
};