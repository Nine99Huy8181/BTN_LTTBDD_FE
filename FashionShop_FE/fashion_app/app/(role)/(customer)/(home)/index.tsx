import { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { productService } from '@/services/product.service'; // Đường dẫn tới product.service.ts
import { Product } from '@/types';
import { Routes } from '@/constants';


export default function HomeScreen() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
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
  const renderProductItem = ({ item }: { item: Product }) => (
    <View style={styles.productItem}>
      <Text style={styles.productName}>{item.name}</Text>
      <Text style={styles.productPrice}>{item.basePrice} VNĐ</Text>
      <Text style={styles.productPrice}>{item.reviewCount}</Text>
      <Button
        title="Xem chi tiết"
        onPress={() => router.push(`${Routes.CustomerProductDetail}${item.productID}`)}
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
          keyExtractor={(item) => item.productID.toLocaleString()}
          style={styles.flatList}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  productItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 10,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  productPrice: {
    fontSize: 14,
    color: '#555',
  },
  flatList: {
    width: '100%',
  },
  error: {
    color: 'red',
    fontSize: 16,
  },
});