// app/(customer)/wishlist.tsx
import { Colors, Routes } from '@/constants';
import { useAuth } from '@/hooks/AuthContext';
import { WishlistItem, wishlistService } from '@/services/wishlist.service';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
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
  const [addingId, setAddingId] = useState<number | null>(null); // 🛒 trạng thái khi đang thêm vào giỏ

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
        console.log('Customer chưa có wishlist, tạo mới...');
        await wishlistService.createWishlist(customerId);
        setWishlistItems([]);
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách yêu thích');
      setWishlistItems([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchWishlist();
    setRefreshing(false);
  }, [customerId]);

  useEffect(() => {
    if (user) {
      fetchWishlist();
    } else {
      setLoading(false);
    }
  }, [user, customerId]);

  const handleRemoveItem = async (itemId: number) => {
    Alert.alert(
      'Xóa khỏi yêu thích',
      'Bạn có chắc muốn xóa sản phẩm này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeletingId(itemId);
              await wishlistService.removeItem(itemId);
              setWishlistItems(prev => prev.filter(item => item.wishlistItemID !== itemId));
              Alert.alert('Thành công', 'Đã xóa khỏi danh sách yêu thích');
            } catch (error) {
              console.error('Error removing item:', error);
              Alert.alert('Lỗi', 'Không thể xóa sản phẩm');
            } finally {
              setDeletingId(null);
            }
          },
        },
      ]
    );
  };

  // 🛒 Thêm vào giỏ hàng
  const handleAddToCart = async (productId: number) => {
    try {
      setAddingId(productId);

      // 🛒 TODO: Gọi service thêm vào giỏ hàng ở đây
      // await cartService.addToCart(customerId, productId, 1);
      console.log(`🛒 Giả lập thêm sản phẩm ${productId} vào giỏ hàng`);

      Alert.alert('Thành công', 'Sản phẩm đã được thêm vào giỏ hàng');
    } catch (error) {
      console.error('Lỗi khi thêm vào giỏ hàng:', error);
      Alert.alert('Lỗi', 'Không thể thêm vào giỏ hàng');
    } finally {
      setAddingId(null);
    }
  };

  const handleProductPress = (productId: number) => {
    router.push(`${Routes.CustomerProductDetail}${productId}` as any);
  };

  const renderWishlistItem = ({ item }: { item: WishlistItem }) => (
    <View style={styles.card}>
      <TouchableOpacity
        onPress={() => handleProductPress(item.product.productID)}
        activeOpacity={0.8}
      >
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: item.product.image }}
            style={styles.productImage}
            resizeMode="cover"
          />

          {/* ❌ Nút xóa */}
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => handleRemoveItem(item.wishlistItemID)}
            disabled={deletingId === item.wishlistItemID}
          >
            {deletingId === item.wishlistItemID ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Ionicons name="close" size={18} color="#FFF" />
            )}
          </TouchableOpacity>

          {/* 🛒 Nút thêm vào giỏ */}
          <TouchableOpacity
            style={styles.cartButton}
            onPress={() => handleAddToCart(item.product.productID)}
            disabled={addingId === item.product.productID}
          >
            {addingId === item.product.productID ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Ionicons name="cart-outline" size={18} color="#FFF" />
            )}
          </TouchableOpacity>
        </View>

        {/* Thông tin sản phẩm */}
        <View style={styles.infoContainer}>
          <Text style={styles.brandText} numberOfLines={1}>
            {item.product.brand}
          </Text>
          <Text style={styles.nameText} numberOfLines={2}>
            {item.product.name}
          </Text>

          <View style={styles.bottomRow}>
            <Text style={styles.priceText}>
              {item.product.discountPrice?.toLocaleString('vi-VN')}₫
            </Text>

            {item.product.averageRating > 0 && (
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={12} color="#FFC107" />
                <Text style={styles.ratingText}>
                  {item.product.averageRating.toFixed(1)}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </View>
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
    if (!user) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="person-outline" size={80} color={Colors.text.muted} />
          <Text style={styles.emptyTitle}>Chưa đăng nhập</Text>
          <Text style={styles.emptyDescription}>
            Vui lòng đăng nhập để xem danh sách yêu thích
          </Text>
          <TouchableOpacity
            style={styles.shopButton}
            onPress={() => router.push(Routes.AuthLogin)}
          >
            <Text style={styles.shopButtonText}>Đăng nhập</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.brand.primary} />
        <Text style={styles.loadingText}>Đang tải...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Yêu thích</Text>
        <Text style={styles.headerSubtitle}>
          {wishlistItems.length} sản phẩm
        </Text>
      </View>

      <FlatList
        data={wishlistItems}
        renderItem={renderWishlistItem}
        keyExtractor={item => item.wishlistItemID.toString()}
        numColumns={2}
        contentContainerStyle={[
          styles.listContent,
          wishlistItems.length === 0 && { flex: 1 },
        ]}
        columnWrapperStyle={wishlistItems.length > 0 ? styles.columnWrapper : undefined}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.brand.primary]}
            tintColor={Colors.brand.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.main },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 16, color: Colors.text.secondary },
  header: {
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: Colors.background.main,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  headerTitle: { fontSize: 28, fontWeight: '700', color: Colors.text.primary },
  headerSubtitle: { fontSize: 14, color: Colors.text.secondary },
  listContent: { padding: 16, paddingBottom: 24 },
  columnWrapper: { justifyContent: 'space-between', marginBottom: 16 },
  card: {
    width: CARD_WIDTH,
    backgroundColor: Colors.background.card,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
  },
  imageContainer: { position: 'relative', width: '100%', height: CARD_WIDTH * 1.2 },
  productImage: { width: '100%', height: '100%' },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.status.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.brand.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: { padding: 12 },
  brandText: { fontSize: 10, color: Colors.text.secondary, marginBottom: 4 },
  nameText: { fontSize: 14, fontWeight: '600', color: Colors.text.primary, marginBottom: 8 },
  bottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  priceText: { fontSize: 16, fontWeight: '700', color: Colors.product.price },
  ratingContainer: { flexDirection: 'row', alignItems: 'center' },
  ratingText: { fontSize: 12, color: Colors.text.secondary, marginLeft: 2 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  emptyTitle: { fontSize: 20, fontWeight: '700', marginTop: 16 },
  emptyDescription: { fontSize: 14, textAlign: 'center', marginBottom: 24 },
  shopButton: {
    backgroundColor: Colors.brand.primary,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
  },
  shopButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
