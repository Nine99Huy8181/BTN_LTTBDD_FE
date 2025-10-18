// app/(admin)/(orders)/detail/[id].tsx
import { View, Text, Button } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 20 }}>Màn hình Chi tiết Đơn hàng {id}</Text>
      <Button title="Back" onPress={() => router.back()} />
    </View>
  );
}