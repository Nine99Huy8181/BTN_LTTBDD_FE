// app/(customer)/(profile)/order-detail/[id].tsx
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { OrderService } from '@/services/order.service';
import { showToast } from '@/utils/toast';
import { useAlertDialog } from '@/hooks/AlertDialogContext';

// Hàm chuyển trạng thái + màu sắc (đồng bộ với trang danh sách đơn hàng)
const getStatusText = (status: string) => {
  switch (status) {
    case 'PENDING': return 'Chờ duyệt';
    case 'APPROVED': return 'Đã duyệt';
    case 'SHIPPED': return 'Đang giao';
    case 'DELIVERED': return 'Hoàn thành';
    case 'CANCELLED': return 'Đã hủy';
    default: return status || 'Không xác định';
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

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { showAlert } = useAlertDialog();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const data = await OrderService.getOrderDTODetail(Number(id));
        setOrder(data);
      } catch (error) {
        console.log('Lỗi khi tải chi tiết đơn hàng:', error);
        showToast.error('Lỗi', 'Không thể tải thông tin đơn hàng');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const handleCancel = async () => {
    showAlert('Hủy đơn hàng', 'Bạn có chắc chắn muốn hủy đơn hàng này không?', [
      { text: 'Giữ lại', style: 'cancel' },
      {
        text: 'Hủy đơn',
        style: 'destructive',
        onPress: async () => {
          try {
            await OrderService.cancelOrder(Number(id));
            showToast.success('Thành công', 'Đơn hàng đã được hủy');
            // Cập nhật lại trạng thái
            setOrder({ ...order, orderStatus: 'CANCELLED' });
          } catch (error: any) {
            showToast.error('Lỗi', error.message || 'Không thể hủy đơn hàng');
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
        <Text style={styles.errorText}>Không tìm thấy đơn hàng</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const status = order.orderStatus;
  const vietnameseStatus = getStatusText(status);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.pageTitle}>Chi tiết đơn hàng</Text>
          <Text style={styles.orderId}>Mã đơn: #{order.orderId || order.orderID}</Text>
        </View>

        {/* Trạng thái nổi bật */}
        <View style={[styles.statusCard, { backgroundColor: getStatusBg(status) }]}>
          <Text style={styles.statusLabel}>Trạng thái đơn hàng</Text>
          <Text style={[styles.statusValue, { color: getStatusColor(status) }]}>
            {vietnameseStatus}
          </Text>
        </View>

        {/* Danh sách sản phẩm */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sản phẩm đã đặt</Text>
          {(order.items || order.orderItems || []).map((item: any, index: number) => (
            <View key={index} style={styles.productItem}>
              <Image
                source={{ uri: item.product?.images?.[0] || item.variant?.product?.image || 'https://via.placeholder.com/80' }}
                style={styles.productImage}
                resizeMode="cover"
              />
              <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={2}>
                  {item.product?.name || item.productName}
                </Text>
                {(item.variant || item.color || item.size) && (
                  <Text style={styles.variant}>
                    Phân loại: {item.variant?.color || item.color}
                    {item.variant?.size && ` / ${item.variant.size}`}
                    {item.size && !item.variant?.size && ` / ${item.size}`}
                  </Text>
                )}
                <Text style={styles.quantityPrice}>
                  x{item.quantity} • {Number(item.price || item.unitPrice).toLocaleString()}₫
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
            <Text style={styles.infoValue}>{order.customer?.fullName || order.fullName || 'Khách lẻ'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Số điện thoại</Text>
            <Text style={styles.infoValue}>{order.phone || '—'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Địa chỉ giao</Text>
            <Text style={styles.infoValue}>{order.address || '—'}</Text>
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
              {order.paymentMethod === 'COD' ? 'Thanh toán khi nhận hàng (COD)' :
               order.paymentMethod === 'BANKING' ? 'Chuyển khoản ngân hàng' :
               order.paymentMethod || 'Chưa chọn'}
            </Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tổng cộng</Text>
            <Text style={styles.totalAmount}>
              {Number(order.totalAmount).toLocaleString('vi-VN')} ₫
            </Text>
          </View>
        </View>

        {/* Nút hành động */}
        <View style={styles.actionButtons}>
          {/* Chỉ hiện nút hủy khi đang PENDING */}
          {status === 'PENDING' && (
            <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
              <Text style={styles.cancelBtnText}>Hủy đơn hàng</Text>
            </TouchableOpacity>
          )}

          {/* Chỉ hiện đánh giá khi đã giao hàng thành công */}
          {status === 'DELIVERED' && (
            <TouchableOpacity
              style={styles.reviewBtn}
              onPress={() => router.push(`/order-detail/write-review/${id}`)}
            >
              <Text style={styles.reviewBtnText}>Viết đánh giá</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backBtnText}>Quay lại</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: { marginTop: 12, fontSize: 16, color: '#666' },
  errorText: { fontSize: 17, color: '#999', marginBottom: 20 },

  header: { padding: 20, paddingTop: 10 },
  pageTitle: { fontSize: 26, fontWeight: '800', color: '#111' },
  orderId: { fontSize: 16, color: '#666', marginTop: 6, fontWeight: '600' },

  statusCard: {
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 18,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: '#eee',
  },
  statusLabel: { fontSize: 14, color: '#555', fontWeight: '600' },
  statusValue: { fontSize: 22, fontWeight: '800', marginTop: 8, textTransform: 'uppercase' },

  section: { marginTop: 24, paddingHorizontal: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#111', marginBottom: 14 },

  productItem: {
    flexDirection: 'row',
    backgroundColor: '#fafafa',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  productImage: { width: 84, height: 104, borderRadius: 12, backgroundColor: '#f0f0f0' },
  productInfo: { flex: 1, marginLeft: 14, justifyContent: 'space-between' },
  productName: { fontSize: 15.5, fontWeight: '600', color: '#222' },
  variant: { fontSize: 13.5, color: '#777', marginTop: 4 },
  quantityPrice: { fontSize: 15, color: '#e74c3c', fontWeight: '700', marginTop: 6 },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  infoLabel: { fontSize: 15, color: '#666' },
  infoValue: { fontSize: 15, color: '#111', fontWeight: '600', flex: 1, textAlign: 'right', marginLeft: 10 },

  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 16,
    marginTop: 10,
    borderTopWidth: 2,
    borderTopColor: '#eee',
  },
  totalLabel: { fontSize: 19, fontWeight: '800', color: '#111' },
  totalAmount: { fontSize: 22, fontWeight: '800', color: '#e74c3c' },

  actionButtons: { padding: 20, paddingTop: 10 },
  cancelBtn: {
    backgroundColor: '#C62828',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  cancelBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  reviewBtn: {
    backgroundColor: '#000',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  reviewBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  backBtn: {
    backgroundColor: '#f8f9fa',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#ddd',
  },
  backBtnText: { color: '#111', fontSize: 16, fontWeight: '700' },
});