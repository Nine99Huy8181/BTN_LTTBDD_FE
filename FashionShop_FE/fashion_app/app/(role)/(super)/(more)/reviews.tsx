// app/(admin)/(more)/reviews.tsx
import { View, Text, Button } from 'react-native';
import { useRouter } from 'expo-router';
import { Routes } from '@/constants';

export default function ReviewsScreen() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 20 }}>Màn hình Đánh giá</Text>
      <Button title="Respond Review 1" onPress={() => router.push(`${Routes.SuperRespondReview}1`)} />
    </View>
  );
}