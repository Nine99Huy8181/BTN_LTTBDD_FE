// app/(role)/(admin)/(more)/add-coupon.tsx
import { couponService } from "@/services/coupon.service";
import { Coupon } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function AddCouponScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Form States
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [startDateObj, setStartDateObj] = useState<Date | null>(null);
  const [endDateObj, setEndDateObj] = useState<Date | null>(null);

  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [discountValue, setDiscountValue] = useState("");
  const [discountType, setDiscountType] = useState<
    "PERCENTAGE" | "FIXED_AMOUNT"
  >("PERCENTAGE");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [maxUses, setMaxUses] = useState("");
  const [conditions, setConditions] = useState("");
  const [status, setStatus] = useState<"ACTIVE" | "INACTIVE">("ACTIVE");

  // Validation
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!code.trim()) {
      newErrors.code = "Vui lòng nhập mã giảm giá";
    } else if (code.length < 3) {
      newErrors.code = "Mã phải có ít nhất 3 ký tự";
    }

    if (!description.trim()) {
      newErrors.description = "Vui lòng nhập mô tả";
    }

    if (!discountValue.trim()) {
      newErrors.discountValue = "Vui lòng nhập giá trị giảm";
    } else {
      const value = parseFloat(discountValue);
      if (isNaN(value) || value <= 0) {
        newErrors.discountValue = "Giá trị phải lớn hơn 0";
      }
      if (discountType === "PERCENTAGE" && value > 100) {
        newErrors.discountValue = "Phần trăm không được vượt quá 100";
      }
    }

    if (!startDate.trim()) {
      newErrors.startDate = "Vui lòng nhập ngày bắt đầu";
    }

    if (!endDate.trim()) {
      newErrors.endDate = "Vui lòng nhập ngày kết thúc";
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (start >= end) {
        newErrors.endDate = "Ngày kết thúc phải sau ngày bắt đầu";
      }
    }

    if (maxUses.trim()) {
      const value = parseInt(maxUses);
      if (isNaN(value) || value <= 0) {
        newErrors.maxUses = "Số lần sử dụng phải lớn hơn 0";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Hàm xử lý chọn ngày
  const onStartDateChange = (event: any, selectedDate?: Date) => {
    setShowStartPicker(Platform.OS === "ios"); // iOS giữ picker mở
    if (selectedDate) {
      setStartDateObj(selectedDate);
      setStartDate(selectedDate.toISOString().split("T")[0]); // YYYY-MM-DD
      if (errors.startDate) setErrors({ ...errors, startDate: "" });
    }
  };

  const onEndDateChange = (event: any, selectedDate?: Date) => {
    setShowEndPicker(Platform.OS === "ios");
    if (selectedDate) {
      setEndDateObj(selectedDate);
      setEndDate(selectedDate.toISOString().split("T")[0]);
      if (errors.endDate) setErrors({ ...errors, endDate: "" });
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert("Lỗi", "Vui lòng kiểm tra lại thông tin");
      return;
    }

    try {
      setLoading(true);

      const couponData: Omit<Coupon, "couponID"> = {
        code: code.trim().toUpperCase(),
        description: description.trim(),
        discountValue: parseFloat(discountValue),
        discountType,
        startDate,
        endDate,
        maxUses: maxUses ? parseInt(maxUses) : undefined,
        usedCount: 0,
        conditions: conditions.trim() || undefined,
        status,
      };

      await couponService.createCoupon(couponData);
      Alert.alert("Thành công", "Đã tạo mã giảm giá mới", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (error: any) {
      console.error("Error creating coupon:", error);
      const message =
        error.response?.data?.message || "Không thể tạo mã giảm giá";
      Alert.alert("Lỗi", message);
    } finally {
      setLoading(false);
    }
  };

  const renderDiscountTypeSelector = () => (
    <View style={styles.typeSelector}>
      <TouchableOpacity
        style={[
          styles.typeButton,
          discountType === "PERCENTAGE" && styles.typeButtonActive,
        ]}
        onPress={() => setDiscountType("PERCENTAGE")}
      >
        <Ionicons
          name="analytics-outline"
          size={18}
          color={discountType === "PERCENTAGE" ? "#fff" : "#666"}
        />
        <Text
          style={[
            styles.typeButtonText,
            discountType === "PERCENTAGE" && styles.typeButtonTextActive,
          ]}
        >
          Phần trăm
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.typeButton,
          discountType === "FIXED_AMOUNT" && styles.typeButtonActive,
        ]}
        onPress={() => setDiscountType("FIXED_AMOUNT")}
      >
        <Ionicons
          name="cash"
          size={18}
          color={discountType === "FIXED_AMOUNT" ? "#fff" : "#666"}
        />
        <Text
          style={[
            styles.typeButtonText,
            discountType === "FIXED_AMOUNT" && styles.typeButtonTextActive,
          ]}
        >
          Số tiền
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderStatusSelector = () => (
    <View style={styles.typeSelector}>
      <TouchableOpacity
        style={[
          styles.typeButton,
          status === "ACTIVE" && styles.typeButtonActive,
        ]}
        onPress={() => setStatus("ACTIVE")}
      >
        <Ionicons
          name="checkmark-circle"
          size={18}
          color={status === "ACTIVE" ? "#fff" : "#666"}
        />
        <Text
          style={[
            styles.typeButtonText,
            status === "ACTIVE" && styles.typeButtonTextActive,
          ]}
        >
          Kích hoạt
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.typeButton,
          status === "INACTIVE" && styles.typeButtonActive,
        ]}
        onPress={() => setStatus("INACTIVE")}
      >
        <Ionicons
          name="pause-circle"
          size={18}
          color={status === "INACTIVE" ? "#fff" : "#666"}
        />
        <Text
          style={[
            styles.typeButtonText,
            status === "INACTIVE" && styles.typeButtonTextActive,
          ]}
        >
          Tạm dừng
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Thêm mã giảm giá</Text>
          <View style={styles.titleLine} />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Code */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Mã giảm giá <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, errors.code && styles.inputError]}
            placeholder="VD: SUMMER2024"
            value={code}
            onChangeText={(text) => {
              setCode(text);
              if (errors.code) setErrors({ ...errors, code: "" });
            }}
            autoCapitalize="characters"
            maxLength={20}
          />
          {errors.code && <Text style={styles.errorText}>{errors.code}</Text>}
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Mô tả <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[
              styles.input,
              styles.textArea,
              errors.description && styles.inputError,
            ]}
            placeholder="Giảm giá mùa hè cho tất cả sản phẩm"
            value={description}
            onChangeText={(text) => {
              setDescription(text);
              if (errors.description) setErrors({ ...errors, description: "" });
            }}
            multiline
            numberOfLines={3}
          />
          {errors.description && (
            <Text style={styles.errorText}>{errors.description}</Text>
          )}
        </View>

        {/* Discount Type */}
        <View style={styles.section}>
          <Text style={styles.label}>Loại giảm giá</Text>
          {renderDiscountTypeSelector()}
        </View>

        {/* Discount Value */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Giá trị giảm <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.inputWithSuffix}>
            <TextInput
              style={[
                styles.input,
                styles.inputWithSuffixInput,
                errors.discountValue && styles.inputError,
              ]}
              placeholder="0"
              value={discountValue}
              onChangeText={(text) => {
                setDiscountValue(text);
                if (errors.discountValue)
                  setErrors({ ...errors, discountValue: "" });
              }}
              keyboardType="numeric"
            />
            <Text style={styles.inputSuffix}>
              {discountType === "PERCENTAGE" ? "%" : "đ"}
            </Text>
          </View>
          {errors.discountValue && (
            <Text style={styles.errorText}>{errors.discountValue}</Text>
          )}
        </View>

        {/* Date Range */}
        <View style={styles.dateRow}>
          <View style={[styles.section, { flex: 1 }]}>
            <Text style={styles.label}>
              Ngày bắt đầu <Text style={styles.required}>*</Text>
            </Text>
            <TouchableOpacity
              style={[
                styles.input,
                errors.startDate && styles.inputError,
                { justifyContent: "center" },
              ]}
              onPress={() => setShowStartPicker(true)}
            >
              <Text style={{ color: startDate ? "#000" : "#888" }}>
                {startDate || "Chọn ngày"}
              </Text>
            </TouchableOpacity>
            {showStartPicker && (
              <DateTimePicker
                value={startDateObj || new Date()}
                mode="date"
                display="default"
                onChange={onStartDateChange}
              />
            )}
            {errors.startDate && (
              <Text style={styles.errorText}>{errors.startDate}</Text>
            )}
          </View>

          <View style={[styles.section, { flex: 1 }]}>
            <Text style={styles.label}>
              Ngày kết thúc <Text style={styles.required}>*</Text>
            </Text>
            <TouchableOpacity
              style={[
                styles.input,
                errors.endDate && styles.inputError,
                { justifyContent: "center" },
              ]}
              onPress={() => setShowEndPicker(true)}
            >
              <Text style={{ color: endDate ? "#000" : "#888" }}>
                {endDate || "Chọn ngày"}
              </Text>
            </TouchableOpacity>
            {showEndPicker && (
              <DateTimePicker
                value={endDateObj || new Date()}
                mode="date"
                display="default"
                onChange={onEndDateChange}
              />
            )}
            {errors.endDate && (
              <Text style={styles.errorText}>{errors.endDate}</Text>
            )}
          </View>
        </View>

        {/* Max Uses */}
        <View style={styles.section}>
          <Text style={styles.label}>Số lần sử dụng tối đa</Text>
          <TextInput
            style={[styles.input, errors.maxUses && styles.inputError]}
            placeholder="Không giới hạn"
            value={maxUses}
            onChangeText={(text) => {
              setMaxUses(text);
              if (errors.maxUses) setErrors({ ...errors, maxUses: "" });
            }}
            keyboardType="numeric"
          />
          {errors.maxUses && (
            <Text style={styles.errorText}>{errors.maxUses}</Text>
          )}
          <Text style={styles.helperText}>
            Để trống nếu không giới hạn số lần sử dụng
          </Text>
        </View>

        {/* Conditions */}
        <View style={styles.section}>
          <Text style={styles.label}>Điều kiện áp dụng</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="VD: Áp dụng cho đơn hàng từ 500.000đ"
            value={conditions}
            onChangeText={setConditions}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Status */}
        <View style={styles.section}>
          <Text style={styles.label}>Trạng thái</Text>
          {renderStatusSelector()}
        </View>
      </ScrollView>

      {/* Footer Actions */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.back()}
          disabled={loading}
        >
          <Text style={styles.cancelButtonText}>Hủy</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="checkmark" size={20} color="#fff" />
              <Text style={styles.submitButtonText}>Tạo mã</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  backButton: {
    marginRight: 15,
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
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  required: {
    color: "#FF3B30",
  },
  input: {
    height: 48,
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    paddingHorizontal: 15,
    fontSize: 14,
    color: "#000",
  },
  inputError: {
    borderColor: "#FF3B30",
    backgroundColor: "#FFF5F5",
  },
  textArea: {
    height: 90,
    paddingTop: 12,
    textAlignVertical: "top",
  },
  errorText: {
    fontSize: 12,
    color: "#FF3B30",
    marginTop: 4,
  },
  helperText: {
    fontSize: 12,
    color: "#888",
    marginTop: 4,
  },
  typeSelector: {
    flexDirection: "row",
    gap: 10,
  },
  typeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#f9f9f9",
  },
  typeButtonActive: {
    backgroundColor: "#000",
    borderColor: "#000",
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginLeft: 6,
  },
  typeButtonTextActive: {
    color: "#fff",
  },
  inputWithSuffix: {
    position: "relative",
  },
  inputWithSuffixInput: {
    paddingRight: 50,
  },
  inputSuffix: {
    position: "absolute",
    right: 15,
    top: 14,
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  dateRow: {
    flexDirection: "row",
    gap: 10,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    padding: 20,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    gap: 10,
  },
  cancelButton: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  submitButton: {
    flex: 1,
    height: 50,
    backgroundColor: "#000",
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});
