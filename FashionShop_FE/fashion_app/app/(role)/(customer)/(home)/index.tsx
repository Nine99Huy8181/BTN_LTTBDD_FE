// app/(role)/index.tsx
import { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, Button, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { productService } from '@/services/product.service';
import { ProductResponse } from '@/types';
import { Routes } from '@/constants';

export default function HomeScreen() {
  const router = useRouter();
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.getAllProducts();
      setProducts(data);
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể tải sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: ProductResponse }) => (
    <View style={styles.productItem}>
      {item.image ? (
        <Image source={{ uri: item.image }} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.placeholder]} />
      )}
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.brand}>{item.brand}</Text>
        <Text style={styles.price}>${item.discountPrice}</Text>
        <Text style={styles.rating}>Rating: {item.averageRating} ({item.soldQuantity} sold)</Text>
        <Button
          title="Chi tiết"
          onPress={() => router.push(`${Routes.CustomerProductDetail}${item.productID}`)}
        />
      </View>
    </View>
  );

  if (loading) return <ActivityIndicator size="large" style={{ flex: 1 }} />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sản phẩm nổi bật</Text>
      <Button title="Tìm kiếm" onPress={() => router.push(Routes.CustomerSearch)} />
      <Button title="Thông báo" onPress={() => router.push(Routes.CustomerNotifications)} />

      <FlatList
        data={products}
        renderItem={renderItem}
        keyExtractor={(item) => item.productID.toString()}
        ListEmptyComponent={<Text>Không có sản phẩm</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
  productItem: { flexDirection: 'row', padding: 12, borderBottomWidth: 1, borderColor: '#eee' },
  image: { width: 80, height: 80, borderRadius: 8 },
  placeholder: { backgroundColor: '#ddd' },
  info: { marginLeft: 12, flex: 1 },
  name: { fontWeight: 'bold' },
  brand: { color: '#666' },
  price: { color: '#e91e63', fontWeight: 'bold' },
  rating: { fontSize: 12, color: '#888' },
});