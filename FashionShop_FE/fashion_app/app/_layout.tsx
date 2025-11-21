// app/_layout.tsx
import { WishlistProvider } from '@/hooks/WishlistContext';
import { AuthProvider, useAuth } from '../hooks/AuthContext';
import { Stack, useRouter } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';
import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import * as Linking from 'expo-linking'; // THÊM
import { NotificationProvider } from '@/hooks/NotificationContext';
import { initializeBackgroundNotifications } from '@/scripts/backgroundNotifications';

function RootLayoutContent() {
  const router = useRouter();
  const { user, isInitializing } = useAuth();

  // Initialize background notification handler ONCE at app startup
  useEffect(() => {
    initializeBackgroundNotifications().catch(e => 
      console.error('Failed to initialize background notifications:', e)
    );
  }, []);

  // CẤU HÌNH NOTIFICATION HANDLER (SDK MỚI)
  useEffect(() => {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  }, []);

  // XỬ LÝ KHI NHẬN THÔNG BÁO (FOREGROUND)
  useEffect(() => {
    const handleNotification = async (notification: Notifications.Notification) => {
      const data = notification.request.content.data as any;

      if (typeof data?.deepLink === 'string' && data.deepLink.trim()) {
        const dl = data.deepLink as string;
        try {
          if (dl.startsWith('app://')) {
            const path = dl.replace(/^app:\/\//, '');
            router.push((`/${path}` as unknown) as any);
          } else {
            await Linking.openURL(dl);
          }
        } catch (e) {
          // ignore
        }
      } else {
        router.push('/(role)/(customer)/notification');
      }
    };

    const subscription = Notifications.addNotificationReceivedListener(handleNotification);
    return () => subscription.remove();
  }, [router]);

  // XỬ LÝ KHI NGƯỜI DÙNG NHẤN VÀO THÔNG BÁO (BACKGROUND / KILLED)
  useEffect(() => {
    const responseListener = Notifications.addNotificationResponseReceivedListener(async (response) => {
      const data = response.notification.request.content.data as any;

      if (typeof data?.deepLink === 'string' && data.deepLink.trim()) {
        const dl = data.deepLink as string;
        try {
          if (dl.startsWith('app://')) {
            const path = dl.replace(/^app:\/\//, '');
            router.push((`/${path}` as unknown) as any);
          } else {
            await Linking.openURL(dl);
          }
        } catch (e) {
          // ignore
        }
      } else {
        router.push('/(role)/(customer)/notification');
      }
    });

    return () => responseListener.remove();
  }, [router]);

  if (isInitializing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const initialRouteName = user ? '(role)' : '(auth)';

  return (
    <Stack
      screenOptions={{ headerShown: false }}
      initialRouteName={initialRouteName}
      key={user ? 'authenticated' : 'unauthenticated'}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="(role)" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <WishlistProvider>
          <NotificationProvider>
            <RootLayoutContent />
            <Toast />
          </NotificationProvider>
        </WishlistProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}