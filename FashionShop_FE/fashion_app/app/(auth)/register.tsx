// app/(auth)/register.tsx
import { View, Text, Button } from 'react-native';
import { useRouter } from 'expo-router';

export default function RegisterScreen() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 20 }}>Màn hình Đăng ký</Text>
      <Button title="Quay lại Đăng nhập" onPress={() => router.back()} />
      <Button title="Xác minh Email" onPress={() => router.push('/(auth)/verify-email')} />
    </View>
  );
}