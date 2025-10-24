// app/(customer)/(profile)/referral.tsx
import { couponService } from '@/services/coupon.service';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Button, FlatList, Text, View } from 'react-native';

export default function CouponScreen() {
  const router = useRouter();
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 📦 Lấy danh sách coupon khả dụng
  const fetchCoupons = async () => {
    try {
      const data = await couponService.getAvailableCoupons();
      setCoupons(data);
    } catch (error) {
      console.error('❌ Lỗi khi tải coupon:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách mã giảm giá');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={{ marginTop: 10 }}>Đang tải mã giảm giá...</Text>
      </View>
    );
  }

  if (coupons.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Hiện không có mã giảm giá khả dụng.</Text>
        <Button title="Quay lại" onPress={() => router.back()} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 15 }}>🎟️ Mã giảm giá của tôi</Text>

      <FlatList
        data={coupons}
        keyExtractor={(item) => item.couponID.toString()}
        renderItem={({ item }) => (
          <View
            style={{
              borderWidth: 1,
              borderColor: '#ccc',
              borderRadius: 10,
              padding: 15,
              marginBottom: 12,
              backgroundColor: '#f9f9f9',
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#007bff' }}>{item.code}</Text>
            <Text>{item.description}</Text>
            <Text>
              Giảm: {item.discountValue}
              {item.discountType === 'PERCENT' ? '%' : '₫'}
            </Text>
            <Text>
              Hiệu lực: {item.startDate} ➜ {item.endDate}
            </Text>
            <Text>
              Sử dụng: {item.usedCount ?? 0}/{item.maxUses ?? '∞'}
            </Text>
            <Text style={{ color: 'green', marginTop: 5 }}>Trạng thái: {item.status}</Text>
          </View>
        )}
      />

      <Button title="Quay lại" onPress={() => router.back()} />
    </View>
  );
}
