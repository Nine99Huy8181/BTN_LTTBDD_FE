import { Client } from '@stomp/stompjs';
// @ts-ignore - sockjs-client has no bundled d.ts in this project
import SockJS from 'sockjs-client/dist/sockjs';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import { api } from './api'; // Giả định bạn sẽ dùng 'api' để lấy base URL
import { Config } from '@/constants/Config';

// services/websocket.ts
let client: Client | null = null;

export const connectWebSocket = async (
  userId: string,
  role: 'ADMIN' | 'CUSTOMER',
  onNotification: (data: any) => void
) => {
  // load jwt from secure store so we can attach it to the websocket handshake
  try {
    const token = await SecureStore.getItemAsync('jwt_token');
    // put it on globalThis for sync usage inside webSocketFactory
    // (webSocketFactory is sync). This is pragmatic; alternatively you'd use connectHeaders in stompjs.
    (globalThis as any).__JWT = token || '';
  } catch (e) {
    console.warn('Failed to read JWT for websocket handshake', e);
    (globalThis as any).__JWT = '';
  }
  if (client?.connected) {
    client.deactivate();
  }

  client = new Client({
    // We use webSocketFactory with SockJS to support SockJS endpoint on the server.
    webSocketFactory: () => {
      // derive WS url from API_URL (remove trailing /api if present)
      const apiUrl = Config.API_URL || api.defaults.baseURL || '';
      let base = apiUrl.replace(/\/api\/?$/, '');
      // Ensure the URL has an http/https scheme; SockJS expects http(s) URLs (not ws://)
      if (!/^https?:\/\//i.test(base)) {
        base = 'http://' + base;
      }
      // strip trailing slash
      base = base.replace(/\/$/, '');
      // pass token as query param so server handshake handler can read it
      const sockUrl = `${base}/ws?token=${encodeURIComponent('Bearer ' + ((globalThis as any).__JWT || ''))}`;
      return new SockJS(sockUrl);
    },
    reconnectDelay: 5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
  });

  client.onConnect = () => {
    console.log('[WebSocket] Connected as', role, userId);

    // Subscribe to user-destinations; server will route to the session whose Principal name matches the customerId
    if (role === 'CUSTOMER') {
      client!.subscribe(`/user/queue/notifications`, msg => {
        onNotification({ ...JSON.parse(msg.body), source: 'websocket' });
      });
      client!.subscribe(`/user/queue/notifications/read`, msg => {
        const payload = JSON.parse(msg.body);
        onNotification({ ...payload, action: 'read', source: 'websocket' });
      });
      client!.subscribe(`/user/queue/notifications/delete`, msg => {
        onNotification({ notificationId: JSON.parse(msg.body), action: 'delete', source: 'websocket' });
      });
    }

    if (role === 'ADMIN') {
      client!.subscribe('/topic/admin/notifications', msg => {
        onNotification({ ...JSON.parse(msg.body), source: 'websocket' });
      });
    }
  };

  client.onStompError = (frame) => {
    console.log('STOMP Error:', frame);
  };

  client.activate();
};

export const disconnectWebSocket = () => {
  client?.deactivate();
  client = null;
};

/**
 * Đăng ký Expo Push Token lên backend
 * @param customerId ID của customer
 */
export const registerPushToken = async (customerId: number) => {
  if (!Device.isDevice) {
    console.warn('Must use physical device for Push Notifications');
    return;
  }

  // 1. Xin quyền
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Permission not granted for push notifications');
    return;
  }

  // 2. Lấy token
  try {
    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      Constants.manifest?.extra?.eas?.projectId;

    if (!projectId) {
      console.log('EAS Project ID not found in app config');
      return;
    }

    const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
    console.log('Got Expo Push Token:', token);

    // 3. GỌI API LƯU TOKEN VÀO CUSTOMER (backend: PUT /api/push-token)
    await api.put('/push-token', {
      customerId: customerId,
      expoPushToken: token,
    });

    console.log('Push token saved to backend');
  } catch (e: any) {
    console.log('Error getting or saving push token', e.message);
  }
};