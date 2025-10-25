import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Modal, ActivityIndicator, Dimensions} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { productService } from '@/services/product.service';
import { ProductResponse} from '@/types';
import ProductItem from '@/components/ProductItem';

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
          <Ionicons name="arrow-back" size={24} color="#000000" />
        </TouchableOpacity>

        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#666666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm sản phẩm..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#666666" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Ionicons name="search" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Toolbar: Filter & Sort */}
      <View style={styles.toolbar}>
        <TouchableOpacity 
          style={styles.toolbarButton} 
          onPress={() => setFilterModalVisible(true)}
        >
          <Ionicons name="filter" size={20} color="#000000" />
          <Text style={styles.toolbarButtonText}>Lọc</Text>
          {(minPrice || maxPrice || minRating || maxRating) && (
            <View style={styles.filterBadge} />
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.toolbarButton} 
          onPress={() => setSortModalVisible(true)}
        >
          <Ionicons name="swap-vertical" size={20} color="#000000" />
          <Text style={styles.toolbarButtonText}>
            {sortType === 'default' && 'Sắp xếp'}
            {sortType === 'price-asc' && 'Giá tăng'}
            {sortType === 'price-desc' && 'Giá giảm'}
            {sortType === 'rating-desc' && 'Đánh giá'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Result Info */}
      <View style={styles.resultInfo}>
        <Text style={styles.resultText}>
          {params.categoryId && 'Danh mục • '}
          Tìm thấy {sortedProducts.length} sản phẩm
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Fixed Header */}
      {renderHeader()}

      {/* Product List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000000" />
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
              <Ionicons name="search-outline" size={64} color="#CCCCCC" />
              <Text style={styles.emptyText}>Không tìm thấy sản phẩm</Text>
            </View>
          }
        />
      )}

      {/* Filter Modal */}
      <Modal
        visible={filterModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Bộ lọc</Text>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                <Ionicons name="close" size={24} color="#000000" />
              </TouchableOpacity>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Khoảng giá (VNĐ)</Text>
              <View style={styles.filterRow}>
                <TextInput
                  style={styles.filterInput}
                  placeholder="Từ"
                  value={minPrice}
                  onChangeText={setMinPrice}
                  keyboardType="numeric"
                />
                <Text style={styles.filterSeparator}>-</Text>
                <TextInput
                  style={styles.filterInput}
                  placeholder="Đến"
                  value={maxPrice}
                  onChangeText={setMaxPrice}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Đánh giá</Text>
              <View style={styles.filterRow}>
                <TextInput
                  style={styles.filterInput}
                  placeholder="Từ (0-5)"
                  value={minRating}
                  onChangeText={setMinRating}
                  keyboardType="decimal-pad"
                />
                <Text style={styles.filterSeparator}>-</Text>
                <TextInput
                  style={styles.filterInput}
                  placeholder="Đến (0-5)"
                  value={maxRating}
                  onChangeText={setMaxRating}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.clearButton} onPress={clearFilter}>
                <Text style={styles.clearButtonText}>Xóa bộ lọc</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.applyButton} onPress={applyFilter}>
                <Text style={styles.applyButtonText}>Áp dụng</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
              <Text style={styles.modalTitle}>Sắp xếp theo</Text>
              <TouchableOpacity onPress={() => setSortModalVisible(false)}>
                <Ionicons name="close" size={24} color="#000000" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.sortOption}
              onPress={() => {
                setSortType('default');
                setSortModalVisible(false);
              }}
            >
              <Text style={styles.sortOptionText}>Mặc định</Text>
              {sortType === 'default' && <Ionicons name="checkmark" size={24} color="#000000" />}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sortOption}
              onPress={() => {
                setSortType('price-asc');
                setSortModalVisible(false);
              }}
            >
              <Text style={styles.sortOptionText}>Giá: Thấp đến cao</Text>
              {sortType === 'price-asc' && <Ionicons name="checkmark" size={24} color="#000000" />}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sortOption}
              onPress={() => {
                setSortType('price-desc');
                setSortModalVisible(false);
              }}
            >
              <Text style={styles.sortOptionText}>Giá: Cao đến thấp</Text>
              {sortType === 'price-desc' && <Ionicons name="checkmark" size={24} color="#000000" />}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sortOption}
              onPress={() => {
                setSortType('rating-desc');
                setSortModalVisible(false);
              }}
            >
              <Text style={styles.sortOptionText}>Đánh giá cao nhất</Text>
              {sortType === 'rating-desc' && <Ionicons name="checkmark" size={24} color="#000000" />}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 25,
    backgroundColor: '#FFFFFF',
  },
  headerContainer: {
    backgroundColor: '#FFFFFF',
    paddingTop: 10,
    paddingHorizontal: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    marginBottom: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000000',
  },
  searchButton: {
    width: 48,
    height: 48,
    backgroundColor: '#000000',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toolbar: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  toolbarButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 6,
    position: 'relative',
  },
  toolbarButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  filterBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF3B30',
  },
  resultInfo: {
    paddingVertical: 8,
  },
  resultText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productRow: {
    justifyContent: 'space-between',
    padding: 10,
  },
  contentContainer: {
    paddingTop: 16,
    paddingBottom: 32,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    color: '#999999',
    marginTop: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
  },
  filterSection: {
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  filterInput: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#000000',
  },
  filterSeparator: {
    fontSize: 16,
    color: '#666666',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  clearButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#000000',
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },
  applyButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#000000',
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  sortOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  sortOptionText: {
    fontSize: 16,
    color: '#000000',
  },
});