// WishlistScreen.tsx
import ProductItem from '@/components/ProductItem';
import { Colors, Routes } from '@/constants';
import { useAuth } from '@/hooks/AuthContext';
import { useWishlist } from '@/hooks/WishlistContext';
import { wishlistService } from '@/services/wishlist.service';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

export default function WishlistScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { wishlistProductIds, isLoading, refreshWishlist } = useWishlist();
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const customerId = user?.customerId;
  const accountId = user?.accountId;

  // Lấy danh sách sản phẩm từ wishlistProductIds
  useEffect(() => {
    const loadWishlistProducts = async () => {
      if (!customerId || wishlistProductIds.size === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const wishlist = await wishlistService.getByCustomerId(customerId);
        if (!wishlist?.wishlistID) {
          setProducts([]);
          return;
        }

        const items = await wishlistService.getItemsByWishlistId(wishlist.wishlistID);
        const productList = items
          .filter(item => wishlistProductIds.has(item.product.productID))
          .map(item => ({
            productID: item.product.productID,
            name: item.product.name,
            brand: item.product.brand,
            discountPrice: item.product.discountPrice,
            averageRating: item.product.averageRating || 0,
            image: item.product.image,
          }));
        setProducts(productList);
      } catch (error) {
        Alert.alert('Lỗi', 'Không thể tải sản phẩm yêu thích');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadWishlistProducts();
  }, [customerId, wishlistProductIds]); // Phụ thuộc wishlistProductIds → tự động cập nhật

  const filteredProducts = useMemo(() => {
    return products.filter(p =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [products, searchQuery]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshWishlist();
    setRefreshing(false);
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.productWrapper}>
      <ProductItem
        product={item}
        accountId={accountId}
        onRemoveFromWishlist={() => {
          // Không cần làm gì thêm, context sẽ tự cập nhật → useEffect sẽ reload
        }}
      />
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="heart-outline" size={80} color="#aaa" />
      <Text style={styles.emptyTitle}>Danh sách yêu thích trống</Text>
      <Text style={styles.emptyDescription}>
        Hãy thêm sản phẩm yêu thích để dễ dàng theo dõi nhé!
      </Text>
      <TouchableOpacity
        style={styles.shopButton}
        onPress={() => router.push(Routes.CustomerHome)}
      >
        <Text style={styles.shopButtonText}>Khám phá ngay</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading && products.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.brand?.primary || '#0066CC'} />
        <Text style={styles.loadingText}>Đang tải...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#999999" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Bạn đang muốn mua gì... ?"
              placeholderTextColor="#CCCCCC"
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color="#999999" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.header}>
          <Text style={styles.headerTitle}>Danh sách yêu thích</Text>
          <Text style={styles.headerSubtitle}>{filteredProducts.length} sản phẩm</Text>
        </View>
        <View style={styles.divider} />

        <FlatList
          data={filteredProducts}
          renderItem={renderItem}
          keyExtractor={item => item.productID.toString()}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          ListEmptyComponent={renderEmpty}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={[
            styles.listContent,
            filteredProducts.length === 0 && { flex: 1 },
          ]}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
}

// Styles
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 10 },
  header: { paddingHorizontal: 16, marginBottom: 8 },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  headerSubtitle: { color: '#666', marginTop: 4 },
  divider: { height: 1, backgroundColor: '#eee', marginHorizontal: 16 },
  listContent: { paddingHorizontal: 8 },
  columnWrapper: { justifyContent: 'space-between', paddingHorizontal: 8 },
  productWrapper: { marginBottom: 16 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  emptyTitle: { fontSize: 18, fontWeight: '600', marginTop: 16, color: '#333' },
  emptyDescription: { fontSize: 14, color: '#666', textAlign: 'center', marginTop: 8 },
  shopButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#000',
    borderRadius: 8,
  },
  shopButtonText: { color: '#fff', fontWeight: '600' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, color: '#666' },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    gap: 8,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 16,
    height: 44,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#000000',
  },
});