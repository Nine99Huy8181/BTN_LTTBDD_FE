import { FlatList, RefreshControl, TouchableOpacity, Text, View, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useNotification } from '@/hooks/NotificationContext';
import * as Linking from 'expo-linking';
import { NotificationDTO } from '@/types';
import { useState } from 'react';

const openDeepLink = (deepLink: string, router: any) => {
  try {
    if (deepLink.startsWith('app://order/')) {
      // app://order/27 -> /(role)/(customer)/(profile)/order-detail/27
      const orderId = deepLink.replace(/^app:\/\/order\//, '');
      router.push((`/(role)/(customer)/(profile)/order-detail/${orderId}` as unknown) as any);
    } else if (deepLink.startsWith('app://')) {
      const path = deepLink.replace(/^app:\/\//, '');
      router.push((`/${path}` as unknown) as any);
    } else {
      Linking.openURL(deepLink).catch(() => {
        // fallback
      });
    }
  } catch (e) {
    // ignore
  }
};

export default function CustomerNotificationScreen() {
  const router = useRouter();
  const { notifications, unreadCount, markAsRead, deleteNotification, refreshNotifications } = useNotification();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshNotifications();
    setRefreshing(false);
  };

  const handlePress = async (item: NotificationDTO) => {
    if (!item.isRead) await markAsRead(item.notificationID);
    if (item.deepLink) {
      openDeepLink(item.deepLink, router);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <View style={{ padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#eee' }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold' }}>
          Thông báo {unreadCount > 0 && `(${unreadCount} mới)`}
        </Text>
      </View>

      <FlatList
        data={notifications}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        keyExtractor={item => item.notificationID.toString()}
        renderItem={({ item }) => (
          <View
            style={{
              backgroundColor: item.isRead ? '#fff' : '#e3f2fd',
              padding: 16,
              marginHorizontal: 16,
              marginVertical: 4,
              borderRadius: 12,
              borderLeftWidth: 4,
              borderLeftColor: item.isRead ? '#ddd' : '#2196F3',
            }}
          >
            <TouchableOpacity onPress={() => handlePress(item)} activeOpacity={0.7}>
              <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{item.title}</Text>
              <Text style={{ marginTop: 4, color: '#444' }}>{item.message}</Text>
              <Text style={{ fontSize: 12, color: '#999', marginTop: 8 }}>
                {new Date(item.createdDate).toLocaleString('vi-VN')}
              </Text>
            </TouchableOpacity>

            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8 }}>
              {!item.isRead && (
                <TouchableOpacity
                  onPress={async () => { await markAsRead(item.notificationID); }}
                  style={{ marginRight: 12 }}
                >
                  <Text style={{ color: '#1976d2' }}>Đánh dấu đã đọc</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                onPress={() => {
                  Alert.alert('Xác nhận', 'Bạn có chắc muốn xóa thông báo này?', [
                    { text: 'Hủy', style: 'cancel' },
                    { text: 'Xóa', style: 'destructive', onPress: async () => { await deleteNotification(item.notificationID); } },
                  ]);
                }}
              >
                <Text style={{ color: '#d32f2f' }}>Xóa</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 }}>
            <Text style={{ color: '#999' }}>Chưa có thông báo</Text>
          </View>
        }
      />
    </View>
  );
}