// app/(customer)/(cart)/checkout.tsx
import { View, Text, Button } from 'react-native';
import { useRouter } from 'expo-router';

export default function CheckoutScreen() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 20 }}>Màn hình Checkout</Text>
      <Button title="Select Address" onPress={() => router.push('/(customer)/(cart)/select-address')} />
      <Button title="Apply Coupon" onPress={() => router.push('/(customer)/(cart)/apply-coupon')} />
      <Button title="Payment" onPress={() => router.push('/(customer)/(cart)/payment-method')} />
    </View>
  );
}