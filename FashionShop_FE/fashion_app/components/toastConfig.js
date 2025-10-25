import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons"; // Nếu bạn dùng Expo, có sẵn
// Nếu không dùng Expo: npm install react-native-vector-icons && link thư viện

export const toastConfig = {
  // ✅ Thành công
  success: ({ text1, text2 }) => (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#E8F5E9",
        borderLeftWidth: 6,
        borderLeftColor: "#2E7D32",
        padding: 12,
        borderRadius: 12,
        marginHorizontal: 10,
        marginTop: 10,
      }}
    >
      <Ionicons name="checkmark-circle" size={26} color="#2E7D32" style={{ marginRight: 10 }} />
      <View>
        <Text style={{ color: "#2E7D32", fontWeight: "bold", fontSize: 16 }}>{text1}</Text>
        {text2 && <Text style={{ color: "#388E3C", fontSize: 14 }}>{text2}</Text>}
      </View>
    </View>
  ),

  // ❌ Lỗi
  error: ({ text1, text2 }) => (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFEBEE",
        borderLeftWidth: 6,
        borderLeftColor: "#C62828",
        padding: 12,
        borderRadius: 12,
        marginHorizontal: 10,
        marginTop: 10,
      }}
    >
      <Ionicons name="close-circle" size={26} color="#C62828" style={{ marginRight: 10 }} />
      <View>
        <Text style={{ color: "#C62828", fontWeight: "bold", fontSize: 16 }}>{text1}</Text>
        {text2 && <Text style={{ color: "#E53935", fontSize: 14 }}>{text2}</Text>}
      </View>
    </View>
  ),

  // ⚠️ Cảnh báo
  warning: ({ text1, text2 }) => (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFF8E1",
        borderLeftWidth: 6,
        borderLeftColor: "#FFB300",
        padding: 12,
        borderRadius: 12,
        marginHorizontal: 10,
        marginTop: 10,
      }}
    >
      <Ionicons name="warning" size={26} color="#FFB300" style={{ marginRight: 10 }} />
      <View>
        <Text style={{ color: "#795548", fontWeight: "bold", fontSize: 16 }}>{text1}</Text>
        {text2 && <Text style={{ color: "#8D6E63", fontSize: 14 }}>{text2}</Text>}
      </View>
    </View>
  ),

  // 🔵 Xác nhận (confirm)
  confirm: ({ text1, text2 }) => (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#E3F2FD",
        borderLeftWidth: 6,
        borderLeftColor: "#1976D2",
        padding: 12,
        borderRadius: 12,
        marginHorizontal: 10,
        marginTop: 10,
      }}
    >
      <Ionicons name="help-circle" size={26} color="#1976D2" style={{ marginRight: 10 }} />
      <View>
        <Text style={{ color: "#0D47A1", fontWeight: "bold", fontSize: 16 }}>{text1}</Text>
        {text2 && <Text style={{ color: "#1565C0", fontSize: 14 }}>{text2}</Text>}
      </View>
    </View>
  ),

  //Xác nhận có button
  confirmAction: ({ text1, text2, props }) => (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#E3F2FD",
        borderLeftWidth: 6,
        borderLeftColor: "#1976D2",
        padding: 12,
        borderRadius: 12,
        marginHorizontal: 10,
        marginTop: 10,
      }}
    >
      <Ionicons
        name="help-circle"
        size={26}
        color="#1976D2"
        style={{ marginRight: 10 }}
      />
      <View style={{ flex: 1 }}>
        <Text style={{ color: "#0D47A1", fontWeight: "bold", fontSize: 16 }}>
          {text1}
        </Text>
        {text2 && (
          <Text style={{ color: "#1565C0", fontSize: 14, marginTop: 3 }}>
            {text2}
          </Text>
        )}

        {/* Nút xác nhận */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "flex-end",
            marginTop: 10,
          }}
        >
          <TouchableOpacity
            onPress={() => {
              props?.onCancel?.(); // Gọi callback hủy
            }}
            style={{
              paddingVertical: 6,
              paddingHorizontal: 15,
              marginRight: 8,
              backgroundColor: "#E0E0E0",
              borderRadius: 8,
            }}
          >
            <Text style={{ color: "#424242", fontWeight: "600" }}>Hủy</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              props?.onConfirm?.(); // Gọi callback xác nhận
            }}
            style={{
              paddingVertical: 6,
              paddingHorizontal: 15,
              backgroundColor: "#1976D2",
              borderRadius: 8,
            }}
          >
            <Text style={{ color: "white", fontWeight: "600" }}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  ),
};
