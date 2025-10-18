// app/(admin)/(more)/reports.tsx
import { View, Text, Button } from 'react-native';
import { useRouter } from 'expo-router';

export default function ReportsScreen() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 20 }}>Màn hình Báo cáo</Text>
      <Button title="Back" onPress={() => router.back()} />
    </View>
  );
}