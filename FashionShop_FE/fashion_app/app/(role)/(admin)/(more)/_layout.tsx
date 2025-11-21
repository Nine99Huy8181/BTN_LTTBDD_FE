// app/(admin)/(more)/_layout.tsx
import { Stack } from "expo-router";

export default function MoreLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="customers" options={{ headerShown: false }} />
      <Stack.Screen name="reviews" options={{ headerShown: false }} />
      <Stack.Screen
        name="respond-review/[id]"
        options={{ headerShown: false }}
      />
      <Stack.Screen name="coupons" options={{ headerShown: false }} />
      <Stack.Screen name="add-coupon" options={{ headerShown: false }} />
      <Stack.Screen
        name="edit-coupon/[id]"
        options={{ headerShown: false }}
      />
      <Stack.Screen name="categories" options={{ headerShown: false }} />
      <Stack.Screen name="profile" options={{ headerShown: false }} />
    </Stack>
  );
}
