// app/(customer)/(cart)/payment-method.tsx
import { View, Text, Button } from 'react-native';
import { useRouter } from 'expo-router';

export default function PaymentMethodScreen() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 20 }}>Màn hình Phương thức Thanh toán</Text>
      <Button title="Back" onPress={() => router.back()} />
      <Button title="Confirm" onPress={() => router.push('/(customer)/(cart)/order-success')} />
    </View>
  );
}