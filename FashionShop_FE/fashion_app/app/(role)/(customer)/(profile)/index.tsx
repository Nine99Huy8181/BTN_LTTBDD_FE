import { Routes } from '@/constants';
import { useAuth } from '@/hooks/AuthContext';
import { accountService } from '@/services/account.service';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [account, setAccount] = useState<any>(null);
  const [avatarError, setAvatarError] = useState(false);

  useEffect(() => {
    if (user?.userName) {
      accountService
        .getAccountByEmail(user.userName) // 🧩 userName chứa email
        .then((res) => setAccount(res))
        .catch((err) => console.error('Lỗi khi lấy account:', err));
    }
  }, [user]);

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  const avatarUri =
    avatarError || !account?.avatar
      ? 'https://cdn-icons-png.flaticon.com/512/847/847969.png'
      : account.avatar;

  return (
    <View style={styles.container}>
      {/* Thông tin người dùng */}
      <View style={styles.profileHeader}>
        <Image
          source={{ uri: avatarUri }}
          style={styles.avatar}
          onError={() => setAvatarError(true)}
        />
        <Text style={styles.name}>
          {account?.customer?.fullName ||
            account?.fullName ||
            account?.email ||
            user?.userName ||
            'Đang tải...'}
        </Text>

      </View>

      {/* Các mục chức năng */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.item} onPress={() => router.push(Routes.CustomerEditProfile)}>
          <Ionicons name="person-circle-outline" size={22} color="#333" />
          <Text style={styles.itemText}>Chỉnh sửa hồ sơ</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.item} onPress={() => router.push(Routes.CustomerAddressBook)}>
          <Ionicons name="location-outline" size={22} color="#333" />
          <Text style={styles.itemText}>Sổ địa chỉ</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.item} onPress={() => router.push(Routes.CustomerOrders)}>
          <Ionicons name="receipt-outline" size={22} color="#333" />
          <Text style={styles.itemText}>Đơn hàng của tôi</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.item} onPress={() => router.push(Routes.CustomerCoupon)}>
          <Ionicons name="pricetag-outline" size={22} color="#333" />
          <Text style={styles.itemText}>Mã giảm giá</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#fff" />
        <Text style={styles.logoutText}>Đăng xuất</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
    paddingHorizontal: 24,
    paddingTop: 70,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 40,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
    marginBottom: 30,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  itemText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    backgroundColor: '#ff4444',
    borderRadius: 10,
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
