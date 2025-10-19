// app/(customer)/(cart)/checkout.tsx
import { View, Text, Button } from 'react-native';
import { useRouter } from 'expo-router';
import { Routes } from '@/constants';

export default function CheckoutScreen() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 20 }}>Màn hình Checkout</Text>
      <Button title="Select Address" onPress={() => router.push(Routes.CustomerSelectAddress)} />
      <Button title="Apply Coupon" onPress={() => router.push(Routes.CustomerApplyCoupon)} />
      <Button title="Payment" onPress={() => router.push(Routes.CustomerPaymentMethod)} />
    </View>
  );
}