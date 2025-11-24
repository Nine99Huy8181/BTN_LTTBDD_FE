import { useAuth } from "@/hooks/AuthContext";
import { addressService } from "@/services/address.service";
import { showToast } from "@/utils/toast";
import { useRouter } from "expo-router";
import { useState } from "react";
import CustomAlertDialog, { ButtonType } from '@/components/CustomAlertDialog';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function AddAddressScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const customerId = user?.customerId || 1;

  const [form, setForm] = useState({
    recipientName: "",
    recipientPhone: "",
    streetAddress: "",
    district: "",
    city: "",
    country: "Việt Nam",
    isDefault: false,
  });

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalProps, setModalProps] = useState<any>({});

  const showAlert = (title: string, message: string, buttons: ButtonType[]) => {
    setModalProps({ title, message, buttons });
    setIsModalVisible(true);
  };
  const handleClose = () => setIsModalVisible(false);

  const [loading, setLoading] = useState(false);

  const handleChange = (key: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (
      !form.recipientName ||
      !form.recipientPhone ||
      !form.streetAddress ||
      !form.city
    ) {
      showToast.error("Lỗi", "Vui lòng điền đầy đủ thông tin bắt buộc!");
      return;
    }

    const newAddress = {
      customerId,
      recipientName: form.recipientName.trim(),
      recipientPhone: form.recipientPhone.trim(),
      streetAddress: form.streetAddress.trim(),
      district: form.district?.trim() || "",
      city: form.city.trim(),
      country: form.country.trim() || "Việt Nam",
      isDefault: form.isDefault,
    };

    setLoading(true);
    try {
      await addressService.createAddress(newAddress);
      // Gọi hàm này sau khi API thêm địa chỉ thành công
      showAlert("Thành công", "Đã thêm địa chỉ mới!", [
        {
          text: "OK",
          style: "default", // Đặt style là 'default' để sử dụng màu xanh/chính
          onPress: () => {
            // Logic điều hướng giữ nguyên
            router.replace("/(customer)/(profile)/address-book");
          },
        },
      ]);
    } catch (error: any) {
      if (error.response?.status === 409) {
        showToast.error(
          "Xung đột dữ liệu",
          'Có thể đã tồn tại địa chỉ mặc định khác. Vui lòng bỏ chọn "Đặt làm mặc định" hoặc chỉnh lại địa chỉ cũ.'
        );
      } else {
        showToast.error("Lỗi", "Không thể thêm địa chỉ. Vui lòng thử lại.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        {/* 🔹 Tiêu đề */}
        <View style={styles.header}>
          <Text style={styles.title}>Thêm địa chỉ mới</Text>
          <View style={styles.titleLine} />
        </View>

        {/* 🔹 Form nhập thông tin */}
        <View style={styles.formCard}>
          <Text style={styles.label}>Tên người nhận *</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập tên người nhận"
            placeholderTextColor="#888"
            value={form.recipientName}
            onChangeText={(text) => handleChange("recipientName", text)}
          />

          <Text style={styles.label}>Số điện thoại *</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập số điện thoại"
            placeholderTextColor="#888"
            keyboardType="phone-pad"
            value={form.recipientPhone}
            onChangeText={(text) => handleChange("recipientPhone", text)}
          />

          <Text style={styles.label}>Địa chỉ *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ví dụ: 123 Đường ABC"
            placeholderTextColor="#888"
            value={form.streetAddress}
            onChangeText={(text) => handleChange("streetAddress", text)}
          />

          <Text style={styles.label}>Quận / Huyện</Text>
          <TextInput
            style={styles.input}
            placeholder="Ví dụ: Quận 1"
            placeholderTextColor="#888"
            value={form.district}
            onChangeText={(text) => handleChange("district", text)}
          />

          <Text style={styles.label}>Thành phố *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ví dụ: TP. Hồ Chí Minh"
            placeholderTextColor="#888"
            value={form.city}
            onChangeText={(text) => handleChange("city", text)}
          />

          <Text style={styles.label}>Quốc gia</Text>
          <TextInput
            style={styles.input}
            placeholder="Việt Nam"
            placeholderTextColor="#888"
            value={form.country}
            onChangeText={(text) => handleChange("country", text)}
          />

          {/* 🔘 Đặt làm mặc định */}
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Đặt làm địa chỉ mặc định</Text>
            <Switch
              value={form.isDefault}
              onValueChange={(value) => handleChange("isDefault", value)}
              thumbColor={form.isDefault ? "#000" : "#ccc"}
            />
          </View>
        </View>

        {/* 🔹 Nút hành động */}
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.primaryButtonText}>
            {loading ? "Đang lưu..." : "Lưu địa chỉ"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.back()}
        >
          <Text style={styles.secondaryButtonText}>Quay lại</Text>
        </TouchableOpacity>
      </ScrollView>

      <CustomAlertDialog
        isVisible={isModalVisible}
        title={modalProps.title || ""}
        message={modalProps.message || ""}
        buttons={modalProps.buttons || []}
        onClose={handleClose}
      />
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
  label: {
    fontWeight: "600",
    marginBottom: 6,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
    fontSize: 15,
    backgroundColor: "#f7f7f7", // 🌿 Nền xám nhẹ cho dịu mắt
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  switchLabel: {
    fontSize: 16,
    color: "#333",
  },
  primaryButton: {
    backgroundColor: "#000",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 10,
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  secondaryButton: {
    backgroundColor: "#fff",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 40,
  },
  secondaryButtonText: {
    color: "#000",
    fontWeight: "600",
    fontSize: 16,
  },
});
