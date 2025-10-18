// app/(customer)/(home)/notifications.tsx
import { View, Text, Button } from 'react-native';
import { useRouter } from 'expo-router';

export default function NotificationsScreen() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 20 }}>Màn hình Thông báo</Text>
      <Button title="Back to Home" onPress={() => router.back()} />
    </View>
  );
}