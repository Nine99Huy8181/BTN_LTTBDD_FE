// app/(admin)/(more)/index.tsx
import { Routes } from "@/constants";
import { useAuth } from "@/hooks/AuthContext";
import { accountService } from "@/services/account.service";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function MenuScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [account, setAccount] = useState<any>(null);
  const [avatarError, setAvatarError] = useState(false);

  // Lấy thông tin tài khoản để hiển thị Avatar và Tên
  useEffect(() => {
    if (user?.userName) {
      accountService
        .getAccountByEmail(user.userName)
        .then((res) => setAccount(res))
        .catch((err) => console.error("Lỗi khi lấy account:", err));
    }
  }, [user]);

  const handleLogout = async () => {
    await logout();
    router.replace("/(auth)/login");
  };

  const avatarUri =
    avatarError || !account?.avatar
      ? "https://cdn-icons-png.flaticon.com/512/2206/2206368.png" // Icon admin mặc định khác một chút cho dễ phân biệt
      : account.avatar;

  return (
    <View style={styles.container}>
      {/* 1. Header: Avatar & Tên Admin */}
      <View style={styles.profileHeader}>
        <Image
          source={{ uri: avatarUri }}
          style={styles.avatar}
          onError={() => setAvatarError(true)}
        />
        <Text style={styles.name}>
          {account?.fullName || user?.userName || "Admin"}
        </Text>
        <Text style={{ color: "#666", marginTop: 4 }}>Quản trị viên</Text>
      </View>

      {/* 2. Các mục chức năng (Menu List) */}
      <View style={styles.section}>
        {/* Customers */}
        <TouchableOpacity
          style={styles.item}
          onPress={() => router.push(Routes.CustomerHome)}
        >
          <Ionicons name="people-outline" size={22} color="#333" />
          <Text style={styles.itemText}>Chuyển qua giao diện khách hàng</Text>
        </TouchableOpacity>

        {/* Reviews */}
        <TouchableOpacity
          style={styles.item}
          onPress={() => router.push(Routes.AdminReviews)}
        >
          <Ionicons name="chatbox-ellipses-outline" size={22} color="#333" />
          <Text style={styles.itemText}>Quản lý Đánh giá</Text>
        </TouchableOpacity>

        {/* Profile */}
        <TouchableOpacity
          style={styles.item}
          onPress={() => router.push(Routes.AdminProfile)}
        >
          <Ionicons name="person-circle-outline" size={22} color="#333" />
          <Text style={styles.itemText}>Quản lý hồ sơ</Text>
        </TouchableOpacity>

        {/* Coupons */}
        <TouchableOpacity
          style={styles.item}
          onPress={() => router.push("/(role)/(admin)/(more)/coupons")}
        >
          <Ionicons name="ticket-outline" size={22} color="#333" />
          <Text style={styles.itemText}>Quản lý Mã giảm giá</Text>
        </TouchableOpacity>
      </View>

      {/* 3. Nút Đăng xuất */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#fff" />
        <Text style={styles.logoutText}>Đăng xuất</Text>
      </TouchableOpacity>
    </View>
  );
}

// Styles giữ nguyên từ ProfileScreen customer
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fafafa",
    paddingHorizontal: 24,
    paddingTop: 70,
  },
  profileHeader: {
    alignItems: "center",
    marginBottom: 40,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "#e0e0e0",
  },
  name: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    marginBottom: 30,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  itemText: {
    fontSize: 16,
    color: "#333",
    marginLeft: 10,
    fontWeight: "500",
  },
  logoutButton: {
    flexDirection: "row",
    backgroundColor: "#ff4444",
    borderRadius: 10,
    paddingVertical: 14,
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  logoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
