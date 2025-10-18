// app/(admin)/(more)/coupons.tsx
import { View, Text, Button } from 'react-native';
import { useRouter } from 'expo-router';

export default function CouponsScreen() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 20 }}>Màn hình Coupon</Text>
      <Button title="Add Coupon" onPress={() => router.push('/(admin)/(more)/add-coupon')} />
    </View>
  );
}