import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

// Dữ liệu giả (fake notifications)
const fakeNotifications = [
  {
    id: '1',
    title: 'Giảm giá 40% toàn bộ!',
    message: 'Ưu đãi đặc biệt mùa đông. Áp dụng ngay hôm nay!',
    time: '10 phút trước',
    icon: 'flame',
    read: false,
  },
  {
    id: '2',
    title: 'Đơn hàng #1234 đã giao thành công',
    message: 'Cảm ơn bạn đã mua sắm tại Fashion Store!',
    time: '1 giờ trước',
    icon: 'checkmark-circle',
    read: true,
  },
  {
    id: '3',
    title: 'Sản phẩm mới về',
    message: 'Áo khoác lông, polo cao cấp – chỉ từ $99!',
    time: '3 giờ trước',
    icon: 'shirt',
    read: true,
  },
  {
    id: '4',
    title: 'Nhắc nhở giỏ hàng',
    message: 'Bạn còn 2 sản phẩm trong giỏ. Hoàn tất ngay để nhận ưu đãi!',
    time: 'Hôm qua',
    icon: 'cart',
    read: false,
  },
];

export default function DashboardScreen() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  const renderNotification = ({ item }: { item: any }) => {
    return (
      <TouchableOpacity style={[styles.notificationCard, !item.read && styles.unreadCard]}>
        <View style={styles.iconContainer}>
          <Ionicons name={item.icon as any} size={24} color={item.read ? '#888' : '#ff3a3aff'} />
          {!item.read && <View style={styles.unreadDot} />}
        </View>
        <View style={styles.content}>
          <Text style={[styles.title, !item.read && styles.boldText]}>{item.title}</Text>
          <Text style={[styles.message, !item.read && styles.boldText]}>{item.message}</Text>
          <Text style={styles.time}>{item.time}</Text>
        </View>
        {item.id === '1' && (
          <Image
            source={{ uri: 'https://via.placeholder.com/60' }}
            style={styles.thumbnail}
            resizeMode="cover"
          />
        )}
      </TouchableOpacity>
    );
  };

  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="notifications-off-outline" size={64} color="#ccc" />
      <Text style={styles.emptyTitle}>Chưa có thông báo nào!</Text>
      <Text style={styles.emptySubtitle}>Chúng tôi sẽ thông báo khi có ưu đãi mới</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thông báo</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Danh sách thông báo */}
      <FlatList
        data={fakeNotifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={EmptyState}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

// === STYLES ===
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    textAlign: 'center',
    marginRight: -40,
  },
  listContainer: {
    padding: 16,
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#000000ff',
  },
  iconContainer: {
    position: 'relative',
    marginRight: 12,
  },
  unreadDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#000000ff',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    color: '#555',
    marginBottom: 6,
  },
  time: {
    fontSize: 12,
    color: '#999',
  },
  boldText: {
    fontWeight: '600',
    color: '#000',
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginLeft: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#888',
    marginTop: 8,
  },
});