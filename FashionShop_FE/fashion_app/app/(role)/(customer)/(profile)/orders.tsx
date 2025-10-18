// app/(customer)/(profile)/orders.tsx
import { View, Text, Button } from 'react-native';
import { useRouter } from 'expo-router';

export default function OrdersScreen() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 20 }}>Màn hình Đơn hàng</Text>
      <Button title="Order Detail 1" onPress={() => router.push('/(customer)/(profile)/order-detail/1')} />
      <Button title="Back" onPress={() => router.back()} />
    </View>
  );
}