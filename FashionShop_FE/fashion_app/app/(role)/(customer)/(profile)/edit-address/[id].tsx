// app/(customer)/(profile)/edit-address/[id].tsx
import { useAuth } from '@/hooks/AuthContext';
import { addressService } from '@/services/address.service';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function EditAddressScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
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

  // 🧭 Lấy thông tin địa chỉ
  const fetchAddress = async () => {
    try {
      const data = await addressService.getAddressById(Number(id));
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

  // 💾 Cập nhật
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

    setSaving(true);
    try {
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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
        <Text style={{ marginTop: 10 }}>Đang tải thông tin địa chỉ...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* 🏷️ Tiêu đề */}
      <View style={styles.header}>
        <Text style={styles.title}>Chỉnh sửa địa chỉ</Text>
        <View style={styles.underline} />
      </View>

      {/* 🧾 Form nhập liệu */}
      <View style={styles.formSection}>
        <Text style={styles.label}>Tên người nhận *</Text>
        <TextInput
          style={styles.input}
          value={form.recipientName}
          onChangeText={(text) => handleChange('recipientName', text)}
          placeholder="Nhập tên người nhận"
        />

        <Text style={styles.label}>Số điện thoại *</Text>
        <TextInput
          style={styles.input}
          value={form.recipientPhone}
          keyboardType="phone-pad"
          onChangeText={(text) => handleChange('recipientPhone', text)}
          placeholder="Nhập số điện thoại"
        />

        <Text style={styles.label}>Địa chỉ *</Text>
        <TextInput
          style={styles.input}
          value={form.streetAddress}
          onChangeText={(text) => handleChange('streetAddress', text)}
          placeholder="Số nhà, đường..."
        />

        <Text style={styles.label}>Quận / Huyện</Text>
        <TextInput
          style={styles.input}
          value={form.district}
          onChangeText={(text) => handleChange('district', text)}
          placeholder="Nhập quận/huyện"
        />

        <Text style={styles.label}>Thành phố *</Text>
        <TextInput
          style={styles.input}
          value={form.city}
          onChangeText={(text) => handleChange('city', text)}
          placeholder="Nhập thành phố"
        />

        <Text style={styles.label}>Quốc gia</Text>
        <TextInput
          style={styles.input}
          value={form.country}
          onChangeText={(text) => handleChange('country', text)}
        />

        {/* 🔘 Đặt mặc định */}
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Đặt làm địa chỉ mặc định</Text>
          <Switch
            value={form.isDefault}
            onValueChange={(value) => handleChange('isDefault', value)}
            thumbColor={form.isDefault ? '#000' : '#ccc'}
            trackColor={{ true: '#b3b3b3', false: '#e0e0e0' }}
          />
        </View>

        {/* 🎯 Nút hành động */}
        <View style={{ marginTop: 30 }}>
          <TouchableOpacity
            style={[styles.primaryButton, saving && { opacity: 0.7 }]}
            onPress={handleUpdate}
            disabled={saving}
          >
            <Text style={styles.primaryButtonText}>
              {saving ? 'Đang lưu...' : 'Cập nhật địa chỉ'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={() => router.back()}>
            <Text style={styles.secondaryButtonText}>Quay lại</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 60,
    backgroundColor: '#fff',
  },
  header: {
    marginBottom: 25,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111',
  },
  underline: {
    width: 40,
    height: 3,
    backgroundColor: '#000',
    borderRadius: 2,
    marginTop: 5,
  },
  formSection: {
    marginTop: 10,
  },
  label: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 10,
    marginBottom: 16,
    fontSize: 15,
    backgroundColor: '#fafafa',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 18,
  },
  switchLabel: {
    fontSize: 16,
    color: '#333',
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
});