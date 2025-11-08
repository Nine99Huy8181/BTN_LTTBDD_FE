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
} from 'react-native';

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const data = await OrderService.getOrderDetail(Number(id));
        setOrder(data);
      } catch (error) {
        console.error('❌ Lỗi khi tải đơn hàng:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const handleCancel = async () => {
    Alert.alert('Xác nhận', 'Bạn có chắc chắn muốn hủy đơn hàng này?', [
      { text: 'Không', style: 'cancel' },
      {
        text: 'Có',
        onPress: async () => {
          try {
            await OrderService.cancelOrder(Number(id));
            Alert.alert('✅ Thành công', 'Đơn hàng đã được hủy!');
            router.back();
          } catch (error) {
            Alert.alert('❌ Lỗi', 'Không thể hủy đơn hàng này!');
          }
        },
      },
    ]);
  };

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#000" />
        <Text style={{ marginTop: 10 }}>Đang tải chi tiết đơn hàng...</Text>
      </View>
    );

  if (!order)
    return (
      <View style={styles.center}>
        <Text>Không tìm thấy đơn hàng.</Text>
      </View>
    );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* 🔹 Tiêu đề + gạch đen */}
      <Text style={styles.title}>Chi tiết đơn hàng #{id}</Text>
      <View style={styles.titleLine} />

      {/* 🔹 Nội dung đơn hàng */}
      <View style={styles.card}>
        <Text style={styles.label}>👤 Khách hàng:</Text>
        <Text style={styles.value}>{order.customer?.fullName}</Text>

        <Text style={styles.label}>📦 Trạng thái:</Text>
        <Text style={[styles.value, { color: '#007bff' }]}>{order.orderStatus}</Text>

        <Text style={styles.label}>💰 Tổng tiền:</Text>
        <Text style={[styles.value, { fontWeight: 'bold', color: '#e63946' }]}>
          {order.totalAmount?.toLocaleString()} ₫
        </Text>

        {order.notes && (
          <>
            <Text style={styles.label}>📝 Ghi chú:</Text>
            <Text style={styles.value}>{order.notes}</Text>
          </>
        )}
      </View>

      {/* 🔹 Nút hành động giống style của Sổ địa chỉ */}
      <View style={{ marginTop: 30 }}>
        {order.orderStatus === 'PENDING' && (
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: '#e63946' }]}
            onPress={handleCancel}
          >
            <Text style={styles.primaryButtonText}>Hủy đơn hàng</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() =>
            router.push(`/(role)/(customer)/(profile)/order-detail/write-review/${id}`)
          }
        >
          <Text style={styles.primaryButtonText}>Viết đánh giá</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.back()}
        >
          <Text style={styles.secondaryButtonText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// 🎨 Style — đồng bộ với AddressBookScreen
const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 40,
    backgroundColor: '#fff',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111',
  },
  titleLine: {
    width: 40,
    height: 3,
    backgroundColor: '#000',
    borderRadius: 2,
    marginTop: 5,
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#f8f9fa',
    borderRadius: 14,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 25,
  },
  label: {
    fontSize: 15,
    color: '#555',
    marginTop: 8,
  },
  value: {
    fontSize: 16,
    color: '#000',
    marginBottom: 5,
  },
  primaryButton: {
    backgroundColor: '#000',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  secondaryButton: {
    backgroundColor: '#fff',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  secondaryButtonText: {
    color: '#000',
    fontWeight: '600',
    fontSize: 16,
  },
});
