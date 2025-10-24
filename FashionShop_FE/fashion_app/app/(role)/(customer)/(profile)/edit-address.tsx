import { useAuth } from '@/hooks/AuthContext';
import { addressService } from '@/services/address.service';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Button, ScrollView, Switch, Text, TextInput, View } from 'react-native';

export default function EditAddressScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams(); // 📦 Lấy ID từ route
  const { user } = useAuth();
  const customerId = user?.customerId || 1;

  const [form, setForm] = useState({
    recipientName: '',
    recipientPhone: '',
    streetAddress: '',
    district: '',
    city: '',
    country: 'Việt Nam',
    isDefault: false,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const handleChange = (key: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // 🧭 Lấy thông tin địa chỉ cũ
  const fetchAddress = async () => {
    try {
      const data = await addressService.getAddressById(Number(id)); // ⚠️ cần có trong service
      setForm({
        recipientName: data.recipientName,
        recipientPhone: data.recipientPhone,
        streetAddress: data.streetAddress,
        district: data.district || '',
        city: data.city,
        country: data.country || 'Việt Nam',
        isDefault: data.isDefault || false,
      });
    } catch (error) {
      console.error('❌ Lỗi khi tải địa chỉ:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin địa chỉ.');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddress();
  }, [id]);

  // 💾 Cập nhật địa chỉ
  const handleUpdate = async () => {
    if (!form.recipientName || !form.recipientPhone || !form.streetAddress || !form.city) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin bắt buộc!');
      return;
    }

    const updatedAddress = {
      addressID: Number(id),
      customerId,
      recipientName: form.recipientName.trim(),
      recipientPhone: form.recipientPhone.trim(),
      streetAddress: form.streetAddress.trim(),
      district: form.district?.trim() || '',
      city: form.city.trim(),
      country: form.country.trim() || 'Việt Nam',
      isDefault: form.isDefault,
    };

    console.log('📤 Dữ liệu cập nhật:', updatedAddress);

    setSaving(true);
    try {
      // ⚠️ TODO: cần bổ sung trong service
      await addressService.updateAddress(Number(id), updatedAddress);
      Alert.alert('Thành công', 'Địa chỉ đã được cập nhật!', [
        { text: 'OK', onPress: () => router.replace('/(customer)/(profile)/address-book') },
      ]);
    } catch (error: any) {
      console.error('❌ Error updating address:', error.response?.data || error.message);
      if (error.response?.status === 409) {
        Alert.alert(
          'Xung đột dữ liệu',
          'Địa chỉ mặc định khác đã tồn tại. Vui lòng bỏ chọn "Đặt làm mặc định" hoặc chỉnh địa chỉ cũ.'
        );
      } else {
        Alert.alert('Lỗi', 'Không thể cập nhật địa chỉ. Vui lòng thử lại.');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Đang tải thông tin địa chỉ...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 15 }}>Chỉnh sửa địa chỉ</Text>

      <Text>Tên người nhận *</Text>
      <TextInput
        style={styles.input}
        value={form.recipientName}
        onChangeText={(text) => handleChange('recipientName', text)}
      />

      <Text>Số điện thoại *</Text>
      <TextInput
        style={styles.input}
        value={form.recipientPhone}
        keyboardType="phone-pad"
        onChangeText={(text) => handleChange('recipientPhone', text)}
      />

      <Text>Địa chỉ *</Text>
      <TextInput
        style={styles.input}
        value={form.streetAddress}
        onChangeText={(text) => handleChange('streetAddress', text)}
      />

      <Text>Quận / Huyện</Text>
      <TextInput
        style={styles.input}
        value={form.district}
        onChangeText={(text) => handleChange('district', text)}
      />

      <Text>Thành phố *</Text>
      <TextInput
        style={styles.input}
        value={form.city}
        onChangeText={(text) => handleChange('city', text)}
      />

      <Text>Quốc gia</Text>
      <TextInput
        style={styles.input}
        value={form.country}
        onChangeText={(text) => handleChange('country', text)}
      />

      {/* 🔘 Chọn làm địa chỉ mặc định */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: 10,
          marginBottom: 20,
        }}
      >
        <Text style={{ fontSize: 16 }}>Đặt làm địa chỉ mặc định</Text>
        <Switch
          value={form.isDefault}
          onValueChange={(value) => handleChange('isDefault', value)}
          thumbColor={form.isDefault ? '#007bff' : '#ccc'}
        />
      </View>

      <Button
        title={saving ? 'Đang lưu...' : 'Cập nhật địa chỉ'}
        onPress={handleUpdate}
        disabled={saving}
      />

      <View style={{ marginTop: 10 }}>
        <Button title="Quay lại" color="gray" onPress={() => router.back()} />
      </View>
    </ScrollView>
  );
}

const styles = {
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
};
