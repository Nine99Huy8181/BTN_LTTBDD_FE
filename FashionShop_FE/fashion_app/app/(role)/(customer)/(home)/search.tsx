import FilterModal from '@/components/FilterModal';
import ProductItem from '@/components/ProductItem';
import { productService } from '@/services/product.service';
import { ProductResponse } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const SCREEN_WIDTH = Dimensions.get('window').width;

export interface ProductSearchParams {
  keyword?: string;
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  maxRating?: number;
}

type SortType = 'default' | 'price-asc' | 'price-desc' | 'rating-desc';

export default function SearchScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [sortModalVisible, setSortModalVisible] = useState(false);

  // Filter states
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minRating, setMinRating] = useState('');
  const [maxRating, setMaxRating] = useState('');

  // Sort state
  const [sortType, setSortType] = useState<SortType>('default');

  // Current search params (internal state)
  const [currentParams, setCurrentParams] = useState<ProductSearchParams>({});

  // Load params from route only once
  useEffect(() => {
    const initialParams: ProductSearchParams = {};

    if (params.keyword) {
      const keyword = decodeURIComponent(params.keyword as string);
      setSearchQuery(keyword);
      initialParams.keyword = keyword;
    }
    if (params.categoryId) {
      initialParams.categoryId = Number(params.categoryId);
    }
    if (params.minPrice) {
      setMinPrice(params.minPrice as string);
      initialParams.minPrice = Number(params.minPrice);
    }
    if (params.maxPrice) {
      setMaxPrice(params.maxPrice as string);
      initialParams.maxPrice = Number(params.maxPrice);
    }
    if (params.minRating) {
      setMinRating(params.minRating as string);
      initialParams.minRating = Number(params.minRating);
    }
    if (params.maxRating) {
      setMaxRating(params.maxRating as string);
      initialParams.maxRating = Number(params.maxRating);
    }

    setCurrentParams(initialParams);
  }, []); // Only run once on mount

  // Fetch products when currentParams changes
  useEffect(() => {
    if (Object.keys(currentParams).length > 0) {
      fetchProducts(currentParams);
    }
  }, [currentParams]);

  const fetchProducts = async (searchParams: ProductSearchParams) => {
    setLoading(true);
    try {
      let result: ProductResponse[];

      // Nếu có categoryId, ưu tiên lấy theo category
      if (searchParams.categoryId) {
        result = await productService.getProductsByCategoryId(searchParams.categoryId);

        // Áp dụng các filter khác nếu có
        if (searchParams.keyword) {
          result = result.filter(p =>
            p.name.toLowerCase().includes(searchParams.keyword!.toLowerCase())
          );
        }
        if (searchParams.minPrice !== undefined) {
          result = result.filter(p => p.discountPrice >= searchParams.minPrice!);
        }
        if (searchParams.maxPrice !== undefined) {
          result = result.filter(p => p.discountPrice <= searchParams.maxPrice!);
        }
        if (searchParams.minRating !== undefined) {
          result = result.filter(p => p.averageRating >= searchParams.minRating!);
        }
        if (searchParams.maxRating !== undefined) {
          result = result.filter(p => p.averageRating <= searchParams.maxRating!);
        }
      } else {
        // Không có categoryId, dùng searchProducts bình thường
        result = await productService.searchProducts(searchParams);
      }

      setProducts(result);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle search - update internal state only
  const handleSearch = () => {
    if (!searchQuery.trim()) return;

    const newParams: ProductSearchParams = {
      keyword: searchQuery.trim(),
    };

    // Keep categoryId if exists
    if (params.categoryId) {
      newParams.categoryId = Number(params.categoryId);
    }

    // Keep existing filters
    if (minPrice) newParams.minPrice = Number(minPrice);
    if (maxPrice) newParams.maxPrice = Number(maxPrice);
    if (minRating) newParams.minRating = Number(minRating);
    if (maxRating) newParams.maxRating = Number(maxRating);

    setCurrentParams(newParams);
  };

  // Apply filter - update internal state only
  const applyFilter = () => {
    const newParams: ProductSearchParams = {};

    // Keep search keyword
    if (searchQuery.trim()) {
      newParams.keyword = searchQuery.trim();
    }

    // Keep categoryId if exists
    if (params.categoryId) {
      newParams.categoryId = Number(params.categoryId);
    }

    if (minPrice.trim()) {
      newParams.minPrice = Number(minPrice);
    }
    if (maxPrice.trim()) {
      newParams.maxPrice = Number(maxPrice);
    }
    if (minRating.trim()) {
      newParams.minRating = Number(minRating);
    }
    if (maxRating.trim()) {
      newParams.maxRating = Number(maxRating);
    }

    setCurrentParams(newParams);
    setFilterModalVisible(false);
  };

  // Clear filter
  const clearFilter = () => {
    setMinPrice('');
    setMaxPrice('');
    setMinRating('');
    setMaxRating('');
  };

  // Sort products
  const getSortedProducts = () => {
    const sorted = [...products];

    switch (sortType) {
      case 'price-asc':
        return sorted.sort((a, b) => a.discountPrice - b.discountPrice);
      case 'price-desc':
        return sorted.sort((a, b) => b.discountPrice - a.discountPrice);
      case 'rating-desc':
        return sorted.sort((a, b) => b.averageRating - a.averageRating);
      default:
        return sorted;
    }
  };

  const sortedProducts = getSortedProducts();

  // Render header (fixed)
  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>

        <View style={styles.searchInputContainer}>
          <Ionicons name="search-outline" size={20} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Bạn đang muốn mua gì...?"
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearIconButton}>
              <Ionicons name="close-circle" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Toolbar: Filter & Sort */}
      <View style={styles.toolbar}>
        <TouchableOpacity
          style={[
            styles.toolbarButton,
            (minPrice || maxPrice || minRating || maxRating) && styles.toolbarButtonActive
          ]}
          onPress={() => setFilterModalVisible(true)}
        >
          <Ionicons
            name="options-outline"
            size={18}
            color={(minPrice || maxPrice || minRating || maxRating) ? "#1A1A1A" : "#6B7280"}
          />
          <Text style={[
            styles.toolbarButtonText,
            (minPrice || maxPrice || minRating || maxRating) && styles.toolbarButtonTextActive
          ]}>Filter</Text>
          {(minPrice || maxPrice || minRating || maxRating) && (
            <View style={styles.filterBadge} />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.toolbarButton,
            sortType !== 'default' && styles.toolbarButtonActive
          ]}
          onPress={() => setSortModalVisible(true)}
        >
          <Ionicons
            name="swap-vertical-outline"
            size={18}
            color={sortType !== 'default' ? "#1A1A1A" : "#6B7280"}
          />
          <Text style={[
            styles.toolbarButtonText,
            sortType !== 'default' && styles.toolbarButtonTextActive
          ]}>
            {sortType === 'default' && 'Sort'}
            {sortType === 'price-asc' && 'Price ↑'}
            {sortType === 'price-desc' && 'Price ↓'}
            {sortType === 'rating-desc' && 'Rating'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Result Info */}
      {sortedProducts.length > 0 && (
        <View style={styles.resultInfo}>
          <Text style={styles.resultText}>
            {sortedProducts.length} {sortedProducts.length === 1 ? 'Product' : 'Products'} Found
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Fixed Header */}
        {renderHeader()}

        {/* Product List */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1A1A1A" />
            <Text style={styles.loadingText}>Searching products...</Text>
          </View>
        ) : (
          <FlatList
            data={sortedProducts}
            renderItem={({ item }) => <ProductItem product={item} />}
            keyExtractor={(item) => item.productID.toString()}
            numColumns={2}
            columnWrapperStyle={styles.productRow}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconContainer}>
                  <Ionicons name="search-outline" size={64} color="#D1D5DB" />
                </View>
                <Text style={styles.emptyTitle}>No Products Found</Text>
                <Text style={styles.emptySubtitle}>Try adjusting your search or filter to find what you're looking for</Text>
              </View>
            }
          />
        )}

        {/* Filter Modal */}
        <FilterModal
          visible={filterModalVisible}
          onClose={() => setFilterModalVisible(false)}
          minPrice={minPrice}
          maxPrice={maxPrice}
          minRating={minRating}
          maxRating={maxRating}
          setMinPrice={setMinPrice}
          setMaxPrice={setMaxPrice}
          setMinRating={setMinRating}
          setMaxRating={setMaxRating}
          onClear={clearFilter}
          onApply={applyFilter}
        />

        {/* Sort Modal */}
        <Modal
          visible={sortModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setSortModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Sort By</Text>
                <TouchableOpacity
                  onPress={() => setSortModalVisible(false)}
                  style={styles.closeButton}
                >
                  <Ionicons name="close" size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.sortOption}
                onPress={() => {
                  setSortType('default');
                  setSortModalVisible(false);
                }}
              >
                <View style={styles.sortOptionLeft}>
                  <Ionicons name="apps-outline" size={20} color="#6B7280" />
                  <Text style={[
                    styles.sortOptionText,
                    sortType === 'default' && styles.sortOptionTextActive
                  ]}>Default</Text>
                </View>
                {sortType === 'default' && (
                  <View style={styles.checkmarkCircle}>
                    <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.sortOption}
                onPress={() => {
                  setSortType('price-asc');
                  setSortModalVisible(false);
                }}
              >
                <View style={styles.sortOptionLeft}>
                  <Ionicons name="arrow-up-outline" size={20} color="#6B7280" />
                  <Text style={[
                    styles.sortOptionText,
                    sortType === 'price-asc' && styles.sortOptionTextActive
                  ]}>Price: Low to High</Text>
                </View>
                {sortType === 'price-asc' && (
                  <View style={styles.checkmarkCircle}>
                    <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.sortOption}
                onPress={() => {
                  setSortType('price-desc');
                  setSortModalVisible(false);
                }}
              >
                <View style={styles.sortOptionLeft}>
                  <Ionicons name="arrow-down-outline" size={20} color="#6B7280" />
                  <Text style={[
                    styles.sortOptionText,
                    sortType === 'price-desc' && styles.sortOptionTextActive
                  ]}>Price: High to Low</Text>
                </View>
                {sortType === 'price-desc' && (
                  <View style={styles.checkmarkCircle}>
                    <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.sortOption, styles.sortOptionLast]}
                onPress={() => {
                  setSortType('rating-desc');
                  setSortModalVisible(false);
                }}
              >
                <View style={styles.sortOptionLeft}>
                  <Ionicons name="star-outline" size={20} color="#6B7280" />
                  <Text style={[
                    styles.sortOptionText,
                    sortType === 'rating-desc' && styles.sortOptionTextActive
                  ]}>Highest Rating</Text>
                </View>
                {sortType === 'rating-desc' && (
                  <View style={styles.checkmarkCircle}>
                    <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                  </View>
                )}
              </TouchableOpacity>
            </View>
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
    paddingTop: 20,
    backgroundColor: '#FFFFFF',
  },
  headerContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 50,
    paddingHorizontal: 20,
    height: 50,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1A1A1A',
    fontWeight: '400',
  },
  clearIconButton: {
    padding: 4,
  },
  toolbar: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  toolbarButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 50,
    gap: 8,
    position: 'relative',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  toolbarButtonActive: {
    backgroundColor: '#F9FAFB',
    borderColor: '#1A1A1A',
  },
  toolbarButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  toolbarButtonTextActive: {
    color: '#1A1A1A',
    fontWeight: '600',
  },
  filterBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
  },
  resultInfo: {
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  resultText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 15,
    color: '#6B7280',
    fontWeight: '500',
  },
  productRow: {
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    gap: 16,
  },
  contentContainer: {
    paddingTop: 8,
    paddingBottom: 32,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 22,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 24,
    paddingBottom: 40,
    paddingHorizontal: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: '#F9FAFB',
  },
  filterSection: {
    marginBottom: 24,
  },
  filterLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  filterInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  inputPrefix: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    marginRight: 8,
  },
  ratingIcon: {
    marginRight: 8,
  },
  filterInput: {
    flex: 1,
    fontSize: 15,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  filterDivider: {
    width: 20,
    height: 2,
    backgroundColor: '#E5E7EB',
    borderRadius: 1,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 32,
  },
  clearButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 50,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  clearButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
  },
  applyButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 50,
    backgroundColor: '#1A1A1A',
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  sortOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  sortOptionLast: {
    borderBottomWidth: 0,
  },
  sortOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sortOptionText: {
    fontSize: 15,
    color: '#6B7280',
    fontWeight: '500',
  },
  sortOptionTextActive: {
    color: '#1A1A1A',
    fontWeight: '600',
  },
  checkmarkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
  },
});