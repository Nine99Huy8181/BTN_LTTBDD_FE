
import { Routes } from '@/constants';
import { useAuth } from '@/hooks/AuthContext';
import { addressService } from '@/services/address.service';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function AddressBookScreen() {
  const router = useRouter();
  const { fromCheckout } = useLocalSearchParams();
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const customerId = user?.customerId ?? 1;

  const fetchAddresses = async () => {
    try {
      const data = await addressService.getAddressesByCustomerId(Number(customerId));
      const sorted = (data as any[]).sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0));
      setAddresses(sorted);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải danh sách địa chỉ');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (customerId) fetchAddresses();
  }, [customerId]);

  const handleDelete = async (id: number) => {
    Alert.alert('Xác nhận', 'Bạn có chắc muốn xóa địa chỉ này?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          try {
            await addressService.deleteAddress(id);
            Alert.alert('Thành công', 'Địa chỉ đã bị xóa!');
            fetchAddresses();
          } catch {
            Alert.alert('Lỗi', 'Không thể xóa địa chỉ này');
          }
        },
      },
    ]);
  };

  // Xử lý việc chọn địa chỉ cho đơn hàng (từ màn checkout)
  const handleSelectAddress = (address: any) => {
    if (fromCheckout) {
      router.navigate({
        pathname: Routes.CustomerCheckout as any,
        params: { selectedAddressId: address.addressID }
      });
    }
  };

  // Xử lý việc đặt địa chỉ làm mặc định
  const handleSetDefault = async (id: number) => {
    try {
      await addressService.setDefaultAddress(id);
      Alert.alert('Thành công', 'Đã đặt làm địa chỉ mặc định!');
      fetchAddresses();
    } catch {
      Alert.alert('Lỗi', 'Không thể đặt làm mặc định');
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#000" />
        <Text style={{ marginTop: 10 }}>Đang tải danh sách địa chỉ...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* 🔹 Tiêu đề */}
      <View style={styles.header}>
        <Text style={styles.title}>Sổ địa chỉ</Text>
        <View style={styles.titleLine} />
      </View>

      {/* 🔹 Danh sách địa chỉ */}
      {addresses.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Bạn chưa có địa chỉ nào.</Text>
        </View>
      ) : (
        <FlatList
          data={addresses}
          keyExtractor={(item) => item.addressID.toString()}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => fromCheckout && handleSelectAddress(item)}
              style={[
                styles.card,
                item.isDefault && { borderColor: '#000', backgroundColor: '#fafafa' },
              ]}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.name}>{item.recipientName}</Text>
                {item.isDefault && <Text style={styles.defaultTag}>Mặc định</Text>}
              </View>

              <Text style={styles.info}>{item.recipientPhone}</Text>
              <Text style={styles.info}>
                {item.streetAddress}, {item.district}, {item.city}
              </Text>
              <Text style={styles.info}>{item.country}</Text>

              <View style={styles.actionsRow}>
                {!item.isDefault && !fromCheckout && (
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleSetDefault(item.addressID)}
                  >
                    <Text style={styles.actionText}>Đặt mặc định</Text>
                  </TouchableOpacity>
                )}
                {!fromCheckout && (
                  <>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() =>
                        router.push(`${Routes.CustomerEditAddress}/${item.addressID}` as any)
                      }
                    >
                      <Text style={styles.actionText}>Chỉnh sửa</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: '#ff3b30' }]}
                      onPress={() => handleDelete(item.addressID)}
                    >
                      <Text style={[styles.actionText, { color: '#fff' }]}>Xóa</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      {/* 🔹 Nút hành động */}
      <View style={{ marginTop: 30 }}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.push(Routes.CustomerAddAddress as any)}
        >
          <Text style={styles.primaryButtonText}>Thêm địa chỉ mới</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={() => router.back()}>
          <Text style={styles.secondaryButtonText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 40,
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111',
  },
  titleLine: {
    width: 40,
    height: 3,
    backgroundColor: '#000',
    borderRadius: 2,
    marginTop: 5,
  },
  card: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 14,
    padding: 15,
    marginBottom: 15,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  name: {
    fontWeight: '700',
    fontSize: 16,
    color: '#222',
  },
  defaultTag: {
    backgroundColor: '#000',
    color: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    fontSize: 12,
    overflow: 'hidden',
  },
  info: {
    fontSize: 14,
    color: '#444',
    marginBottom: 2,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
    gap: 10,
  },
  actionButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000',
  },
  primaryButton: {
    backgroundColor: '#000',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  secondaryButton: {
    backgroundColor: '#fff',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  secondaryButtonText: {
    color: '#000',
    fontWeight: '600',
    fontSize: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    marginVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
