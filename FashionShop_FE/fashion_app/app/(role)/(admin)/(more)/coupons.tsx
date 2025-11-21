// app/(role)/(admin)/(more)/coupons.tsx
import { Routes } from "@/constants";
import { couponService } from "@/services/coupon.service";
import { Coupon } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
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

const STATUS_OPTIONS = [
  { label: "Tất cả", value: "ALL" },
  { label: "Đang hoạt động", value: "ACTIVE" },
  { label: "Không hoạt động", value: "INACTIVE" },
  { label: "Hết hạn", value: "EXPIRED" },
];

const DISCOUNT_TYPE_OPTIONS = [
  { label: "Tất cả", value: "ALL" },
  { label: "Phần trăm", value: "PERCENTAGE" },
  { label: "Số tiền", value: "FIXED_AMOUNT" },
];

export default function CouponsScreen() {
  const router = useRouter();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [filteredCoupons, setFilteredCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [filterDiscountType, setFilterDiscountType] = useState<string>("ALL");

  // Sử dụng useFocusEffect để gọi lại hàm fetch mỗi khi màn hình hiển thị
  useFocusEffect(
    useCallback(() => {
      fetchCoupons();
    }, [])
  );

  useEffect(() => {
    applyFilters();
  }, [coupons, searchQuery, filterStatus, filterDiscountType]);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const data = await couponService.getAllCoupons();
      // Sort by startDate descending (newest first)
      const sortedData = data.sort((a, b) => {
        const dateA = parseDate(a.startDate)?.getTime() ?? 0;
        const dateB = parseDate(b.startDate)?.getTime() ?? 0;
        return dateB - dateA;
      });
      setCoupons(sortedData);
    } catch (error) {
      console.error("Error fetching coupons:", error);
      Alert.alert("Lỗi", "Không thể tải danh sách mã giảm giá");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCoupons();
    setRefreshing(false);
  };

  // Cập nhật kiểu dữ liệu đầu vào là any để chấp nhận mảng
  const parseDate = (dateInput?: any): Date | null => {
    if (!dateInput) return null;

    // CASE 1: Xử lý nếu Spring Boot trả về mảng [2025, 10, 17]
    if (Array.isArray(dateInput)) {
      // dateInput[0] = year, dateInput[1] = month, dateInput[2] = day
      // Lưu ý: Month trong JS bắt đầu từ 0, nên phải trừ 1
      return new Date(Date.UTC(dateInput[0], dateInput[1] - 1, dateInput[2]));
    }

    const s = String(dateInput).trim();

    // CASE 2: Xử lý chuỗi "YYYY-MM-DD" (Logic cũ của bạn)
    const match = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (match) {
      const y = parseInt(match[1], 10);
      const m = parseInt(match[2], 10) - 1;
      const d = parseInt(match[3], 10);
      return new Date(Date.UTC(y, m, d));
    }

    // CASE 3: Xử lý chuỗi ISO
    const dt = new Date(s);
    return !isNaN(dt.getTime()) ? dt : null;
  };

  const applyFilters = () => {
    let filtered = [...coupons];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter((coupon) => {
        const code = (coupon.code ?? "").toLowerCase();
        const description = (coupon.description ?? "").toLowerCase();
        return code.includes(q) || description.includes(q);
      });
    }

    if (filterStatus !== "ALL") {
      filtered = filtered.filter((coupon) => coupon.status === filterStatus);
    }

    if (filterDiscountType !== "ALL") {
      filtered = filtered.filter(
        (coupon) => coupon.discountType === filterDiscountType
      );
    }

    setFilteredCoupons(filtered);
  };

  const handleDeleteCoupon = (id: number, code: string) => {
    Alert.alert("Xác nhận xóa", `Bạn có chắc muốn xóa mã giảm giá "${code}"?`, [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          try {
            await couponService.deleteCoupon(id);
            Alert.alert("Thành công", "Đã xóa mã giảm giá");
            fetchCoupons();
          } catch (error) {
            console.error("Error deleting coupon:", error);
            Alert.alert("Lỗi", "Không thể xóa mã giảm giá");
          }
        },
      },
    ]);
  };

  const formatDate = (dateInput: any): string => {
    const date = parseDate(dateInput);
    if (!date) return "Chưa xác định";

    return date.toLocaleDateString("vi-VN", {
      timeZone: "UTC",
    });
  };

  const formatDiscount = (value: number, type: string) => {
    if (type === "PERCENTAGE") {
      return `${value}%`;
    }
    return `${value.toLocaleString("vi-VN")}đ`;
  };

  const renderCouponItem = ({ item }: { item: Coupon }) => {
    const endDateObj = parseDate(item.endDate);
    const isExpired = endDateObj ? endDateObj < new Date() : false;
    const usagePercent = item.maxUses
      ? ((item.usedCount || 0) / item.maxUses) * 100
      : 0;

    return (
      <View style={styles.card}>
        {/* Card Header: Code + Status */}
        <View style={styles.cardHeader}>
          <View style={styles.codeContainer}>
            <View style={styles.codeBadge}>
              <Text style={styles.codeText}>{item.code}</Text>
            </View>
            {isExpired && (
              <View style={styles.expiredTag}>
                <Text style={styles.expiredText}>Hết hạn</Text>
              </View>
            )}
          </View>
          <View
            style={[
              styles.statusTag,
              item.status === "ACTIVE"
                ? styles.statusActive
                : styles.statusInactive,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                item.status === "ACTIVE"
                  ? { color: "#155724" }
                  : { color: "#721c24" },
              ]}
            >
              {item.status === "ACTIVE" ? "Hoạt động" : "Tạm dừng"}
            </Text>
          </View>
        </View>

        {/* Card Body: Description + Details */}
        <View style={styles.cardBody}>
          <Text style={styles.description} numberOfLines={2}>
            {item.description || "Không có mô tả"}
          </Text>

          <View style={styles.detailsRow}>
            <View style={styles.detailItem}>
              <Ionicons name="pricetag" size={14} color="#666" />
              <Text style={styles.detailText}>
                Giảm {formatDiscount(item.discountValue, item.discountType)}
              </Text>
            </View>

            <View style={styles.detailItem}>
              <Ionicons name="calendar-outline" size={14} color="#666" />
              <Text style={styles.detailText}>
                {formatDate(item.startDate)} - {formatDate(item.endDate)}
              </Text>
            </View>
          </View>

          {item.maxUses && (
            <View style={styles.usageContainer}>
              <View style={styles.usageBar}>
                <View
                  style={[styles.usageProgress, { width: `${usagePercent}%` }]}
                />
              </View>
              <Text style={styles.usageText}>
                Đã dùng: {item.usedCount || 0}/{item.maxUses}
              </Text>
            </View>
          )}
        </View>

        {/* Card Footer: Actions */}
        <View style={styles.cardFooter}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() =>
              router.push(`${Routes.AdminEditCoupon}${item.couponID}` as any)
            }
          >
            <Ionicons name="create-outline" size={16} color="#007AFF" />
            <Text style={styles.actionButtonText}>Sửa</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDeleteCoupon(item.couponID!, item.code)}
          >
            <Ionicons name="trash-outline" size={16} color="#FF3B30" />
            <Text style={[styles.actionButtonText, { color: "#FF3B30" }]}>
              Xóa
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#000" />
        <Text style={{ marginTop: 10 }}>Đang tải dữ liệu...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Quản lý mã giảm giá</Text>
          <View style={styles.titleLine} />
          <Text style={styles.subtitle}>{filteredCoupons.length} mã</Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push(Routes.AdminAddCoupon as any)}
        >
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.addButtonText}>Thêm</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm mã, mô tả..."
          placeholderTextColor="#666"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Filter: Status */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionLabel}>Trạng thái:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {STATUS_OPTIONS.map((status) => (
            <TouchableOpacity
              key={status.value}
              onPress={() => setFilterStatus(status.value)}
              style={[
                styles.filterButton,
                filterStatus === status.value && styles.filterButtonActive,
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  filterStatus === status.value && styles.filterTextActive,
                ]}
              >
                {status.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Filter: Discount Type */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionLabel}>Loại giảm giá:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {DISCOUNT_TYPE_OPTIONS.map((type) => (
            <TouchableOpacity
              key={type.value}
              onPress={() => setFilterDiscountType(type.value)}
              style={[
                styles.filterButton,
                styles.sortButton,
                filterDiscountType === type.value && styles.filterButtonActive,
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  filterDiscountType === type.value && styles.filterTextActive,
                ]}
              >
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* List */}
      <FlatList
        data={filteredCoupons}
        renderItem={renderCouponItem}
        keyExtractor={(item) => item.couponID!.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              Không tìm thấy mã giảm giá nào.
            </Text>
          </View>
        }
      />
    </View>
  );
}

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
  header: {
    marginBottom: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
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
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: "#666",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#000",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
    marginLeft: 4,
  },
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
    fontSize: 14,
  },
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
    flexDirection: "row",
    alignItems: "center",
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
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  codeContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  codeBadge: {
    backgroundColor: "#F0F0F0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderStyle: "dashed",
  },
  codeText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#000",
    letterSpacing: 1,
  },
  expiredTag: {
    backgroundColor: "#FFE5E5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 8,
  },
  expiredText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#D32F2F",
  },
  statusTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusActive: {
    backgroundColor: "#D4EDDA",
  },
  statusInactive: {
    backgroundColor: "#F8D7DA",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
  },
  cardBody: {
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: "#444",
    lineHeight: 20,
    marginBottom: 10,
  },
  detailsRow: {
    gap: 8,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  detailText: {
    fontSize: 13,
    color: "#666",
    marginLeft: 6,
  },
  usageContainer: {
    marginTop: 8,
  },
  usageBar: {
    height: 6,
    backgroundColor: "#F0F0F0",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 4,
  },
  usageProgress: {
    height: "100%",
    backgroundColor: "#4CAF50",
  },
  usageText: {
    fontSize: 12,
    color: "#666",
  },
  cardFooter: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingTop: 10,
    gap: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#007AFF",
    backgroundColor: "#fff",
  },
  deleteButton: {
    borderColor: "#FF3B30",
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#007AFF",
    marginLeft: 4,
  },
  emptyContainer: {
    alignItems: "center",
    marginVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
  },
});
