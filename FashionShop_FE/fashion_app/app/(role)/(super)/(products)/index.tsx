// app/(admin)/(products)/index.tsx
import { View, Text, Button } from 'react-native';
import { useRouter } from 'expo-router';

export default function ProductManagementScreen() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 20 }}>Màn hình Quản lý Sản phẩm</Text>
        <Button title="Add Product" onPress={() => router.push('/(admin)/(products)/add-product')} />
        <Button title="Edit Product" onPress={() => router.push('/(admin)/(products)/edit-product/1')} />
        <Button title="Variant Product" onPress={() => router.push('/(admin)/(products)/variants/1')} /> 
    </View>
  );
}