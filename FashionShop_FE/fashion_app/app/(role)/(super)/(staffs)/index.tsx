// app/(admin)/(products)/index.tsx
import { View, Text, Button } from 'react-native';
import { useRouter } from 'expo-router';

export default function ProductManagementScreen() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 20 }}>Màn hình Quản lý Sản phẩm</Text>
        <Button title="Add Staff" onPress={() => router.push('/(super)/(staffs)/add-staff')} />
        <Button title="Edit staff" onPress={() => router.push('/(super)/(staffs)/edit-product/1')} />
    </View>
  );
}