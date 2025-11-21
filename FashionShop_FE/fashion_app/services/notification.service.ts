// services/notification.service.ts
import { NotificationDTO } from "@/types";
import { api } from "./api";

export const NotificationService = {
  // Lấy danh sách thông báo
  async getCustomerNotifications(customerId: number): Promise<NotificationDTO[]> {
    const res = await api.get(`/notifications/customer/${customerId}`);
    return res.data;
  },

  // Lấy danh sách thông báo admin/hệ thống
  async getAdminNotifications(): Promise<NotificationDTO[]> {
    const res = await api.get(`/notifications/admin`);
    return res.data;
  },

  // Đánh dấu đã đọc
  async markAsRead(id: number): Promise<void> {
    await api.put(`/notifications/${id}/read`);
  },

  async markAdminAsRead(id: number): Promise<void> {
    await api.put(`/notifications/admin/${id}/read`);
  },

  // Xóa thông báo
  async deleteNotification(id: number): Promise<void> {
    await api.delete(`/notifications/${id}`);
  },

  async deleteAdminNotification(id: number): Promise<void> {
    await api.delete(`/notifications/admin/${id}`);
  },
};