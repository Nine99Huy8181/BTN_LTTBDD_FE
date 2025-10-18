// app/(customer)/(profile)/change-password.tsx
import { View, Text, Button } from 'react-native';
import { useRouter } from 'expo-router';

export default function ChangePasswordScreen() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 20 }}>Màn hình Đổi mật khẩu</Text>
      <Button title="Back" onPress={() => router.back()} />
    </View>
  );
}