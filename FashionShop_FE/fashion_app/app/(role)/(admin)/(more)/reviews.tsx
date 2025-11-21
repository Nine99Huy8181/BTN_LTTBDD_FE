// app/(admin)/(more)/reviews.tsx
import { Routes } from "@/constants";
import { reviewService } from "@/services/review.service";
import { ReviewDTO } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// Định nghĩa các options cho filter để render dễ dàng hơn (tương tự ProductManagement)
const STATUS_OPTIONS = [
  { label: "Tất cả", value: "ALL" },
  { label: "Chấp thuận", value: "APPROVED" },
  { label: "Chưa duyệt", value: "INAPPROVED" },
];

const RATING_OPTIONS = [
  { label: "Tất cả", value: null },
  { label: "5 Sao", value: 5 },
  { label: "4 Sao", value: 4 },
  { label: "3 Sao", value: 3 },
  { label: "2 Sao", value: 2 },
  { label: "1 Sao", value: 1 },
];

export default function ReviewsScreen() {
  const router = useRouter();
  const [reviews, setReviews] = useState<ReviewDTO[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<ReviewDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "ALL" | "APPROVED" | "INAPPROVED"
  >("ALL");
  const [filterRating, setFilterRating] = useState<number | null>(null);

  useEffect(() => {
    fetchReviews();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [reviews, searchQuery, filterStatus, filterRating]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      try {
        const token = await SecureStore.getItemAsync("jwt_token");
        console.log("Debug: token exists before fetching reviews:", !!token);
      } catch (e) {
        console.warn("Debug: failed to read token before fetching reviews", e);
      }
      const data = await reviewService.getAllReviews();
      const sortedData = data.sort(
        (a, b) =>
          new Date(b.reviewDate).getTime() - new Date(a.reviewDate).getTime()
      );
      setReviews(sortedData);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const parseReviewDate = (value: any) => {
    if (!value) return null;
    if (typeof value === "string" || typeof value === "number") {
      const d = new Date(value);
      return isNaN(d.getTime()) ? null : d;
    }
    if (Array.isArray(value)) {
      const [y, m, d, hh = 0, mm = 0, ss = 0] = value;
      return new Date(y, m - 1, d, hh, mm, ss);
    }
    return null;
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchReviews();
    setRefreshing(false);
  };

  const applyFilters = () => {
    let filtered = [...reviews];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter((review) => {
        const r: any = review as any;
        const name = (
          review.customerName ??
          r.customer?.fullName ??
          r.customer?.account?.email ??
          ""
        )
          .toString()
          .toLowerCase();
        const comment = (review.comment ?? "").toString().toLowerCase();
        return name.includes(q) || comment.includes(q);
      });
    }

    if (filterStatus !== "ALL") {
      filtered = filtered.filter((review) => review.status === filterStatus);
    }

    if (filterRating !== null) {
      filtered = filtered.filter((review) => review.rating === filterRating);
    }

    setFilteredReviews(filtered);
  };

  // --- UI Helpers ---
  const renderStars = (rating: number) => (
    <View style={styles.starsContainer}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Ionicons
          key={star}
          name={star <= rating ? "star" : "star-outline"}
          size={14}
          color={star <= rating ? "#FFD700" : "#ccc"}
        />
      ))}
    </View>
  );

  const renderReviewItem = ({ item }: { item: ReviewDTO }) => {
    const r: any = item as any;
    const displayName =
      item.customerName ??
      r.customer?.fullName ??
      r.customer?.account?.email ??
      "Khách hàng";
    const avatarUri = item.customerAvatar ?? r.customer?.account?.avatar ?? "";
    // Filter out empty/null image URIs so we don't render blank placeholders
    const validImages = (item.images || []).filter(
      (img: any) => img && typeof img === "string" && img.trim() !== ""
    );

    return (
      <TouchableOpacity style={styles.card}>
        {/* Card Header: Avatar + Name + Rating */}
        <View style={styles.cardHeader}>
          <View style={styles.customerRow}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Text style={styles.avatarText}>
                  {(displayName?.charAt(0) || "?").toUpperCase()}
                </Text>
              </View>
            )}
            <View style={{ flex: 1 }}>
              <Text style={styles.customerName} numberOfLines={1}>
                {displayName}
              </Text>
              <Text style={styles.reviewDate}>
                {(() => {
                  const d = parseReviewDate(item.reviewDate);
                  return d ? d.toLocaleDateString("vi-VN") : "N/A";
                })()}
              </Text>
            </View>
          </View>
          {/* Rating bên phải header */}
          {renderStars(item.rating)}
        </View>

        {/* Card Body: Comment + Images */}
        <View style={styles.cardBody}>
          <Text style={styles.comment} numberOfLines={3}>
            {item.comment}
          </Text>

          {validImages.length > 0 && (
            <View style={styles.imagesContainer}>
              {validImages.slice(0, 3).map((img: string, index: number) => (
                <Image
                  key={index}
                  source={{ uri: img }}
                  style={styles.reviewImage}
                />
              ))}

              {validImages.length > 3 && (
                <View style={styles.moreImages}>
                  <Text style={styles.moreImagesText}>
                    +{validImages.length - 3}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Card Footer: Status + Action */}
        <View style={styles.cardFooter}>
          <View
            style={[
              styles.statusTag,
              item.status === "APPROVED"
                ? styles.statusApproved
                : styles.statusInactive,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                item.status === "APPROVED"
                  ? { color: "#155724" }
                  : { color: "#721c24" },
              ]}
            >
              {item.status === "APPROVED" ? "Đã duyệt" : "Chưa duyệt"}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.actionButtonOutline}
            onPress={() =>
              router.push(
                `${Routes.AdminRespondReview}/${item.reviewID}?name=${encodeURIComponent(
                  displayName
                )}&avatar=${encodeURIComponent(avatarUri)}` as any
              )
            }
          >
            <Ionicons name="chatbox-outline" size={14} color="#007AFF" />
            <Text
              style={[
                styles.actionButtonTextOutline,
                { color: "#007AFF", marginLeft: 4 },
              ]}
            >
              Phản hồi
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
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
      {/* 🔹 Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Quản lý đánh giá</Text>
          <View style={styles.titleLine} />
          <Text style={styles.subtitle}>{filteredReviews.length} đánh giá</Text>
        </View>
      </View>

      {/* 🔹 Search */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm khách hàng, nội dung..."
          placeholderTextColor="#666"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* 🔹 Filter Section 1: Status */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionLabel}>Trạng thái:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {STATUS_OPTIONS.map((status) => (
            <TouchableOpacity
              key={status.value}
              onPress={() => setFilterStatus(status.value as any)}
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

      {/* 🔹 Filter Section 2: Rating */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionLabel}>Số sao:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {RATING_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.label}
              onPress={() => setFilterRating(option.value as any)}
              style={[
                styles.filterButton,
                styles.sortButton,
                filterRating === option.value && styles.filterButtonActive,
              ]}
            >
              {/* Hiển thị icon sao nếu là lọc sao */}
              {option.value !== null && (
                <Ionicons
                  name="star"
                  size={12}
                  color={filterRating === option.value ? "#fff" : "#FFD700"}
                  style={{ marginRight: 4 }}
                />
              )}
              <Text
                style={[
                  styles.filterText,
                  filterRating === option.value && styles.filterTextActive,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* 🔹 List */}
      <FlatList
        data={filteredReviews}
        renderItem={renderReviewItem}
        keyExtractor={(item) => item.reviewID.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Không tìm thấy đánh giá nào.</Text>
          </View>
        }
      />
    </View>
  );
}

// ------------------------
// STYLES (Đồng bộ ProductManagementScreen)
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
    fontSize: 14,
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
    alignItems: "flex-start",
    marginBottom: 10,
  },
  customerRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  avatarPlaceholder: {
    backgroundColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontWeight: "bold",
    color: "#666",
    fontSize: 14,
  },
  customerName: {
    fontWeight: "700",
    fontSize: 15,
    color: "#222",
  },
  reviewDate: {
    fontSize: 11,
    color: "#888",
    marginTop: 2,
  },
  starsContainer: {
    flexDirection: "row",
  },

  // Card Body
  cardBody: {
    marginBottom: 12,
  },
  comment: {
    fontSize: 14,
    color: "#444",
    lineHeight: 20,
    marginBottom: 8,
  },
  imagesContainer: {
    flexDirection: "row",
    marginTop: 4,
  },
  reviewImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 8,
    // backgroundColor: "#f0f0f0",
  },
  moreImages: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  moreImagesText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
  },

  noImageContainer: {
    marginTop: 6,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: "#fafafa",
  },
  noImageText: {
    fontSize: 13,
    color: "#888",
  },

  // Card Footer (Actions)
  cardFooter: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingTop: 10,
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusApproved: {
    backgroundColor: "#D4EDDA",
  },
  statusInactive: {
    backgroundColor: "#F8D7DA",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
  },
  actionButtonOutline: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#007AFF",
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
  },
  actionButtonTextOutline: {
    fontSize: 13,
    fontWeight: "600",
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
