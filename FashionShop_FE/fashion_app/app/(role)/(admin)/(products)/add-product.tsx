// screens/AddProductScreen.tsx
import { productService } from "@/services/product.service";
import {
  isValidImageUri,
  uploadProductImage,
} from "@/services/productImageUpload.service";
import { Product } from "@/types";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
export default function AddProductScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false); // ✅ Thêm state
  const [selectingFromAlbum, setSelectingFromAlbum] = useState(false);
  const [viewerVisible, setViewerVisible] = useState(false);
  const [viewerImage, setViewerImage] = useState("");

  const [form, setForm] = useState<Partial<Product>>({
    name: "",
    description: "",
    brand: "",
    basePrice: 0,
    discountPrice: 0,
    material: "",
    status: "active",
    averageRating: 0,
    reviewCount: 0,
    isFeatured: false,
    image: "",
  });

  const handleChange = (key: string, value: string | number | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // ✅ THÊM hàm pickImage
  const pickImage = async () => {
    try {
      setSelectingFromAlbum(true);
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        setSelectingFromAlbum(false);
        Alert.alert("Quyền truy cập bị từ chối", "Không thể chọn ảnh");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
        allowsMultipleSelection: false,
      });

      if (!result.canceled && result.assets?.length > 0) {
        const uri = result.assets[0].uri;

        if (!isValidImageUri(uri)) {
          setSelectingFromAlbum(false);
          Alert.alert("Lỗi", "URI ảnh không hợp lệ");
          return;
        }

        // Do not upload yet - keep local URI in form.image
        handleChange("image", uri);
      }
    } catch (error) {
      console.error("Pick image error:", error);
      Alert.alert("Lỗi", "Không thể chọn ảnh");
      setSelectingFromAlbum(false);
    } finally {
      setSelectingFromAlbum(false);
    }
  };

  const handleAddProduct = async () => {
    if (!form.name || !form.basePrice || !form.brand) {
      Alert.alert(
        "Lỗi",
        "Vui lòng điền đầy đủ các trường bắt buộc (Tên, Giá, Thương hiệu)"
      );
      return;
    }

    if (form.basePrice <= 0) {
      Alert.alert("Lỗi", "Giá sản phẩm phải lớn hơn 0");
      return;
    }

    setLoading(true);
    try {
      // If image is a local URI (not yet uploaded), upload now
      if (form.image && !/^https?:\/\//i.test(String(form.image))) {
        try {
          setUploadingImage(true);
          const uploaded = await uploadProductImage(String(form.image));
          handleChange("image", uploaded);
        } catch (e) {
          console.error("Upload error:", e);
          Alert.alert("Lỗi", "Không thể tải ảnh lên. Vui lòng thử lại.");
          setUploadingImage(false);
          setLoading(false);
          return;
        } finally {
          setUploadingImage(false);
        }
      }
      await productService.createProduct(form as Product);
      Alert.alert("Thành công", "Sản phẩm đã được thêm!", [
        {
          text: "OK",
          onPress: () => router.replace("/(role)/(admin)/(products)"),
        },
      ]);
    } catch (error: any) {
      console.error("Add product error:", error);
      Alert.alert(
        "Lỗi",
        error.message || "Không thể thêm sản phẩm. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        {/* 🔹 Tiêu đề */}
        <View style={styles.header}>
          <Text style={styles.title}>Thêm sản phẩm mới</Text>
          <View style={styles.titleLine} />
        </View>

        {/* 🔹 Form nhập thông tin */}
        <View style={styles.formCard}>
          {/* Thông tin cơ bản */}
          <Text style={styles.sectionTitle}>Thông tin cơ bản</Text>

          <Text style={styles.label}>Tên sản phẩm *</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập tên sản phẩm"
            placeholderTextColor="#888"
            value={form.name}
            onChangeText={(text) => handleChange("name", text)}
          />

          <Text style={styles.label}>Thương hiệu *</Text>
          <Dropdown
            style={styles.dropdown}
            data={[
              { label: "Việt Shop", value: "Việt Shop" },
              { label: "Việt Shop 2", value: "Việt Shop 2" },
            ]}
            labelField="label"
            valueField="value"
            placeholder="Chọn thương hiệu"
            value={form.brand}
            onChange={(item) => handleChange("brand", item.value)}
          />

          <Text style={styles.label}>Mô tả</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Nhập mô tả chi tiết về sản phẩm"
            placeholderTextColor="#888"
            value={form.description}
            onChangeText={(text) => handleChange("description", text)}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          <Text style={styles.label}>Chất liệu</Text>
          <TextInput
            style={styles.input}
            placeholder="Ví dụ: Cotton, Polyester, Leather, ABS..."
            placeholderTextColor="#888"
            value={form.material}
            onChangeText={(text) => handleChange("material", text)}
          />

          {/* Giá cả */}
          <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Giá cả</Text>

          <Text style={styles.label}>Giá gốc *</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập giá gốc (VNĐ)"
            placeholderTextColor="#888"
            keyboardType="numeric"
            value={form.basePrice?.toString() || ""}
            onChangeText={(text) =>
              handleChange("basePrice", parseFloat(text) || 0)
            }
          />

          <Text style={styles.label}>Giá giảm</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập giá sau giảm (VNĐ) - để trống nếu không giảm"
            placeholderTextColor="#888"
            keyboardType="numeric"
            value={form.discountPrice?.toString() || ""}
            onChangeText={(text) =>
              handleChange("discountPrice", parseFloat(text) || 0)
            }
          />

          {/* Hình ảnh */}
          <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Hình ảnh</Text>

          {/* ✅ Hiển thị loading khi đang upload */}
          {uploadingImage && (
            <View style={styles.uploadingContainer}>
              <ActivityIndicator color="#000" size="small" />
              <Text style={{ marginLeft: 10, color: "#666" }}>
                Đang tải ảnh lên Cloudinary...
              </Text>
            </View>
          )}

          {/* ✅ Preview ảnh nếu có */}
          {form.image && (
            <View style={styles.imagePreviewContainer}>
              <TouchableOpacity
                style={{ width: "100%" }}
                onPress={() => {
                  setViewerImage(String(form.image));
                  setViewerVisible(true);
                }}
              >
                <Image
                  source={{ uri: String(form.image) }}
                  style={styles.imagePreview}
                  resizeMode="cover"
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={() => handleChange("image", "")}
              >
                <Text style={styles.removeImageText}>× Xóa ảnh</Text>
              </TouchableOpacity>
            </View>
          )}

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
                <Image
                  source={{ uri: viewerImage }}
                  style={styles.viewerImage}
                  resizeMode="contain"
                />
              </View>
            </TouchableOpacity>
          </Modal>

          {/* ✅ Nút tải ảnh từ thư viện */}
          <TouchableOpacity
            style={[
              styles.uploadButton,
              (uploadingImage || selectingFromAlbum) && {
                opacity: 0.5,
                backgroundColor: "#f5f5f5",
              },
            ]}
            onPress={pickImage}
            disabled={uploadingImage || selectingFromAlbum}
          >
            <Text style={styles.uploadButtonText}>
              {selectingFromAlbum
                ? "⏳ Đang chọn ảnh..."
                : uploadingImage
                  ? "⏳ Đang tải..."
                  : "📂 Tải ảnh từ thư viện"}
            </Text>
          </TouchableOpacity>

          {/* Hiển thị trạng thái khi đang chọn từ album */}
          {selectingFromAlbum && (
            <View style={styles.uploadingContainer}>
              <ActivityIndicator color="#000" size="small" />
              <Text style={{ marginLeft: 10, color: "#666" }}>
                Đang tải ảnh từ album...
              </Text>
            </View>
          )}

          {/* ✅ Input URL (backup option) */}
          <Text style={styles.label}>Hoặc nhập URL hình ảnh</Text>
          <TextInput
            style={styles.input}
            placeholder="https://example.com/image.jpg"
            placeholderTextColor="#888"
            value={form.image}
            onChangeText={(text) => handleChange("image", text)}
            editable={!uploadingImage}
          />

          {/* Cài đặt */}
          <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Cài đặt</Text>

          <Text style={styles.label}>Trạng thái</Text>
          <View style={styles.statusContainer}>
            <TouchableOpacity
              style={[
                styles.statusButton,
                form.status === "active" && styles.statusButtonActive,
              ]}
              onPress={() => handleChange("status", "active")}
            >
              <Text
                style={[
                  styles.statusButtonText,
                  form.status === "active" && styles.statusButtonTextActive,
                ]}
              >
                Hoạt động
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.statusButton,
                form.status === "inactive" && styles.statusButtonActive,
              ]}
              onPress={() => handleChange("status", "inactive")}
            >
              <Text
                style={[
                  styles.statusButtonText,
                  form.status === "inactive" && styles.statusButtonTextActive,
                ]}
              >
                Không hoạt động
              </Text>
            </TouchableOpacity>
          </View>

          {/* 🔘 Sản phẩm nổi bật */}
          <View style={styles.switchRow}>
            <View>
              <Text style={styles.switchLabel}>Sản phẩm nổi bật</Text>
              <Text style={styles.switchHint}>Hiển thị ở trang chủ</Text>
            </View>
            <Switch
              value={form.isFeatured}
              onValueChange={(value) => handleChange("isFeatured", value)}
              thumbColor={form.isFeatured ? "#000" : "#ccc"}
              trackColor={{ false: "#d1d5db", true: "#9ca3af" }}
            />
          </View>
        </View>

        {/* 🔹 Nút hành động */}
        <TouchableOpacity
          style={[styles.primaryButton, loading && styles.buttonDisabled]}
          onPress={handleAddProduct}
          disabled={loading}
        >
          <Text style={styles.primaryButtonText}>
            {loading ? "Đang lưu..." : "Thêm sản phẩm"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.back()}
          disabled={loading}
        >
          <Text style={styles.secondaryButtonText}>Quay lại</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 40,
    backgroundColor: "#fff",
  },
  header: {
    marginBottom: 25,
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
    marginTop: 6,
  },
  formCard: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 14,
    padding: 16,
    marginBottom: 30,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111",
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  label: {
    fontWeight: "600",
    marginBottom: 6,
    color: "#333",
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    fontSize: 15,
    backgroundColor: "#f7f7f7",
    color: "#111",
  },
  textArea: {
    minHeight: 100,
    paddingTop: 12,
  },
  statusContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 15,
  },
  statusButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#f7f7f7",
    alignItems: "center",
  },
  statusButtonActive: {
    backgroundColor: "#000",
    borderColor: "#000",
  },
  statusButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  statusButtonTextActive: {
    color: "#fff",
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    paddingVertical: 8,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  switchHint: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  primaryButton: {
    backgroundColor: "#000",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  buttonDisabled: {
    backgroundColor: "#9ca3af",
    opacity: 0.7,
  },
  secondaryButton: {
    backgroundColor: "#fff",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 20,
  },
  secondaryButtonText: {
    color: "#000",
    fontWeight: "600",
    fontSize: 16,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    marginBottom: 15,
    backgroundColor: "#f7f7f7",
  },

  picker: {
    height: 50,
    width: "100%",
  },
  dropdown: {
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    backgroundColor: "#f7f7f7",
    marginBottom: 15,
  },
  uploadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  viewerOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
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
  },
  imagePreviewContainer: {
    marginBottom: 15,
    alignItems: "center",
  },
  imagePreview: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 10,
  },
  removeImageButton: {
    backgroundColor: "#FF3B30",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  removeImageText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  uploadButton: {
    borderWidth: 1,
    borderColor: "#000",
    borderStyle: "dashed",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 15,
    backgroundColor: "#fff",
  },
  uploadButtonText: {
    fontWeight: "600",
    color: "#000",
    fontSize: 15,
  },
});
