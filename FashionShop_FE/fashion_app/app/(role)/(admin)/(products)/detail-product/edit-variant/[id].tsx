// screens/EditVariantScreen.tsx
import { productVariantService } from "@/services/productvariant.service";
import {
  isValidImageUri,
  uploadVariantImage,
} from "@/services/variantImageUpload.service";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
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

export default function EditVariantScreen() {
  const { id } = useLocalSearchParams(); // variantID
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true); // State riêng cho việc load dữ liệu ban đầu
  const [uploadingImages, setUploadingImages] = useState(false);

  // Form state
  const [productID, setProductID] = useState<number>(0);
  const [sku, setSku] = useState("");
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [priceAdj, setPriceAdj] = useState<number>(0);
  const [images, setImages] = useState<string[]>([]);
  const [status, setStatus] = useState("active");
  const [totalQuantity, setTotalQuantity] = useState<number>(0);
  const [reservedQuantity, setReservedQuantity] = useState<number>(0);
  const [newImageUrl, setNewImageUrl] = useState("");

  useEffect(() => {
    fetchVariantDetail();
  }, []);

  const fetchVariantDetail = async () => {
    try {
      setFetching(true);

      const variant = await productVariantService.getVariantById(Number(id));

      setProductID(variant.productID);
      setSku(variant.sku);
      setSize(variant.size);
      setColor(variant.color);
      setPriceAdj(variant.priceAdjustment);
      setImages(variant.images || []);
      setStatus(variant.status);

      // Logic tính toán inventory cũ của bạn
      const reservedFromResp =
        (variant as any).reservedQuantity ??
        (variant as any).inventory?.reservedQuantity ??
        0;
      const validFromResp =
        (variant as any).validQuantity ??
        (variant as any).inventory?.quantity ??
        0;

      // totalQuantity (input field) = valid + reserved
      setTotalQuantity((validFromResp ?? 0) + (reservedFromResp ?? 0));
      setReservedQuantity(reservedFromResp ?? 0);
    } catch (error) {
      Alert.alert("Lỗi", "Không thể tải thông tin biến thể");
      router.back();
    } finally {
      setFetching(false);
    }
  };

  const pickImage = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
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

        // Validate URI
        if (!isValidImageUri(uri)) {
          Alert.alert("Lỗi", "URI ảnh không hợp lệ");
          return;
        }

        // Show loading
        setUploadingImages(true);

        try {
          // Upload lên Cloudinary
          const cloudinaryUrl = await uploadVariantImage(uri);

          // Thêm URL vào state
          setImages((prev) => [...prev, cloudinaryUrl]);

          Alert.alert("Thành công", "Đã tải ảnh lên Cloudinary");
        } catch (error) {
          console.error("Upload error:", error);
          Alert.alert("Lỗi", "Không thể tải ảnh lên. Vui lòng thử lại.");
        } finally {
          setUploadingImages(false);
        }
      }
    } catch (error) {
      console.error("Pick image error:", error);
      Alert.alert("Lỗi", "Không thể chọn ảnh");
      setUploadingImages(false);
    }
  };

  const addImageUrl = () => {
    if (!newImageUrl.trim()) return;
    setImages((prev) => [...prev, newImageUrl.trim()]);
    setNewImageUrl("");
  };

  const removeImageAt = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const saveVariant = async () => {
    if (!sku.trim()) {
      Alert.alert("Lỗi", "SKU là bắt buộc");
      return;
    }

    try {
      setLoading(true);

      const payload: any = {
        productID: productID,
        sku: sku.trim(),
        size: size.trim(),
        color: color.trim(),
        priceAdjustment: priceAdj,
        images: images,
        status,
        validQuantity: Math.max(0, totalQuantity - reservedQuantity),
        reservedQuantity: reservedQuantity,
      };

      await productVariantService.updateVariant(Number(id), payload);

      Alert.alert("Thành công", "Biến thể đã được cập nhật");
      router.back();
    } catch (error) {
      Alert.alert("Lỗi", "Không thể lưu biến thể");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#000" />
        <Text style={{ marginTop: 10 }}>Đang tải dữ liệu...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#fff" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        {/* 🔹 Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Chỉnh sửa biến thể</Text>
          <View style={styles.titleLine} />
        </View>

        {/* 🔹 Form Card */}
        <View style={styles.card}>
          {/* SKU Section */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Mã SKU <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={sku}
              onChangeText={setSku}
              placeholder="Ví dụ: VNI-Ao-Do-L"
            />
          </View>

          {/* Size & Color Row */}
          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
              <Text style={styles.label}>Kích thước (Size)</Text>
              <TextInput
                style={styles.input}
                value={size}
                onChangeText={setSize}
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Màu sắc (Color)</Text>
              <TextInput
                style={styles.input}
                value={color}
                onChangeText={setColor}
              />
            </View>
          </View>

          {/* Price Adjustment */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Điều chỉnh giá (+/-)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={priceAdj.toString()}
              onChangeText={(t) => setPriceAdj(parseFloat(t) || 0)}
            />
            <Text style={styles.helperText}>
              Giá biến thể = Giá gốc + Giá điều chỉnh
            </Text>
          </View>

          {/* Inventory Section */}
          <Text style={styles.sectionHeader}>Kho hàng</Text>
          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
              <Text style={styles.label}>Tổng số lượng</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={totalQuantity.toString()}
                onChangeText={(t) => setTotalQuantity(parseInt(t) || 0)}
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Đã đặt (Reserved)</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={reservedQuantity.toString()}
                onChangeText={(t) => setReservedQuantity(parseInt(t) || 0)}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Sẵn sàng bán (Available)</Text>
            <TextInput
              style={[styles.input, styles.inputDisabled]}
              value={Math.max(0, totalQuantity - reservedQuantity).toString()}
              editable={false}
            />
          </View>

          {/* Images Section */}
          <Text style={styles.sectionHeader}>Hình ảnh</Text>

          {/* ✅ Hiển thị trạng thái uploading */}
          {uploadingImages && (
            <View style={styles.uploadingContainer}>
              <ActivityIndicator color="#000" size="small" />
              <Text style={{ marginLeft: 10, color: "#666" }}>
                Đang tải ảnh lên Cloudinary...
              </Text>
            </View>
          )}

          <View style={styles.imageInputContainer}>
            <TextInput
              style={[styles.input, { flex: 1, marginBottom: 0 }]}
              placeholder="Dán URL ảnh..."
              value={newImageUrl}
              onChangeText={setNewImageUrl}
            />
            <TouchableOpacity style={styles.addUrlBtn} onPress={addImageUrl}>
              <Text style={styles.addUrlText}>+ Thêm</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.uploadBtn} onPress={pickImage}>
            <Text style={styles.uploadBtnText}>📂 Chọn ảnh từ thư viện</Text>
          </TouchableOpacity>

          <View style={styles.imagesRow}>
            {images.map((img, idx) => (
              <View key={idx} style={styles.imageWrapper}>
                <Image source={{ uri: img }} style={styles.imageThumb} />
                <TouchableOpacity
                  style={styles.removeImageBtn}
                  onPress={() => removeImageAt(idx)}
                >
                  <Text style={styles.removeImageText}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={saveVariant}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryButtonText}>Lưu thay đổi</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => router.back()}
            >
              <Text style={styles.secondaryButtonText}>Hủy bỏ</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 40,
    paddingBottom: 60,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  // Header
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111",
  },
  titleLine: {
    width: 50,
    height: 4,
    backgroundColor: "#000",
    borderRadius: 2,
    marginTop: 8,
  },

  // Card
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },

  // Inputs
  inputGroup: {
    marginBottom: 16,
  },
  row: {
    flexDirection: "row",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  required: {
    color: "#e91e63",
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    paddingHorizontal: 15,
    fontSize: 15,
    color: "#000",
  },
  inputDisabled: {
    backgroundColor: "#eeeeee",
    color: "#888",
  },
  helperText: {
    fontSize: 12,
    color: "#888",
    marginTop: 5,
    fontStyle: "italic",
  },

  // Section Headers
  sectionHeader: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
    marginTop: 10,
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 5,
  },

  // Image Handling
  imageInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 10,
  },
  addUrlBtn: {
    backgroundColor: "#000",
    height: 48,
    paddingHorizontal: 15,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  addUrlText: {
    color: "#fff",
    fontWeight: "600",
  },
  uploadBtn: {
    borderWidth: 1,
    borderColor: "#000",
    borderStyle: "dashed",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 15,
    backgroundColor: "#fff",
  },
  uploadBtnText: {
    fontWeight: "600",
    color: "#000",
  },
  imagesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 10,
  },
  imageWrapper: {
    position: "relative",
    marginRight: 10,
    marginBottom: 10,
  },
  imageThumb: {
    width: 70,
    height: 70,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  removeImageBtn: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "#FF3B30",
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#fff",
  },
  removeImageText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
    marginTop: -2,
  },

  // Buttons
  buttonContainer: {
    marginTop: 15,
  },
  primaryButton: {
    backgroundColor: "#000",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 3,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  secondaryButton: {
    backgroundColor: "#fff",
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  secondaryButtonText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "600",
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
});
