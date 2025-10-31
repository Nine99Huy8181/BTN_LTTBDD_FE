import { Address } from '@/types';
import { api } from './api';

const AddressService = {
  getAddressesByCustomerId: async (customerId: number): Promise<Address[]> => {
    const res = await api.get(`/addresses/customer/${customerId}`);
    return res.data;
  },

  createAddress: async (address: Address): Promise<Address> => {
    const res = await api.post('/addresses', address);
    return res.data;
  },
};

export { AddressService };


export const addressService = {
  // 🧾 Lấy toàn bộ địa chỉ (dành cho admin)
  async getAllAddresses() {
    const response = await api.get('/addresses');
    return response.data;
  },

  // 👤 Lấy danh sách địa chỉ theo customerId
  async getAddressesByCustomerId(customerId: number) {
    const response = await api.get(`/addresses/customer/${customerId}`);
    return response.data;
  },

  // 🔍 Lấy chi tiết 1 địa chỉ
  async getAddressById(id: number) {
    const response = await api.get(`/addresses/${id}`);
    return response.data;
  },

  // ➕ Tạo địa chỉ mới
  async createAddress(data: any) {
    const response = await api.post('/addresses', data);
    return response.data;
  },

  // ✏️ Cập nhật địa chỉ
  async updateAddress(id: number, data: any) {
    const response = await api.put(`/addresses/${id}`, data);
    return response.data;
  },

  // ❌ Xóa địa chỉ
  async deleteAddress(id: number) {
    const response = await api.delete(`/addresses/${id}`);
    return response.data;
  },

  // ⭐ Đặt địa chỉ mặc định
  async setDefaultAddress(addressId: number) {
    const response = await api.put(`/addresses/${addressId}/default`);
    return response.data;
  },
};
