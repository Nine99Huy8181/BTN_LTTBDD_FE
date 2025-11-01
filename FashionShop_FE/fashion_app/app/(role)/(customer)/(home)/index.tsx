import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { productService } from '@/services/product.service';
import { categoryService } from '@/services/category.service';
import { ProductResponse, Category } from '@/types';
import { Routes } from '@/constants';
import BannerSlider from '@/components/BannerSlider';
import FeaturedProducts from '@/components/FeaturedProducts';
import CategoryList from '@/components/CategoryList';
import ProductItem from '@/components/ProductItem';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/AuthContext';
import FilterModal from '@/components/FilterModal';


export default function HomeScreen() {
  const {user} = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minRating, setMinRating] = useState('');
  const [maxRating, setMaxRating] = useState('');
  
  const fetchData = async () => {
    try {
      const [productData, categoryData] = await Promise.all([
        productService.getAllProducts(),
        categoryService.getAllCategories(),
      ]);
      setProducts(productData);
      setCategories(categoryData);
      setError(null);
    } catch (err) {
      setError('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`${Routes.CustomerSearch}?keyword=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleFilter = () => {
    setFilterModalVisible(true);
  };

  const applyFilter = () => {
    const params = new URLSearchParams();

    if (searchQuery.trim()) {
      params.append('keyword', searchQuery.trim());
    }
    if (minPrice.trim()) {
      params.append('minPrice', minPrice.trim());
    }
    if (maxPrice.trim()) {
      params.append('maxPrice', maxPrice.trim());
    }
    if (minRating.trim()) {
      params.append('minRating', minRating.trim());
    }
    if (maxRating.trim()) {
      params.append('maxRating', maxRating.trim());
    }

    router.push(`${Routes.CustomerSearch}?${params.toString()}`);
    setFilterModalVisible(false);
  };

  const clearFilter = () => {
    setMinPrice('');
    setMaxPrice('');
    setMinRating('');
    setMaxRating('');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000000" />
        <Text style={styles.loadingText}>Đang tải...</Text>
      </View>
    );
  }

  const ListHeaderComponent = () => (
    <>
      {/* Banner Slider */}
      <BannerSlider />

      {/* Category List */}
      <CategoryList categories={categories} />

      {/* Featured Products */}
      <FeaturedProducts products={products} />

      {/* All Products Section Header */}
      <View style={styles.allProductsSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Tất cả sản phẩm</Text>
          <View style={styles.titleUnderline} />
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={styles.error}>{error}</Text>
          </View>
        )}
      </View>
    </>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Fashion Store</Text>
        <TouchableOpacity style={styles.chatbotButton} activeOpacity={0.7}>
          <Ionicons name="chatbubble-ellipses-outline" size={24} color="#000000" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#999999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="What are you looking for... ?"
            placeholderTextColor="#CCCCCC"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#999999" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.filterButton} onPress={handleFilter} activeOpacity={0.7}>
          <Ionicons name="options-outline" size={22} color="#000000" />
        </TouchableOpacity>
      </View>
      
      <FlatList
        style={styles.container}
        data={products}
        renderItem={({ item }) => <ProductItem product={item} accountId={user?.accountId}/>}
        keyExtractor={(item) => item.productID.toString()}
        numColumns={2}
        columnWrapperStyle={styles.productRow}
        ListHeaderComponent={ListHeaderComponent}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#000000" />
        }
      />

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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666666',
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '400',
    color: '#000000',
    fontStyle: 'italic',
    letterSpacing: 0.5,
  },
  chatbotButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    gap: 8,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 16,
    height: 44,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#000000',
  },
  filterButton: {
    width: 44,
    height: 44,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  allProductsSection: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 16,
  },
  sectionHeader: {
    marginBottom: 20,
  },
  sectionTitle: {
  fontSize: 20,
  fontWeight: '400',
  color: '#000000',
  letterSpacing: 0.5,
  fontFamily: 'serif',
},
  titleUnderline: {
    width: 32,
    height: 2,
    backgroundColor: '#000000',
    marginTop: 4,
  },
  productRow: {
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
    borderWidth: 1,
    borderColor: '#FFE0E0',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  errorIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  error: {
    color: '#CC0000',
    fontSize: 14,
    flex: 1,
    fontWeight: '500',
  },
});