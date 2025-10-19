// app/(customer)/wishlist.tsx
import { View, Text, Button } from 'react-native';
import { useRouter } from 'expo-router';
import { Routes } from '@/constants';

export default function WishlistScreen() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 20 }}>Màn hình Yêu thích</Text>
      <Button title="Back to Home" onPress={() => router.replace(Routes.CustomerHome)} />
    </View>
  );
}