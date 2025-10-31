import { Colors, Routes } from '@/constants';
import { useAuth } from '@/hooks/AuthContext';
import { WishlistItem, wishlistService } from '@/services/wishlist.service';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

export default function WishlistScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [addingId, setAddingId] = useState<number | null>(null);
  const [search, setSearch] = useState('');

  const customerId = user?.customerId || 1;


  const fetchWishlist = async () => {
    if (!customerId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const wishlist = await wishlistService.getByCustomerId(customerId);
      if (wishlist?.wishlistID) {
        const items = await wishlistService.getItemsByWishlistId(wishlist.wishlistID);
        setWishlistItems(items || []);
      } else {
        await wishlistService.createWishlist(customerId);
        setWishlistItems([]);
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải danh sách yêu thích');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchWishlist();
  }, [user, customerId]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchWishlist();
    setRefreshing(false);
  }, [customerId]);

  const handleRemoveItem = async (itemId: number) => {
    Alert.alert('Xóa khỏi yêu thích', 'Bạn có chắc muốn xóa sản phẩm này?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          try {
            setDeletingId(itemId);
            await wishlistService.removeItem(itemId);
            setWishlistItems(prev => prev.filter(i => i.wishlistItemID !== itemId));
          } catch {
            Alert.alert('Lỗi', 'Không thể xóa sản phẩm');
          } finally {
            setDeletingId(null);
          }
        },
      },
    ]);
  };

  const handleAddToCart = async (productId: number) => {
    try {
      setAddingId(productId);
      Alert.alert('Thành công', 'Đã thêm vào giỏ hàng');
    } finally {
      setAddingId(null);
    }
  };

  const handleProductPress = (productId: number) => {
    router.push(`${Routes.CustomerProductDetail}${productId}` as any);
  };

  // 🔍 Lọc theo từ khóa tìm kiếm
  const filteredItems = useMemo(() => {
    return wishlistItems.filter(item =>
      item.product.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, wishlistItems]);

  const renderWishlistItem = ({ item }: { item: WishlistItem }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.9}
      onPress={() => handleProductPress(item.product.productID)}
    >
      <View style={styles.imageWrapper}>
        <Image source={{ uri: item.product.image }} style={styles.image} resizeMode="cover" />

        <TouchableOpacity
          style={styles.heartRemove}
          onPress={() => handleRemoveItem(item.wishlistItemID)}
          disabled={deletingId === item.wishlistItemID}
        >
          {deletingId === item.wishlistItemID ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Ionicons name="heart-dislike" size={20} color="#fff" />
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>
          {item.product.name}
        </Text>

        <View style={styles.ratingRow}>
          <Ionicons name="star" size={14} color="#FFD700" />
          <Text style={styles.rating}>{item.product.averageRating?.toFixed(1) || '3.8'}</Text>
          <Text style={styles.sold}> • Đã bán 0</Text>
        </View>

        <View style={styles.bottomRow}>
          <Text style={styles.price}>
            {item.product.discountPrice?.toLocaleString('vi-VN')}đ
          </Text>
          <TouchableOpacity
            style={styles.cartButton}
            onPress={() => handleAddToCart(item.product.productID)}
            disabled={addingId === item.product.productID}
          >
            {addingId === item.product.productID ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Ionicons name="cart-outline" size={18} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="heart-outline" size={80} color={Colors.text.muted} />
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.brand.primary} />
        <Text style={styles.loadingText}>Đang tải...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 🔍 Thanh tìm kiếm */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#777" style={{ marginRight: 8 }} />
        <TextInput
          placeholder="Tìm kiếm sản phẩm..."
          placeholderTextColor="#999"
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Tiêu đề */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Danh sách yêu thích</Text>
        <Text style={styles.headerSubtitle}>{filteredItems.length} sản phẩm</Text>
      </View>
      <View style={styles.divider} />

      <FlatList
        data={filteredItems}
        renderItem={renderWishlistItem}
        keyExtractor={item => item.wishlistItemID.toString()}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.brand.primary]} />
        }
        contentContainerStyle={[
          styles.listContent,
          filteredItems.length === 0 && { flex: 1 },
        ]}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },

  // 🔍 Search bar (dịch xuống thấp hơn, padding mềm hơn)
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F3F3',
    marginHorizontal: 16,
    marginTop: 60, // 🔸 tăng để tránh sát mép trên
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  searchInput: { flex: 1, fontSize: 15, color: '#111' },

  // --- Header ---
  header: {
    paddingHorizontal: 20,
    paddingTop: 24, // 🔸 tăng khoảng cách
    paddingBottom: 12,
    backgroundColor: '#fff',
  },
  headerTitle: { fontSize: 26, fontWeight: '700', color: '#111' },
  headerSubtitle: { fontSize: 14, color: '#777', marginTop: 4 },

  // 🔹 Gạch phân cách
  divider: {
  width: 40,             // ngắn lại như hình
  height: 3,             // dày nhẹ hơn để rõ hơn
  backgroundColor: '#111',
  borderRadius: 2,
  marginTop: 6,          // khoảng cách nhỏ giữa chữ và gạch
  marginLeft: 20,        // canh theo chữ "Danh sách yêu thích"
  marginBottom: 16,
  alignSelf: 'flex-start',
},


  // --- Danh sách ---
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16, // 🔸 dãn đều hơn
    paddingBottom: 32,
  },
  columnWrapper: { justifyContent: 'space-between', marginBottom: 20 },

  // --- Card ---
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  imageWrapper: { position: 'relative', width: '100%', aspectRatio: 1 },
  image: { width: '100%', height: '100%' },

  // ❤️ Nút trái tim mới (hiệu ứng nổi, màu gradient nhẹ)
  heartRemove: {
    position: 'absolute',
    top: 10,
    left: 10,
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FF5E73', // 🔸 tươi hơn
    shadowColor: '#FF5E73',
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },

  info: {
    padding: 12,
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: '#222',
    marginBottom: 6,
    minHeight: 36,
  },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  rating: { fontSize: 13, fontWeight: '600', color: '#222', marginLeft: 4 },
  sold: { fontSize: 12, color: '#666' },
  bottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  price: { fontSize: 15, fontWeight: 'bold', color: '#111' },
  cartButton: {
    backgroundColor: Colors.brand.primary,
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // --- Empty ---
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  emptyTitle: { fontSize: 20, fontWeight: '700', marginTop: 16 },
  emptyDescription: { fontSize: 14, textAlign: 'center', color: '#666', marginBottom: 24 },
  shopButton: {
    backgroundColor: Colors.brand.primary,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 24,
  },
  shopButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },

  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, color: '#555' },
});

