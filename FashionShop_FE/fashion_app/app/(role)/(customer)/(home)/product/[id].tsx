import { View, Text, Button, Image, ScrollView, TouchableOpacity, FlatList, StyleSheet, Dimensions, Alert, Modal } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
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

import { useFocusEffect } from '@react-navigation/native';
import React from 'react';

export default function ProductDetailScreen() {
  const params = useLocalSearchParams();

  // Fetch reviews khi màn hình được mount và khi focus
  useEffect(() => {
    const interval = setInterval(() => {
      if (params.id) {
        fetchReviews();
      }
    }, 1000); // Fetch mỗi giây

    return () => clearInterval(interval);
  }, [params.id]);
  
  // Fetch reviews mỗi khi màn hình được focus
  useFocusEffect(
    React.useCallback(() => {
      // Fetch ngay khi màn hình được focus
      fetchReviews();
    }, [])
  );
  
  // Fetch reviews mỗi khi màn hình được focus
  useFocusEffect(
    React.useCallback(() => {
      // Fetch ngay khi màn hình được focus
      fetchReviews();
    }, [])
  );

  /* Lines 18-183 omitted */
  const { id } = useLocalSearchParams();
  const numberId = Number(id);
  const router = useRouter();

  const [product, setProduct] = useState<Product | null>(null);
  const [variants, setVariants] = useState<ProductVariantResponse[]>([]);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isReviewsOpen, setIsReviewsOpen] = useState(true);
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Array<{ rating: number; comment: string; reviewDate: string; images?: string[] }>>([]);
  
  // State cho modal xem ảnh
  const [selectedReviewImage, setSelectedReviewImage] = useState<string | null>(null);

  // Compute average rating (from fetched reviews if available, otherwise fallback to product average)
  const computedAverageRating = (() => {
    if (reviews && reviews.length > 0) {
      const sum = reviews.reduce((s, r) => s + (typeof r.rating === 'number' ? r.rating : Number(r.rating) || 0), 0);
      return sum / reviews.length;
    }
    return product?.averageRating || 0;
  })();

  const roundedStarsForDisplay = Math.max(0, Math.min(5, Math.round(computedAverageRating)));
  const starsDisplay = '★'.repeat(roundedStarsForDisplay) + '☆'.repeat(5 - roundedStarsForDisplay);
  const reviewCountToShow = reviews && reviews.length > 0 ? reviews.length : (0);

  // Fetch product and variants
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
      const endpoints = [
        `/reviews/product/${numberId}`,
        `/products/${numberId}/reviews`,
        `/reviews?productID=${numberId}`,
      ];
      for (const ep of endpoints) {
        try {
          const res = await api.get(ep);
          if (res?.data && Array.isArray(res.data)) {
            setReviews(res.data.map((r: any) => ({ rating: r.rating, comment: r.comment, reviewDate: r.reviewDate || r.review_date || r.reviewDate, images: r.images || [] })));
            return;
          }
        } catch (e) {
          // continue
        }
      }
      // fallback: mock data
      const mock = [
        { rating: 5, comment: 'Sản phẩm tuyệt vời, giao nhanh.', reviewDate: '2025-10-23T12:34:00', images: [] },
        { rating: 4, comment: 'Chất lượng ok, nhưng màu khác so với hình.', reviewDate: '2025-10-22T10:20:00', images: [] },
        { rating: 3, comment: 'Bình thường, giá hơi cao.', reviewDate: '2025-10-20T09:15:00', images: [] },
      ];
      setReviews(mock);
    } catch (err) {
      console.error('fetchReviews error', err);
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

  const handleBuyNow = () => {
    if (!selectedVariant) {
      alert('Vui lòng chọn màu sắc và kích cỡ');
      return;
    }

    if (selectedVariant.validQuantity <= 0) {
      alert('Sản phẩm này hiện đã hết hàng');
      return;
    }

    router.push({
      pathname: '/checkout',
      params: {
        productId: product?.productID,
        variantId: selectedVariant.variantID,
        productName: product?.name,
        color: selectedVariant.color,
        size: selectedVariant.size,
        price: finalPrice,
        image: selectedVariant.images[0] || product?.image,
        availableQuantity: selectedVariant.validQuantity,
      },
    });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Ionicons name="arrow-back" size={24} color="#000000" />
      </TouchableOpacity>

      <FlatList
        data={['content']}
        keyExtractor={(item) => item}
        showsVerticalScrollIndicator={false}
        renderItem={() => (
          <View>
            {/* Slide Banner */}
            <View style={styles.bannerWrapper}>
              <FlatList
                data={displayImages}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item, index) => `image-${index}`}
                onMomentumScrollEnd={(event) => {
                  const slideSize = event.nativeEvent.layoutMeasurement.width;
                  const index = Math.floor(event.nativeEvent.contentOffset.x / slideSize);
                  setCurrentImageIndex(index);
                }}
                renderItem={({ item }) => (
                  <View style={styles.imageContainer}>
                    <Image
                      source={{ uri: item || 'https://via.placeholder.com/400' }}
                      style={styles.bannerImage}
                      resizeMode="cover"
                    />
                  </View>
                )}
              />

              {displayImages.length > 1 && (
                <View style={styles.indicatorContainer}>
                  {displayImages.map((_, index) => (
                    <View
                      key={index}
                      style={[
                        styles.indicator,
                        currentImageIndex === index ? styles.activeIndicator : styles.inactiveIndicator,
                      ]}
                    />
                  ))}
                </View>
              )}
            </View>

            <View style={styles.content}>
              <Text style={styles.productName}>{product?.name}</Text>
              <Text style={styles.brand}>{product?.brand}</Text>

              <View style={styles.priceContainer}>
                <Text style={styles.price}>{finalPrice.toLocaleString('vi-VN')} ₫</Text>
                {product?.discountPrice !== product?.basePrice && (
                  <Text style={styles.originalPrice}>{product?.basePrice.toLocaleString('vi-VN')} ₫</Text>
                )}
              </View>

              <TouchableOpacity
                onPress={() => router.push('/(role)/(customer)/(profile)/referral')}
                style={styles.ratingContainer}
              >
                <Ionicons name="star" size={20} color="#FFD700" />
                <Text style={styles.rating}>
                  {reviewCountToShow > 0 ? `${starsDisplay} (${reviewCountToShow} đánh giá)` : 'Chưa có đánh giá nào'}
                </Text>
              </TouchableOpacity>

              <Text style={styles.sectionTitle}>Màu sắc</Text>
              <View style={styles.selectionContainer}>
                {uniqueColors.map(color => (
                  <TouchableOpacity
                    key={color}
                    onPress={() => handleColorSelect(color)}
                    style={[
                      styles.selectionButton,
                      selectedColor === color ? styles.selectedButton : styles.unselectedButton,
                    ]}
                  >
                    <Text
                      style={[
                        styles.selectionText,
                        selectedColor === color ? styles.selectedText : styles.unselectedText,
                      ]}
                    >
                      {color}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.sectionTitle}>Kích cỡ</Text>
              <View style={styles.selectionContainer}>
                {uniqueSizes.map(size => (
                  <TouchableOpacity
                    key={size}
                    onPress={() => setSelectedSize(size)}
                    style={[
                      styles.selectionButton,
                      selectedSize === size ? styles.selectedButton : styles.unselectedButton,
                    ]}
                  >
                    <Text
                      style={[
                        styles.selectionText,
                        selectedSize === size ? styles.selectedText : styles.unselectedText,
                      ]}
                    >
                      {size}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {selectedVariant && (
                <View style={styles.stockContainer}>
                  <Ionicons
                    name={selectedVariant.validQuantity > 10 ? "checkmark-circle" : "alert-circle"}
                    size={20}
                    color={selectedVariant.validQuantity > 10 ? "#4CAF50" : "#FF9800"}
                  />
                  <Text style={styles.stockText}>
                    {selectedVariant.validQuantity > 0
                      ? `Còn ${selectedVariant.validQuantity} sản phẩm`
                      : 'Hết hàng'}
                  </Text>
                </View>
              )}

              <Text style={styles.sectionTitle}>Mô tả</Text>
              <Text style={styles.detailText}>{product?.description}</Text>

              <Text style={styles.sectionTitle}>Chất liệu</Text>
              <Text style={styles.detailText}>{product?.material}</Text>

              <Text style={styles.sectionTitle}>Trạng thái</Text>
              <Text style={styles.detailText}>{product?.status}</Text>

              <Text style={styles.sectionTitle}>Ngày tạo</Text>
              <Text style={styles.detailText}>
                {new Date(product?.createdDate || '').toLocaleDateString('vi-VN')}
              </Text>

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    styles.addToCartButton,
                    (!selectedVariant || selectedVariant.validQuantity <= 0) && styles.disabledButton
                  ]}
                  onPress={async () => {
                    if (!user || !user.accountId) {
                      Alert.alert('Vui lòng đăng nhập trước khi thêm vào giỏ hàng');
                      return;
                    }

                    const variantId = (product && (product as any).productID) || numberId;
                    const result = await CartService.addToCart(user.accountId as number, variantId, 1);
                    if (result.success) {
                      Alert.alert('Thêm vào giỏ hàng thành công');
                    } else {
                      Alert.alert('Lỗi', result.message || 'Thêm vào giỏ hàng thất bại');
                    }
                  }}
                >
                  <Ionicons name="cart-outline" size={20} color="#000000" />
                  <Text style={[styles.actionButtonText, { color: '#000000' }]}>Thêm vào giỏ</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    styles.buyNowButton,
                    (!selectedVariant || selectedVariant.validQuantity <= 0) && styles.disabledButton
                  ]}
                  onPress={handleBuyNow}
                  disabled={!selectedVariant || selectedVariant.validQuantity <= 0}
                >
                  <Ionicons name="flash" size={20} color="#FFFFFF" />
                  <Text style={[styles.actionButtonText, { color: '#FFFFFF' }]}>Mua ngay</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Reviews Section */}
            <View style={styles.section}>
              <View style={styles.rowBetween}>
                <Text style={styles.sectionTitle}>Reviews</Text>
{/* Button đánh giá  */}
                <TouchableOpacity onPress={() => router.push({ pathname: '/product/reviews/[id]', params: { id: String(numberId) } })}>
                  <Text style={{ color: '#007AFF' }}>Đánh giá</Text>
                </TouchableOpacity>
              </View>
              <View style={{ marginTop: 8, flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ fontSize: 15, color: '#333' }}>
                  {reviewCountToShow > 0 ? `${starsDisplay} (${reviewCountToShow})` : 'Chưa có đánh giá nào'}
                </Text>
                {reviewCountToShow > 0 && (
                  <TouchableOpacity style={{ marginLeft: 12 }} onPress={async () => {
                    const willOpen = !isReviewsOpen;
                    setIsReviewsOpen(willOpen);
                    if (willOpen && reviews.length === 0) {
                      await fetchReviews();
                    }
                  }}>
                    <Ionicons name={isReviewsOpen ? 'chevron-up' : 'chevron-down'} size={18} color="#007AFF" />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Reviews list (expandable) - chỉ hiển thị khi có đánh giá */}
            {isReviewsOpen && reviewCountToShow > 0 && (
              <View style={[styles.section, { marginTop: 12 }]}>
                {reviews.length === 0 ? (
                  <Text style={{ color: '#666', fontSize: 14 }}>Chưa có đánh giá</Text>
                ) : (
                  reviews.map((r, i) => (
                    <View key={i} style={styles.reviewItem}>
                      <View style={styles.reviewHeader}>
                        <View style={styles.reviewerAvatar}>
                          <Text style={styles.reviewerInitial}>{(r as any).userName ? (r as any).userName.charAt(0).toUpperCase() : 'U'}</Text>
                        </View>
                        <View style={{ flex: 1, marginLeft: 8 }}>
                          <Text style={styles.reviewerName}>{(r as any).userName || 'Người dùng'}</Text>
                          <Text style={styles.reviewStars}>{'★'.repeat(Math.max(0, Math.min(5, Math.round(r.rating)))) + '☆'.repeat(5 - Math.max(0, Math.min(5, Math.round(r.rating))))}</Text>
                        </View>
                        <Text style={styles.reviewDate}>{new Date(r.reviewDate).toLocaleString()}</Text>
                      </View>
                      <Text style={styles.reviewComment}>{r.comment}</Text>
                      {r.images && r.images.length > 0 && (
                        <FlatList 
                          data={r.images} 
                          horizontal 
                          keyExtractor={(it, idx) => String(idx)} 
                          renderItem={({ item }) => (
                            <TouchableOpacity onPress={() => setSelectedReviewImage(item)}>
                              <Image source={{ uri: item }} style={styles.reviewImage} />
                            </TouchableOpacity>
                          )} 
                        />
                      )}
                    </View>
                  ))
                )}
              </View>
            )}
          </View>
        )}
      />

      {/* Modal xem ảnh to */}
      <Modal
        visible={selectedReviewImage !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedReviewImage(null)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity 
            style={styles.modalBackdrop} 
            activeOpacity={1}
            onPress={() => setSelectedReviewImage(null)}
          >
            <View style={styles.modalContent}>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setSelectedReviewImage(null)}
              >
                <Ionicons name="close" size={30} color="#FFFFFF" />
              </TouchableOpacity>
              {selectedReviewImage && (
                <Image 
                  source={{ uri: selectedReviewImage }} 
                  style={styles.fullImage}
                  resizeMode="contain"
                />
              )}
            </View>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 16,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  bannerWrapper: {
    position: 'relative',
    backgroundColor: '#F5F5F5',
  },
  imageContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  indicatorContainer: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeIndicator: {
    backgroundColor: '#000000',
    width: 24,
  },
  inactiveIndicator: {
    backgroundColor: '#CCCCCC',
  },
  content: {
    padding: 16,
  },
  productName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  brand: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
  },
  price: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
  },
  originalPrice: {
    fontSize: 18,
    color: '#999999',
    textDecorationLine: 'line-through',
    marginLeft: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
    paddingVertical: 8,
  },
  rating: {
    fontSize: 16,
    color: '#000000',
    marginLeft: 6,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    marginTop: 20,
    marginBottom: 12,
  },
  selectionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectionButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedButton: {
    backgroundColor: '#000000',
    borderWidth: 2,
    borderColor: '#000000',
  },
  unselectedButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  selectionText: {
    fontSize: 15,
    fontWeight: '600',
  },
  selectedText: {
    color: '#FFFFFF',
  },
  unselectedText: {
    color: '#000000',
  },
  stockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    gap: 8,
  },
  stockText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333333',
  },
  detailText: {
    fontSize: 15,
    color: '#333333',
    lineHeight: 22,
    marginBottom: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 24,
    marginBottom: 32,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  addToCartButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#000000',
  },
  buyNowButton: {
    backgroundColor: '#000000',
    borderWidth: 2,
    borderColor: '#000000',
  },
  disabledButton: {
    opacity: 0.5,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  section: { 
    marginTop: 20,
    paddingHorizontal: 16,
  },
  rowBetween: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  // Reviews styles - ĐÃ SỬA: Loại bỏ padding cố định, để nội dung tự động co dãn
  reviewItem: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  reviewHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 8 
  },
  reviewerAvatar: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    backgroundColor: '#F5F5F5', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  reviewerInitial: { 
    fontSize: 16, 
    fontWeight: '700', 
    color: '#333' 
  },
  reviewerName: { 
    fontSize: 14, 
    fontWeight: '700', 
    color: '#111' 
  },
  reviewStars: { 
    color: '#F5A623', 
    marginTop: 2,
    fontSize: 14,
  },
  reviewDate: { 
    fontSize: 12, 
    color: '#666' 
  },
  reviewComment: { 
    marginTop: 4, 
    color: '#333', 
    lineHeight: 20,
    marginBottom: 4,
  },
  reviewImage: { 
    width: 80, 
    height: 80, 
    marginRight: 8, 
    marginTop: 8, 
    borderRadius: 8 
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH,
  },
});