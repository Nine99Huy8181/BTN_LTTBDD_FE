// app/(customer)/(profile)/settings.tsx
import { View, Text, Button } from 'react-native';
import { useRouter } from 'expo-router';

export default function SettingsScreen() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 20 }}>Màn hình Cài đặt</Text>
      <Button title="Back" onPress={() => router.back()} />
    </View>
  );
}