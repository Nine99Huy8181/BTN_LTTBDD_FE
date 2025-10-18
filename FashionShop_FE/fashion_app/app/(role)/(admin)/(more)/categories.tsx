// app/(admin)/(more)/categories.tsx
import { View, Text, Button } from 'react-native';
import { useRouter } from 'expo-router';

export default function CategoriesScreen() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 20 }}>Màn hình Danh mục</Text>
      <Button title="Back" onPress={() => router.back()} />
    </View>
  );
}