// app/(admin)/(orders)/index.tsx
import { View, Text, Button } from 'react-native';
import { useRouter } from 'expo-router';
import { Routes } from '@/constants';

export default function OrderManagementScreen() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 20 }}>Màn hình Quản lý Đơn hàng</Text>
      <Button title="Order Detail 1" onPress={() => router.push(Routes.AdminOrderDetail)} />
    </View>
  );
}