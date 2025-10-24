import { cancelOrder, getOrderDetail } from '@/services/order.service';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Button, Text, View } from 'react-native';

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const data = await getOrderDetail(Number(id));
        setOrder(data);
      } catch (error) {
        console.error('Error fetching order:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const handleCancel = async () => {
    Alert.alert(
      "Xác nhận",
      "Bạn có chắc chắn muốn hủy đơn hàng này?",
      [
        { text: "Không", style: "cancel" },
        {
          text: "Có",
          onPress: async () => {
            try {
              await cancelOrder(Number(id));
              Alert.alert("Thành công", "Đơn hàng đã được hủy!");
              router.back();
            } catch (error) {
              Alert.alert("Lỗi", "Không thể hủy đơn hàng này!");
            }
          },
        },
      ]
    );
  };

  if (loading) return <Text>Đang tải...</Text>;
  if (!order) return <Text>Không tìm thấy đơn hàng</Text>;

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 20, marginBottom: 10 }}>Chi tiết Đơn hàng #{id}</Text>

      <Text>Khách hàng: {order.customer.fullName}</Text>
      <Text>Trạng thái: {order.orderStatus}</Text>
      <Text>Tổng tiền: {order.totalAmount} đ</Text>
      <Text>Ghi chú: {order.notes}</Text>

      {order.orderStatus === 'PENDING' && (
        <Button title="Hủy đơn hàng" onPress={handleCancel} color="red" />
      )}

      <Button title="Đánh giá" onPress={() => router.push('/(customer)/(profile)/order-detail/write-review/1')} />
      <Button title="Quay lại" onPress={() => router.back()} />
    </View>
  );
}
