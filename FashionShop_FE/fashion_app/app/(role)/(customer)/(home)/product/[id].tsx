import { View, Text, Button, Image, ScrollView, TouchableOpacity, FlatList, StyleSheet, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { productService } from '@/services/product.service';
import { productVariantService } from '@/services/productvariant.service';
import { Product, ProductVariantResponse } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Routes } from '@/constants';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const numberId = Number(id);
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [variants, setVariants] = useState<ProductVariantResponse[]>([]);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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

        // Set default selections
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

  // Get unique colors (only available ones)
  const uniqueColors = Array.from(
    new Set(variants.filter(v => v.validQuantity > 0).map(v => v.color))
  );
  
  // Get unique sizes for selected color (only available ones)
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

  // Get images based on selected color
  const getDisplayImages = () => {
    if (!product || !selectedColor) return [];
    
    // Chỉ lấy ảnh từ variants có màu được chọn
    const colorVariants = variants.filter(v => v.color === selectedColor);
    const variantImages = colorVariants.flatMap(v => 
      v.images.filter(img => img && img.trim() !== '')
    );
    
    // Nếu không có ảnh variant, fallback về ảnh product
    return variantImages.length > 0 ? variantImages : [product.image].filter(img => img);
  };

  const displayImages = getDisplayImages();

  // Calculate final price based on selected variant
  const selectedVariant = variants.find(
    v => v.color === selectedColor && v.size === selectedSize
  );
  const finalPrice = selectedVariant
    ? (product?.discountPrice || 0) + selectedVariant.priceAdjustment
    : product?.discountPrice || 0;

  // Handle color selection - reset size and image when changing color
  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    setCurrentImageIndex(0);
    
    // Auto select first available size for this color
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

  // Handle add to cart
  const handleAddToCart = () => {
    if (!selectedVariant) {
      alert('Vui lòng chọn màu sắc và kích cỡ');
      return;
    }
    
    if (selectedVariant.validQuantity <= 0) {
      alert('Sản phẩm này hiện đã hết hàng');
      return;
    }
    
    router.push({
      pathname: '/(role)/(customer)/(cart)',
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

  // Handle buy now
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
      {/* Back Button */}
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
              
              {/* Image Indicator */}
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
        {/* Product Name and Brand */}
        <Text style={styles.productName}>{product?.name}</Text>
        <Text style={styles.brand}>{product?.brand}</Text>

        {/* Price */}
        <View style={styles.priceContainer}>
          <Text style={styles.price}>{finalPrice.toLocaleString('vi-VN')} ₫</Text>
          {product?.discountPrice !== product?.basePrice && (
            <Text style={styles.originalPrice}>{product?.basePrice.toLocaleString('vi-VN')} ₫</Text>
          )}
        </View>

        {/* Rating */}
        <TouchableOpacity
          onPress={() => router.push('/(role)/(customer)/(profile)/referral')}
          style={styles.ratingContainer}
        >
          <Ionicons name="star" size={20} color="#FFD700" />
          <Text style={styles.rating}>
            {product?.averageRating.toFixed(1)} ({product?.reviewCount} đánh giá)
          </Text>
        </TouchableOpacity>

        {/* Color Selection */}
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

        {/* Size Selection */}
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

        {/* Stock Quantity */}
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

        {/* Product Details */}
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

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[
              styles.actionButton, 
              styles.addToCartButton,
              (!selectedVariant || selectedVariant.validQuantity <= 0) && styles.disabledButton
            ]} 
            onPress={handleAddToCart}
            disabled={!selectedVariant || selectedVariant.validQuantity <= 0}
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
          </View>
        )}
      />
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
});