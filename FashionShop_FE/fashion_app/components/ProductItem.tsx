// ProductItem.tsx
import { Routes } from '@/constants';
import { useWishlist } from '@/hooks/WishlistContext';
import { CartService } from '@/services/cart.service';
import { ProductResponse } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { showToast } from '@/utils/toast';
import StyledText from './StyledText';

const { width } = Dimensions.get('window');
const gridItemWidth = (width - 48) / 2;
const horizontalItemWidth = width * 0.65;

interface ProductItemProps {
  product: ProductResponse;
  horizontal?: boolean;
  accountId?: number;
  onRemoveFromWishlist?: () => void;
}

export default function ProductItem({
  product,
  horizontal = false,
  accountId,
  onRemoveFromWishlist,
}: ProductItemProps) {
  const itemWidth = horizontal ? horizontalItemWidth : gridItemWidth;
  const [loadingCart, setLoadingCart] = useState(false);
  const { wishlistProductIds, addToWishlist, removeFromWishlist } = useWishlist();
  const router = useRouter();

  const isWishlisted = wishlistProductIds.has(product.productID);

  const toggleWishlist = async () => {
    try {
      if (isWishlisted) {
        await removeFromWishlist(product.productID);
        onRemoveFromWishlist?.();
        showToast.success('Đã xóa khỏi danh sách yêu thích');
      } else {
        await addToWishlist(product.productID);
        showToast.success('Đã thêm vào danh sách yêu thích');
      }
    } catch (error) {
      showToast.error('Lỗi', 'Không thể cập nhật danh sách yêu thích');
    }
  };

  const addToCart = async () => {
    if (!accountId) {
      showToast.error('Lỗi', 'Vui lòng đăng nhập để thêm vào giỏ hàng');
      return;
    }

    setLoadingCart(true);
    try {
      const result = await CartService.addToCart(accountId, product.productID, 1);
      if (result.success) {
        showToast.success('Thành công', 'Đã thêm vào giỏ hàng');
      } else {
        showToast.error('Lỗi', result.message || 'Không thể thêm vào giỏ hàng');
      }
    } catch (error: any) {
      showToast.error('Lỗi', error.message || 'Thao tác thất bại');
    } finally {
      setLoadingCart(false);
    }
  };

  const hasDiscount = product.discountPrice < product.basePrice;
  const discountPercentage = hasDiscount
    ? Math.round(((product.basePrice - product.discountPrice) / product.basePrice) * 100)
    : 0;

  return (
    <TouchableOpacity
      style={[styles.productItem, { width: itemWidth }, horizontal && styles.horizontalItem]}
      onPress={() => router.push(`${Routes.CustomerProductDetail}/${product.productID}` as any)}
      activeOpacity={0.7}
    >
      <View style={styles.imageContainer}>
        <Image
          style={styles.productImg}
          source={{ uri: product.image }}
          resizeMode="cover"
        />

        {/* Gradient overlay at bottom */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.05)']}
          style={styles.imageGradient}
        />

        {/* Badges container */}
        <View style={styles.badgesContainer}>
          {hasDiscount && (
            <View style={styles.discountBadge}>
              <StyledText style={styles.discountText}>-{discountPercentage}%</StyledText>
            </View>
          )}
          {product.soldQuantity > 50 && (
            <View style={styles.hotBadge}>
              <Ionicons name="flame" size={12} color="#fff" />
              <StyledText style={styles.hotText}>Hot</StyledText>
            </View>
          )}
        </View>

        {/* Wishlist button */}
        <TouchableOpacity
          style={[styles.wishlistButton, isWishlisted && styles.wishlistButtonActive]}
          onPress={toggleWishlist}
          activeOpacity={0.8}
        >
          <Ionicons
            name={isWishlisted ? 'heart' : 'heart-outline'}
            size={20}
            color={isWishlisted ? '#fff' : '#1a1a1a'}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.productInfo}>
        <StyledText style={styles.productName} numberOfLines={2}>
          {product.name}
        </StyledText>

        <View style={styles.ratingContainer}>
          <View style={styles.ratingBadge}>
            <Ionicons name="star" color="#FFA500" size={12} />
            <StyledText style={styles.rating}>{product.averageRating.toFixed(1)}</StyledText>
          </View>
          {product.soldQuantity > 0 && (
            <StyledText style={styles.sold}>Đã bán {product.soldQuantity}</StyledText>
          )}
        </View>

        <View style={styles.priceRow}>
          <View style={styles.priceContainer}>
            <StyledText style={styles.price}>
              {product.discountPrice.toLocaleString()}đ
            </StyledText>
            {hasDiscount && (
              <StyledText style={styles.originalPrice}>
                {product.basePrice.toLocaleString()}đ
              </StyledText>
            )}
          </View>

          <TouchableOpacity
            style={[styles.cartButton, loadingCart && styles.cartButtonLoading]}
            onPress={(e) => {
              e.stopPropagation();
              addToCart();
            }}
            disabled={loadingCart}
            activeOpacity={0.7}
          >
            {loadingCart ? (
              <ActivityIndicator size={18} color="#fff" />
            ) : (
              <Ionicons name="cart-outline" size={18} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  productItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    marginBottom: 4,
  },
  horizontalItem: {
    marginRight: 16,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#F8F9FA',
  },
  productImg: {
    width: '100%',
    height: '100%',
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '30%',
  },
  badgesContainer: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    gap: 6,
  },
  discountBadge: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  hotBadge: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  hotText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  wishlistButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  wishlistButtonActive: {
    backgroundColor: '#FF3B30',
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
    lineHeight: 18,
    letterSpacing: 0.2,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E7',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 3,
  },
  rating: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  sold: {
    fontSize: 11,
    color: '#8E8E93',
    fontWeight: '500',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flex: 1,
    gap: 2,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF3B30',
    letterSpacing: 0.3,
  },
  originalPrice: {
    fontSize: 12,
    color: '#8E8E93',
    textDecorationLine: 'line-through',
    fontWeight: '500',
  },
  cartButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  cartButtonLoading: {
    opacity: 0.7,
  },
});