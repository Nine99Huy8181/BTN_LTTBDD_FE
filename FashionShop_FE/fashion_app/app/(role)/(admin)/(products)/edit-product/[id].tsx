// screens/EditProductScreen.tsx
import { productService } from "@/services/product.service";
import {
  isValidImageUri,
  uploadProductImage,
} from "@/services/productImageUpload.service";
import { ProductResponse, UpdateProductRequest } from "@/types";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
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

export default function EditProductScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [product, setProduct] = useState<ProductResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectingFromAlbum, setSelectingFromAlbum] = useState(false);
  const [viewerVisible, setViewerVisible] = useState(false);
  const [viewerImage, setViewerImage] = useState("");

  useEffect(() => {
    fetchProduct();
  }, []);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await productService.getProductById(Number(id));
      setProduct(response);
    } catch (error) {
      Alert.alert("Lỗi", "Không thể tải thông tin sản phẩm");
    } finally {
      setLoading(false);
    }
  };

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

  const handleUpdateProduct = async () => {
    if (!product?.name || !product?.basePrice || !product?.brand) {
      Alert.alert(
        "Lỗi",
        "Vui lòng điền đầy đủ các trường bắt buộc (Tên, Giá, Thương hiệu)"
      );
      return;
    }

    // 1. Khởi tạo biến cục bộ với ảnh hiện tại
    let finalImageUrl = product.image;

    try {
      // 2. Kiểm tra nếu là ảnh local (chưa upload) thì upload và cập nhật biến cục bộ
      if (product?.image && !/^https?:\/\//i.test(String(product.image))) {
        try {
          setUploadingImage(true);
          const uploaded = await uploadProductImage(String(product.image));

          // Cập nhật biến cục bộ (QUAN TRỌNG)
          finalImageUrl = uploaded;

          // Cập nhật state (để UI hiển thị đúng, nhưng không dùng cho payload bên dưới ngay được)
          handleChange("image", uploaded);
        } catch (e) {
          console.error("Upload error:", e);
          Alert.alert("Lỗi", "Không thể tải ảnh lên. Vui lòng thử lại.");
          setUploadingImage(false);
          return;
        } finally {
          setUploadingImage(false);
        }
      }

      // 3. Dùng biến finalImageUrl để tạo payload
      const payload: UpdateProductRequest = {
        name: product.name,
        basePrice: product.basePrice,
        discountPrice: product.discountPrice,
        brand: product.brand,
        description: product.description,
        material: product.material,
        image: finalImageUrl, // <-- Dùng biến cục bộ ở đây, KHÔNG dùng product.image
        status: product.status,
        isFeatured: product.isFeatured,
      };

      await productService.updateProduct(Number(id), payload);
      Alert.alert("Thành công", "Sản phẩm đã được cập nhật");
      router.replace("/(role)/(admin)/(products)");
    } catch (error) {
      Alert.alert("Lỗi", "Không thể cập nhật sản phẩm");
    }
  };

  const handleChange = (key: string, value: string | number | boolean) => {
    // Nếu product null thì không làm gì (hoặc return)
    if (!product) return;
    setProduct({ ...product, [key]: value });
  };

  if (!product) {
    return (
      <View style={styles.container}>
        <ActivityIndicator
          size="large"
          color="#000"
          style={{ marginTop: 50 }}
        />
        <Text style={{ textAlign: "center", marginTop: 10 }}>Đang tải...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Sửa sản phẩm</Text>
          <View style={styles.titleLine} />
        </View>

        {/* Form Card */}
        <View style={styles.formCard}>
          {/* Thông tin cơ bản */}
          <Text style={styles.sectionTitle}>Thông tin cơ bản</Text>

          <Text style={styles.label}>Tên sản phẩm *</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập tên sản phẩm"
            value={product.name}
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
            value={product.brand}
            onChange={(item) => handleChange("brand", item.value)}
          />

          <Text style={styles.label}>Mô tả</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Nhập mô tả"
            multiline
            numberOfLines={4}
            value={product.description}
            onChangeText={(text) => handleChange("description", text)}
          />

          <Text style={styles.label}>Chất liệu</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập chất liệu"
            value={product.material}
            onChangeText={(text) => handleChange("material", text)}
          />

          {/* Giá cả */}
          <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Giá cả</Text>
          <Text style={styles.label}>Giá gốc *</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập giá gốc"
            keyboardType="numeric"
            value={product.basePrice.toString()}
            onChangeText={(text) =>
              handleChange("basePrice", parseFloat(text) || 0)
            }
          />

          <Text style={styles.label}>Giá giảm</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập giá giảm"
            keyboardType="numeric"
            value={product.discountPrice.toString()}
            onChangeText={(text) =>
              handleChange("discountPrice", parseFloat(text) || 0)
            }
          />

          {/* Hình ảnh */}
          <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Hình ảnh</Text>

          {uploadingImage && (
            <View style={styles.uploadingContainer}>
              <ActivityIndicator color="#000" size="small" />
              <Text style={{ marginLeft: 10, color: "#666" }}>
                Đang tải ảnh lên Cloudinary...
              </Text>
            </View>
          )}

          {selectingFromAlbum && (
            <View style={styles.uploadingContainer}>
              <ActivityIndicator color="#000" size="small" />
              <Text style={{ marginLeft: 10, color: "#666" }}>
                Đang tải ảnh từ album...
              </Text>
            </View>
          )}

          {product?.image && (
            <View style={styles.imagePreviewContainer}>
              <TouchableOpacity
                style={{ width: "100%" }}
                onPress={() => {
                  setViewerImage(String(product.image));
                  setViewerVisible(true);
                }}
              >
                <Image
                  source={{ uri: product.image }}
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

          <Text style={styles.label}>Hoặc nhập URL hình ảnh</Text>
          <TextInput
            style={styles.input}
            placeholder="https://example.com/image.jpg"
            value={product?.image}
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
                product.status === "active" && styles.statusButtonActive,
              ]}
              onPress={() => handleChange("status", "active")}
            >
              <Text
                style={[
                  styles.statusButtonText,
                  product.status === "active" && styles.statusButtonTextActive,
                ]}
              >
                Hoạt động
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.statusButton,
                product.status === "inactive" && styles.statusButtonActive,
              ]}
              onPress={() => handleChange("status", "inactive")}
            >
              <Text
                style={[
                  styles.statusButtonText,
                  product.status === "inactive" &&
                    styles.statusButtonTextActive,
                ]}
              >
                Không hoạt động
              </Text>
            </TouchableOpacity>
          </View>

          {/* Nổi bật */}
          <View style={styles.switchRow}>
            <View>
              <Text style={styles.switchLabel}>Sản phẩm nổi bật</Text>
              <Text style={styles.switchHint}>Hiển thị ở trang chủ</Text>
            </View>
            <Switch
              value={product.isFeatured}
              onValueChange={(value) => handleChange("isFeatured", value)}
              thumbColor={product.isFeatured ? "#000" : "#ccc"}
              trackColor={{ false: "#d1d5db", true: "#9ca3af" }}
            />
          </View>
        </View>

        {/* Buttons */}
        <TouchableOpacity
          style={[styles.primaryButton, loading && styles.buttonDisabled]}
          onPress={handleUpdateProduct}
          disabled={loading}
        >
          <Text style={styles.primaryButtonText}>
            {loading ? "Đang lưu..." : "Cập nhật sản phẩm"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.back()}
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
