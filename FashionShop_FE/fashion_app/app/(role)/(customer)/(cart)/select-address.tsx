// app/(customer)/(cart)/select-address.tsx
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Routes } from '@/constants';
import { useAuth } from '@/hooks/AuthContext';
import { addressService } from '@/services/address.service';
import { useState, useEffect } from 'react';

export default function SelectAddressScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<any[]>([]);

  useEffect(() => {
    loadAddresses();
  }, [user]);

  const loadAddresses = async () => {
    if (!user?.customerId) return;
    try {
      const addrs = await addressService.getAddressesByCustomerId(user.customerId);
      setAddresses(addrs || []);
    } catch (err) {
      console.log('Load addresses error:', err);
    }
  };

  const selectAddress = async (address: any) => {
    // Gọi API để cập nhật địa chỉ được chọn cho đơn hàng
    try {
      await addressService.setDefaultAddress(address.addressID);
      router.back(); // Quay lại màn hình checkout
    } catch (err) {
      console.log('Set default address error:', err);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.heading}>Chọn địa chỉ giao hàng</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push(Routes.CustomerAddAddress as any)}
          >
            <Text style={styles.addButtonText}>+ Thêm địa chỉ mới</Text>
          </TouchableOpacity>
        </View>

        {addresses.map((addr) => (
          <TouchableOpacity
            key={addr.addressID}
            style={[styles.addressCard, addr.isDefault && styles.defaultCard]}
            onPress={() => selectAddress(addr)}
          >
            <View style={styles.addressHeader}>
              <Text style={styles.recipientName}>{addr.recipientName}</Text>
              {addr.isDefault && <Text style={styles.defaultTag}>Mặc định</Text>}
            </View>
            <Text style={styles.phoneNumber}>{addr.recipientPhone}</Text>
            <Text style={styles.addressText}>
              {addr.streetAddress}, {addr.district}, {addr.city}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  addButtonText: {
    color: '#007AFF',
    fontSize: 14,
  },
  addressCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  defaultCard: {
    borderColor: '#007AFF',
    borderWidth: 2,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  recipientName: {
    fontSize: 16,
    fontWeight: '600',
  },
  defaultTag: {
    fontSize: 12,
    color: '#007AFF',
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  phoneNumber: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
});