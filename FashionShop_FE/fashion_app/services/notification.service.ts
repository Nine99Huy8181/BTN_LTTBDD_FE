// services/notification.service.ts
import { NotificationDTO } from "@/types";
import { api } from "./api";
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

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

  // Đăng ký push token
  async registerForPushNotificationsAsync(customerId: number): Promise<string | null> {
    let token;

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        alert('Cần cấp quyền thông báo để nhận ưu đãi!');
        return null;
      }

      token = (await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId,
      })).data;

      // Gửi token lên backend
      await api.post('/notifications/register-token', {
        customerId,
        token,
        platform: 'expo'
      });
    } else {
      console.log('Phải dùng thiết bị thật để nhận thông báo');
    }

    return token;
  }
};