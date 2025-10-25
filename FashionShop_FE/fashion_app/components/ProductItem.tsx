import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { ProductResponse } from '@/types';
import { Routes } from '@/constants';

const { width } = Dimensions.get('window');
const gridItemWidth = (width - 48) / 2;
const horizontalItemWidth = width * 0.65;

interface ProductItemProps {
  product: ProductResponse;
  horizontal?: boolean;
}

export default function ProductItem({ product, horizontal = false }: ProductItemProps) {
  const router = useRouter();
  const itemWidth = horizontal ? horizontalItemWidth : gridItemWidth;

  return (
    <TouchableOpacity
      style={[styles.productItem, { width: itemWidth }, horizontal && styles.horizontalItem]}
      onPress={() => router.push(`${Routes.CustomerProductDetail}/${product.productID}`)}
      activeOpacity={0.8}
    >
      {/* Product Image Placeholder */}
      <View style={styles.imageContainer}>
        <View style={styles.imagePlaceholder}>
          <Image style={styles.productImg} source={{uri: product.image}} />
        </View>
        {product.soldQuantity > 50 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Hot</Text>
          </View>
        )}
      </View>

      {/* Product Info */}
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {product.name}
        </Text>
        
        <View style={styles.ratingContainer}>
          <Text style={styles.star}>⭐</Text>
          <Text style={styles.rating}>{product.averageRating.toFixed(1)}</Text>
          <Text style={styles.sold}>• Đã bán {product.soldQuantity}</Text>
        </View>

        <View style={styles.priceContainer}>
          <Text style={styles.price}>{product.discountPrice.toLocaleString()}đ</Text>
        </View>
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
  horizontalItem: {
    marginRight: 16,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#F5F5F5',
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    fontSize: 48,
  },
  productImg: {
    width: "100%",
    height: "100%"
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FF3B30',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
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
    marginBottom: 8,
  },
  star: {
    fontSize: 12,
    marginRight: 4,
  },
  rating: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000000',
  },
  sold: {
    fontSize: 12,
    color: '#666666',
    marginLeft: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
});