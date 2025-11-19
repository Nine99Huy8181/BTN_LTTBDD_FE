// app/(admin)/(products)/_layout.tsx
import { Stack } from "expo-router";

export default function ProductsLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Products" }} />
      <Stack.Screen name="add-product" options={{ title: "Add Product" }} />
      <Stack.Screen
        name="edit-product/[id]"
        options={{ title: "Edit Product" }}
      />
      <Stack.Screen
        name="detail-product/[id]"
        options={{ title: "Product Detail" }}
      />
      <Stack.Screen
        name="variants/[productId]"
        options={{ title: "Variants" }}
      />
      <Stack.Screen name="inventory" options={{ title: "Inventory" }} />
    </Stack>
  );
}
