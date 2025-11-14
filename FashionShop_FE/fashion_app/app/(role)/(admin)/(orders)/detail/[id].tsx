import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { OrderService } from '@/services/order.service';
import { OrderDTO } from '@/types';
import Toast from 'react-native-toast-message';

const STATUS_FLOW = ['PENDING', 'APPROVED', 'SHIPPED', 'DELIVERED'];

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams();
  const [order, setOrder] = useState<OrderDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const loadOrder = async () => {
    try {
      const data = await OrderService.getOrderDetail(Number(id));
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
    Alert.alert(
      'Xác nhận',
      `Cập nhật trạng thái đơn hàng thành "${getStatusText(newStatus)}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đồng ý',
          onPress: async () => {
            try {
              const updated = await OrderService.updateOrderStatus(Number(id), newStatus);
              setOrder(updated);
              Toast.show({ type: 'success', text1: 'Cập nhật thành công!' });
            } catch (error) {
              Toast.show({ type: 'error', text1: 'Cập nhật thất bại' });
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Không tìm thấy đơn hàng</Text>
      </View>
    );
  }

  const currentIndex = STATUS_FLOW.indexOf(order.orderStatus);
  const nextStatus = currentIndex < STATUS_FLOW.length - 1 ? STATUS_FLOW[currentIndex + 1] : null;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <View style={{ backgroundColor: '#fff', padding: 16, marginBottom: 12 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold' }}>
            Đơn hàng #{order.orderID}
          </Text>
          <Text style={{
            fontSize: 14,
            color: getStatusColor(order.orderStatus),
            fontWeight: 'bold',
            backgroundColor: '#f0f0f0',
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 20,
          }}>
            {getStatusText(order.orderStatus)}
          </Text>
        </View>

        <Text style={{ color: '#666', marginTop: 4 }}>
          Ngày đặt: {new Date(order.orderDate).toLocaleString('vi-VN')}
        </Text>
      </View>

      {/* Customer Info */}
      <View style={{ backgroundColor: '#fff', padding: 16, marginBottom: 12 }}>
        <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>Thông tin khách hàng</Text>
        <Text>Tên: {order.customerName}</Text>
        <Text>ID: #{order.customerID}</Text>
      </View>

      {/* Shipping */}
      <View style={{ backgroundColor: '#fff', padding: 16, marginBottom: 12 }}>
        <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>Giao hàng</Text>
        <Text>Địa chỉ: {order.shippingAddress}</Text>
        <Text>Phí ship: {order.shippingFee.toLocaleString('vi-VN')}đ</Text>
      </View>

      {/* Payment */}
      <View style={{ backgroundColor: '#fff', padding: 16, marginBottom: 12 }}>
        <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>Thanh toán</Text>
        <Text>Phương thức: {order.paymentMethod}</Text>
        <Text>Trạng thái: {order.paymentStatus === 'PAID' ? 'Đã thanh toán' : 'Chưa thanh toán'}</Text>
      </View>

      {/* Total */}
      <View style={{ backgroundColor: '#fff', padding: 16, marginBottom: 20 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Tổng cộng</Text>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#2196F3' }}>
            {order.totalAmount.toLocaleString('vi-VN')}đ
          </Text>
        </View>
      </View>

      {/* Update Button */}
      {nextStatus && (
        <View style={{ padding: 16 }}>
          <TouchableOpacity
            onPress={() => updateStatus(nextStatus)}
            style={{
              backgroundColor: '#2196F3',
              padding: 16,
              borderRadius: 12,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>
              {getNextActionText(nextStatus)}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
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
    case 'PENDING': return '#FF9800';
    case 'APPROVED': return '#4CAF50';
    case 'SHIPPED': return '#2196F3';
    case 'DELIVERED': return '#2E7D32';
    case 'CANCELLED': return '#F44336';
    default: return '#666';
  }
};

const getNextActionText = (status: string) => {
  switch (status) {
    case 'APPROVED': return 'Duyệt đơn hàng';
    case 'SHIPPED': return 'Giao hàng';
    case 'DELIVERED': return 'Hoàn thành';
    default: return 'Cập nhật';
  }
};