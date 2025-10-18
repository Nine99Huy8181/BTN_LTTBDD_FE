// app/(customer)/(profile)/edit-profile.tsx
import { View, Text, Button } from 'react-native';
import { useRouter } from 'expo-router';

export default function EditProfileScreen() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 20 }}>Màn hình Chỉnh sửa Hồ sơ</Text>
      <Button title="Back" onPress={() => router.back()} />
    </View>
  );
}