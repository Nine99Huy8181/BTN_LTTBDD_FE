import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { OrderService } from '@/services/order.service';
import { OrderDTO } from '@/types';
import Toast from 'react-native-toast-message';
import { safeDate } from '@/scripts/safeDate';

interface FilterTab {
  label: string;
  status: string | null;
  icon: keyof typeof Ionicons.glyphMap;
}

const FILTERS: FilterTab[] = [
  { label: 'Tất cả', status: null, icon: 'list-outline' },
  { label: 'Chờ duyệt', status: 'PENDING', icon: 'time-outline' },
  { label: 'Đã duyệt', status: 'APPROVED', icon: 'checkmark-outline' },
  { label: 'Đang giao', status: 'SHIPPED', icon: 'car-outline' },
  { label: 'Hoàn thành', status: 'DELIVERED', icon: 'gift-outline' },
  { label: 'Đã hủy', status: 'CANCELLED', icon: 'close-outline' },
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

  const lastScrollY = useRef(0);
  const [isScrollingDown, setIsScrollingDown] = useState(true);

  const router = useRouter();

  const loadOrders = useCallback(async (page: number, filter: string | null, isRefresh = false) => {
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
      console.log('Load orders error:', error);
      Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Không thể tải đơn hàng' });
    } finally {
      if (isRefresh) setRefreshing(false);
      if (shouldSetLoading) setLoading(false);
      if (!isRefresh && page !== 0) setLoadingMore(false);
    }
  }, [hasMore, loadingMore]);

  useEffect(() => {
    loadOrders(0, activeFilter);
  }, [loadOrders, activeFilter]);

  const handleFilterPress = (status: string | null) => {
    if (status === activeFilter) return;
    setActiveFilter(status);
    setOrders([]);
    setCurrentPage(0);
    setHasMore(true);
  };

  const onRefresh = () => loadOrders(0, activeFilter, true);

  const handleScroll = (event: any) => {
    const currentY = event.nativeEvent.contentOffset.y;
    const diff = currentY - lastScrollY.current;
    if (Math.abs(diff) > 10) setIsScrollingDown(diff > 0);
    lastScrollY.current = currentY;
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore && !refreshing && !loading && isScrollingDown && currentPage > 0) {
      loadOrders(currentPage + 1, activeFilter);
    }
  };

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#000000" />
        <Text style={styles.loadingMoreText}>Đang tải...</Text>
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="document-text-outline" size={64} color="#CCCCCC" />
        <Text style={styles.emptyText}>Chưa có đơn hàng</Text>
      </View>
    );
  };

  const renderOrderItem = ({ item }: { item: OrderDTO }) => (
    <TouchableOpacity
      onPress={() => router.push(`/(role)/(admin)/(orders)/detail/${item.orderID}`)}
      style={styles.orderCard}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.orderIdContainer}>
          <Text style={styles.orderId}>#{item.orderID}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusBg(item.orderStatus) }]}>
            <Text style={[styles.statusText, { color: getStatusColor(item.orderStatus) }]}>
              {getStatusText(item.orderStatus)}
            </Text>
          </View>
        </View>
        <Text style={styles.orderDate}>{safeDate(item.orderDate)}</Text>
      </View>

      <View style={styles.cardDivider} />

      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          <Ionicons name="person-outline" size={16} color="#666666" />
          <Text style={styles.customerName}>{item.customerName}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="card-outline" size={16} color="#666666" />
          <Text style={styles.paymentInfo}>
            {item.paymentMethod} • {item.paymentStatus === 'PAID' ? 'Đã TT' : 'Chưa TT'}
          </Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.totalLabel}>Tổng tiền</Text>
        <Text style={styles.totalAmount}>{item.totalAmount?.toLocaleString('vi-VN')}đ</Text>
      </View>

      <View style={styles.arrowContainer}>
        <Ionicons name="chevron-forward" size={20} color="#CCCCCC" />
      </View>
    </TouchableOpacity>
  );

  const renderFilterItem = ({ item }: { item: FilterTab }) => {
    const isActive = activeFilter === item.status;
    return (
      <TouchableOpacity
        onPress={() => handleFilterPress(item.status)}
        style={[styles.filterButton, isActive && styles.filterButtonActive]}
        activeOpacity={0.7}
      >
        <Ionicons
          name={item.icon}
          size={16}
          color={isActive ? '#FFFFFF' : '#666666'}
          style={styles.filterIcon}
        />
        <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
          {item.label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Quản lý đơn hàng</Text>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={FILTERS}
          keyExtractor={item => item.status || 'all'}
          renderItem={renderFilterItem}
          contentContainerStyle={styles.filterList}
        />
      </View>

      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Danh sách đơn hàng</Text>
        <View style={styles.titleUnderline} />
      </View>

      {/* Loading State */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000000" />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      )}

      {/* Orders List */}
      {!loading && (
        <FlatList
          data={orders}
          renderItem={renderOrderItem}
          keyExtractor={item => `order-${item.orderID}`}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#000000" />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmpty}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

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
    case 'PENDING': return '#E65100';
    case 'APPROVED': return '#2E7D32';
    case 'SHIPPED': return '#1565C0';
    case 'DELIVERED': return '#1B5E20';
    case 'CANCELLED': return '#C62828';
    default: return '#666666';
  }
};

const getStatusBg = (status: string) => {
  switch (status) {
    case 'PENDING': return '#FFF3E0';
    case 'APPROVED': return '#E8F5E9';
    case 'SHIPPED': return '#E3F2FD';
    case 'DELIVERED': return '#E8F5E9';
    case 'CANCELLED': return '#FFEBEE';
    default: return '#F5F5F5';
  }
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '400',
    color: '#000000',
    fontStyle: 'italic',
    letterSpacing: 0.5,
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  filterList: {
    paddingHorizontal: 12,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  filterButtonActive: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  filterIcon: {
    marginRight: 6,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#666666',
  },
  filterTextActive: {
    color: '#FFFFFF',
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666666',
    fontWeight: '500',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 32,
    backgroundColor: '#F8F8F8',
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    position: 'relative',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  orderIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  orderDate: {
    fontSize: 12,
    color: '#999999',
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#F5F5F5',
    marginVertical: 12,
  },
  cardBody: {
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  customerName: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '500',
  },
  paymentInfo: {
    fontSize: 13,
    color: '#666666',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
  },
  totalLabel: {
    fontSize: 13,
    color: '#666666',
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },
  arrowContainer: {
    position: 'absolute',
    right: 16,
    top: '50%',
    marginTop: -10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#999999',
  },
  footerLoader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  loadingMoreText: {
    fontSize: 14,
    color: '#666666',
  },
});