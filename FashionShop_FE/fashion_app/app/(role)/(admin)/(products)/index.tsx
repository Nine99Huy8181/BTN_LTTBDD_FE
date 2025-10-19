import { View, Text, FlatList, Button, StyleSheet, TextInput, Alert, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { productService } from '@/services/product.service';
import { Product } from '@/types';
import { Routes } from '@/constants';

export default function ProductManagementScreen() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
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
      Alert.alert('Error', 'Failed to fetch products');
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
      Alert.alert('Error', 'Failed to refresh products');
    } finally {
      setRefreshing(false);
    }
  };

  // Filter products based on search query
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Render individual product item
  const renderProductItem = ({ item }: { item: Product }) => (
    <View style={styles.productItem}>
      <Text style={styles.productName}>{item.name}</Text>
      <Text style={styles.productPrice}>${item.basePrice}</Text>
      <Text style={styles.productBrand}>{item.brand}</Text>
      <Button
        title="Edit"
        onPress={() => router.push(`${Routes.AdminEditProduct}${item.productID}`)}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Product Management</Text>
      
      <TextInput
        style={styles.searchInput}
        placeholder="Search products..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <Button
        title="Add Product"
        onPress={() => router.push(Routes.AdminAddProduct)}
      />

      {loading ? (
        <Text>Loading...</Text>
      ) : (
        <FlatList
          data={filteredProducts}
          renderItem={renderProductItem}
          keyExtractor={item => item.productID.toString()}
          ListEmptyComponent={<Text>No products found</Text>}
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
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  searchInput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  flatList: {
    flex: 1,
  },
  productItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 8,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  productPrice: {
    fontSize: 16,
    color: 'green',
  },
  productBrand: {
    fontSize: 14,
    color: 'gray',
  },
});