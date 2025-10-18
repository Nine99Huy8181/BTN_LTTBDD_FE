// app/(auth)/forgot-password.tsx
import { View, Text, Button } from 'react-native';
import { useRouter } from 'expo-router';

export default function ForgotPasswordScreen() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 20 }}>Màn hình Quên mật khẩu</Text>
      <Button title="Quay lại" onPress={() => router.back()} />
    </View>
  );
}