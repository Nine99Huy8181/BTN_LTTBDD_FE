// app/(customer)/(profile)/index.tsx
import { Routes } from '@/constants';
import { useAuth } from '@/hooks/AuthContext';
import { useRouter } from 'expo-router';
import { Button, Text, View } from 'react-native';

export default function ProfileScreen() {
  const router = useRouter();
  const { logout } = useAuth();

    const handleLogout = async () => {
    // Clear token và user state
    await logout();
    
    // Navigate về login
    router.replace('/(auth)/login');
  };
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 20 }}>Màn hình Hồ sơ</Text>
      <Button title="Chỉnh sửa thông tin cá nhân" onPress={() => router.push(Routes.CustomerEditProfile)} />
      <Button title="Thông tin địa chỉ" onPress={() => router.push(Routes.CustomerAddressBook)} />
      <Button title="Đơn hàng" onPress={() => router.push(Routes.CustomerOrders)} />
      <Button title="Mã giảm giá của tôi" onPress={() => router.push(Routes.CustomerCoupon)} />
      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
}