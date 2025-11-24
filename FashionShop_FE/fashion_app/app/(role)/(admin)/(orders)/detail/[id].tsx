import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useAlertDialog } from '@/hooks/AlertDialogContext';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { OrderService } from '@/services/order.service';
import { OrderDTO } from '@/types';
import { safeDate } from '@/scripts/safeDate';
import Toast from 'react-native-toast-message';

const STATUS_FLOW = ['PENDING', 'APPROVED', 'SHIPPED', 'DELIVERED'];

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { showAlert } = useAlertDialog();
  const [order, setOrder] = useState<OrderDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const loadOrder = async () => {
    try {
      const data = await OrderService.getOrderDTODetail(Number(id));
      setOrder(data);
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Lỗi tải chi tiết đơn hàng' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrder();
  }, [id]);

  const updateStatus = async (newStatus: string) => {
    showAlert(
      'Xác nhận',
      `Cập nhật trạng thái đơn hàng thành "${getStatusText(newStatus)}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đồng ý',
          onPress: async () => {
            setUpdating(true);
            try {
              const updated = await OrderService.updateOrderStatus(Number(id), newStatus);
              setOrder(updated);
              Toast.show({ type: 'success', text1: 'Cập nhật thành công!' });
            } catch (error) {
              Toast.show({ type: 'error', text1: 'Cập nhật thất bại' });
            } finally {
              setUpdating(false);
            }
          },
        },
      ]
    );
  };

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

  if (!order) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#000000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chi tiết đơn hàng</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="document-text-outline" size={64} color="#CCCCCC" />
          <Text style={styles.emptyText}>Không tìm thấy đơn hàng</Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentIndex = STATUS_FLOW.indexOf(order.orderStatus);
  const nextStatus = currentIndex >= 0 && currentIndex < STATUS_FLOW.length - 1 
    ? STATUS_FLOW[currentIndex + 1] 
    : null;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết đơn hàng</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Order Info Card */}
        <View style={styles.card}>
          <View style={styles.orderHeader}>
            <View>
              <Text style={styles.orderId}>Đơn hàng #{order.orderID}</Text>
              <Text style={styles.orderDate}>{safeDate(order.orderDate)}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: getStatusBg(order.orderStatus) }]}>
              <Text style={[styles.statusText, { color: getStatusColor(order.orderStatus) }]}>
                {getStatusText(order.orderStatus)}
              </Text>
            </View>
          </View>
        </View>

        {/* Status Timeline */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Trạng thái đơn hàng</Text>
          <View style={styles.titleUnderline} />
          <View style={styles.timeline}>
            {STATUS_FLOW.map((status, index) => {
              const isActive = index <= currentIndex;
              const isCurrent = index === currentIndex;
              return (
                <View key={status} style={styles.timelineItem}>
                  <View style={styles.timelineLeft}>
                    <View style={[
                      styles.timelineDot,
                      isActive && styles.timelineDotActive,
                      isCurrent && styles.timelineDotCurrent
                    ]}>
                      {isActive && <Ionicons name="checkmark" size={12} color="#FFFFFF" />}
                    </View>
                    {index < STATUS_FLOW.length - 1 && (
                      <View style={[styles.timelineLine, isActive && styles.timelineLineActive]} />
                    )}
                  </View>
                  <Text style={[styles.timelineText, isActive && styles.timelineTextActive]}>
                    {getStatusText(status)}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Customer Info */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Thông tin khách hàng</Text>
          <View style={styles.titleUnderline} />
          <View style={styles.infoRow}>
            <Ionicons name="person-outline" size={18} color="#666666" />
            <Text style={styles.infoLabel}>Tên:</Text>
            <Text style={styles.infoValue}>{order.customerName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="finger-print-outline" size={18} color="#666666" />
            <Text style={styles.infoLabel}>ID:</Text>
            <Text style={styles.infoValue}>#{order.customerID}</Text>
          </View>
        </View>

        {/* Shipping Info */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Thông tin giao hàng</Text>
          <View style={styles.titleUnderline} />
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={18} color="#666666" />
            <Text style={styles.infoLabel}>Địa chỉ:</Text>
            <Text style={[styles.infoValue, styles.addressText]}>{order.shippingAddress}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="car-outline" size={18} color="#666666" />
            <Text style={styles.infoLabel}>Phí ship:</Text>
            <Text style={styles.infoValue}>{order.shippingFee.toLocaleString('vi-VN')}đ</Text>
          </View>
          {order.notes && (
            <View style={styles.infoRow}>
              <Ionicons name="document-text-outline" size={18} color="#666666" />
              <Text style={styles.infoLabel}>Ghi chú:</Text>
              <Text style={[styles.infoValue, styles.notesText]}>{order.notes}</Text>
            </View>
          )}
        </View>

        {/* Payment Info */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Thanh toán</Text>
          <View style={styles.titleUnderline} />
          <View style={styles.infoRow}>
            <Ionicons name="wallet-outline" size={18} color="#666666" />
            <Text style={styles.infoLabel}>Phương thức:</Text>
            <Text style={styles.infoValue}>{order.paymentMethod}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="checkmark-circle-outline" size={18} color="#666666" />
            <Text style={styles.infoLabel}>Trạng thái:</Text>
            <View style={[
              styles.paymentBadge,
              { backgroundColor: order.paymentStatus === 'PAID' ? '#E8F5E9' : '#FFF3E0' }
            ]}>
              <Text style={[
                styles.paymentBadgeText,
                { color: order.paymentStatus === 'PAID' ? '#2E7D32' : '#E65100' }
              ]}>
                {order.paymentStatus === 'PAID' ? 'Đã thanh toán' : 'Chưa thanh toán'}
              </Text>
            </View>
          </View>
          {order.paymentDate && (
            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={18} color="#666666" />
              <Text style={styles.infoLabel}>Ngày TT:</Text>
              <Text style={styles.infoValue}>{safeDate(order.paymentDate)}</Text>
            </View>
          )}
          {order.couponCode && (
            <View style={styles.infoRow}>
              <Ionicons name="pricetag-outline" size={18} color="#666666" />
              <Text style={styles.infoLabel}>Mã giảm:</Text>
              <Text style={[styles.infoValue, styles.couponText]}>{order.couponCode}</Text>
            </View>
          )}
        </View>

        {/* Total */}
        <View style={styles.card}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tổng cộng</Text>
            <Text style={styles.totalValue}>{order.totalAmount.toLocaleString('vi-VN')}đ</Text>
          </View>
        </View>

        {/* Action Button */}
        {nextStatus && (
          <TouchableOpacity
            style={[styles.actionButton, updating && styles.actionButtonDisabled]}
            onPress={() => updateStatus(nextStatus)}
            activeOpacity={0.8}
            disabled={updating}
          >
            {updating ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name={getActionIcon(nextStatus)} size={20} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>{getNextActionText(nextStatus)}</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {order.orderStatus === 'CANCELLED' && (
          <View style={styles.cancelledBanner}>
            <Ionicons name="close-circle" size={20} color="#D32F2F" />
            <Text style={styles.cancelledText}>Đơn hàng đã bị hủy</Text>
          </View>
        )}

        <View style={styles.bottomSpace} />
      </ScrollView>
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

const getNextActionText = (status: string) => {
  switch (status) {
    case 'APPROVED': return 'Duyệt đơn hàng';
    case 'SHIPPED': return 'Xác nhận giao hàng';
    case 'DELIVERED': return 'Hoàn thành đơn hàng';
    default: return 'Cập nhật';
  }
};

const getActionIcon = (status: string): keyof typeof Ionicons.glyphMap => {
  switch (status) {
    case 'APPROVED': return 'checkmark-circle-outline';
    case 'SHIPPED': return 'car-outline';
    case 'DELIVERED': return 'gift-outline';
    default: return 'arrow-forward-outline';
  }
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#999999',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#000000',
    letterSpacing: 0.3,
  },
  placeholder: {
    width: 40,
  },
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderId: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    letterSpacing: 0.3,
  },
  orderDate: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    letterSpacing: 0.3,
  },
  titleUnderline: {
    width: 24,
    height: 2,
    backgroundColor: '#000000',
    marginTop: 4,
    marginBottom: 16,
  },
  timeline: {
    paddingLeft: 4,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    minHeight: 40,
  },
  timelineLeft: {
    alignItems: 'center',
    width: 24,
  },
  timelineDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineDotActive: {
    backgroundColor: '#000000',
  },
  timelineDotCurrent: {
    backgroundColor: '#000000',
    borderWidth: 3,
    borderColor: '#E0E0E0',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 4,
  },
  timelineLineActive: {
    backgroundColor: '#000000',
  },
  timelineText: {
    fontSize: 14,
    color: '#999999',
    marginLeft: 12,
    marginTop: 2,
  },
  timelineTextActive: {
    color: '#000000',
    fontWeight: '500',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 8,
    width: 80,
  },
  infoValue: {
    fontSize: 14,
    color: '#000000',
    flex: 1,
    fontWeight: '500',
  },
  addressText: {
    lineHeight: 20,
  },
  notesText: {
    fontStyle: 'italic',
    color: '#666666',
  },
  paymentBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  paymentBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  couponText: {
    color: '#1565C0',
    fontWeight: '600',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
  },
  actionButton: {
    flexDirection: 'row',
    backgroundColor: '#000000',
    marginHorizontal: 16,
    marginTop: 20,
    paddingVertical: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  actionButtonDisabled: {
    backgroundColor: '#999999',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelledBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFEBEE',
    marginHorizontal: 16,
    marginTop: 20,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  cancelledText: {
    color: '#D32F2F',
    fontSize: 15,
    fontWeight: '600',
  },
  bottomSpace: {
    height: 32,
  },
});