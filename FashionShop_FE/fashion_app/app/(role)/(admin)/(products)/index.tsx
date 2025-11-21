// screens/ProductManagementScreen.tsx
import { productService } from "@/services/product.service";
import { ProductResponse } from "@/types";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// 1. Định nghĩa lại Brands (Có nút Tất cả làm mặc định)
const BRAND_OPTIONS = [
  { label: "Tất cả", value: "all" },
  { label: "Việt Shop", value: "Việt Shop" },
  { label: "Việt Shop 2", value: "Việt Shop 2" },
];

// 2. Định nghĩa lại 4 kiểu Sort cũ của bạn
const SORT_OPTIONS = [
  { label: "Mặc định", value: "none" },
  { label: "Giá tăng ↑", value: "priceAsc" },
  { label: "Giá giảm ↓", value: "priceDesc" },
  { label: "Đánh giá ⭐", value: "rating" },
  { label: "Đã bán 🔥", value: "sold" },
];

export default function ProductManagementScreen() {
  const router = useRouter();

  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // State bộ lọc
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("all"); // Mặc định là 'all'
  const [sortBy, setSortBy] = useState("none");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productService.getAllProducts();
      setProducts(response);
    } catch (error) {
      Alert.alert("Lỗi", "Không thể tải danh sách sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const response = await productService.getAllProducts();
      setProducts(response);
    } catch (error) {
      Alert.alert("Lỗi", "Không thể làm mới danh sách sản phẩm");
    } finally {
      setRefreshing(false);
    }
  };

  // ----------------
  // LOGIC LỌC & SẮP XẾP
  // ----------------
  const filteredProducts = useMemo(() => {
    let data = [...products];

    // 1. Search
    if (searchQuery.trim() !== "") {
      data = data.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // 2. Brand Filter (Logic nút "Tất cả")
    if (selectedBrand !== "all") {
      data = data.filter((p) => p.brand === selectedBrand);
    }

    // 3. Sort (4 cases cũ của bạn)
    switch (sortBy) {
      case "priceAsc":
        data.sort((a, b) => a.discountPrice - b.discountPrice);
        break;
      case "priceDesc":
        data.sort((a, b) => b.discountPrice - a.discountPrice);
        break;
      case "rating":
        data.sort((a, b) => b.averageRating - a.averageRating);
        break;
      case "sold":
        data.sort((a, b) => b.soldQuantity - a.soldQuantity);
        break;
      default:
        // 'none' hoặc các trường hợp khác thì giữ nguyên thứ tự API
        break;
    }

    return data;
  }, [products, searchQuery, selectedBrand, sortBy]);

  // ----------------
  // XÓA SẢN PHẨM
  // ----------------
  const deleteProduct = (id: number) => {
    Alert.alert("Xác nhận", "Bạn có chắc muốn xóa sản phẩm này?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          try {
            await productService.deleteProduct(id);
            fetchProducts(); // Load lại dữ liệu sau khi xóa
          } catch (error) {
            Alert.alert("Lỗi", "Không thể xóa sản phẩm");
          }
        },
      },
    ]);
  };

  // ----------------
  // RENDER ITEM
  // ----------------
  const renderProductItem = ({ item }: { item: ProductResponse }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        router.push(
          `/(role)/(admin)/(products)/detail-product/${item.productID}`
        )
      }
    >
      {/* Header Card */}
      <View style={styles.cardHeader}>
        <Text style={styles.productName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.priceTag}>
          {item.discountPrice.toLocaleString()} ₫
        </Text>
      </View>

      {/* Body Card */}
      <View style={styles.cardBody}>
        <Text style={styles.info}>Thương hiệu: {item.brand}</Text>
        <View style={styles.rowInfo}>
          <Text style={styles.info}>⭐ {item.averageRating.toFixed(1)}</Text>
          <Text style={[styles.info, { marginLeft: 15 }]}>
            Đã bán: {item.soldQuantity}
          </Text>
        </View>
      </View>

      {/* Footer Card (Actions) */}
      <View style={styles.cardFooter}>
        <TouchableOpacity
          style={styles.actionButtonOutline}
          onPress={() =>
            router.push(
              `/(role)/(admin)/(products)/edit-product/${item.productID}`
            )
          }
        >
          <Text style={styles.actionButtonTextOutline}>Sửa</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButtonOutline, styles.deleteButton]}
          onPress={() => deleteProduct(item.productID)}
        >
          <Text style={[styles.actionButtonTextOutline, { color: "#FF3B30" }]}>
            Xóa
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#000" />
        <Text style={{ marginTop: 10 }}>Đang tải dữ liệu...</Text>
      </View>
    );

  return (
    <View style={styles.container}>
      {/* 🔹 Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Quản lý sản phẩm</Text>
          <View style={styles.titleLine} />
        </View>
        <TouchableOpacity
          style={styles.addButtonSmall}
          onPress={() => router.push("/(role)/(admin)/(products)/add-product")}
        >
          <Text style={styles.addButtonText}>+ Thêm</Text>
        </TouchableOpacity>
      </View>

      {/* 🔹 Search */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm tên sản phẩm..."
          placeholderTextColor="#666"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* 🔹 Filter Section (Thương hiệu) */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionLabel}>Thương hiệu:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {BRAND_OPTIONS.map((brand) => (
            <TouchableOpacity
              key={brand.value}
              onPress={() => setSelectedBrand(brand.value)}
              style={[
                styles.filterButton,
                selectedBrand === brand.value && styles.filterButtonActive,
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedBrand === brand.value && styles.filterTextActive,
                ]}
              >
                {brand.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* 🔹 Sort Section (Sắp xếp - 4 tiêu chí cũ) */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionLabel}>Sắp xếp:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {SORT_OPTIONS.map((sort) => (
            <TouchableOpacity
              key={sort.value}
              onPress={() => setSortBy(sort.value)}
              style={[
                styles.filterButton,
                styles.sortButton, // Style viền riêng cho nút sort
                sortBy === sort.value && styles.filterButtonActive,
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  sortBy === sort.value && styles.filterTextActive,
                ]}
              >
                {sort.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* 🔹 List */}
      {filteredProducts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Không tìm thấy sản phẩm nào.</Text>
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          renderItem={renderProductItem}
          keyExtractor={(item) => item.productID.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </View>
  );
}

// ------------------------
// STYLES
// ------------------------
const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 40,
    backgroundColor: "#fff",
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  // Header
  header: {
    marginBottom: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111",
  },
  titleLine: {
    width: 40,
    height: 3,
    backgroundColor: "#000",
    borderRadius: 2,
    marginTop: 5,
  },
  addButtonSmall: {
    backgroundColor: "#000",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },

  // Search
  searchContainer: {
    marginBottom: 10,
  },
  searchInput: {
    height: 45,
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    paddingHorizontal: 15,
    fontSize: 15,
  },

  // Section Labels & Filters
  sectionContainer: {
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666",
    marginBottom: 6,
    marginLeft: 2,
  },
  filterButton: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  sortButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#eee",
  },
  filterButtonActive: {
    backgroundColor: "#000",
    borderColor: "#000",
  },
  filterText: {
    color: "#000",
    fontWeight: "500",
    fontSize: 13,
  },
  filterTextActive: {
    color: "#fff",
  },

  // Card
  card: {
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 14,
    padding: 15,
    marginBottom: 15,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  productName: {
    fontWeight: "700",
    fontSize: 16,
    color: "#222",
    flex: 1,
    marginRight: 10,
  },
  priceTag: {
    backgroundColor: "#E8F5E9",
    color: "#2E7D32",
    fontSize: 13,
    fontWeight: "700",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    overflow: "hidden",
  },
  cardBody: {
    marginBottom: 12,
  },
  rowInfo: {
    flexDirection: "row",
    marginTop: 4,
  },
  info: {
    fontSize: 14,
    color: "#555",
  },

  // Card Footer (Actions)
  cardFooter: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingTop: 10,
    justifyContent: "flex-end",
    gap: 10,
  },
  actionButtonOutline: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#fff",
  },
  deleteButton: {
    borderColor: "#FF3B30",
    backgroundColor: "#FFF5F5",
  },
  actionButtonTextOutline: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
  },

  // Empty State
  emptyContainer: {
    alignItems: "center",
    marginVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
  },
});
