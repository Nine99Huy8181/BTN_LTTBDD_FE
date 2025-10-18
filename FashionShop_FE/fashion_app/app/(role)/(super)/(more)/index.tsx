// app/(admin)/(more)/index.tsx
import { View, Text, Button } from 'react-native';
import { useRouter } from 'expo-router';

export default function MenuScreen() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 20 }}>Màn hình Thêm</Text>
      <Button title="Customers" onPress={() => router.push('/(super)/(more)/customers')} />
      <Button title="Reviews" onPress={() => router.push('/(super)/(more)/reviews')} />
      <Button title="Profile" onPress={() => router.push('/(super)/(more)/profile')} />
    </View>
  );
}