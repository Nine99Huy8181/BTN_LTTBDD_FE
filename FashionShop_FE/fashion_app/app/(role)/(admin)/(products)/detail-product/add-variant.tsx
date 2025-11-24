// screens/AddVariantScreen.tsx
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

export default function AddVariantScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [viewerVisible, setViewerVisible] = useState(false);
  const [viewerImage, setViewerImage] = useState("");
  const [selectingFromAlbum, setSelectingFromAlbum] = useState(false);

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
    const p = (params as any).productID ?? (params as any).productId;
    if (p) {
      const n = Number(p);
      if (!isNaN(n)) setProductID(n);
    }
  }, [params]);

  const pickImage = async () => {
    try {
      setSelectingFromAlbum(true);
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        setSelectingFromAlbum(false);
        showToast.error("Quyền truy cập bị từ chối", "Không thể chọn ảnh");
        return;
      }

      // Allow multiple selection here; do NOT upload yet — only collect local URIs
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
        allowsMultipleSelection: true,
      });

      if (!result.canceled && result.assets?.length > 0) {
        const uris = result.assets.map((a) => a.uri).filter(Boolean);

        // Validate URIs and add them to state as local URIs (no upload now)
        const validUris = uris.filter((uri) => isValidImageUri(uri));
        if (validUris.length === 0) {
          showToast.error("Lỗi", "Không có URI ảnh hợp lệ");
          return;
        }

        setImages((prev) => [...prev, ...validUris]);
      }
    } catch (error) {
      console.log("Pick image error:", error);
      showToast.error("Lỗi", "Không thể chọn ảnh");
      setSelectingFromAlbum(false);
      setUploadingImages(false);
    } finally {
      setSelectingFromAlbum(false);
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
      showToast.error("Lỗi", "SKU là bắt buộc");
      return;
    }

    if (!productID || productID <= 0) {
      showToast.error("Lỗi", "ProductID không hợp lệ");
      return;
    }

    try {
      setLoading(true);

      // If there are local URIs (not yet uploaded), upload them now
      // Detect remote URLs by checking prefix "http"
      const needUpload = images.filter((u) => !/^https?:\/\//i.test(u));
      let finalImages = images.slice();

      if (needUpload.length > 0) {
        try {
          setUploadingImages(true);
          const uploaded = await Promise.all(
            needUpload.map(async (uri) => {
              try {
                return await uploadVariantImage(uri);
              } catch (e) {
                console.log("Upload single image failed:", e);
                throw e;
              }
            })
          );

          // Replace local URIs with uploaded URLs in finalImages
          let uploadIndex = 0;
          finalImages = finalImages.map((u) =>
            !/^https?:\/\//i.test(u) ? uploaded[uploadIndex++] : u
          );
        } catch (e) {
          showToast.error("Lỗi", "Không thể tải ảnh lên. Vui lòng thử lại.");
          setUploadingImages(false);
          setLoading(false);
          return;
        } finally {
          setUploadingImages(false);
        }
      }

      const createPayload: any = {
        productID: productID,
        sku: sku.trim(),
        size: size.trim(),
        color: color.trim(),
        priceAdjustment: priceAdj,
        images: finalImages,
        status,
      };

      const validQuantity = Math.max(0, totalQuantity - reservedQuantity);
      createPayload.validQuantity = validQuantity;
      createPayload.reservedQuantity = reservedQuantity;

      await productVariantService.createVariant(createPayload);

      showToast.success("Thành công", "Biến thể đã được tạo");
      router.back();
    } catch (error) {
      showToast.error("Lỗi", "Không thể tạo biến thể");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#fff" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        {/* 🔹 Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Thêm biến thể mới</Text>
          <View style={styles.titleLine} />
        </View>

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color="#000" />
            <Text style={{ marginLeft: 10 }}>Đang xử lý...</Text>
          </View>
        )}

        {/* 🔹 Form Card */}
        <View style={styles.card}>
          {/* Product ID Section */}
          {/* <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Product ID <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={productID ? productID.toString() : ""}
              onChangeText={(t) => setProductID(parseInt(t) || 0)}
              placeholder="Nhập ID sản phẩm"
            />
          </View> */}
          {productID > 0 && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Thêm biến thể cho Product ID</Text>
              <View
                style={[
                  styles.input,
                  styles.inputDisabled,
                  { justifyContent: "center" },
                ]}
              >
                <Text style={{ color: "#888", fontSize: 15 }}>
                  #{productID}
                </Text>
              </View>
            </View>
          )}

          {/* SKU Section */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Mã SKU <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={sku}
              onChangeText={setSku}
              placeholder="Ví dụ: SKU0001"
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
                placeholder="S, M, L..."
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Màu sắc (Color)</Text>
              <TextInput
                style={styles.input}
                value={color}
                onChangeText={setColor}
                placeholder="Đỏ, Xanh..."
              />
            </View>
          </View>

          {/* Price Adjustment */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Điều chỉnh giá (+/- VNĐ)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={priceAdj.toString()}
              onChangeText={(t) => setPriceAdj(parseFloat(t) || 0)}
              placeholder="0"
            />
            <Text style={styles.helperText}>
              Nhập số dương để tăng giá, số âm để giảm giá so với giá gốc.
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
            <Text style={styles.label}>Sẵn có (Available)</Text>
            <TextInput
              style={[styles.input, styles.inputDisabled]}
              value={Math.max(0, totalQuantity - reservedQuantity).toString()}
              editable={false}
            />
          </View>

          {/* Images Section */}
          <Text style={styles.sectionHeader}>Hình ảnh biến thể</Text>

          {/* ✅ Hiển thị trạng thái uploading */}
          {uploadingImages && (
            <View style={styles.uploadingContainer}>
              <ActivityIndicator color="#000" size="small" />
              <Text style={{ marginLeft: 10, color: "#666" }}>
                Đang tải ảnh lên Cloudinary...
              </Text>
            </View>
          )}

          {/* Hiển thị trạng thái khi đang mở album / chọn ảnh */}
          {selectingFromAlbum && (
            <View style={styles.uploadingContainer}>
              <ActivityIndicator color="#000" size="small" />
              <Text style={{ marginLeft: 10, color: "#666" }}>
                Đang tải ảnh từ album...
              </Text>
            </View>
          )}

          <View style={styles.imageInputContainer}>
            <TextInput
              style={[styles.input, { flex: 1, marginBottom: 0 }]}
              placeholder="Dán URL ảnh vào đây..."
              value={newImageUrl}
              onChangeText={setNewImageUrl}
            />
            <TouchableOpacity style={styles.addUrlBtn} onPress={addImageUrl}>
              <Text style={styles.addUrlText}>+ Thêm</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.uploadBtn}
            onPress={pickImage}
            disabled={selectingFromAlbum}
          >
            <Text style={styles.uploadBtnText}>📂 Tải ảnh từ thư viện</Text>
          </TouchableOpacity>

          <View style={styles.imagesRow}>
            {images.map((img, idx) => (
              <View key={idx} style={styles.imageWrapper}>
                <TouchableOpacity
                  onPress={() => {
                    setViewerImage(img);
                    setViewerVisible(true);
                  }}
                >
                  <Image source={{ uri: img }} style={styles.imageThumb} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.removeImageBtn}
                  onPress={() => removeImageAt(idx)}
                >
                  <Text style={styles.removeImageText}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>

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

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={saveVariant}
              disabled={loading}
            >
              <Text style={styles.primaryButtonText}>
                {loading ? "Đang lưu..." : "Tạo biến thể"}
              </Text>
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
    paddingBottom: 80,
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
  loadingContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 15,
  },

  // Card Form
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    // Shadow effect
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
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

  // Section Header
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
    marginTop: 10,
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
});
