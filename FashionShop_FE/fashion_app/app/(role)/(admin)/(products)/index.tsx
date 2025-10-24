// app/(admin)/products/index.tsx
import { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, Button, StyleSheet, Alert, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { productService } from '@/services/product.service';
import { ProductResponse } from '@/types';
import { Routes } from '@/constants';

export default function ProductManagementScreen() {
  const router = useRouter();
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
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

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProducts();
    setRefreshing(false);
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderProductItem = ({ item }: { item: ProductResponse }) => (
    <View style={styles.productItem}>
      <Text style={styles.productName}>{item.name}</Text>
      <Text style={styles.productPrice}>${item.discountPrice}</Text>
      <Text style={styles.productBrand}>{item.brand}</Text>
      <Text style={styles.sold}>Đã bán: {item.soldQuantity}</Text>
      <Button
        title="Sửa"
        onPress={() => router.push(`${Routes.AdminEditProduct}${item.productID}`)}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quản lý sản phẩm</Text>

      <TextInput
        style={styles.searchInput}
        placeholder="Tìm kiếm sản phẩm..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <Button title="Thêm sản phẩm" onPress={() => router.push(Routes.AdminAddProduct)} />

      {loading ? (
        <Text>Đang tải...</Text>
      ) : (
        <FlatList
          data={filteredProducts}
          renderItem={renderProductItem}
          keyExtractor={item => item.productID.toString()}
          ListEmptyComponent={<Text>Không tìm thấy sản phẩm</Text>}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
  searchInput: { borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 8, marginBottom: 12 },
  productItem: { padding: 12, borderBottomWidth: 1, borderColor: '#eee' },
  productName: { fontWeight: 'bold', fontSize: 16 },
  productPrice: { color: '#e91e63', fontWeight: 'bold' },
  productBrand: { color: '#666' },
  sold: { fontSize: 12, color: '#888' },
});