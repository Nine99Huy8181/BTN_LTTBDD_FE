// screens/HomeScreen.tsx
import { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { productService } from '@/services/product.service';
import { ProductResponse } from '@/types';
import { Routes } from '@/constants';

export default function HomeScreen() {
  const router = useRouter();
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Lấy danh sách sản phẩm khi component mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await productService.getAllProducts();
        setProducts(data);
        setLoading(false);
      } catch (err) {
        setError('Không thể tải danh sách sản phẩm');
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Render mỗi item trong FlatList
  const renderProductItem = ({ item }: { item: ProductResponse }) => (
    <View style={styles.productItem}>
      <Text style={styles.productName}>{item.name}</Text>
      <Text style={styles.productPrice}>{item.discountPrice} VNĐ</Text>
      <Text style={styles.productRating}>Đánh giá: {item.averageRating.toFixed(1)}/5</Text>
      <Text style={styles.productSold}>Đã bán: {item.soldQuantity}</Text>
      <Button
        title="Xem chi tiết"
        onPress={() => router.push(`${Routes.CustomerProductDetail}/${item.productID}`)}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Màn hình Trang chủ</Text>
      <Button title="Search" onPress={() => router.push(Routes.CustomerSearch)} />
      <Button
        title="Notifications"
        onPress={() => router.push(Routes.CustomerNotifications)}
      />

      <Text style={styles.title}>Danh sách Sản phẩm</Text>
      {loading ? (
        <Text>Đang tải...</Text>
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <FlatList
          data={products}
          renderItem={renderProductItem}
          keyExtractor={(item) => item.productID.toString()}
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
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 16,
  },
  productItem: {
    padding: 16,
    marginVertical: 8,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  productPrice: {
    fontSize: 16,
    color: '#e91e63',
    marginVertical: 4,
  },
  productRating: {
    fontSize: 14,
    color: '#555',
  },
  productSold: {
    fontSize: 14,
    color: '#555',
  },
  error: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
  },
  flatList: {
    flex: 1,
  },
});