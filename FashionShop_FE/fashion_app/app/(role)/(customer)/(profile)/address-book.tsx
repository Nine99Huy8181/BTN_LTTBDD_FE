import { Routes } from '@/constants';
import { useAuth } from '@/hooks/AuthContext';
import { addressService } from '@/services/address.service';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Button, FlatList, Text, TouchableOpacity, View } from 'react-native';

export default function AddressBookScreen() {
  const router = useRouter();
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // ⚙️ Nếu user chưa có, fallback tạm customerId = 1 (chỉ để test)
  const customerId = user?.customerId ?? 1;

  // 📦 Lấy danh sách địa chỉ
  const fetchAddresses = async () => {
    try {
      // ⚠️ Kiểm tra ID trước khi gọi API
      if (!customerId || isNaN(Number(customerId))) {
        console.warn('⚠️ customerId không hợp lệ:', customerId);
        Alert.alert('Không thể tải địa chỉ', 'Không xác định được người dùng hiện tại.');
        setLoading(false);
        return;
      }

      console.log('📡 Gọi API getAddressesByCustomerId với id =', customerId);
      const data = await addressService.getAddressesByCustomerId(Number(customerId));

      // ✅ Sắp xếp: địa chỉ mặc định lên đầu
      const sorted = (data as any[]).sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0));

      setAddresses(sorted);
    } catch (error) {
      console.error('❌ Error fetching addresses:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách địa chỉ');
    } finally {
      setLoading(false);
    }
  };

  // 🚀 Gọi API khi màn hình mount
  useEffect(() => {
    if (customerId && !isNaN(Number(customerId))) {
      fetchAddresses();
    } else {
      console.warn('⚠️ Không thể gọi fetchAddresses vì customerId không hợp lệ:', customerId);
      setLoading(false);
    }
  }, [customerId]);

  // 🗑️ Xóa địa chỉ
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
          } catch (error) {
            console.error('❌ Lỗi khi xóa địa chỉ:', error);
            Alert.alert('Lỗi', 'Không thể xóa địa chỉ này');
          }
        },
      },
    ]);
  };

  // ⭐ Đặt địa chỉ mặc định
  const handleSetDefault = async (id: number) => {
    try {
      await addressService.setDefaultAddress(id);
      Alert.alert('Thành công', 'Đã đặt làm địa chỉ mặc định!');
      fetchAddresses();
    } catch (error) {
      console.error('❌ Lỗi khi đặt mặc định:', error);
      Alert.alert('Lỗi', 'Không thể đặt làm mặc định');
    }
  };

  // ⏳ Loading
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={{ marginTop: 10 }}>Đang tải danh sách địa chỉ...</Text>
      </View>
    );
  }

  // 📭 Nếu không có địa chỉ
  if (addresses.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ fontSize: 16, marginBottom: 10 }}>Chưa có địa chỉ nào.</Text>
        <Button title="➕ Thêm địa chỉ mới" onPress={() => router.push(Routes.CustomerAddAddress)} />
        <View style={{ marginTop: 10 }}>
          <Button title="⬅️ Quay lại" onPress={() => router.back()} />
        </View>
      </View>
    );
  }

  // 🏠 Hiển thị danh sách địa chỉ
  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 22, marginBottom: 10, fontWeight: 'bold' }}>Sổ địa chỉ của bạn</Text>

      <FlatList
        data={addresses}
        keyExtractor={(item) => item.addressID.toString()}
        renderItem={({ item }) => (
          <View
            style={{
              borderWidth: 1,
              borderColor: '#ccc',
              padding: 15,
              borderRadius: 10,
              marginBottom: 10,
              backgroundColor: item.isDefault ? '#e6f7ff' : '#fff',
            }}
          >
            <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{item.recipientName}</Text>
            <Text>{item.recipientPhone}</Text>
            <Text>
              {item.streetAddress}, {item.district}, {item.city}
            </Text>
            <Text>{item.country}</Text>

            {item.isDefault && (
              <Text style={{ color: 'green', marginTop: 5 }}>⭐ Địa chỉ mặc định</Text>
            )}

            <View style={{ flexDirection: 'row', marginTop: 10, gap: 15 }}>
              {!item.isDefault && (
                <TouchableOpacity onPress={() => handleSetDefault(item.addressID)}>
                  <Text style={{ color: '#007bff' }}>Đặt mặc định</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity onPress={() => router.push(`${Routes.CustomerEditAddress}?id=${item.addressID}`)}>
                   <Text style={{ color: 'orange' }}>Chỉnh sửa</Text>
              </TouchableOpacity>


              <TouchableOpacity onPress={() => handleDelete(item.addressID)}>
                <Text style={{ color: 'red' }}>Xóa</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <View style={{ marginTop: 10 }}>
        <Button title="➕ Thêm địa chỉ mới" onPress={() => router.push(Routes.CustomerAddAddress)} />
      </View>

      <View style={{ marginTop: 10 }}>
        <Button title="⬅️ Quay lại" onPress={() => router.back()} />
      </View>
    </View>
  );
}
