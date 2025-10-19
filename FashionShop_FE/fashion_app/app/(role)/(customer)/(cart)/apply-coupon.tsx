// app/(customer)/(cart)/apply-coupon.tsx
import { View, Text, Button } from 'react-native';
import { useRouter } from 'expo-router';
import { Routes } from '@/constants';

export default function ApplyCouponScreen() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 20 }}>Màn hình Áp dụng Coupon</Text>
      <Button title="Back" onPress={() => router.back()} />
      <Button title="Next" onPress={() => router.push(Routes.CustomerPaymentMethod)} />
    </View>
  );
}