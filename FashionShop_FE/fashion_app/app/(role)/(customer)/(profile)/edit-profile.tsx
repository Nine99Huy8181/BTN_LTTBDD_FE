// screens/EditProfileScreen.tsx
import { useAuth } from "@/hooks/AuthContext";
import { accountService } from "@/services/account.service";
import { customerService } from "@/services/customer.service";
import {
  isValidImageUri,
  uploadProductImage,
} from "@/services/productImageUpload.service";
import { Customer } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, isInitializing } = useAuth();

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showGenderPicker, setShowGenderPicker] = useState(false);
  const [viewerVisible, setViewerVisible] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    dateOfBirth: new Date(),
    gender: "",
  });

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Helper: Parse date từ backend
  const parseDate = (dateInput: any): Date | null => {
    if (!dateInput) return null;
    if (Array.isArray(dateInput)) {
      return new Date(
        Date.UTC(
          dateInput[0],
          dateInput[1] - 1,
          dateInput[2],
          dateInput[3] || 0,
          dateInput[4] || 0,
          dateInput[5] || 0
        )
      );
    }
    const d = new Date(dateInput);
    return isNaN(d.getTime()) ? null : d;
  };

  // Hàm format ngày dd/MM/yyyy (VD: 05/12/1990)
  const formatDate = (dateInput: Date | string) => {
    if (!dateInput) return "";
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return "";

    const day = `0${d.getDate()}`.slice(-2);
    const month = `0${d.getMonth() + 1}`.slice(-2);
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  useEffect(() => {
    if (isInitializing) return;
    if (!user || !user.accountId) {
      setLoading(false);
      setError("Vui lòng đăng nhập để xem hồ sơ");
      return;
    }

    fetchCustomerProfile(user.accountId as number);
  }, [isInitializing, user?.accountId]);

  const fetchCustomerProfile = async (accountId?: number) => {
    try {
      setLoading(true);
      const id = accountId ?? user?.accountId;
      if (!id) {
        setError("Không tìm thấy thông tin tài khoản");
        setLoading(false);
        return;
      }

      const data = await customerService.getCustomersByAccountId(id as number);
      if (data && data.length > 0) {
        const customerData = data[0];
        setCustomer(customerData);

        const parsedDOB = parseDate(customerData.dateOfBirth) || new Date();

        setFormData({
          fullName: customerData.fullName,
          phoneNumber: customerData.phoneNumber,
          dateOfBirth: parsedDOB,
          gender: customerData.gender,
        });
        setError("");
      } else {
        setError("Không tìm thấy thông tin khách hàng");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Không thể tải thông tin cá nhân"
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setError("");
  };

  const handleCancel = () => {
    if (customer) {
      const parsedDOB = parseDate(customer.dateOfBirth) || new Date();
      setFormData({
        fullName: customer.fullName,
        phoneNumber: customer.phoneNumber,
        dateOfBirth: parsedDOB,
        gender: customer.gender,
      });
    }
    setIsEditing(false);
    setShowGenderPicker(false);
    setError("");
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setFormData({ ...formData, dateOfBirth: selectedDate });
    }
  };

  const handleSave = async () => {
    // 1. Validate cơ bản
    if (!formData.fullName || !formData.phoneNumber || !formData.gender) {
      Alert.alert(
        "Lỗi",
        "Vui lòng điền đầy đủ thông tin (Họ tên, SĐT, Giới tính)"
      );
      return;
    }
    if (!customer) return;

    try {
      setSaving(true);

      // 2. Chuẩn bị dữ liệu update
      // QUAN TRỌNG: Không gửi field "account" để tránh lỗi Backend xử lý object con
      // Chúng ta dùng "as any" để bỏ qua check type của TypeScript tạm thời
      const updateData: any = {
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        dateOfBirth: formData.dateOfBirth.toISOString().split("T")[0], // yyyy-MM-dd
        gender: formData.gender,
      };

      console.log("📦 Đang gửi dữ liệu update:", updateData);

      // 3. Gọi API
      await customerService.updateCustomer(customer.customerID, updateData);

      Alert.alert("Thành công", "Cập nhật thông tin cá nhân thành công");
      setIsEditing(false);

      // Load lại dữ liệu mới nhất
      fetchCustomerProfile();
    } catch (err: any) {
      console.error("❌ Lỗi Update Info:", err);

      // Lấy thông báo lỗi chi tiết từ Backend nếu có
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Không thể cập nhật thông tin";

      setError(errorMsg); // Hiển thị lỗi lên màn hình đỏ (nếu muốn)
      Alert.alert("Lỗi", errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleCameraPress = () => {
    Alert.alert("Thay đổi ảnh đại diện", "Bạn có muốn đổi ảnh đại diện mới?", [
      { text: "Hủy", style: "cancel" },
      { text: "Chọn từ thư viện", onPress: pickAndUploadAvatar },
    ]);
  };

  const pickAndUploadAvatar = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Quyền truy cập bị từ chối", "Không thể chọn ảnh");
        return;
      }

      // ✅ SỬA LỖI: Dùng MediaTypeOptions thay vì MediaType
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
        allowsMultipleSelection: false,
      });

      if (result.canceled || !result.assets?.length) return;

      const uri = result.assets[0].uri;
      if (!isValidImageUri(uri)) {
        Alert.alert("Lỗi", "URI ảnh không hợp lệ");
        return;
      }

      if (!customer) return;

      setUploadingAvatar(true);

      // 1. Upload ảnh lên Cloudinary
      const uploadedUrl = await uploadProductImage(uri);

      // 2. Cập nhật UI ngay lập tức (Optimistic UI)
      setCustomer((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          account: {
            ...prev.account,
            avatar: uploadedUrl,
          },
        };
      });

      // 3. Chuẩn bị dữ liệu account để update (giống Admin)
      // Loại bỏ các trường circular reference để tránh lỗi
      const updatedAccount = {
        ...customer.account,
        avatar: uploadedUrl,
        customer: undefined,
        admin: undefined,
      };

      // 4. Gọi API Backend
      await accountService.updateAccount(
        customer.account.accountID,
        updatedAccount
      );

      Alert.alert("Thành công", "Ảnh đại diện đã được cập nhật");
    } catch (err: any) {
      console.error("Upload avatar error:", err?.response || err);
      Alert.alert(
        "Lỗi",
        err?.response?.data?.message || "Không thể cập nhật avatar"
      );
      fetchCustomerProfile();
    } finally {
      setUploadingAvatar(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#000" />
        <Text style={{ marginTop: 10 }}>Đang tải thông tin...</Text>
      </View>
    );
  }

  if (error && !customer) {
    return (
      <View style={styles.center}>
        <Text style={{ fontSize: 40, marginBottom: 10 }}>⚠️</Text>
        <Text style={{ color: "#DC2626", marginBottom: 20 }}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => fetchCustomerProfile(user?.accountId as number)}
        >
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!customer) return null;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Hồ Sơ Cá Nhân</Text>
          <View style={styles.titleLine} />
          <Text style={styles.subtitle}>Quản lý thông tin & tài khoản</Text>
        </View>
      </View>

      {error && (
        <View style={styles.errorAlert}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={() => setError("")}>
            <Text style={styles.errorClose}>✕</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Card Avatar */}
      <View style={styles.card}>
        <View style={styles.avatarSection}>
          <View style={{ position: "relative" }}>
            <TouchableOpacity
              onPress={() => setViewerVisible(true)}
              activeOpacity={0.8}
            >
              {customer.account.avatar ? (
                <Image
                  source={{ uri: customer.account.avatar }}
                  style={styles.avatar}
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>
                    {customer.fullName.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cameraIcon}
              onPress={handleCameraPress}
              disabled={uploadingAvatar}
            >
              <Ionicons name="camera" size={16} color="#fff" />
            </TouchableOpacity>
          </View>

          {uploadingAvatar && (
            <ActivityIndicator
              size="small"
              color="#000"
              style={{ marginTop: 8 }}
            />
          )}

          <View style={{ alignItems: "center", marginTop: 10 }}>
            <Text style={styles.avatarName}>{customer.fullName}</Text>
            <View
              style={[
                styles.statusTag,
                customer.account.accountStatus === "ACTIVE"
                  ? styles.statusActive
                  : styles.statusInactive,
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  customer.account.accountStatus === "ACTIVE"
                    ? { color: "#155724" }
                    : { color: "#721c24" },
                ]}
              >
                {customer.account.accountStatus === "ACTIVE"
                  ? "Hoạt động"
                  : "Không hoạt động"}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Card Thông Tin Tài Khoản */}
      <View style={styles.card}>
        <Text style={styles.sectionLabel}>Thông Tin Tài Khoản</Text>
        <View style={styles.detailsRow}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{customer.account.email}</Text>
          </View>
          <View style={styles.separator} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Vai trò</Text>
            <Text style={styles.infoValue}>{customer.account.role}</Text>
          </View>
          <View style={styles.separator} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Ngày đăng ký</Text>
            <Text style={styles.infoValue}>
              {(() => {
                const d = parseDate(customer.account.registrationDate);
                return d ? d.toLocaleDateString("vi-VN") : "-";
              })()}
            </Text>
          </View>
        </View>
      </View>

      {/* Card Thông Tin Cá Nhân */}
      <View style={styles.card}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 15,
          }}
        >
          <Text style={styles.sectionLabel}>Thông Tin Cá Nhân</Text>
          {!isEditing && (
            <TouchableOpacity onPress={handleEdit}>
              <Text style={{ color: "#007AFF", fontWeight: "600" }}>Sửa</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={{ gap: 12 }}>
          <View>
            <Text style={styles.fieldLabel}>
              Họ và Tên <Text style={{ color: "red" }}>*</Text>
            </Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={formData.fullName}
                onChangeText={(t) => setFormData({ ...formData, fullName: t })}
              />
            ) : (
              <Text style={styles.fieldValue}>{customer.fullName}</Text>
            )}
          </View>

          <View>
            <Text style={styles.fieldLabel}>
              Số điện thoại <Text style={{ color: "red" }}>*</Text>
            </Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={formData.phoneNumber}
                onChangeText={(t) =>
                  setFormData({ ...formData, phoneNumber: t })
                }
                keyboardType="phone-pad"
              />
            ) : (
              <Text style={styles.fieldValue}>{customer.phoneNumber}</Text>
            )}
          </View>

          {/* Date of Birth */}
          <View>
            <Text style={styles.fieldLabel}>
              Ngày sinh <Text style={{ color: "red" }}>*</Text>
            </Text>

            {isEditing ? (
              <View>
                {/* Ô chọn ngày */}
                <TouchableOpacity
                  style={styles.input}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={{ color: "#000" }}>
                    {formatDate(formData.dateOfBirth)}
                  </Text>
                </TouchableOpacity>

                {/* DateTimePicker logic */}
                {showDatePicker && (
                  <DateTimePicker
                    value={formData.dateOfBirth}
                    mode="date"
                    display="default" // Android sẽ hiện Dialog lịch chuẩn
                    onChange={(event, selectedDate) => {
                      // Quan trọng: Tắt picker ngay lập tức trên Android để tránh lỗi UI
                      setShowDatePicker(Platform.OS === "ios");
                      if (selectedDate) {
                        setFormData({ ...formData, dateOfBirth: selectedDate });
                      }
                    }}
                    maximumDate={new Date()}
                  />
                )}
              </View>
            ) : (
              <Text style={styles.fieldValue}>
                {/* Hiển thị khi xem (không sửa) */}
                {customer.dateOfBirth ? formatDate(customer.dateOfBirth) : "-"}
              </Text>
            )}
          </View>

          <View>
            <Text style={styles.fieldLabel}>
              Giới tính <Text style={{ color: "red" }}>*</Text>
            </Text>
            {isEditing ? (
              <>
                <TouchableOpacity
                  style={styles.input}
                  onPress={() => setShowGenderPicker(!showGenderPicker)}
                >
                  <Text style={{ color: "#000" }}>
                    {formData.gender || "Chọn giới tính"}
                  </Text>
                </TouchableOpacity>
                {showGenderPicker && (
                  <View style={styles.genderPicker}>
                    {["Nam", "Nữ", "Khác"].map((g) => (
                      <TouchableOpacity
                        key={g}
                        style={styles.genderOption}
                        onPress={() => {
                          setFormData({ ...formData, gender: g });
                          setShowGenderPicker(false);
                        }}
                      >
                        <Text style={styles.genderText}>{g}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </>
            ) : (
              <Text style={styles.fieldValue}>{customer.gender}</Text>
            )}
          </View>
        </View>

        {isEditing && (
          <View style={styles.cardFooter}>
            <TouchableOpacity
              style={[styles.actionButton, { borderColor: "#999" }]}
              onPress={handleCancel}
              disabled={saving}
            >
              <Text style={[styles.actionButtonText, { color: "#666" }]}>
                Hủy
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.actionButton,
                { backgroundColor: "#000", borderColor: "#000" },
              ]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={[styles.actionButtonText, { color: "#fff" }]}>
                  Lưu thay đổi
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Card 4: Additional Info */}
      <View style={styles.card}>
        <Text style={styles.sectionLabel}>Thông Tin Bổ Sung</Text>
        <View style={styles.detailsRow}>
          <View style={styles.separator} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Điểm tích lũy</Text>
            <View style={styles.loyaltyBox}>
              <Ionicons name="star" size={16} color="#FFD700" />
              <Text style={styles.loyaltyText}>
                {customer.loyaltyPoints || 0}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={{ height: 40 }} />

      <Modal
        visible={viewerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setViewerVisible(false)}
      >
        <TouchableOpacity
          style={styles.viewerOverlay}
          activeOpacity={1}
          onPress={() => setViewerVisible(false)}
        >
          <View style={styles.viewerContainer}>
            {customer.account.avatar ? (
              <Image
                source={{ uri: customer.account.avatar }}
                style={styles.viewerImage}
                resizeMode="contain"
              />
            ) : (
              <View
                style={[
                  styles.viewerImage,
                  {
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "#fff",
                  },
                ]}
              >
                <Text>Chưa có ảnh đại diện</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingTop: 40, backgroundColor: "#fff", flex: 1 },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  header: {
    marginBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  title: { fontSize: 22, fontWeight: "700", color: "#111" },
  titleLine: {
    width: 40,
    height: 3,
    backgroundColor: "#000",
    borderRadius: 2,
    marginTop: 5,
    marginBottom: 4,
  },
  subtitle: { fontSize: 13, color: "#666" },
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
  sectionLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111",
    marginBottom: 10,
  },
  avatarSection: { alignItems: "center", paddingVertical: 10 },
  avatar: { width: 100, height: 100, borderRadius: 50 },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { color: "#000", fontSize: 36, fontWeight: "bold" },
  cameraIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#000",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  avatarName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
    marginBottom: 8,
  },
  statusTag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  statusActive: { backgroundColor: "#D4EDDA" },
  statusInactive: { backgroundColor: "#F8D7DA" },
  statusText: { fontSize: 12, fontWeight: "700" },
  detailsRow: { gap: 0 },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  separator: { height: 1, backgroundColor: "#f5f5f5" },
  infoLabel: { fontSize: 14, color: "#666" },
  infoValue: { fontSize: 14, color: "#000", fontWeight: "500" },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#444",
    marginBottom: 6,
  },
  fieldValue: {
    fontSize: 15,
    color: "#000",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    marginBottom: 10,
  },
  input: {
    height: 45,
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    paddingHorizontal: 15,
    fontSize: 14,
    marginBottom: 10,
    justifyContent: "center",
  },
  genderPicker: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginTop: -5,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    overflow: "hidden",
  },
  genderOption: { padding: 14, borderBottomWidth: 1, borderColor: "#eee" },
  genderText: { fontSize: 15, color: "#333" },
  cardFooter: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingTop: 15,
    marginTop: 10,
    gap: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#007AFF",
    backgroundColor: "#fff",
  },
  actionButtonText: { fontSize: 14, fontWeight: "600", marginLeft: 4 },
  retryButton: {
    backgroundColor: "#000",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: { color: "#fff", fontWeight: "600" },
  errorAlert: {
    backgroundColor: "#FFE5E5",
    borderWidth: 1,
    borderColor: "#F8D7DA",
    padding: 12,
    marginBottom: 15,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  errorText: { color: "#D32F2F", flex: 1, fontSize: 14 },
  errorClose: {
    color: "#D32F2F",
    fontSize: 18,
    fontWeight: "bold",
    paddingLeft: 12,
  },
  viewerOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    alignItems: "center",
  },
  viewerContainer: {
    width: "100%",
    paddingHorizontal: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  viewerImage: { width: "100%", height: 400, borderRadius: 8 },
});
