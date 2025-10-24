// screens/ProductManagementScreen.tsx
import { View, Text, FlatList, Button, StyleSheet, TextInput, Alert, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { productService } from '@/services/product.service';
import { ProductResponse } from '@/types';
import { Routes } from '@/constants';

export default function ProductManagementScreen() {
  const router = useRouter();
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Fetch products when component mounts
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productService.getAllProducts();
      setProducts(response);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải danh sách sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  // Handle pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const response = await productService.getAllProducts();
      setProducts(response);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể làm mới danh sách sản phẩm');
    } finally {
      setRefreshing(false);
    }
  };


  // Filter products based on search query
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Render individual product item
  const renderProductItem = ({ item }: { item: ProductResponse }) => (
    <View style={styles.productItem}>
      <Text style={styles.productName}>{item.name}</Text>
      <Text style={styles.productPrice}>{item.discountPrice} VNĐ</Text>
      <Text style={styles.productBrand}>Thương hiệu: {item.brand}</Text>
      <Text style={styles.productRating}>Đánh giá: {item.averageRating.toFixed(1)}/5</Text>
      <Text style={styles.productSold}>Đã bán: {item.soldQuantity}</Text>
      <View style={styles.buttonContainer}>
        <Button
          title="Sửa"
          onPress={() => router.push(`${Routes.AdminEditProduct}/${item.productID}`)}
        />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quản lý Sản phẩm</Text>

      <TextInput
        style={styles.searchInput}
        placeholder="Tìm kiếm sản phẩm..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <Button
        title="Thêm Sản phẩm"
        onPress={() => router.push(Routes.AdminAddProduct)}
      />

      {loading ? (
        <Text>Đang tải...</Text>
      ) : (
        <FlatList
          data={filteredProducts}
          renderItem={renderProductItem}
          keyExtractor={(item) => item.productID.toString()}
          ListEmptyComponent={<Text>Không tìm thấy sản phẩm</Text>}
          style={styles.flatList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#0000ff']}
              tintColor={'#0000ff'}
            />
          }
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
  searchInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 16,
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
  productBrand: {
    fontSize: 14,
    color: '#555',
  },
  productRating: {
    fontSize: 14,
    color: '#555',
  },
  productSold: {
    fontSize: 14,
    color: '#555',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  flatList: {
    flex: 1,
  },
});