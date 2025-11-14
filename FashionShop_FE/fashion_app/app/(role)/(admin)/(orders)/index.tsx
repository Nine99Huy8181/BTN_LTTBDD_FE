import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { OrderService } from '@/services/order.service';
import { OrderDTO } from '@/types';
import Toast from 'react-native-toast-message';
import { safeDate } from '@/scripts/safeDate';

interface FilterTab {
  label: string;
  status: string | null;
}

const FILTERS: FilterTab[] = [
  { label: 'Tất cả', status: null },
  { label: 'Chờ duyệt', status: 'PENDING' },
  { label: 'Đã duyệt', status: 'APPROVED' },
  { label: 'Đang giao', status: 'SHIPPED' },
  { label: 'Hoàn thành', status: 'DELIVERED' },
  { label: 'Đã hủy', status: 'CANCELLED' },
];

const PAGE_SIZE = 20;

export default function AdminOrdersScreen() {
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Theo dõi hướng cuộn
  const lastScrollY = useRef(0);
  const [isScrollingDown, setIsScrollingDown] = useState(true);

  const router = useRouter();

  const loadOrders = useCallback(async (page: number, filter: string | null, isRefresh: boolean = false) => {
    let shouldSetLoading = false;

    if (isRefresh) {
      setRefreshing(true);
    } else if (page === 0) {
      setLoading(true);
      shouldSetLoading = true;
    } else {
      if (loadingMore || !hasMore) return;
      setLoadingMore(true);
    }

    try {
      const response = await OrderService.getAllOrdersPaginated(page, PAGE_SIZE, filter);

      setOrders(prev => (page === 0 ? response.content : [...prev, ...response.content]));
      setHasMore(!response.last);
      setCurrentPage(page);

    } catch (error) {
      console.error('Load orders error:', error);
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Không thể tải đơn hàng',
      });
    } finally {
      if (isRefresh) setRefreshing(false);
      if (shouldSetLoading) setLoading(false);
      if (!isRefresh && page !== 0) setLoadingMore(false);
    }
  }, [hasMore, loadingMore]);

  // Tải lần đầu + khi đổi filter
  useEffect(() => {
    loadOrders(0, activeFilter);
  }, [loadOrders, activeFilter]);

  // Đổi filter
  const handleFilterPress = (status: string | null) => {
    if (status === activeFilter) return;
    setActiveFilter(status);
    setOrders([]);
    setCurrentPage(0);
    setHasMore(true);
    // loadOrders sẽ tự chạy nhờ useEffect
  };

  // Pull to refresh
  const onRefresh = () => {
    loadOrders(0, activeFilter, true);
  };

  // Theo dõi cuộn
  const handleScroll = (event: any) => {
    const currentY = event.nativeEvent.contentOffset.y;
    const diff = currentY - lastScrollY.current;
    if (Math.abs(diff) > 10) {
      setIsScrollingDown(diff > 0);
    }
    lastScrollY.current = currentY;
  };

  // Load more
  const handleLoadMore = () => {
    if (!loadingMore && hasMore && !refreshing && !loading && isScrollingDown && currentPage > 0) {
      loadOrders(currentPage + 1, activeFilter);
    }
  };

  // Render footer
  const renderFooter = () => {
    if (!loadingMore) return null;
    return <ActivityIndicator size="large" color="#2196F3" style={{ marginVertical: 20 }} />;
  };

  // Render empty
  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Chưa có đơn hàng</Text>
      </View>
    );
  };

  // Render item
  const renderOrderItem = ({ item }: { item: OrderDTO }) => (
    <TouchableOpacity
      onPress={() => router.push(`/(role)/(admin)/(orders)/detail/${item.orderID}`)}
      style={styles.itemContainer}
    >
      <View style={styles.itemRow}>
        <Text style={styles.orderId}>Đơn #{item.orderID}</Text>
        <Text style={styles.orderDate}>
          {safeDate(item.orderDate)}
        </Text>
      </View>
      <Text style={styles.customerName}>
        Khách: <Text style={{ fontWeight: '600' }}>{item.customerName}</Text>
      </Text>
      <View style={styles.itemRow}>
        <Text style={styles.totalAmount}>
          {item.totalAmount?.toLocaleString('vi-VN')}đ
        </Text>
        <Text style={{
          color: getStatusColor(item.orderStatus),
          fontWeight: '600',
          fontSize: 13,
        }}>
          {getStatusText(item.orderStatus)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Filter Tabs */}
      <View style={styles.filterBar}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={FILTERS}
          keyExtractor={item => item.status || 'all'}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => handleFilterPress(item.status)}
              style={[
                styles.filterButton,
                { backgroundColor: activeFilter === item.status ? '#2196F3' : '#eee' }
              ]}
            >
              <Text style={{
                color: activeFilter === item.status ? '#fff' : '#333',
                fontWeight: '600',
              }}>
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Full screen loading */}
      {loading && (
        <View style={styles.fullScreenLoader}>
          <ActivityIndicator size="large" color="#2196F3" />
        </View>
      )}

      {/* Orders List */}
      {!loading && (
        <FlatList
          data={orders}
          renderItem={renderOrderItem}
          keyExtractor={item => `order-${item.orderID}`} // Ổn định, tránh reset scroll
          contentContainerStyle={{ paddingBottom: 20 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          onScroll={handleScroll}
          scrollEventThrottle={16} // Mượt hơn
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmpty}
        />
      )}
    </View>
  );
}

// Helper functions
const getStatusText = (status: string) => {
  switch (status) {
    case 'PENDING': return 'Chờ duyệt';
    case 'APPROVED': return 'Đã duyệt';
    case 'SHIPPED': return 'Đang giao';
    case 'DELIVERED': return 'Hoàn thành';
    case 'CANCELLED': return 'Đã hủy';
    default: return status;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'PENDING': return '#FF9800';
    case 'APPROVED': return '#4CAF50';
    case 'SHIPPED': return '#2196F3';
    case 'DELIVERED': return '#2E7D32';
    case 'CANCELLED': return '#F44336';
    default: return '#666';
  }
};

// Styles
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  filterBar: { backgroundColor: '#fff', paddingVertical: 12 },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 6,
    borderRadius: 20,
  },
  fullScreenLoader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: { color: '#999', fontSize: 16 },
  itemContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderId: { fontWeight: 'bold', fontSize: 16 },
  orderDate: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  customerName: { marginTop: 4, color: '#444' },
  totalAmount: { color: '#2196F3', fontWeight: 'bold', marginTop: 8 },
});