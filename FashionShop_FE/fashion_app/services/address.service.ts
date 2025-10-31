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
  async getAllAddresses(): Promise<Address[]> {
    const res = await api.get('/addresses');
    return res.data;
  },

  // 👤 Lấy danh sách địa chỉ theo customerId
  async getAddressesByCustomerId(customerId: number): Promise<Address[]> {
    const response = await api.get(`/addresses/customer/${customerId}`);
    return response.data;
  },

  // 🔍 Lấy chi tiết 1 địa chỉ
  async getAddressById(id: number): Promise<Address> {
    const response = await api.get(`/addresses/${id}`);
    return response.data;
  },

  // ➕ Tạo địa chỉ mới
  async createAddress(data: Address): Promise<Address> {
    const response = await api.post('/addresses', data);
    return response.data;
  },


  // ✏️ Cập nhật địa chỉ
  async updateAddress(id: number, data: Address): Promise<Address> {
    const response = await api.put(`/addresses/${id}`, data);
    return response.data;
  },

  // ❌ Xóa địa chỉ
  async deleteAddress(id: number): Promise<void> {
    await api.delete(`/addresses/${id}`);
  },

  // ⭐ Đặt địa chỉ mặc định
  async setDefaultAddress(addressId: number): Promise<Address> {
    const response = await api.put(`/addresses/${addressId}/default`);
    return response.data;
  },
};
