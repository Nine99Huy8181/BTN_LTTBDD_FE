// screens/ProfileAdminScreen.tsx
import { useAuth } from "@/hooks/AuthContext";
import { accountService } from "@/services/account.service";
import { adminService } from "@/services/admin.service";
import {
  isValidImageUri,
  uploadProductImage,
} from "@/services/productImageUpload.service";
import { Admin, UpdateAdminRequest } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
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
import { showToast } from "@/utils/toast";
import { useAlertDialog } from "@/hooks/AlertDialogContext";

export default function ProfileAdminScreen() {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // State cho xem ảnh full màn hình
  const [viewerVisible, setViewerVisible] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    department: "",
    position: "",
    hireDate: new Date(),
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const { user, isInitializing } = useAuth();
  const { showAlert } = useAlertDialog();

  // Hàm helper parseDate (Giữ nguyên logic cũ)
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

  useEffect(() => {
    if (isInitializing) return;
    if (!user || !user.accountId) {
      setLoading(false);
      setError("Vui lòng đăng nhập để xem hồ sơ admin");
      return;
    }

    fetchAdminProfile(user.accountId as number);
  }, [isInitializing, user?.accountId]);

  const fetchAdminProfile = async (accountId?: number) => {
    try {
      setLoading(true);
      const id = accountId ?? user?.accountId;
      if (!id) {
        setError("Không tìm thấy thông tin tài khoản");
        setLoading(false);
        return;
      }

      const data = await adminService.getAdminsByAccountId(id as number);
      if (data && data.length > 0) {
        const adminData = data[0];
        setAdmin(adminData);

        const parsedHireDate = parseDate(adminData.hireDate) || new Date();

        setFormData({
          fullName: adminData.fullName,
          department: adminData.department,
          position: adminData.position,
          hireDate: parsedHireDate,
        });
        setError("");
      } else {
        setError("Không tìm thấy thông tin admin");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Không thể tải thông tin cá nhân"
      );
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setError("");
  };

  const handleCancel = () => {
    if (admin) {
      const parsedHireDate = parseDate(admin.hireDate) || new Date();
      setFormData({
        fullName: admin.fullName,
        department: admin.department,
        position: admin.position,
        hireDate: parsedHireDate,
      });
    }
    setIsEditing(false);
    setError("");
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setFormData({ ...formData, hireDate: selectedDate });
    }
  };

  const handleSave = async () => {
    if (!formData.fullName || !formData.department || !formData.position) {
      setError("Vui lòng điền đầy đủ thông tin");
      return;
    }
    if (!admin) return;

    try {
      setSaving(true);
      const updateData: UpdateAdminRequest = {
        account: { accountID: admin.account.accountID },
        fullName: formData.fullName,
        department: formData.department,
        position: formData.position,
        hireDate: formData.hireDate.toISOString().split("T")[0],
      };

      await adminService.updateAdmin(admin.adminID, updateData);
      showToast.success("Thành công", "Cập nhật thông tin cá nhân thành công");
      setIsEditing(false);
      fetchAdminProfile();
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message || "Không thể cập nhật thông tin";
      setError(errorMsg);
      showToast.error("Lỗi", errorMsg);
    } finally {
      setSaving(false);
    }
  };

  // Avatar logic
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const handleCameraPress = () => {
    showAlert(
      "Thay đổi ảnh đại diện",
      "Bạn có muốn đổi ảnh đại diện mới?",
      [
        { text: "Hủy", style: "cancel" },
        { text: "Chọn từ thư viện", onPress: pickAndUploadAvatar },
      ]
    );
  };

  const pickAndUploadAvatar = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        showToast.error("Quyền truy cập bị từ chối", "Không thể chọn ảnh");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes:
          (ImagePicker as any).MediaType?.Images ??
          (ImagePicker as any).MediaTypeOptions?.Images,
        quality: 0.7,
        allowsMultipleSelection: false,
      });

      if (result.canceled || !result.assets?.length) return;

      const uri = result.assets[0].uri;
      if (!isValidImageUri(uri)) {
        showToast.error("Lỗi", "URI ảnh không hợp lệ");
        return;
      }

      if (!admin) return;

      setUploadingAvatar(true);
      const uploadedUrl = await uploadProductImage(uri);

      setAdmin((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          account: { ...prev.account, avatar: uploadedUrl },
        };
      });

      const updatedAccount = {
        ...admin.account,
        avatar: uploadedUrl,
        customer: undefined,
        admin: undefined,
      };

      await accountService.updateAccount(
        admin.account.accountID,
        updatedAccount
      );
      showToast.success("Thành công", "Ảnh đại diện đã được cập nhật");
    } catch (err: any) {
      console.log("Upload avatar error:", err?.response || err);
      showAlert(
        "Lỗi",
        err?.response?.data?.message || "Không thể cập nhật avatar"
      );
      fetchAdminProfile();
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

  if (error && !admin) {
    return (
      <View style={styles.center}>
        <Text style={{ fontSize: 40, marginBottom: 10 }}>⚠️</Text>
        <Text style={{ color: "#DC2626", marginBottom: 20 }}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => fetchAdminProfile(user?.accountId as number)}
        >
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!admin) return null;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header đồng bộ với Coupons */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Hồ Sơ Cá Nhân</Text>
          <View style={styles.titleLine} />
          <Text style={styles.subtitle}>Quản lý thông tin & tài khoản</Text>
        </View>
      </View>

      {/* Error Alert */}
      {error && (
        <View style={styles.errorAlert}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={() => setError("")}>
            <Text style={styles.errorClose}>✕</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Card 1: Avatar & Basic Info */}
      <View style={styles.card}>
        <View style={styles.avatarSection}>
          <View style={{ position: "relative" }}>
            <TouchableOpacity
              onPress={() => setViewerVisible(true)}
              activeOpacity={0.8}
            >
              {admin.account.avatar ? (
                <Image
                  source={{ uri: admin.account.avatar }}
                  style={styles.avatar}
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>
                    {admin.fullName.charAt(0).toUpperCase()}
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
            <Text style={styles.avatarName}>{admin.fullName}</Text>
            <View
              style={[
                styles.statusTag,
                admin.account.accountStatus === "ACTIVE"
                  ? styles.statusActive
                  : styles.statusInactive,
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  admin.account.accountStatus === "ACTIVE"
                    ? { color: "#155724" }
                    : { color: "#721c24" },
                ]}
              >
                {admin.account.accountStatus === "ACTIVE"
                  ? "Hoạt động"
                  : "Không hoạt động"}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Card 2: Thông tin tài khoản */}
      <View style={styles.card}>
        <Text style={styles.sectionLabel}>Thông Tin Tài Khoản</Text>
        <View style={styles.detailsRow}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{admin.account.email}</Text>
          </View>
          <View style={styles.separator} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Vai trò</Text>
            <Text style={styles.infoValue}>{admin.account.role}</Text>
          </View>
          <View style={styles.separator} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Ngày đăng ký</Text>
            <Text style={styles.infoValue}>
              {(() => {
                const d = parseDate(admin.account.registrationDate);
                return d ? d.toLocaleDateString("vi-VN") : "-";
              })()}
            </Text>
          </View>
        </View>
      </View>

      {/* Card 3: Thông tin cá nhân (Editable) */}
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
          {/* Full Name */}
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
              <Text style={styles.fieldValue}>{admin.fullName}</Text>
            )}
          </View>

          {/* Department */}
          <View>
            <Text style={styles.fieldLabel}>
              Phòng Ban <Text style={{ color: "red" }}>*</Text>
            </Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={formData.department}
                onChangeText={(t) =>
                  setFormData({ ...formData, department: t })
                }
              />
            ) : (
              <Text style={styles.fieldValue}>{admin.department}</Text>
            )}
          </View>

          {/* Position */}
          <View>
            <Text style={styles.fieldLabel}>
              Chức Vụ <Text style={{ color: "red" }}>*</Text>
            </Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={formData.position}
                onChangeText={(t) => setFormData({ ...formData, position: t })}
              />
            ) : (
              <Text style={styles.fieldValue}>{admin.position}</Text>
            )}
          </View>

          {/* Hire Date */}
          <View>
            <Text style={styles.fieldLabel}>
              Ngày Vào Làm <Text style={{ color: "red" }}>*</Text>
            </Text>
            {isEditing ? (
              <>
                <TouchableOpacity
                  style={styles.input}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={{ color: "#000" }}>
                    {formData.hireDate.toLocaleDateString("vi-VN")}
                  </Text>
                </TouchableOpacity>
                {showDatePicker && (
                  <DateTimePicker
                    value={formData.hireDate}
                    mode="date"
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={handleDateChange}
                    maximumDate={new Date()}
                  />
                )}
              </>
            ) : (
              <Text style={styles.fieldValue}>
                {(() => {
                  const hd = parseDate(admin.hireDate);
                  return hd ? hd.toLocaleDateString("vi-VN") : "-";
                })()}
              </Text>
            )}
          </View>
        </View>

        {/* Action Buttons (Only when editing) */}
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
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Admin ID</Text>
            <Text style={styles.infoValue}>#{admin.adminID}</Text>
          </View>
          <View style={styles.separator} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Account ID</Text>
            <Text style={styles.infoValue}>#{admin.account.accountID}</Text>
          </View>
          <View style={styles.separator} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Thâm niên</Text>
            <Text style={styles.infoValue}>
              {(() => {
                const hd = parseDate(admin.hireDate);
                if (!hd) return "-";
                const years = Math.floor(
                  (Date.now() - hd.getTime()) / (1000 * 60 * 60 * 24 * 365)
                );
                return `${years} năm`;
              })()}
            </Text>
          </View>
        </View>
      </View>

      <View style={{ height: 40 }} />

      {/* Modal View Full Avatar */}
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
            {admin.account.avatar ? (
              <Image
                source={{ uri: admin.account.avatar }}
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

// STYLES ĐƯỢC ĐỒNG BỘ VỚI CouponsScreen (Minimalist style)
const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 40,
    backgroundColor: "#fff", // Nền trắng chuẩn
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  // --- Header ---
  header: {
    marginBottom: 20,
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

  // --- Cards ---
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
  sectionLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111",
    marginBottom: 10,
  },

  // --- Avatar Section ---
  avatarSection: {
    alignItems: "center",
    paddingVertical: 10,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#000",
    fontSize: 36,
    fontWeight: "bold",
  },
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

  // --- Status Badge (Copied from Coupons) ---
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

  // --- Info Rows ---
  detailsRow: {
    gap: 0,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  separator: {
    height: 1,
    backgroundColor: "#f5f5f5",
  },
  infoLabel: {
    fontSize: 14,
    color: "#666",
  },
  infoValue: {
    fontSize: 14,
    color: "#000",
    fontWeight: "500",
  },

  // --- Form Inputs (Copied from Coupons) ---
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

  // --- Actions (Copied from Coupons) ---
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
  actionButtonText: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 4,
  },
  retryButton: {
    backgroundColor: "#000",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "600",
  },

  // --- Errors ---
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
  errorText: {
    color: "#D32F2F",
    flex: 1,
    fontSize: 14,
  },
  errorClose: {
    color: "#D32F2F",
    fontSize: 18,
    fontWeight: "bold",
    paddingLeft: 12,
  },

  // --- Viewer Modal ---
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
  viewerImage: {
    width: "100%",
    height: 400,
    borderRadius: 8,
  },
});
