// app/(admin)/(more)/add-coupon.tsx
import { View, Text, Button } from 'react-native';
import { useRouter } from 'expo-router';

export default function AddCouponScreen() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 20 }}>Màn hình Thêm Coupon</Text>
      <Button title="Back" onPress={() => router.back()} />
    </View>
  );
}