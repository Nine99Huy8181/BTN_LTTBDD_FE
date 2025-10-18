// app/(customer)/(home)/search.tsx
import { View, Text, Button } from 'react-native';
import { useRouter } from 'expo-router';

export default function SearchScreen() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 20 }}>Màn hình Tìm kiếm</Text>
      <Button title="Back to Home" onPress={() => router.back()} />
    </View>
  );
}