// app/(customer)/(profile)/_layout.tsx
import { Stack } from 'expo-router';

export default function ProfileLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Profile', headerShown: false }} />
      <Stack.Screen name="edit-profile" options={{ headerShown: false }} />
      <Stack.Screen name="address-book" options={{ title: 'Address Book', headerShown: false }} />
      <Stack.Screen name="add-address" options={{ title: 'Add Address', headerShown: false }} />
      <Stack.Screen name="edit-address/[id]" options={{ title: 'Edit Address', headerShown: false }} />
      <Stack.Screen name="orders" options={{ title: 'Orders', headerShown: false }} />
      <Stack.Screen name="order-detail/[id]" options={{ title: 'Order Detail', headerShown: false }} />
      <Stack.Screen name="tracking/[id]" options={{ title: 'Tracking' }} />
      <Stack.Screen name="loyalty-points" options={{ title: 'Loyalty Points' }} />
      <Stack.Screen name="coupon" options={{ title: 'Coupon' , headerShown: false }} />
      <Stack.Screen name="change-password" options={{ title: 'Change Password' }} />
      <Stack.Screen name="settings" options={{ title: 'Settings' }} />
      <Stack.Screen name="order-detail/write-review/[id]" options={{ title: 'Write Review' }} />
    </Stack>
  );
}