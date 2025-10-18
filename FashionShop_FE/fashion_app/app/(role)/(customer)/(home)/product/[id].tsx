// app/(shared)/product/[id].tsx
import { View, Text, Button } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 20 }}>Màn hình Chi tiết Sản phẩm {id}</Text>
      <Button title="Reviews" onPress={() => router.push('/(home)/product/reviews/1')} />
    </View>
  );
}