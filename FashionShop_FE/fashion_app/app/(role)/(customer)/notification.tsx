import { FlatList, RefreshControl, TouchableOpacity, Text, View } from 'react-native';
import { useAlertDialog } from '@/hooks/AlertDialogContext';
import { showToast } from '@/utils/toast';
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
  const { showAlert } = useAlertDialog();

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
    <View style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
      {/* Header */}
      <View style={{ 
        paddingTop: 50, 
        paddingBottom: 16, 
        paddingHorizontal: 16, 
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0'
      }}>
        <Text style={{ fontSize: 24, fontWeight: '700', color: '#000' }}>
          Thông báo
        </Text>
        {unreadCount > 0 && (
          <Text style={{ fontSize: 14, color: '#666', marginTop: 4 }}>
            {unreadCount} thông báo mới
          </Text>
        )}
      </View>

      <FlatList
        data={notifications}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor="#FF3B30"
          />
        }
        keyExtractor={item => item.notificationID.toString()}
        contentContainerStyle={{ paddingVertical: 8 }}
        renderItem={({ item }) => (
          <View
            style={{
              backgroundColor: '#fff',
              marginHorizontal: 16,
              marginVertical: 6,
              borderRadius: 12,
              overflow: 'hidden',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 3,
              elevation: 2,
            }}
          >
            <TouchableOpacity 
              onPress={() => handlePress(item)} 
              activeOpacity={0.7}
              style={{ padding: 16 }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                {/* Notification Indicator */}
                {!item.isRead && (
                  <View style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: '#FF3B30',
                    marginRight: 12,
                    marginTop: 6
                  }} />
                )}
                
                <View style={{ flex: 1 }}>
                  <Text style={{ 
                    fontWeight: item.isRead ? '600' : '700', 
                    fontSize: 16,
                    color: item.isRead ? '#333' : '#000',
                    marginBottom: 6
                  }}>
                    {item.title}
                  </Text>
                  
                  <Text style={{ 
                    fontSize: 14, 
                    color: '#666',
                    lineHeight: 20
                  }}>
                    {item.message}
                  </Text>
                  
                  <Text style={{ 
                    fontSize: 12, 
                    color: '#999', 
                    marginTop: 8 
                  }}>
                    {new Date(item.createdDate).toLocaleString('vi-VN')}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* Action Buttons */}
            <View style={{ 
              flexDirection: 'row', 
              justifyContent: 'flex-end',
              paddingHorizontal: 16,
              paddingBottom: 12,
              paddingTop: 4,
              borderTopWidth: 1,
              borderTopColor: '#f5f5f5'
            }}>
              {!item.isRead && (
                <TouchableOpacity
                  onPress={async () => { await markAsRead(item.notificationID); }}
                  style={{ 
                    paddingVertical: 6,
                    paddingHorizontal: 12,
                    marginRight: 8
                  }}
                >
                  <Text style={{ color: '#007AFF', fontSize: 14, fontWeight: '500' }}>
                    Đánh dấu đã đọc
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                onPress={() => {
                  showAlert('Xác nhận', 'Bạn có chắc muốn xóa thông báo này?', [
                    { text: 'Hủy', style: 'cancel' },
                    { 
                      text: 'Xóa', 
                      style: 'destructive', 
                      onPress: async () => { await deleteNotification(item.notificationID); } 
                    },
                  ]);
                }}
                style={{ 
                  paddingVertical: 6,
                  paddingHorizontal: 12
                }}
              >
                <Text style={{ color: '#FF3B30', fontSize: 14, fontWeight: '500' }}>
                  Xóa
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={{ 
            flex: 1, 
            justifyContent: 'center', 
            alignItems: 'center', 
            marginTop: 100 
          }}>
            <View style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: '#f5f5f5',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 16
            }}>
              <Text style={{ fontSize: 40 }}>🔔</Text>
            </View>
            <Text style={{ 
              color: '#999', 
              fontSize: 16,
              fontWeight: '500'
            }}>
              Chưa có thông báo
            </Text>
            <Text style={{ 
              color: '#ccc', 
              fontSize: 14,
              marginTop: 8
            }}>
              Các thông báo mới sẽ hiển thị tại đây
            </Text>
          </View>
        }
      />
    </View>
  );
}