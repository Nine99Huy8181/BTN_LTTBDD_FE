// app/(customer)/(cart)/_layout.tsx
import { Stack } from 'expo-router';

export default function CartLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="checkout" options={{ headerShown: false }} />
      <Stack.Screen name="select-address" options={{ headerShown: false }} />
      <Stack.Screen name="payment-method" options={{ headerShown: false }} />
      <Stack.Screen name="apply-coupon" options={{ headerShown: false }} />
      <Stack.Screen name="order-success" options={{ headerShown: false }} />
    </Stack>
  );
}