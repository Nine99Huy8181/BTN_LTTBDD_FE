// app/(admin)/(products)/_layout.tsx
import { Stack } from 'expo-router';

export default function ProductsLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Staffs' }} />
      <Stack.Screen name="add-staff" options={{ title: 'Add Staff' }} />
      <Stack.Screen name="edit-staff/[id]" options={{ title: 'Edit Staff' }} />
    </Stack>
  );
}