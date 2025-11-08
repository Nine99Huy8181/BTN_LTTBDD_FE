// app/(customer)/(cart)/_layout.tsx
import { Stack } from 'expo-router';

export default function CartLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="checkout" options={{ title: 'Checkout' }} />
      <Stack.Screen name="select-address" options={{ title: 'Select Address' }} />
      <Stack.Screen name="payment-method" options={{ title: 'Payment Method' }} />
      <Stack.Screen name="apply-coupon" options={{ title: 'Apply Coupon' }} />
      <Stack.Screen name="order-success" options={{ title: 'Order Success' }} />
    </Stack>
  );
}