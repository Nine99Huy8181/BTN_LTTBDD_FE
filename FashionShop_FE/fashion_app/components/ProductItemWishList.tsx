import { Colors, Routes } from '@/constants';
import { ProductResponse } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');
const gridItemWidth = (width - 48) / 2;

interface ProductItemWishlistProps {
  product: ProductResponse;
  onRemove?: () => void;
  onAddToCart?: () => void;
  loadingRemove?: boolean;
  loadingAdd?: boolean;
}

export default function ProductItemWishlist({
  product,
  onRemove,
  onAddToCart,
  loadingRemove = false,
  loadingAdd = false,
}: ProductItemWishlistProps) {
  const router = useRouter();

  return (
    <TouchableOpacity
      style={[styles.productItem, { width: gridItemWidth }]}
      onPress={() => router.push(`${Routes.CustomerProductDetail}/${product.productID}`)}
      activeOpacity={0.9}
    >
      {/* Ảnh sản phẩm */}
      <View style={styles.imageContainer}>
        <Image style={styles.productImg} source={{ uri: product.image }} />

        {/* Nút xoá khỏi yêu thích ❤️ */}
        {onRemove && (
          <TouchableOpacity
            style={styles.removeButton}
            onPress={onRemove}
            disabled={loadingRemove}
          >
            {loadingRemove ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="heart-dislike-outline" size={18} color="#fff" />
            )}
          </TouchableOpacity>
        )}

        {/* Nút thêm vào giỏ hàng 🛒 */}
        {onAddToCart && (
          <TouchableOpacity
            style={styles.cartButton}
            onPress={onAddToCart}
            disabled={loadingAdd}
          >
            {loadingAdd ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="cart-outline" size={18} color="#fff" />
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Thông tin sản phẩm */}
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {product.name}
        </Text>

        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={12} color="#FFC107" />
          <Text style={styles.rating}>{product.averageRating.toFixed(1)}</Text>
          <Text style={styles.sold}>· Đã bán {product.soldQuantity}</Text>
        </View>

        <Text style={styles.price}>{product.discountPrice.toLocaleString()}đ</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  productItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#F5F5F5',
  },
  productImg: {
    width: '100%',
    height: '100%',
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.status.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.brand.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
    lineHeight: 20,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  rating: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000000',
    marginLeft: 4,
  },
  sold: {
    fontSize: 12,
    color: '#666666',
    marginLeft: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
});
