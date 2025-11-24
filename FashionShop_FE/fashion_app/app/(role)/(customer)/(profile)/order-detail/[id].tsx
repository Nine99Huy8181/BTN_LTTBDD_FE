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
import { OrderDTO } from '@/types';

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

  const [order, setOrder] = useState<OrderDTO | null>(null);
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
            setOrder(prev => prev ? { ...prev, orderStatus: 'CANCELLED' } : null);
          } catch (error: any) {
            showToast.error('Lỗi', error.message || 'Không thể hủy đơn hàng');
          }
        },
      },
    ]);
  };

  // Hàm format ngày đẹp kiểu Việt Nam: 05/04/2025 14:30
  const formatDateTime = (dateStr?: string | null): string => {
    if (!dateStr?.trim()) return '—';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '—';

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${day}/${month}/${year} ${hours}:${minutes}`;
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

  const vietnameseStatus = getStatusText(order.orderStatus);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.pageTitle}>Chi tiết đơn hàng</Text>
          <Text style={styles.orderId}>Mã đơn: HD{order.orderID}</Text>
        </View>

        {/* Trạng thái nổi bật */}
        <View style={[styles.statusCard, { backgroundColor: getStatusBg(order.orderStatus) }]}>
          <Text style={styles.statusLabel}>Trạng thái đơn hàng</Text>
          <Text style={[styles.statusValue, { color: getStatusColor(order.orderStatus) }]}>
            {vietnameseStatus}
          </Text>
        </View>

        {/* Danh sách sản phẩm */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sản phẩm đã đặt</Text>
          {/* Giả sử backend trả về order.items hoặc bạn sẽ thêm sau */}
          {/* Nếu chưa có thì tạm comment hoặc để mảng rỗng */}
          {/* {(order.items || []).map((item: any, index: number) => ( ... ))} */}
        </View>

        {/* Thông tin giao hàng */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin giao hàng</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Người nhận</Text>
            <Text style={styles.infoValue}>{order.customerName || 'Khách lẻ'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Địa chỉ giao</Text>
            <Text style={styles.infoValue}>{order.shippingAddress || '—'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Ngày đặt hàng</Text>
            <Text style={styles.infoValue}>{formatDateTime(order.orderDate)}</Text>
          </View>
          {order.paymentDate && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Ngày thanh toán</Text>
              <Text style={styles.infoValue}>{formatDateTime(order.paymentDate)}</Text>
            </View>
          )}
        </View>

        {/* Thanh toán */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thanh toán</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Phương thức</Text>
            <Text style={styles.infoValue}>
              {order.paymentMethod === 'COD'
                ? 'Thanh toán khi nhận hàng (COD)'
                : order.paymentMethod === 'BANKING'
                ? 'Chuyển khoản ngân hàng'
                : order.paymentMethod || 'Chưa chọn'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Trạng thái thanh toán</Text>
            <Text style={styles.infoValue}>
              {order.paymentStatus === 'PAID' ? 'Đã thanh toán' :
               order.paymentStatus === 'UNPAID' ? 'Chưa thanh toán' :
               order.paymentStatus || '—'}
            </Text>
          </View>
          {order.shippingFee > 0 && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Phí vận chuyển</Text>
              <Text style={styles.infoValue}>{order.shippingFee.toLocaleString('vi-VN')} ₫</Text>
            </View>
          )}
          {order.couponCode && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Mã giảm giá</Text>
              <Text style={styles.infoValue}>{order.couponCode}</Text>
            </View>
          )}
          {order.notes && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Ghi chú</Text>
              <Text style={styles.infoValue}>{order.notes}</Text>
            </View>
          )}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tổng cộng</Text>
            <Text style={styles.totalAmount}>
              {Number(order.totalAmount).toLocaleString('vi-VN')} ₫
            </Text>
          </View>
        </View>

        {/* Nút hành động */}
        <View style={styles.actionButtons}>
          {order.orderStatus === 'PENDING' && (
            <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
              <Text style={styles.cancelBtnText}>Hủy đơn hàng</Text>
            </TouchableOpacity>
          )}

          {order.orderStatus === 'DELIVERED' && (
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