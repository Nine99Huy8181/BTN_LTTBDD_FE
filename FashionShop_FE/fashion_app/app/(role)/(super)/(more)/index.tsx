// app/(admin)/(more)/index.tsx
import { View, Text, Button } from 'react-native';
import { useRouter } from 'expo-router';
import { Routes } from '@/constants';

export default function MenuScreen() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 20 }}>Màn hình Thêm</Text>
      <Button title="Customers" onPress={() => router.push(Routes.SuperCustomers)} />
      <Button title="Reviews" onPress={() => router.push(Routes.SuperReviews)} />
      <Button title="Profile" onPress={() => router.push(Routes.SuperProfile)} />
    </View>
  );
}