// app/(customer)/(profile)/order-detail/[id].tsx
import { Routes } from "@/constants";
import { OrderService } from "@/services/order.service";
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
} from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const data = await OrderService.getOrderDTODetail(Number(id));
        setOrder(data);
      } catch (error) {
        console.log('Lỗi khi tải đơn hàng:', error);
        Alert.alert('Lỗi', 'Không thể tải thông tin đơn hàng');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const handleCancel = async () => {
    Alert.alert('Hủy đơn hàng', 'Bạn có chắc muốn hủy đơn hàng này?', [
      { text: 'Không giữ lại', style: 'cancel' },
      {
        text: 'Hủy đơn',
        style: 'destructive',
        onPress: async () => {
          try {
            await OrderService.cancelOrder(Number(id));
            Alert.alert('Thành công', 'Đơn hàng đã được hủy', [{ text: 'OK', onPress: () => router.back() }]);
          } catch (error) {
            Alert.alert('Lỗi', 'Không thể hủy đơn hàng. Vui lòng thử lại sau.');
          }
        },
      },
    ]);
  };
  const safeDate = (dateStr?: string | null): string => {
    if (!dateStr?.trim()) return '—';
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? '—' : date.toLocaleDateString('vi-VN');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
        <Text style={styles.loadingText}>Đang tải chi tiết đơn hàng...</Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ fontSize: 16, color: '#666' }}>Không tìm thấy đơn hàng</Text>
      </View>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'PENDING': return '#ffa500';
      case 'CONFIRMED': return '#007bff';
      case 'SHIPPING': return '#8e44ad';
      case 'DELIVERED': return '#27ae60';
      case 'CANCELLED': return '#e74c3c';
      case 'COMPLETED': return '#27ae60';
      default: return '#95a5a6';
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.pageTitle}>Chi tiết đơn hàng</Text>
          <Text style={styles.orderId}>#{order.orderId || order.orderID || id}</Text>
        </View>

        {/* Trạng thái đơn hàng nổi bật */}
        <View style={styles.statusCard}>
          <Text style={styles.statusLabel}>Trạng thái đơn hàng</Text>
          <Text style={[styles.statusValue, { color: getStatusColor(order.orderStatus) }]}>
            {order.orderStatus === 'PENDING' && 'Chờ xác nhận'}
            {order.orderStatus === 'CONFIRMED' && 'Đã xác nhận'}
            {order.orderStatus === 'SHIPPING' && 'Đang giao'}
            {order.orderStatus === 'DELIVERED' && 'Đã giao'}
            {order.orderStatus === 'CANCELLED' && 'Đã hủy'}
            {order.orderStatus === 'COMPLETED' && 'Hoàn thành'}
            {!order.orderStatus && 'Chưa xác định'}
          </Text>
        </View>

        {/* Danh sách sản phẩm */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sản phẩm</Text>
          {(order.items || order.orderItems || []).map((item: any, index: number) => (
            <View key={index} style={styles.productItem}>
              <Image
                source={{ uri: item.product?.images?.[0] || 'https://via.placeholder.com/80' }}
                style={styles.productImage}
                resizeMode="cover"
              />
              <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={2}>
                  {item.product?.name || item.productName}
                </Text>
                {item.variant && (
                  <Text style={styles.variant}>
                    Phân loại: {item.variant.color} {item.variant.size && `/ ${item.variant.size}`}
                  </Text>
                )}
                <Text style={styles.quantityPrice}>
                  x{item.quantity} • {(item.price || item.unitPrice)?.toLocaleString()}₫
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Thông tin giao hàng */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin giao hàng</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Người nhận</Text>
            <Text style={styles.infoValue}>{order.customer?.fullName || 'Khách lẻ'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Số điện thoại</Text>
            <Text style={styles.infoValue}>{order.phone || 'Không có'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Địa chỉ</Text>
            <Text style={styles.infoValue}>{order.address || 'Chưa cung cấp'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Ngày đặt hàng</Text>
            <Text style={styles.infoValue}>{safeDate(order.orderDate)}</Text>
          </View>
        </View>

        {/* Thanh toán */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thanh toán</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Phương thức</Text>
            <Text style={styles.infoValue}>
              {order.paymentMethod === 'COD' ? 'Thanh toán khi nhận hàng' : 
              order.paymentMethod === 'BANKING' ? 'Chuyển khoản ngân hàng' : 
              order.paymentMethod || 'Chưa chọn'}
            </Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tổng cộng</Text>
            <Text style={styles.totalAmount}>{order.totalAmount?.toLocaleString()}₫</Text>
          </View>
        </View>

        {/* Nút hành động */}
        <View style={styles.actionButtons}>
          {order.orderStatus === 'PENDING' && (
            <TouchableOpacity style={[styles.actionBtn, styles.cancelBtn]} onPress={handleCancel}>
              <Text style={styles.cancelBtnText}>Hủy đơn hàng</Text>
            </TouchableOpacity>
          )}

          {order.orderStatus === 'DELIVERED' && (
            <TouchableOpacity
              style={[styles.actionBtn, styles.reviewBtn]}
              onPress={() => router.push(`(role)/(customer)/(profile)/order-detail/write-review/${id}`)}
            >
              <Text style={styles.reviewBtnText}>Viết đánh giá</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={[styles.actionBtn, styles.backBtn]} onPress={() => router.back()}>
            <Text style={styles.backBtnText}>Quay lại</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// 🎨 Style - Đồng bộ 100% với trang Home bạn gửi
const styles = StyleSheet.create({
  safe: {
    flex: 1
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: '#666',
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#111',
  },
  orderId: {
    fontSize: 16,
    color: '#888',
    marginTop: 6,
  },
  statusCard: {
    marginHorizontal: 20,
    backgroundColor: '#f8f9fa',
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 14,
    color: '#666',
  },
  statusValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 6,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 12,
  },
  productItem: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
  },
  productImage: {
    width: 80,
    height: 100,
    borderRadius: 10,
    backgroundColor: '#eee',
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111',
  },
  variant: {
    fontSize: 13,
    color: '#777',
    marginTop: 4,
  },
  quantityPrice: {
    fontSize: 14,
    color: '#e63946',
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 15,
    color: '#666',
  },
  infoValue: {
    fontSize: 15,
    color: '#111',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
    marginLeft: 10,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 16,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#e63946',
  },
  actionButtons: {
    padding: 20,
    paddingTop: 10,
  },
  actionBtn: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  cancelBtn: {
    backgroundColor: '#e63946',
  },
  cancelBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  reviewBtn: {
    backgroundColor: '#000',
  },
  reviewBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  backBtn: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  backBtnText: {
    color: '#111',
    fontSize: 16,
    fontWeight: '600',
  },
});