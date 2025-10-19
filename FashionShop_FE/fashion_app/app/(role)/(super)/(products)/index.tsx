import { View, Text, Button } from 'react-native';
import { useRouter } from 'expo-router';
import { Routes } from '@/constants';

export default function ProductManagementScreen() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 20 }}>Màn hình Quản lý Sản phẩm</Text>
        <Button title="Add Product" onPress={() => router.push(Routes.SuperAddCoupon)} />
        <Button title="Edit Product" onPress={() => router.push(Routes.SuperEditProduct)} />
        <Button title="Variant Product" onPress={() => router.push(Routes.SuperProductVariants)} /> 
    </View>
  );
}