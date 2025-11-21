// app/(admin)/(more)/respond-review/[id].tsx
import {
  reviewResponseService,
  reviewService,
} from "@/services/review.service";
import { ReviewDTO, ReviewResponse } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function RespondReviewScreen() {
  const params = useLocalSearchParams();
  const { id } = params;
  const nameParam = params?.name as string | undefined;
  const avatarParam = params?.avatar as string | undefined;
  const router = useRouter();

  const [review, setReview] = useState<ReviewDTO | null>(null);
  const [existingResponse, setExistingResponse] =
    useState<ReviewResponse | null>(null);
  const [responseContent, setResponseContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // TODO: Lấy adminID từ auth context/storage
  const [adminID] = useState(1);

  // ---------------------------------------------------------
  // LOGIC
  // ---------------------------------------------------------
  useEffect(() => {
    fetchReviewData();
  }, [id]);

  const fetchReviewData = async () => {
    try {
      setLoading(true);
      const reviewData = await reviewService.getReviewById(Number(id));
      setReview(reviewData);

      try {
        const response = await reviewResponseService.getResponseByReviewId(
          Number(id)
        );
        setExistingResponse(response);
        setResponseContent(response.responseContent);
      } catch (error) {
        setExistingResponse(null);
      }
    } catch (error) {
      console.error("Error fetching review:", error);
      Alert.alert("Lỗi", "Không thể tải thông tin đánh giá");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitResponse = async () => {
    if (!responseContent.trim()) {
      Alert.alert("Thông báo", "Vui lòng nhập nội dung phản hồi");
      return;
    }

    try {
      setSubmitting(true);

      if (existingResponse) {
        await reviewResponseService.updateResponse(
          existingResponse.responseID,
          {
            review: { reviewID: Number(id) },
            admin: { adminID },
            responseContent: responseContent.trim(),
            responseDate: new Date().toISOString(),
            status: "ACTIVE",
          } as any
        );
        Alert.alert("Thành công", "Đã cập nhật phản hồi");
      } else {
        await reviewResponseService.createResponse({
          review: { reviewID: Number(id) },
          admin: { adminID },
          responseContent: responseContent.trim(),
          responseDate: new Date().toISOString(),
          status: "ACTIVE",
        } as any);
        Alert.alert("Thành công", "Đã gửi phản hồi");
      }

      router.back();
    } catch (error) {
      const e: any = error;
      console.error("Error submitting response:", e);
      const msg =
        e?.response?.data?.message ||
        e?.response?.data ||
        e?.message ||
        "Không thể gửi phản hồi. Vui lòng thử lại";
      Alert.alert("Lỗi", msg.toString());
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteResponse = () => {
    Alert.alert("Xác nhận", "Bạn có chắc chắn muốn xóa phản hồi này?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          try {
            if (!existingResponse) return;
            setSubmitting(true);
            await reviewResponseService.deleteResponse(
              existingResponse.responseID
            );
            setResponseContent("");
            setExistingResponse(null);
            Alert.alert("Thành công", "Đã xóa phản hồi");
            router.back();
          } catch (err) {
            console.error("Error deleting response:", err);
            Alert.alert("Lỗi", "Không thể xóa phản hồi. Vui lòng thử lại");
          } finally {
            setSubmitting(false);
          }
        },
      },
    ]);
  };

  // ---------------------------------------------------------
  // UI HELPER
  // ---------------------------------------------------------
  // Hàm format ngày giờ theo yêu cầu: "lúc 00:32 ngày 1 tháng 11, 2025"
  const formatDateTime = (dateObj: Date | null) => {
    if (!dateObj) return "N/A";
    const hh = dateObj.getHours().toString().padStart(2, "0");
    const mm = dateObj.getMinutes().toString().padStart(2, "0");
    const day = dateObj.getDate();
    const month = dateObj.getMonth() + 1;
    const year = dateObj.getFullYear();
    return `lúc ${hh}:${mm} ngày ${day} tháng ${month}, ${year}`;
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

  const renderStars = (rating: number) => (
    <View style={styles.starsContainer}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Ionicons
          key={star}
          name={star <= rating ? "star" : "star-outline"}
          size={16}
          color={star <= rating ? "#FFD700" : "#ccc"}
        />
      ))}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#000" />
        <Text style={{ marginTop: 10 }}>Đang tải dữ liệu...</Text>
      </View>
    );
  }

  if (!review) {
    return (
      <View style={styles.center}>
        <Text>Không tìm thấy đánh giá</Text>
      </View>
    );
  }

  const r: any = review as any;
  const displayName =
    review.customerName ??
    r.customer?.fullName ??
    r.customer?.account?.email ??
    nameParam ??
    "Khách hàng";
  const avatarUri =
    review.customerAvatar ?? r.customer?.account?.avatar ?? avatarParam ?? "";

  // Filter out any empty/null image URIs so placeholders aren't shown
  const validImages = (review.images || []).filter((img: any) => !!img);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      {/* Đã xóa Header Row tại đây */}

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* 🔹 Review Details Card */}
        <View style={styles.card}>
          {/* Header Card */}
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
                    const d = parseReviewDate(review.reviewDate);
                    return formatDateTime(d);
                  })()}
                </Text>
              </View>
            </View>
            {renderStars(review.rating)}
          </View>

          {/* Body Card */}
          <View style={styles.cardBody}>
            <Text style={styles.comment}>{review.comment}</Text>
            {validImages && validImages.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.imagesContainer}
              >
                {validImages.map((img: string, index: number) => (
                  <Image
                    key={index}
                    source={{ uri: img }}
                    style={styles.reviewImage}
                  />
                ))}
              </ScrollView>
            ) : (
              <View style={styles.noImageContainer}>
                <Text style={styles.noImageText}>Không kèm hình ảnh</Text>
              </View>
            )}
          </View>

          {/* Footer Card */}
          <View style={styles.cardFooter}>
            <View
              style={[
                styles.statusTag,
                review.status === "APPROVED"
                  ? styles.statusApproved
                  : styles.statusInactive,
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  review.status === "APPROVED"
                    ? { color: "#155724" }
                    : { color: "#721c24" },
                ]}
              >
                {review.status === "APPROVED" ? "Đã duyệt" : "Chưa duyệt"}
              </Text>
            </View>
            <Text style={styles.idText}>ID: {review.reviewID}</Text>
          </View>
        </View>

        {/* 🔹 Response Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Ionicons
              name="chatbox-ellipses-outline"
              size={20}
              color="#007AFF"
            />
            <Text style={styles.sectionLabel}>
              {existingResponse ? "Phản hồi của bạn" : "Viết phản hồi"}
            </Text>
          </View>

          <TextInput
            style={styles.responseInput}
            placeholder="Nhập nội dung phản hồi cho khách hàng..."
            placeholderTextColor="#888"
            multiline
            numberOfLines={6}
            value={responseContent}
            onChangeText={setResponseContent}
            textAlignVertical="top"
          />

          {existingResponse && (
            <Text style={styles.lastUpdated}>
              Cập nhật lần cuối:{" "}
              {(() => {
                const d = parseReviewDate(existingResponse.responseDate);
                return formatDateTime(d);
              })()}
            </Text>
          )}
        </View>

        {/* 🔹 Action Buttons */}
        <View style={styles.actionRow}>
          {existingResponse && (
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDeleteResponse}
              disabled={submitting}
            >
              <Ionicons name="trash-outline" size={20} color="#DC3545" />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[
              styles.submitButton,
              { flex: existingResponse ? 1 : undefined },
            ]}
            onPress={handleSubmitResponse}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="send" size={18} color="#fff" />
                <Text style={styles.submitButtonText}>
                  {existingResponse ? "Cập nhật phản hồi" : "Gửi phản hồi"}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ------------------------
// STYLES
// ------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 16, // Giữ khoảng cách top
    paddingHorizontal: 16, // Chỉnh về 16 để bằng kích thước cũ
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  // Card Style
  card: {
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 14,
    padding: 15,
    marginBottom: 25,
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
    marginBottom: 12,
  },
  customerRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  avatarPlaceholder: {
    backgroundColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontWeight: "bold",
    color: "#666",
    fontSize: 16,
  },
  customerName: {
    fontWeight: "700",
    fontSize: 15,
    color: "#222",
  },
  reviewDate: {
    fontSize: 12,
    color: "#888",
    marginTop: 2,
  },
  starsContainer: {
    flexDirection: "row",
  },
  cardBody: {
    marginBottom: 12,
  },
  comment: {
    fontSize: 15,
    color: "#444",
    lineHeight: 22,
    marginBottom: 10,
  },
  imagesContainer: {
    flexDirection: "row",
    marginTop: 4,
  },
  reviewImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 8,
    backgroundColor: "#f0f0f0",
  },
  cardFooter: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#f9f9f9",
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
  idText: {
    fontSize: 12,
    color: "#aaa",
  },

  // Response Section
  sectionContainer: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
    marginLeft: 8,
  },
  responseInput: {
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 15,
    fontSize: 15,
    color: "#333",
    minHeight: 120,
  },
  lastUpdated: {
    fontSize: 12,
    color: "#999",
    marginTop: 8,
    textAlign: "right",
    fontStyle: "italic",
  },

  // Buttons
  actionRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },
  deleteButton: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: "#FFE5E5",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FFCCCC",
  },
  submitButton: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#007AFF",
    height: 50,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    shadowColor: "#007AFF",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  noImageContainer: {
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: "#fafafa",
  },
  noImageText: {
    fontSize: 14,
    color: "#888",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
