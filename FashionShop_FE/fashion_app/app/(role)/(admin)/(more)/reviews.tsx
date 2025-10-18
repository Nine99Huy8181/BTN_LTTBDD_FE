// app/(admin)/(more)/reviews.tsx
import { View, Text, Button } from 'react-native';
import { useRouter } from 'expo-router';

export default function ReviewsScreen() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 20 }}>Màn hình Đánh giá</Text>
      <Button title="Respond Review 1" onPress={() => router.push('/(admin)/(more)/respond-review/1')} />
    </View>
  );
}