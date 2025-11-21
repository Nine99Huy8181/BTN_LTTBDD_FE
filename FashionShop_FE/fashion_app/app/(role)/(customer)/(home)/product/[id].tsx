import { View, Text, Button, Image, ScrollView, TouchableOpacity, FlatList, StyleSheet, Dimensions, Alert, Modal, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { productService } from '@/services/product.service';
import { productVariantService } from '@/services/productvariant.service';
import { Product, ProductVariantResponse } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Routes } from '@/constants';
import { api } from '@/services/api';

const SCREEN_WIDTH = Dimensions.get('window').width;

import { useAuth } from '@/hooks/AuthContext';
import { CartService } from '@/services/cart.service';
import { useWishlist } from '@/hooks/WishlistContext';

import { useFocusEffect } from '@react-navigation/native';
import React from 'react';

export default function ProductDetailScreen() {
  const params = useLocalSearchParams();

  // Fetch reviews when the screen is focused. Initial load on id change
  // is handled by the useEffect further down (which depends on numberId).
  useFocusEffect(
    React.useCallback(() => {
      if (params.id) {
        fetchReviews();
      }
    }, [params.id])
  );

  /* Lines 18-183 omitted */
  const { id } = useLocalSearchParams();
  const numberId = Number(id);
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  const [product, setProduct] = useState<Product | null>(null);
  const [variants, setVariants] = useState<ProductVariantResponse[]>([]);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isReviewsOpen, setIsReviewsOpen] = useState(false);
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Array<{ rating: number; comment: string; reviewDate: string; images?: string[]; customerName?: string; customerAvatar?: string }>>([]);
  const [selectedImageModal, setSelectedImageModal] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  const { wishlistProductIds, addToWishlist, removeFromWishlist } = useWishlist();
  const [loadingCart, setLoadingCart] = useState(false);
  const [loadingWishlist, setLoadingWishlist] = useState(false);
  const isWishlisted = wishlistProductIds.has(product?.productID || 0);
  

  const discountPercent = product?.basePrice && product?.discountPrice
    ? Math.round(((product.basePrice - product.discountPrice) / product.basePrice) * 100)
    : 0;

  const computedAverageRating = (() => {
    if (reviews && reviews.length > 0) {
      const sum = reviews.reduce((s, r) => s + (typeof r.rating === 'number' ? r.rating : Number(r.rating) || 0), 0);
      return sum / reviews.length;
    }
    return product?.averageRating || 0;
  })();

  const roundedStarsForDisplay = Math.max(0, Math.min(5, Math.round(computedAverageRating)));
  const starsDisplay = '★'.repeat(roundedStarsForDisplay) + '☆'.repeat(5 - roundedStarsForDisplay);
  const reviewCountToShow = reviews.length > 0 ? reviews.length : 0;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productData, variantsData] = await Promise.all([
          productService.getProductById(numberId),
          productVariantService.getVariantsByProductId(numberId),
        ]);
        setProduct(productData);
        setVariants(variantsData);

        if (variantsData.length > 0) {
          setSelectedColor(variantsData[0].color);
          setSelectedSize(variantsData[0].size);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };

    fetchData();
  }, [numberId]);

  async function fetchReviews() {
    try {
      // Use the canonical backend endpoint for reviews by product
      // (the backend exposes GET /api/reviews/product/{productId}).
      const res = await api.get(`/reviews/product/${numberId}`);
      if (res?.data && Array.isArray(res.data)) {
        setReviews(res.data.map((r: any) => ({ 
          rating: r.rating, 
          comment: r.comment, 
          reviewDate: r.reviewDate || r.review_date || r.reviewDate, 
          images: r.images || [],
          customerName: r.customerName || 'User',
          customerAvatar: r.customerAvatar
        })));
        return;
      }

      // Fallback mock data when backend returns unexpected payload
      const mock = [
        { rating: 5, comment: 'Sản phẩm tuyệt vời, giao nhanh.', reviewDate: '2025-10-23T12:34:00', images: [] },
        { rating: 4, comment: 'Chất lượng ok, nhưng màu khác so với hình.', reviewDate: '2025-10-22T10:20:00', images: [] },
        { rating: 3, comment: 'Bình thường, giá hơi cao.', reviewDate: '2025-10-20T09:15:00', images: [] },
      ];
      setReviews(mock);
    } catch (err) {
      // Log error and use fallback mock data
      console.error('fetchReviews error', err);
      const mock = [
        { rating: 5, comment: 'Sản phẩm tuyệt vời, giao nhanh.', reviewDate: '2025-10-23T12:34:00', images: [] },
        { rating: 4, comment: 'Chất lượng ok, nhưng màu khác so với hình.', reviewDate: '2025-10-22T10:20:00', images: [] },
        { rating: 3, comment: 'Bình thường, giá hơi cao.', reviewDate: '2025-10-20T09:15:00', images: [] },
      ];
      setReviews(mock);
    }
  }

  useEffect(() => {
    fetchReviews();
  }, [numberId]);

  const uniqueColors = Array.from(
    new Set(variants.filter(v => v.validQuantity > 0).map(v => v.color))
  );

  const uniqueSizes = Array.from(
    new Set(
      variants
        .filter(v => v.color === selectedColor && v.validQuantity > 0)
        .map(v => v.size)
    )
  ).sort((a, b) => {
    const order = ['S', 'M', 'L', 'XL', 'XXL'];
    return order.indexOf(a) - order.indexOf(b);
  });

  const getDisplayImages = () => {
    if (!product || !selectedColor) return [];

    const colorVariants = variants.filter(v => v.color === selectedColor);
    const variantImages = colorVariants.flatMap(v =>
      v.images.filter(img => img && img.trim() !== '')
    );

    return variantImages.length > 0 ? variantImages : [product.image].filter(img => img);
  };

  const displayImages = getDisplayImages();

  const selectedVariant = variants.find(
    v => v.color === selectedColor && v.size === selectedSize
  );
  const finalPrice = selectedVariant
    ? (product?.discountPrice || 0) + selectedVariant.priceAdjustment
    : product?.discountPrice || 0;

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    setCurrentImageIndex(0);

    const availableSizes = variants
      .filter(v => v.color === color && v.validQuantity > 0)
      .map(v => v.size);

    if (availableSizes.length > 0) {
      const sortedSizes = availableSizes.sort((a, b) => {
        const order = ['S', 'M', 'L', 'XL', 'XXL'];
        return order.indexOf(a) - order.indexOf(b);
      });
      setSelectedSize(sortedSizes[0]);
    } else {
      setSelectedSize(null);
    }
  };

  // const handleBuyNow = () => {
  //   if (!selectedVariant) {
  //     alert('Vui lòng chọn màu sắc và kích cỡ');
  //     return;
  //   }

  //   if (selectedVariant.validQuantity <= 0) {
  //     alert('Sản phẩm này hiện đã hết hàng');
  //     return;
  //   }

  //   router.push({
  //     pathname: '/checkout',
  //     params: {
  //       productId: product?.productID,
  //       variantId: selectedVariant.variantID,
  //       productName: product?.name,
  //       color: selectedVariant.color,
  //       size: selectedVariant.size,
  //       price: finalPrice,
  //       image: selectedVariant.images[0] || product?.image,
  //       availableQuantity: selectedVariant.validQuantity,
  //     },
  //   });
  // };

  const handleThumbnailPress = (index: number) => {
    setCurrentImageIndex(index);
    flatListRef.current?.scrollToOffset({
      offset: index * SCREEN_WIDTH,
      animated: true,
    });
  };

  const incrementQuantity = () => {
    if (selectedVariant && quantity < selectedVariant.validQuantity) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const toggleWishlist = async () => {
    if (!product?.productID) return;
    
    setLoadingWishlist(true);
    try {
      if (isWishlisted) {
        await removeFromWishlist(product.productID);
        Alert.alert('Đã xóa khỏi danh sách yêu thích');
      } else {
        await addToWishlist(product.productID);
        Alert.alert('Đã thêm vào danh sách yêu thích');
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể cập nhật danh sách yêu thích');
    } finally {
      setLoadingWishlist(false);
    }
  };

  const addToCart = async () => {
  if (!user || !user.accountId) {
    Alert.alert('Vui lòng đăng nhập để thêm vào giỏ hàng');
    return;
  }

  if (!selectedVariant) {
    Alert.alert('Vui lòng chọn màu sắc và kích cỡ');
    return;
  }

  if (selectedVariant.validQuantity <= 0) {
    Alert.alert('Sản phẩm này hiện đã hết hàng');
    return;
  }

  setLoadingCart(true);
  try {
    const result = await CartService.addToCart(
      user.accountId as number, 
      selectedVariant.variantID, 
      quantity
    );
    
    if (result.success) {
      Alert.alert('Thành công', 'Đã thêm vào giỏ hàng');
      // Reset quantity về 1
      setQuantity(1);
    } else {
      Alert.alert('Lỗi', result.message || 'Không thể thêm vào giỏ hàng');
    }
  } catch (error: any) {
    Alert.alert('Lỗi', error.message || 'Thao tác thất bại');
  } finally {
    setLoadingCart(false);
  }
};

const handleBuyNow = async () => {
  if (!selectedVariant) {
    Alert.alert('Vui lòng chọn màu sắc và kích cỡ');
    return;
  }

  if (selectedVariant.validQuantity <= 0) {
    Alert.alert('Sản phẩm này hiện đã hết hàng');
    return;
  }

  // Thêm vào giỏ hàng trước
  setLoadingCart(true);
  try {
    const result = await CartService.addToCart(
      user?.accountId as number, 
      selectedVariant.variantID, 
      quantity
    );
    
    if (result.success) {
      // Chuyển đến tab giỏ hàng
      router.push('/(role)/(customer)/(cart)');
    } else {
      Alert.alert('Lỗi', result.message || 'Không thể thêm vào giỏ hàng');
    }
  } catch (error: any) {
    Alert.alert('Lỗi', error.message || 'Thao tác thất bại');
  } finally {
    setLoadingCart(false);
  }
};

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header Buttons */}
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={22} color="#000" />
          </TouchableOpacity>
          
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.headerBtn}>
              <Ionicons name="share-social-outline" size={22} color="#000" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerBtn}
                onPress={toggleWishlist}
                disabled={loadingWishlist}
              >
                {loadingWishlist ? (
                  <ActivityIndicator size={16} color="#666" />
                ) : (
                  <Ionicons
                    name={isWishlisted ? "heart" : "heart-outline"} 
                    size={22} 
                    color={isWishlisted ? "#FF4444" : "#000"} 
                  />
                )}
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView 
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Image Slider */}
          <View style={styles.imageSliderContainer}>
            <FlatList
              ref={flatListRef}
              data={displayImages}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              keyExtractor={(_, index) => `slide-${index}`}
              onMomentumScrollEnd={(e) => {
                const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
                setCurrentImageIndex(index);
              }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => setSelectedImageModal(item)}
                >
                  <Image
                    source={{ uri: item || 'https://via.placeholder.com/400' }}
                    style={styles.mainImage}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              )}
            />

            {/* Thumbnail Row */}
            {displayImages.length > 1 && (
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.thumbnailScroll}
                contentContainerStyle={styles.thumbnailContainer}
              >
                {displayImages.map((img, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleThumbnailPress(index)}
                    style={[
                      styles.thumbnailWrapper,
                      currentImageIndex === index && styles.thumbnailActive
                    ]}
                  >
                    <Image
                      source={{ uri: img }}
                      style={styles.thumbnailImage}
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>

          {/* Content Section */}
          <View style={styles.content}>
            {/* Product Title & Category */}
            <Text style={styles.productName}>{product?.name}</Text>

            {/* Price & Rating Row */}
            <View style={styles.priceRatingRow}>
            <View style={styles.priceBlock}>
              <Text style={styles.discountedPrice}>{finalPrice.toLocaleString('vi-VN')}₫</Text>
              {product?.basePrice !== product?.discountPrice && (
                <View style={styles.priceSecondary}>
                  <Text style={styles.originalPrice}>{(product?.basePrice || 0).toLocaleString('vi-VN')}₫</Text>
                  <View style={styles.discountBadge}>
                    <Text style={styles.discountText}>{discountPercent}% OFF</Text>
                  </View>
                </View>
              )}
            </View>
              {/* Rating */}
              <View style={styles.ratingBlock}>
                <Text style={styles.starsLarge}>{starsDisplay}</Text>
                <Text style={styles.ratingCount}>({reviewCountToShow} ratings)</Text>
              </View>
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Color Selection */}
            <View style={styles.optionSection}>
              <Text style={styles.optionLabel}>Color</Text>
              <View style={styles.colorOptions}>
                {uniqueColors.map(color => (
                  <TouchableOpacity
                    key={color}
                    onPress={() => handleColorSelect(color)}
                    style={[
                      styles.colorButton,
                      selectedColor === color && styles.colorButtonSelected
                    ]}
                  >
                    <View style={[styles.colorCircle, { backgroundColor: color.toLowerCase() }]} />
                    <Text style={[
                      styles.colorText,
                      selectedColor === color && styles.colorTextSelected
                    ]}>{color}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Size Selection */}
            <View style={styles.optionSection}>
              <Text style={styles.optionLabel}>Size</Text>
              <View style={styles.sizeOptions}>
                {uniqueSizes.map(size => (
                  <TouchableOpacity
                    key={size}
                    onPress={() => setSelectedSize(size)}
                    style={[
                      styles.sizeButton,
                      selectedSize === size && styles.sizeButtonSelected
                    ]}
                  >
                    <Text style={[
                      styles.sizeText,
                      selectedSize === size && styles.sizeTextSelected
                    ]}>{size}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Quantity Selector */}
            <View style={styles.optionSection}>
              <Text style={styles.optionLabel}>Quantity</Text>
              <View style={styles.quantitySelector}>
                <TouchableOpacity 
                  onPress={decrementQuantity}
                  style={[styles.quantityBtn, quantity === 1 && styles.quantityBtnDisabled]}
                >
                  <Text style={styles.quantityBtnText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.quantityValue}>{quantity}</Text>
                <TouchableOpacity 
                  onPress={incrementQuantity}
                  style={[styles.quantityBtn, selectedVariant && quantity >= selectedVariant.validQuantity && styles.quantityBtnDisabled]}
                >
                  <Text style={styles.quantityBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            {selectedVariant && (
              <Text style={styles.stockText}>
                {selectedVariant.validQuantity > 0
                  ? `Còn ${selectedVariant.validQuantity} sản phẩm`
                  : 'Hết hàng'}
              </Text>
            )}

            {/* Divider */}
            <View style={styles.divider} />

            {/* Description */}
            <View style={styles.descriptionSection}>
              <Text style={styles.descriptionTitle}>Product Details</Text>
              <Text style={styles.description}>
                {product?.description || 'With soft, midweight knit fabric and a loose fit, this Jordan polo updates a wardrobe staple to give you everything you need in a collared, short-sleeve shirt.'}
              </Text>
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Reviews Section */}
            <View style={styles.reviewsSection}>
              <TouchableOpacity 
                onPress={() => setIsReviewsOpen(!isReviewsOpen)}
                style={styles.reviewsHeader}
              >
                <View style={styles.reviewsHeaderLeft}>
                  <Text style={styles.reviewsTitle}>Reviews ({reviewCountToShow})</Text>
                  <Text style={styles.summaryStars}>{starsDisplay}</Text>
                </View>
                <Ionicons 
                  name={isReviewsOpen ? "chevron-up" : "chevron-down"} 
                  size={20} 
                  color="#000" 
                />
              </TouchableOpacity>

              {isReviewsOpen && reviewCountToShow > 0 && (
                <View style={styles.reviewsList}>
                  {reviews.map((r, i) => {
                    const reviewDate = new Date(r.reviewDate);
                    const isValidDate = !isNaN(reviewDate.getTime());
                    const dateStr = isValidDate 
                      ? reviewDate.toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit' })
                      : 'N/A';
                    
                    return (
                      <View key={i} style={styles.reviewItem}>
                        <View style={styles.reviewHeader}>
                          <View style={styles.avatar}>
                            {r.customerAvatar ? (
                              <Image source={{ uri: r.customerAvatar }} style={{ width: 36, height: 36, borderRadius: 18 }} />
                            ) : (
                              <Ionicons name="person" size={18} color="#666" />
                            )}
                          </View>
                          <View style={styles.reviewInfo}>
                            <Text style={styles.reviewerName}>{r.customerName || 'User'}</Text>
                            <Text style={styles.reviewStars}>
                              {'★'.repeat(Math.round(r.rating))}
                              <Text style={styles.reviewStarsEmpty}>
                                {'☆'.repeat(5 - Math.round(r.rating))}
                              </Text>
                            </Text>
                          </View>
                          <Text style={styles.reviewDate}>{dateStr}</Text>
                        </View>
                        <Text style={styles.reviewComment}>{r.comment}</Text>
                        
                        {r.images && r.images.length > 0 && (
                          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.reviewImagesContainer}>
                            {r.images.map((img, imgIdx) => (
                              <TouchableOpacity key={imgIdx} onPress={() => setSelectedImageModal(img)}>
                                <Image 
                                  source={{ uri: img }} 
                                  style={styles.reviewImage}
                                  resizeMode="cover"
                                />
                              </TouchableOpacity>
                            ))}
                          </ScrollView>
                        )}
                      </View>
                    );
                  })}
                </View>
              )}
            </View>

            {/* Bottom Spacing */}
            <View style={{ height: 100 }} />
          </View>
        </ScrollView>

        {/* Bottom Action Bar */}
        <View style={styles.bottomBar}>
          <TouchableOpacity style={[styles.addToCartBtn, loadingCart && styles.btnDisabled]} 
            onPress={addToCart}
            disabled={loadingCart || !selectedVariant || selectedVariant.validQuantity <= 0}
          >
            {loadingCart ? (
              <ActivityIndicator size={20} color="#666" />
            ) : (
              <Ionicons name="cart-outline" size={24} color="#000" />
            )}
          </TouchableOpacity>
          <TouchableOpacity 
            style={[
              styles.buyNowBtn, 
              (loadingCart || !selectedVariant || selectedVariant.validQuantity <= 0) && styles.btnDisabled
            ]} 
            onPress={handleBuyNow}
            disabled={loadingCart || !selectedVariant || selectedVariant.validQuantity <= 0}
            activeOpacity={0.8}
          >
            {loadingCart ? (
              <ActivityIndicator size={20} color="#FFF" />
            ) : (
              <Text style={styles.buyNowText}>Buy Now</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Modal for Full Image */}
        <Modal
          visible={!!selectedImageModal}
          transparent
          animationType="fade"
          onRequestClose={() => setSelectedImageModal(null)}
        >
          <View style={styles.modalOverlay}>
            <TouchableOpacity 
              style={styles.modalClose} 
              onPress={() => setSelectedImageModal(null)}
            >
              <Ionicons name="close" size={32} color="#FFF" />
            </TouchableOpacity>
            <Image
              source={{ uri: selectedImageModal! }}
              style={styles.modalImage}
              resizeMode="contain"
            />
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: { 
    flex: 1, 
    backgroundColor: '#FFF' 
  },
  
  // Header
  headerButtons: { 
    position: 'absolute', 
    top: 50, 
    left: 0, 
    right: 0, 
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  headerBtn: { 
    backgroundColor: 'rgba(255,255,255,0.95)', 
    width: 40,
    height: 40,
    borderRadius: 20, 
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 12,
  },
  
  // Image Slider
  imageSliderContainer: { 
    backgroundColor: '#F8F8F8',
  },
  mainImage: { 
    width: SCREEN_WIDTH, 
    height: SCREEN_WIDTH * 1.2,
    backgroundColor: '#F0F0F0',
  },
  
  // Thumbnails
  thumbnailScroll: {
    backgroundColor: '#FFF',
  },
  thumbnailContainer: { 
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  thumbnailWrapper: { 
    borderRadius: 8, 
    overflow: 'hidden', 
    borderWidth: 2, 
    borderColor: '#E0E0E0',
    marginRight: 8,
  },
  thumbnailActive: { 
    borderColor: '#000',
    borderWidth: 2.5,
  },
  thumbnailImage: { 
    width: 56, 
    height: 56,
  },
  
  // Content
  content: { 
    padding: 20,
  },
  
  productName: { 
    fontSize: 22, 
    fontWeight: '700', 
    color: '#000',
    letterSpacing: -0.5,
  },
  category: { 
    fontSize: 13, 
    color: '#888', 
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  
  // Price & Rating
  priceRatingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 16,
  },
  priceBlock: {
    flex: 1,
  },
  discountedPrice: { 
    fontSize: 28, 
    fontWeight: '800', 
    color: '#000',
    letterSpacing: -1,
  },
  priceSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 8,
  },
  originalPrice: { 
    fontSize: 16, 
    color: '#999', 
    textDecorationLine: 'line-through',
  },
  discountBadge: { 
    backgroundColor: '#FF3B30',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  discountText: {
    fontSize: 12, 
    color: '#FFF', 
    fontWeight: '700',
  },
  
  ratingBlock: {
    alignItems: 'flex-end',
  },
  starsLarge: { 
    color: '#FFB800', 
    fontSize: 18,
    letterSpacing: 1,
  },
  ratingCount: { 
    marginTop: 2,
    color: '#666', 
    fontSize: 12,
  },
  
  // Divider
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 20,
  },
  
  // Options
  optionSection: {
    marginBottom: 20,
  },
  optionLabel: { 
    fontSize: 15, 
    fontWeight: '600', 
    marginBottom: 12,
    color: '#000',
  },
  
  // Colors
  colorOptions: { 
    flexDirection: 'row', 
    gap: 10,
    flexWrap: 'wrap',
  },
  colorButton: { 
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8, 
    paddingHorizontal: 14, 
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    borderWidth: 1.5,
    borderColor: '#F5F5F5',
    gap: 6,
  },
  colorButtonSelected: { 
    backgroundColor: '#FFF',
    borderColor: '#000',
  },
  colorCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  colorText: { 
    fontSize: 14, 
    color: '#666',
    fontWeight: '500',
  },
  colorTextSelected: { 
    color: '#000',
    fontWeight: '600',
  },
  
  // Sizes
  sizeOptions: { 
    flexDirection: 'row', 
    gap: 10,
  },
  sizeButton: { 
    width: 52, 
    height: 44, 
    borderRadius: 8, 
    borderWidth: 1.5, 
    borderColor: '#E0E0E0', 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  sizeButtonSelected: { 
    backgroundColor: '#000', 
    borderColor: '#000',
  },
  sizeText: { 
    fontSize: 15, 
    fontWeight: '600', 
    color: '#666',
  },
  sizeTextSelected: { 
    color: '#FFF',
  },
  
  // Quantity
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  quantityBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  quantityBtnDisabled: {
    opacity: 0.4,
  },
  quantityBtnText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
  },
  quantityValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    minWidth: 30,
    textAlign: 'center',
  },

  stockText: {
    fontSize: 15,
    color: '#666',
    marginTop: 8,
    fontStyle: 'italic',
  },
  
  // Description
  descriptionSection: {
    marginBottom: 8,
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#000',
  },
  description: { 
    fontSize: 14, 
    color: '#555', 
    lineHeight: 22,
  },
  
  // Reviews
  reviewsSection: { 
    marginBottom: 16,
  },
  reviewsHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    paddingVertical: 4,
  },
  reviewsHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  reviewsTitle: { 
    fontSize: 16, 
    fontWeight: '600',
    color: '#000',
  },
  summaryStars: { 
    color: '#FFB800', 
    fontSize: 14,
  },
  
  reviewsList: { 
    marginTop: 16,
    gap: 12,
  },
  reviewItem: { 
    backgroundColor: '#FAFAFA', 
    padding: 14, 
    borderRadius: 12,
  },
  reviewHeader: { 
    flexDirection: 'row', 
    alignItems: 'center',
    marginBottom: 8,
  },
  avatar: { 
    width: 36, 
    height: 36, 
    borderRadius: 18, 
    backgroundColor: '#E0E0E0', 
    justifyContent: 'center', 
    alignItems: 'center',
  },
  reviewInfo: {
    flex: 1,
    marginLeft: 10,
  },
  reviewerName: { 
    fontSize: 14, 
    fontWeight: '600',
    color: '#000',
  },
  reviewStars: { 
    color: '#FFB800', 
    fontSize: 12,
    marginTop: 2,
  },
  reviewStarsEmpty: {
    color: '#DDD',
  },
  reviewDate: { 
    fontSize: 11, 
    color: '#999',
  },
  reviewComment: { 
    fontSize: 13, 
    color: '#444', 
    lineHeight: 20,
  },
  
  reviewImagesContainer: {
    marginTop: 10,
    gap: 8,
  },
  reviewImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 8,
  },
  
  // Bottom Bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 8,
  },
  addToCartBtn: { 
    width: 56, 
    height: 56, 
    borderRadius: 28, 
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    justifyContent: 'center', 
    alignItems: 'center',
  },
  buyNowBtn: { 
    flex: 1, 
    height: 56, 
    backgroundColor: '#000', 
    borderRadius: 28, 
    justifyContent: 'center', 
    alignItems: 'center',
  },
  buyNowText: { 
    color: '#FFF', 
    fontSize: 17, 
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  
  // Modal
  modalOverlay: { 
    flex: 1, 
    backgroundColor: '#000', 
    justifyContent: 'center', 
    alignItems: 'center',
  },
  modalClose: { 
    position: 'absolute', 
    top: 50, 
    right: 20, 
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 8,
    borderRadius: 20,
  },
  modalImage: { 
    width: SCREEN_WIDTH, 
    height: SCREEN_WIDTH * 1.2,
  },

  btnDisabled: {
  opacity: 0.5,
},
});