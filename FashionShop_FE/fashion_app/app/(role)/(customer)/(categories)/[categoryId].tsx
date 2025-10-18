// app/(customer)/(categories)/[categoryId].tsx
import { View, Text, Button } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function CategoryDetailScreen() {
  const { categoryId } = useLocalSearchParams();
  const router = useRouter();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 20 }}>Màn hình Chi tiết Category {categoryId}</Text>
      <Button title="Go to Subcategory" onPress={() => router.push('/(customer)/(categories)/subcategory/1')} />
      <Button title="Back" onPress={() => router.back()} />
    </View>
  );
}