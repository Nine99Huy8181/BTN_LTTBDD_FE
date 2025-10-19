// app/(customer)/(profile)/order-detail/[id].tsx
import { View, Text, Button } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Routes } from '@/constants';

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 20 }}>Màn hình Chi tiết Đơn hàng {id}</Text>
      <Button title="Tracking" onPress={() => router.push(`${Routes.CustomerOrderTracking}1`)} />
        <Button title="Write Review" onPress={() => router.push('/(customer)/(profile)/order-detail/write-review/1')} />
          {/* Truong hop can chu y */}
      <Button title="Back" onPress={() => router.back()} />
    </View>
  );
}