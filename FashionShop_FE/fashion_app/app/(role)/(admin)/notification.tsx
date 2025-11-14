import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useNotification } from '@/hooks/NotificationContext';
import * as Linking from 'expo-linking';

interface AdminNotification {
  title: string;
  message: string;
  deepLink?: string;
  createdDate: string;
}

export default function AdminNotificationsScreen() {
  const { notifications: ctxNotifications, markAsRead, deleteNotification, refreshNotifications } = useNotification();
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  // For admin, we use notifications from NotificationContext (realtime)
  const loadNotifications = async () => {
    try {
      await refreshNotifications();
    } catch (e) {
      console.error('Failed to refresh admin notifications', e);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  // Xử lý click thông báo
  const handlePress = async (item: any) => {
    try {
      if (!item.isRead && markAsRead) await markAsRead(item.notificationID);
    } catch (e) {
      // ignore
    }

    const deepLink = item.deepLink || item.deepLink === null ? item.deepLink : undefined;
    if (typeof deepLink === 'string' && deepLink.startsWith('app://admin/order/')) {
      const orderId = deepLink.split('/').pop();
      router.push(`/(role)/(admin)/(orders)/detail/${orderId}`);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadNotifications();
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <View style={{ padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#eee' }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Thông báo Admin</Text>
        <Text style={{ color: '#666', fontSize: 14, marginTop: 4 }}>
          Đơn hàng mới, yêu cầu duyệt
        </Text>
      </View>

      <FlatList
        data={ctxNotifications}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
  keyExtractor={(item, index) => (item.notificationID ? item.notificationID.toString() : index.toString())}
        renderItem={({ item }) => (
          <View
            style={{
              backgroundColor: item.isRead ? '#fff' : '#fff8e1',
              padding: 16,
              marginHorizontal: 16,
              marginVertical: 6,
              borderRadius: 12,
              elevation: 2,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
              borderLeftWidth: 4,
              borderLeftColor: item.isRead ? '#ddd' : '#FFA000',
            }}
          >
            <TouchableOpacity onPress={() => handlePress(item)} activeOpacity={0.7}>
              <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#1976d2' }}>
                {item.title}
              </Text>
              <Text style={{ marginTop: 4, color: '#444', fontSize: 14 }}>
                {item.message}
              </Text>
              <Text style={{ fontSize: 12, color: '#999', marginTop: 8 }}>
                {new Date(item.createdDate).toLocaleString('vi-VN')}
              </Text>
            </TouchableOpacity>

            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8 }}>
              {!item.isRead && (
                <TouchableOpacity
                  onPress={async () => { if (markAsRead) await markAsRead(item.notificationID); }}
                  style={{ marginRight: 12 }}
                >
                  <Text style={{ color: '#1976d2' }}>Đánh dấu đã đọc</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                onPress={() => {
                  Alert.alert('Xác nhận', 'Bạn có chắc muốn xóa thông báo này?', [
                    { text: 'Hủy', style: 'cancel' },
                    { text: 'Xóa', style: 'destructive', onPress: async () => { if (deleteNotification) await deleteNotification(item.notificationID); } },
                  ]);
                }}
              >
                <Text style={{ color: '#d32f2f' }}>Xóa</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 60 }}>
            <Text style={{ color: '#999', fontSize: 16 }}>Chưa có thông báo mới</Text>
            <Text style={{ color: '#ccc', fontSize: 14, marginTop: 8 }}>
              Đơn hàng mới sẽ xuất hiện tại đây
            </Text>
          </View>
        }
      />
    </View>
  );
}