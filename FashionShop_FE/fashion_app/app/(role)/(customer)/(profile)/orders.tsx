// app/(role)/(customer)/(profile)/orders.tsx
import { useAuth } from '@/hooks/AuthContext';
import { safeDate } from '@/scripts/safeDate';
import { OrderService } from '@/services/order.service';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// Bộ lọc mới theo đúng trạng thái thực tế
const FILTERS = ['ALL', 'PENDING', 'APPROVED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];


// Hàm chuyển trạng thái sang tiếng Việt + màu sắc
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

const parseTimestamp = (input: string | number[] | null | undefined): string => {
  let numbers: number[] = [];

  if (Array.isArray(input)) {
    numbers = input.map(n => Number(n));
  }
  else if (typeof input === "string") {
    const cleaned = input.replace(/[\[\]\s]/g, "");
    numbers = cleaned.split(",").map(n => parseInt(n.trim(), 10));
  }
  else {
    return "-";
  }
  if (numbers.length < 5 || numbers.some(n => isNaN(n))) {
    return "Invalid";
  }

  const [year, month, day, hour, minute] = numbers;
  return `${(day)}/${(month)}/${year} ${(hour)}:${(minute)}`;
};

export default function OrdersScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const customerId = user?.customerId || 1;

  const [orders, setOrders] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [selectedFilter, setSelectedFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await OrderService.getOrdersByCustomer(customerId);
        setOrders(data || []);
        setFiltered(data || []);
      } catch (error) {
        console.log('Lỗi tải đơn hàng:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [customerId]);

  const applyFilter = (status: string) => {
    setSelectedFilter(status);
    if (status === 'ALL') {
      setFiltered(orders);
    } else {
      setFiltered(orders.filter((o) => o.orderStatus === status));
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#000" />
        <Text style={styles.loadingText}>Đang tải đơn hàng...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Tiêu đề */}
      <View style={styles.header}>
        <Text style={styles.title}>Đơn hàng của bạn</Text>
        <View style={styles.titleLine} />
      </View>

      {/* Bộ lọc trạng thái */}
      <View style={styles.filterContainer}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            onPress={() => applyFilter(f)}
            style={[
              styles.filterButton,
              selectedFilter === f && styles.filterButtonActive,
            ]}
          >
            <Text
              style={[
                styles.filterText,
                selectedFilter === f && styles.filterTextActive,
              ]}
            >
              {f === 'ALL' ? 'Tất cả' : getStatusText(f)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Danh sách đơn hàng */}
      {filtered.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {selectedFilter === 'ALL'
              ? 'Bạn chưa có đơn hàng nào.'
              : `Không có đơn hàng ${getStatusText(selectedFilter).toLowerCase()}.`}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.orderID.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item }) => {
            const status = item.orderStatus;
            const vietnameseStatus = getStatusText(status);

            return (
              <TouchableOpacity
                style={styles.card}
                onPress={() => router.push(`/order-detail/${item.orderID}`)}
                activeOpacity={0.8}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.orderCode}>Mã đơn: HD{item.orderID}</Text>
                  <View
                    style={[
                      styles.statusTag,
                      {
                        backgroundColor: getStatusBg(status),
                        borderColor: getStatusColor(status),
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        { color: getStatusColor(status) },
                      ]}
                    >
                      {vietnameseStatus}
                    </Text>
                  </View>
                </View>

                <Text style={styles.info}>
                  Ngày đặt: {parseTimestamp(item.orderDate)}
                </Text>
                <Text style={styles.info}>
                  Tổng tiền:{' '}
                  <Text style={styles.totalAmount}>
                    {Number(item.totalAmount).toLocaleString('vi-VN')} ₫
                  </Text>
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      )}

      {/* Nút quay lại */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>Quay lại</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 40,
    paddingHorizontal: 16,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111',
  },
  titleLine: {
    width: 50,
    height: 4,
    backgroundColor: '#000',
    borderRadius: 2,
    marginTop: 8,
  },

  // Bộ lọc
  filterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
    gap: 10,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  filterButtonActive: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  filterTextActive: {
    color: '#fff',
  },

  // Card đơn hàng
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderCode: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222',
  },
  statusTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  info: {
    fontSize: 14.5,
    color: '#555',
    marginTop: 6,
  },
  totalAmount: {
    fontWeight: '700',
    color: '#e74c3c',
  },

  // Trống
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#777',
    textAlign: 'center',
    lineHeight: 24,
  },

  // Nút quay lại
  backButton: {
    marginTop: 10,
    marginBottom: 20,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },

  // Loading
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#555',
  },
});