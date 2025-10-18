// app/(customer)/(categories)/index.tsx
import { View, Text, Button } from 'react-native';
import { useRouter } from 'expo-router';

export default function CategoryListScreen() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 20 }}>Màn hình Danh sách Categories</Text>
      <Button title="Go to Category 1" onPress={() => router.push('/(customer)/(categories)/1')} />
        <Button title="Go to Category 2" onPress={() => router.push('/(customer)/(categories)/2')} />
    </View>
  );
}