// app/(customer)/(profile)/loyalty-points.tsx
import { View, Text, Button } from 'react-native';
import { useRouter } from 'expo-router';

export default function LoyaltyPointsScreen() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 20 }}>Màn hình Điểm Thưởng</Text>
      <Button title="Back" onPress={() => router.back()} />
    </View>
  );
}