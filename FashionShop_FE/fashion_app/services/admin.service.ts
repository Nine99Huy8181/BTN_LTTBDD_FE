// services/admin.service.ts
import { Account, Admin, CreateAdminRequest, UpdateAdminRequest } from '@/types';
import { api } from './api';

export const adminService = {
  // Lấy danh sách accounts chưa có admin (để chọn khi tạo mới)
  getAvailableAccounts: async (): Promise<Account[]> => {
    const response = await api.get('/accounts');
    return response.data;
  },
  // Lấy tất cả admins
  getAllAdmins: async (): Promise<Admin[]> => {
    const response = await api.get('/admins');
    return response.data;
  },

  // Lấy admin theo ID
  getAdminById: async (id: number): Promise<Admin> => {
    const response = await api.get(`/admins/${id}`);
    return response.data;
  },

  // Lấy admins theo Account ID
  getAdminsByAccountId: async (accountId: number): Promise<Admin[]> => {
    const response = await api.get(`/admins/account/${accountId}`);
    return response.data;
  },

  // Tạo admin mới
  createAdmin: async (admin: CreateAdminRequest): Promise<Admin> => {
    const response = await api.post('/admins', admin);
    return response.data;
  },

  // Cập nhật admin
  updateAdmin: async (id: number, adminDetails: UpdateAdminRequest): Promise<Admin> => {
    const response = await api.put(`/admins/${id}`, adminDetails);
    return response.data;
  },

  // Xóa admin
  deleteAdmin: async (id: number): Promise<void> => {
    await api.delete(`/admins/${id}`);
  },
};