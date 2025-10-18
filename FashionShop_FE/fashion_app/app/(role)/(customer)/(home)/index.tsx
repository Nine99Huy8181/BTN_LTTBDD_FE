// app/(customer)/(home)/index.tsx
import { View, Text, Button } from 'react-native';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 20 }}>Màn hình Trang chủ</Text>
      <Button title="Search" onPress={() => router.push('/(customer)/(home)/search')} />
      <Button title="Notifications" onPress={() => router.push('/(customer)/(home)/notifications')} />

      <Text style={{ fontSize: 20 }}>Màn hình Danh sách Sản phẩm</Text>
      <Button title="Product 1" onPress={() => router.push('/(customer)/(home)/product/1')} />
    </View>
  );
}