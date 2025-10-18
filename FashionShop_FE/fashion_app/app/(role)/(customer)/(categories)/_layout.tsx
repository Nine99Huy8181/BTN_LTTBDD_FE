// app/(customer)/(categories)/_layout.tsx
import { Stack } from 'expo-router';

export default function CategoriesLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Categories' }} />
      <Stack.Screen name="[categoryId]" options={{ title: 'Category Detail' }} />
      <Stack.Screen name="subcategory/[id]" options={{ title: 'Subcategory' }} />
    </Stack>
  );
}