import { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { accountService } from '@/services/account.service';
import { Account } from '@/types';
import { Routes } from '@/constants';

export default function ProductManagementScreen() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Lấy danh sách tài khoản khi component mount
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const data = await accountService.getAllAccounts();
        if (Array.isArray(data)) {
          setAccounts(data);
        } else {
          throw new Error('Dữ liệu tài khoản không phải là mảng');
        }
        setLoading(false);
      } catch (err: any) {
        setError(
          err.response?.status === 403
            ? 'Bạn không có quyền truy cập danh sách tài khoản'
            : err.response?.status === 401
            ? 'Vui lòng đăng nhập với tài khoản SUPERADMIN'
            : 'Không thể tải danh sách tài khoản'
        );
        setLoading(false);
        console.error('Error fetching accounts:', err);
      }
    };

    fetchAccounts();
  }, []);

  // Render mỗi item tài khoản trong FlatList
  const renderAccountItem = ({ item }: { item: Account }) => (
    <View style={styles.item}>
      <Text style={styles.itemName}>{item.email}</Text>
      <Text style={styles.itemDetail}>Vai trò: {item.role}</Text>
      <Text style={styles.itemDetail}>
        {item.registrationDate ? `Tạo ngày: ${item.registrationDate}` : 'Không có ngày tạo'}
      </Text>
      <Button
        title="Chỉnh sửa"
        onPress={() => router.push(`${Routes.SuperEditStaff}${item.accountID}`)}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Màn hình Quản lý Sản phẩm</Text>
      <Button title="Add Staff" onPress={() => router.push(Routes.SuperAddStaff)} />

      <Text style={styles.title}>Danh sách Tài khoản (SUPERADMIN)</Text>
      {loading ? (
        <Text>Đang tải...</Text>
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : accounts.length === 0 ? (
        <Text>Không có tài khoản nào</Text>
      ) : (
        <FlatList
          data={accounts}
          renderItem={renderAccountItem}
          keyExtractor={(item) => item.accountID.toLocaleString()}
          style={styles.flatList}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 10,
    textAlign: 'center',
  },
  item: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 10,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemDetail: {
    fontSize: 14,
    color: '#555',
  },
  flatList: {
    width: '100%',
  },
  error: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
  },
});