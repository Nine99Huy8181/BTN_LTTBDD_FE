// FeaturedProductItem.tsx
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { ProductResponse } from '@/types';
import { Routes } from '@/constants';
import { Ionicons } from '@expo/vector-icons';
import { useWishlist } from '@/hooks/WishlistContext';
import { showToast } from '@/utils/toast';

const { width } = Dimensions.get('window');
const itemWidth = width * 0.35;

interface FeaturedProductItemProps {
  product: ProductResponse;
  onRemoveFromWishlist?: () => void;
}

export default function FeaturedProductItem({
  product,
  onRemoveFromWishlist,
}: FeaturedProductItemProps) {
  const { wishlistProductIds, addToWishlist, removeFromWishlist } = useWishlist();
  const router = useRouter();

  const isWishlisted = wishlistProductIds.has(product.productID);

  const toggleWishlist = async () => {
    try {
      if (isWishlisted) {
        await removeFromWishlist(product.productID);
        onRemoveFromWishlist?.();
      } else {
        await addToWishlist(product.productID);
      }
    } catch (error) {
      showToast.error('Lỗi', 'Không thể cập nhật danh sách yêu thích');
    }
  };

  return (
    <TouchableOpacity
      style={[styles.productItem, { width: itemWidth }]}
      onPress={() => router.push(`${Routes.CustomerProductDetail}/${product.productID}`)}
      activeOpacity={0.7}
    >
      <View style={styles.imageContainer}>
        <Image 
          style={styles.productImg} 
          source={{ uri: product.image }} 
          resizeMode="cover" 
        />
        
        {/* Wishlist Button */}
        <TouchableOpacity
          style={styles.wishlistButton}
          onPress={toggleWishlist}
          activeOpacity={0.8}
        >
          <Ionicons
            name={isWishlisted ? 'heart' : 'heart-outline'}
            size={20}
            color={isWishlisted ? '#FF4458' : '#FFFFFF'}
          />
        </TouchableOpacity>

        {/* Discount Badge (if applicable) */}
        {product.basePrice && product.basePrice > product.discountPrice && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>
              -{Math.round(((product.basePrice - product.discountPrice) / product.basePrice) * 100)}%
            </Text>
          </View>
        )}
      </View>

      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {product.name}
        </Text>
        
        <View style={styles.priceContainer}>
          <Text style={styles.price}>
            {product.discountPrice.toLocaleString('vi-VN')}₫
          </Text>
          {product.basePrice && product.basePrice > product.discountPrice && (
            <Text style={styles.basePrice}>
              {product.basePrice.toLocaleString('vi-VN')}₫
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  productItem: {
    marginRight: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 0.85,
    backgroundColor: '#F8F8F8',
    position: 'relative',
  },
  productImg: {
    width: '100%',
    height: '100%',
  },
  wishlistButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    backdropFilter: 'blur(10px)',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#FF4458',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  productInfo: {
    padding: 10,
    gap: 6,
  },
  productName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1A1A1A',
    lineHeight: 18,
    minHeight: 36,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  price: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000000ff',
  },
  basePrice: {
    fontSize: 12,
    fontWeight: '500',
    color: '#999999',
    textDecorationLine: 'line-through',
  },
});