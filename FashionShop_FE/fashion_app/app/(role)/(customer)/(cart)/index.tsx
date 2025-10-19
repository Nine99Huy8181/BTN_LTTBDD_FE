// app/(customer)/(cart)/index.tsx
import { View, Text, Button } from 'react-native';
import { useRouter } from 'expo-router';
import { Routes } from '@/constants';

export default function CartScreen() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 20 }}>Màn hình Giỏ hàng</Text>
      <Button title="Checkout" onPress={() => router.push(Routes.CustomerCheckout)} />
    </View>
  );
}