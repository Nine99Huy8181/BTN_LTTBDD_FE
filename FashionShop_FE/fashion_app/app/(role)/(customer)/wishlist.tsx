// app/(customer)/wishlist.tsx
import { View, Text, Button } from 'react-native';
import { useRouter } from 'expo-router';

export default function WishlistScreen() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 20 }}>Màn hình Yêu thích</Text>
      <Button title="Back to Home" onPress={() => router.replace('/(customer)/(home)')} />
    </View>
  );
}