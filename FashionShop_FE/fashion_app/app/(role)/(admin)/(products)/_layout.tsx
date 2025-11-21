// app/(admin)/(products)/_layout.tsx
import { Stack } from "expo-router";

export default function ProductsLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="add-product" options={{  headerShown: false }} />
      <Stack.Screen
        name="edit-product/[id]"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="detail-product/[id]"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="variants/[productId]"
        options={{ headerShown: false }}
      />
      <Stack.Screen name="inventory" options={{ headerShown: false }} />
    </Stack>
  );
}
