import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNotification } from '@/hooks/NotificationContext';
import { safeDate } from '@/scripts/safeDate';

export default function AdminNotificationsScreen() {
  const { notifications: ctxNotifications, markAsRead, deleteNotification, refreshNotifications } = useNotification();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const loadNotifications = async () => {
    try {
      await refreshNotifications();
    } catch (e) {
      console.error('Failed to refresh admin notifications', e);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handlePress = async (item: any) => {
    try {
      if (!item.isRead && markAsRead) await markAsRead(item.notificationID);
    } catch (e) {}

    const deepLink = item.deepLink;
    if (typeof deepLink === 'string' && deepLink.startsWith('app://admin/order/')) {
      const orderId = deepLink.split('/').pop();
      router.push(`/(role)/(admin)/(orders)/detail/${orderId}`);
    }
  };

  const handleMarkAsRead = async (id: number) => {
    if (markAsRead) await markAsRead(id);
  };

  const handleDelete = (id: number) => {
    Alert.alert(
      'Xác nhận xóa',
      'Bạn có chắc muốn xóa thông báo này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            if (deleteNotification) await deleteNotification(id);
          },
        },
      ]
    );
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadNotifications();
  };

  const unreadCount = ctxNotifications.filter((n: any) => !n.isRead).length;

  const renderNotificationItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[styles.notificationCard, !item.isRead && styles.unreadCard]}
      onPress={() => handlePress(item)}
      activeOpacity={0.7}
    >
      {/* Indicator */}
      {!item.isRead && <View style={styles.unreadIndicator} />}

      {/* Icon */}
      <View style={[styles.iconContainer, !item.isRead && styles.iconContainerUnread]}>
        <Ionicons
          name={getNotificationIcon(item.title)}
          size={20}
          color={!item.isRead ? '#000000' : '#999999'}
        />
      </View>

      {/* Content */}
      <View style={styles.contentContainer}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, !item.isRead && styles.titleUnread]} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.time}>{safeDate(item.createdDate)}</Text>
        </View>

        <Text style={styles.message} numberOfLines={2}>
          {item.message}
        </Text>

        {/* Actions */}
        <View style={styles.actionsRow}>
          {!item.isRead && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleMarkAsRead(item.notificationID)}
              activeOpacity={0.7}
            >
              <Ionicons name="checkmark-outline" size={14} color="#666666" />
              <Text style={styles.actionText}>Đã đọc</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDelete(item.notificationID)}
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={14} color="#C62828" />
            <Text style={[styles.actionText, styles.deleteText]}>Xóa</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Arrow */}
      <Ionicons name="chevron-forward" size={18} color="#CCCCCC" style={styles.arrow} />
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="notifications-off-outline" size={48} color="#CCCCCC" />
      </View>
      <Text style={styles.emptyTitle}>Chưa có thông báo</Text>
      <Text style={styles.emptySubtitle}>Đơn hàng mới sẽ xuất hiện tại đây</Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000000" />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Thông báo</Text>
          <Text style={styles.headerSubtitle}>Đơn hàng mới, yêu cầu duyệt</Text>
        </View>
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unreadCount}</Text>
          </View>
        )}
      </View>

      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Tất cả thông báo</Text>
        <View style={styles.titleUnderline} />
      </View>

      {/* Notifications List */}
      <FlatList
        data={ctxNotifications}
        renderItem={renderNotificationItem}
        keyExtractor={(item, index) =>
          item.notificationID ? item.notificationID.toString() : index.toString()
        }
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#000000" />
        }
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const getNotificationIcon = (title: string): keyof typeof Ionicons.glyphMap => {
  const lowerTitle = title.toLowerCase();
  if (lowerTitle.includes('đơn hàng') || lowerTitle.includes('order')) return 'cart-outline';
  if (lowerTitle.includes('thanh toán') || lowerTitle.includes('payment')) return 'card-outline';
  if (lowerTitle.includes('giao hàng') || lowerTitle.includes('ship')) return 'car-outline';
  if (lowerTitle.includes('hủy') || lowerTitle.includes('cancel')) return 'close-circle-outline';
  return 'notifications-outline';
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666666',
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '400',
    color: '#000000',
    fontStyle: 'italic',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#999999',
    marginTop: 2,
  },
  badge: {
    backgroundColor: '#000000',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 12,
    backgroundColor: '#F8F8F8',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '400',
    color: '#000000',
    letterSpacing: 0.5,
  },
  titleUnderline: {
    width: 28,
    height: 2,
    backgroundColor: '#000000',
    marginTop: 4,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 32,
    backgroundColor: '#F8F8F8',
    flexGrow: 1,
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    position: 'relative',
    overflow: 'hidden',
  },
  unreadCard: {
    borderColor: '#E0E0E0',
  },
  unreadIndicator: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: '#000000',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconContainerUnread: {
    backgroundColor: '#F0F0F0',
  },
  contentContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
    flex: 1,
    marginRight: 8,
  },
  titleUnread: {
    color: '#000000',
    fontWeight: '600',
  },
  time: {
    fontSize: 11,
    color: '#999999',
  },
  message: {
    fontSize: 13,
    color: '#666666',
    lineHeight: 18,
  },
  actionsRow: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '500',
  },
  deleteButton: {},
  deleteText: {
    color: '#C62828',
  },
  arrow: {
    marginLeft: 8,
    marginTop: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666666',
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999999',
  },
});