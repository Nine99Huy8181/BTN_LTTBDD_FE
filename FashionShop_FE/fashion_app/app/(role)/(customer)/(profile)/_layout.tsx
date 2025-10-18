// app/(customer)/(profile)/_layout.tsx
import { Stack } from 'expo-router';

export default function ProfileLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Profile' }} />
      <Stack.Screen name="edit-profile" options={{ title: 'Edit Profile' }} />
      <Stack.Screen name="address-book" options={{ title: 'Address Book' }} />
      <Stack.Screen name="add-address" options={{ title: 'Add Address' }} />
      <Stack.Screen name="edit-address/[id]" options={{ title: 'Edit Address' }} />
      <Stack.Screen name="orders" options={{ title: 'Orders' }} />
      <Stack.Screen name="order-detail/[id]" options={{ title: 'Order Detail' }} />
      <Stack.Screen name="tracking/[id]" options={{ title: 'Tracking' }} />
      <Stack.Screen name="loyalty-points" options={{ title: 'Loyalty Points' }} />
      <Stack.Screen name="referral" options={{ title: 'Referral' }} />
      <Stack.Screen name="change-password" options={{ title: 'Change Password' }} />
      <Stack.Screen name="settings" options={{ title: 'Settings' }} />
      <Stack.Screen name="order-detail/write-review/[id]" options={{ title: 'Write Review' }} />
    </Stack>
  );
}