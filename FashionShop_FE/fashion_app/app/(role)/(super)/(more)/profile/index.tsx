// app/(customer)/(profile)/index.tsx
import { View, Text, Button } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/AuthContext';
import { Routes } from '@/constants';

export default function ProfileScreen() {
  const router = useRouter();
  const { logout } = useAuth();

    const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 20 }}>Màn hình Hồ sơ</Text>
      <Button title="Edit Profile" onPress={() => router.push(Routes.SuperEditProfile)} />
      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
}