import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Platform, ToastAndroid } from 'react-native';
import { connectWebSocket, disconnectWebSocket, registerPushToken } from '@/services/websocket';
import { showToast } from '@/utils/toast';
import { useAuth } from '@/hooks/AuthContext';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { NotificationService } from '@/services/notification.service';
import { NotificationDTO } from '@/types';

interface NotificationContextType {
  notifications: NotificationDTO[];
  unreadCount: number;
  markAsRead: (id: number) => void;
  deleteNotification: (id: number) => void;
  addNotification?: (data: any) => void;
  refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const router = useRouter();
  const clientRef = useRef<any>(null); // Lưu client để tránh reconnect

  // Load danh sách thông báo từ API
  const loadNotifications = async () => {
    if (!user) return;
    setLoading(true);
    try {
      let data: NotificationDTO[] = [];
      if (user.role === 'CUSTOMER' && user.customerId) {
        data = await NotificationService.getCustomerNotifications(user.customerId);
      } else if (user.role === 'ADMIN') {
        data = await NotificationService.getAdminNotifications();
      }

      const normalizeDate = (d: any) => {
        if (!d) return 0;
        if (typeof d === 'string') {
          const t = new Date(d).getTime();
          return isNaN(t) ? 0 : t;
        }
        // handle serialized LocalDateTime from Jackson (object with fields)
        if (typeof d === 'object') {
          try {
            // Java LocalDateTime serialized may have fields like year, monthValue, dayOfMonth, hour, minute, second
            const y = d.year ?? d.yearValue ?? d.getYear?.() ?? null;
            const m = d.monthValue ?? d.month ?? null;
            const day = d.dayOfMonth ?? d.day ?? null;
            const hour = d.hour ?? 0;
            const minute = d.minute ?? 0;
            const second = d.second ?? 0;
            if (y != null && m != null && day != null) {
              return new Date(y, m - 1, day, hour, minute, second).getTime();
            }
          } catch (e) {
            return 0;
          }
        }
        return 0;
      };

      setNotifications(data.sort((a, b) => normalizeDate(b.createdDate) - normalizeDate(a.createdDate)));
    } catch (error) {
      console.log('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }

    // Register push token for customers; then load notifications for any logged-in user (customer or admin)
    if (user.role === 'CUSTOMER' && user.customerId) {
      registerPushToken(user.customerId);
    }

    // Load notifications for both CUSTOMER and ADMIN
    loadNotifications();

    const handleNotification = (data: any) => {
      if (data.source !== 'websocket') return;

      if (data.action === 'read') {
        setNotifications(prev =>
          prev.map(n => n.notificationID === data.notificationID ? { ...n, isRead: true, readDate: data.readDate } : n)
        );
      } else if (data.action === 'delete') {
        setNotifications(prev => prev.filter(n => n.notificationID !== data.notificationId));
      } else {
        // New notification
        const normalizeToISOString = (d: any) => {
          if (!d) return null;
          if (typeof d === 'string') {
            const dt = new Date(d);
            return isNaN(dt.getTime()) ? null : dt.toISOString();
          }
          if (typeof d === 'object') {
            try {
              const y = d.year ?? d.yearValue ?? null;
              const m = d.monthValue ?? d.month ?? null;
              const day = d.dayOfMonth ?? d.day ?? null;
              const hour = d.hour ?? 0;
              const minute = d.minute ?? 0;
              const second = d.second ?? 0;
              if (y != null && m != null && day != null) {
                return new Date(y, m - 1, day, hour, minute, second).toISOString();
              }
            } catch (e) {
              return null;
            }
          }
          return null;
        };

        const created = normalizeToISOString(data.createdDate) ?? new Date().toISOString();
        const read = normalizeToISOString(data.readDate) ?? null;

        const newNotif: NotificationDTO = {
          ...data,
          createdDate: created as any,
          readDate: read as any,
          isRead: !!data.isRead,
        };

        setNotifications(prev => [newNotif, ...prev]);

        // Show a short toast for admin users when new admin notifications arrive
        try {
          if (user && user.role === 'ADMIN') {
            const text = typeof data.message === 'string' ? data.message : (data.title || 'Thông báo mới');
            if (Platform.OS === 'android') {
              ToastAndroid.show(text, ToastAndroid.SHORT);
            } else {
              showToast.info(text);
            }
          }
        } catch (e) {
          // ignore UI errors
        }

        // Deep link nếu app đang foreground — prefer internal navigation for app:// links
        if (data.deepLink) {
          setTimeout(() => {
            try {
              const dl: string = data.deepLink;
              if (typeof dl === 'string' && dl.startsWith('app://order/')) {
                const orderId = dl.replace(/^app:\/\/order\//, '');
                if (user && user.role === 'ADMIN') {
                  // router.push((`/(role)/(admin)/(orders)/detail/${orderId}` as unknown) as any);
                  router.push('/(role)/(admin)/notification')
                } else if (user && user.role === 'CUSTOMER') {
                  // router.push((`/(role)/(customer)/(profile)/order-detail/${orderId}` as unknown) as any);
                  router.push('/(role)/(customer)/notification')
                }
              } else if (typeof dl === 'string' && dl.startsWith('app://')) {
                const path = dl.replace(/^app:\/\//, '');
                // router.push((`/${path}` as unknown) as any);
                router.push('/(role)/(admin)/dashboard')
              } else {
                // Linking.openURL(dl).catch(() => {
                //   // fallback
                // });
              }
            } catch (e) {
              // ignore
            }
          }, 500);
        }
      }
    };

    // Kết nối WebSocket
  const userId = user.role === 'CUSTOMER' && user.customerId ? user.customerId.toString() : 'admin';
    (async () => {
      let retries = 0;
      const maxRetries = 3;
      const retryDelay = (attempt: number) => Math.min(1000 * Math.pow(2, attempt), 30000); // exponential backoff, max 30s

      const attemptConnect = async () => {
        try {
          await connectWebSocket(userId, user.role as 'ADMIN' | 'CUSTOMER', handleNotification);
          console.log('[NotificationContext] WebSocket connected successfully');
        } catch (e) {
          if (retries < maxRetries) {
            retries++;
            const delay = retryDelay(retries - 1);
            console.warn(`[NotificationContext] Connection failed, retrying in ${delay}ms (attempt ${retries}/${maxRetries})`);
            setTimeout(attemptConnect, delay);
          } else {
            console.log('[NotificationContext] Failed to connect WebSocket after max retries', e);
            // Don't crash the app, just warn user in console
          }
        }
      };

      attemptConnect();
    })();

    return () => {
      disconnectWebSocket();
    };
  }, [user]);

  const markAsRead = async (id: number) => {
    try {
      if (user?.role === 'ADMIN') {
        await NotificationService.markAdminAsRead(id);
      } else {
        await NotificationService.markAsRead(id);
      }
      setNotifications(prev =>
        prev.map(n => n.notificationID === id ? { ...n, isRead: true, readDate: new Date().toISOString() } : n)
      );
    } catch (error) {
      console.log('Mark as read failed:', error);
    }
  };

  const deleteNotification = async (id: number) => {
    try {
      if (user?.role === 'ADMIN') {
        await NotificationService.deleteAdminNotification(id);
      } else {
        await NotificationService.deleteNotification(id);
      }
      setNotifications(prev => prev.filter(n => n.notificationID !== id));
    } catch (error) {
      console.log('Delete notification failed:', error);
    }
  };

  const addNotification = (data: any) => {
    const newNotif: NotificationDTO = { ...(data as NotificationDTO), isRead: !!data.isRead };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const refreshNotifications = async () => {
    await loadNotifications();
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        deleteNotification,
        addNotification,
        refreshNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};