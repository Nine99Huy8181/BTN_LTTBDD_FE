// app/(auth)/verify-email.tsx
import { View, Text, Button } from 'react-native';
import { useRouter } from 'expo-router';

export default function VerifyEmailScreen() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 20 }}>Màn hình Xác minh Email</Text>
      <Button title="Hoàn tất" onPress={() => router.replace('/(customer)')} />
    </View>
  );
}