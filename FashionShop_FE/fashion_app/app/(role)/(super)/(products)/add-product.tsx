// app/(admin)/(products)/add-product.tsx
import { View, Text, Button } from 'react-native';
import { useRouter } from 'expo-router';

export default function AddProductScreen() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 20 }}>Màn hình Thêm Sản phẩm</Text>
      <Button title="Back" onPress={() => router.back()} />
    </View>
  );
}