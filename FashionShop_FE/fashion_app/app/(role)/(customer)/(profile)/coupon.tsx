// app/(customer)/(profile)/coupon.tsx
import { couponService } from '@/services/coupon.service';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { showToast } from '@/utils/toast';

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
      console.log('❌ Lỗi khi tải coupon:', error);
      showToast.error('Lỗi', 'Không thể tải danh sách mã giảm giá');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#000" />
        <Text style={{ marginTop: 10 }}>Đang tải mã giảm giá...</Text>
      </View>
    );
  }

  if (coupons.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Hiện không có mã giảm giá khả dụng.</Text>
        <TouchableOpacity style={styles.secondaryButton} onPress={() => router.back()}>
          <Text style={styles.secondaryButtonText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 🔹 Tiêu đề */}
      <View style={styles.header}>
        <Text style={styles.title}>Mã giảm giá của tôi</Text>
        <View style={styles.titleLine} />
      </View>

      {/* 🔹 Danh sách mã giảm giá */}
      <FlatList
        data={coupons}
        keyExtractor={(item) => item.couponID.toString()}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.couponCode}>{item.code}</Text>
              <Text
                style={[
                  styles.discountTag,
                  {
                    backgroundColor:
                      item.discountType === 'PERCENT' ? '#007AFF' : '#FF8C00',
                  },
                ]}
              >
                {item.discountType === 'PERCENT'
                  ? `${item.discountValue}%`
                  : `${item.discountValue.toLocaleString()}₫`}
              </Text>
            </View>

            <Text style={styles.description}>{item.description}</Text>
            <Text style={styles.info}>
              Hiệu lực: {item.startDate} ➜ {item.endDate}
            </Text>
            <Text style={styles.info}>
              Sử dụng: {item.usedCount ?? 0}/{item.maxUses ?? '∞'}
            </Text>
            <Text
              style={[
                styles.status,
                { color: item.status === 'ACTIVE' ? 'green' : '#999' },
              ]}
            >
              Trạng thái: {item.status}
            </Text>
          </View>
        )}
      />

      {/* 🔹 Nút quay lại */}
      <TouchableOpacity style={styles.secondaryButton} onPress={() => router.back()}>
        <Text style={styles.secondaryButtonText}>Quay lại</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 40,
    backgroundColor: '#fff',
    flex: 1,
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
    padding: 16,
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
    marginBottom: 8,
  },
  couponCode: {
    fontSize: 18,
    fontWeight: '700',
    color: '#007AFF',
  },
  discountTag: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  description: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  info: {
    fontSize: 13,
    color: '#555',
    marginBottom: 2,
  },
  status: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 6,
  },
  secondaryButton: {
    marginTop: 20,
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
