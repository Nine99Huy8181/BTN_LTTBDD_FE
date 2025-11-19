// screens/ProductDetailScreen.tsx
import { productVariantService } from "@/services/productvariant.service";
import { ProductVariantResponse } from "@/types";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [variants, setVariants] = useState<ProductVariantResponse[]>([]);
  const [loading, setLoading] = useState(false);

  // Sử dụng useFocusEffect để refresh khi quay lại từ EditVariantScreen
  useFocusEffect(
    useCallback(() => {
      fetchVariants();
    }, [])
  );

  const fetchVariants = async () => {
    try {
      setLoading(true);
      const res = await productVariantService.getVariantsByProductId(
        Number(id)
      );
      setVariants(res);
    } catch (error) {
      Alert.alert("Lỗi", "Không thể tải variants");
    } finally {
      setLoading(false);
    }
  };

  const openCreateForm = () => {
    router.push(
      `/(role)/(admin)/(products)/detail-product/add-variant?productId=${id}`
    );
  };

  const openEditForm = (v: ProductVariantResponse) => {
    router.push(
      `/(role)/(admin)/(products)/detail-product/edit-variant/${v.variantID}?productId=${id}`
    );
  };

  const confirmDeleteVariant = (variantId: number) => {
    Alert.alert("Xác nhận", "Bạn có chắc muốn xóa biến thể này?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          try {
            setLoading(true);
            await productVariantService.deleteVariant(variantId);
            Alert.alert("Đã xóa");
            fetchVariants();
          } catch (error) {
            Alert.alert("Lỗi", "Không thể xóa biến thể");
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  const renderVariant = ({ item }: { item: ProductVariantResponse }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.variantSku}>{item.sku}</Text>
        <Text style={styles.variantQty}>Qty: {item.validQuantity ?? 0}</Text>
      </View>
      <Text style={styles.variantInfo}>Size: {item.size || "-"} </Text>
      <Text style={styles.variantInfo}>Color: {item.color || "-"} </Text>
      <Text style={styles.variantInfo}>+Price: {item.priceAdjustment}</Text>
      <View style={styles.imagesRow}>
        {item.images?.map((img, idx) => (
          <TouchableOpacity key={idx} onPress={() => {}}>
            <View style={styles.imageBox}>
              <Image source={{ uri: img }} style={styles.thumb} />
            </View>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => openEditForm(item)}
        >
          <Text style={styles.actionText}>Sửa</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, styles.deleteBtn]}
          onPress={() => confirmDeleteVariant(item.variantID)}
        >
          <Text style={[styles.actionText, { color: "#FF3B30" }]}>Xóa</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <FlatList
        contentContainerStyle={styles.container}
        data={variants}
        keyExtractor={(v) => v.variantID.toString()}
        renderItem={renderVariant}
        ListHeaderComponent={() => (
          <View>
            <View style={styles.header}>
              <Text style={styles.title}>Biến thể của sản phẩm</Text>
            </View>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={openCreateForm}
            >
              <Text style={styles.primaryButtonText}>+ Thêm variant</Text>
            </TouchableOpacity>

            {loading && <ActivityIndicator style={{ marginTop: 20 }} />}
          </View>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListFooterComponent={() => <View style={{ height: 40 }} />}
        extraData={variants}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 30,
    backgroundColor: "#fff",
  },
  header: { marginBottom: 12 },
  title: { fontSize: 20, fontWeight: "700", color: "#111" },
  primaryButton: {
    backgroundColor: "#000",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginVertical: 12,
  },
  primaryButtonText: { color: "#fff", fontWeight: "600" },
  secondaryButton: {
    backgroundColor: "#fff",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
  },
  secondaryButtonText: { color: "#000", fontWeight: "600" },
  card: {
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 12,
    padding: 12,
    backgroundColor: "#fff",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  variantSku: { fontWeight: "700" },
  variantQty: { color: "#666" },
  variantInfo: { color: "#444", marginBottom: 4 },
  imagesRow: { flexDirection: "row", gap: 8, flexWrap: "wrap", marginTop: 8 },
  imageBox: {
    width: 80,
    height: 50,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    padding: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 10,
  },
  actionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#fff",
  },
  deleteBtn: { borderColor: "#FF3B30", backgroundColor: "#FFF5F5" },
  actionText: { fontWeight: "600" },
  thumb: {
    width: "100%",
    height: "100%",
    borderRadius: 6,
    resizeMode: "cover",
  },
});
