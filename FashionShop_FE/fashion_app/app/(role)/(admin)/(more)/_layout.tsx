// app/(admin)/(more)/_layout.tsx
import { Stack } from 'expo-router';

export default function MoreLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'More' }} />
      <Stack.Screen name="customers" options={{ title: 'Customers' }} />
      <Stack.Screen name="reviews" options={{ title: 'Reviews' }} />
      <Stack.Screen name="respond-review/[id]" options={{ title: 'Respond Review' }} />
      <Stack.Screen name="coupons" options={{ title: 'Coupons' }} />
      <Stack.Screen name="add-coupon" options={{ title: 'Add Coupon' }} />
      <Stack.Screen name="edit-coupon/[id]" options={{ title: 'Edit Coupon' }} />
      <Stack.Screen name="categories" options={{ title: 'Categories' }} />
      <Stack.Screen name="reports" options={{ title: 'Reports' }} />
      <Stack.Screen name="profile" options={{ headerShown: false }} />
    </Stack>
  );
}