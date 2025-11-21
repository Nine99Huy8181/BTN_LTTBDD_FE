// app/(role)/(customer)/(profile)/orders.tsx
import { useAuth } from '@/hooks/AuthContext';
import { OrderService } from "@/services/order.service";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const FILTERS = ["ALL", "PENDING", "DELIVERING", "DELIVERED", "CANCELLED"];

export default function OrdersScreen() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [selectedFilter, setSelectedFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();
  const customerId = user?.customerId || 1;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await OrderService.getOrdersByCustomer(customerId);
        setOrders(data);
        setFiltered(data);
      } catch (error) {
        console.log("❌ Lỗi tải danh sách đơn hàng:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const applyFilter = (status: string) => {
    setSelectedFilter(status);
    if (status === "ALL") setFiltered(orders);
    else setFiltered(orders.filter((o) => o.orderStatus === status));
  };

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#000" />
        <Text style={{ marginTop: 10 }}>Đang tải danh sách đơn hàng...</Text>
      </View>
    );

  return (
    <View style={styles.container}>
      {/* 🔹 Tiêu đề */}
      <View style={styles.header}>
        <Text style={styles.title}>Đơn hàng của bạn</Text>
        <View style={styles.titleLine} />
      </View>

      {/* 🔹 Bộ lọc */}
      <View style={styles.filterContainer}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            onPress={() => applyFilter(f)}
            style={[
              styles.filterButton,
              selectedFilter === f && styles.filterButtonActive,
            ]}
          >
            <Text
              style={[
                styles.filterText,
                selectedFilter === f && styles.filterTextActive,
              ]}
            >
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 🔹 Danh sách đơn hàng */}
      {filtered.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Không có đơn hàng nào.</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.orderID.toString()}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => router.push(`/order-detail/${item.orderID}`)}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.orderCode}>Mã đơn: #{item.orderID}</Text>
                <Text
                  style={[
                    styles.statusTag,
                    {
                      backgroundColor:
                        item.orderStatus === "DELIVERED"
                          ? "#4CAF50"
                          : item.orderStatus === "PENDING"
                          ? "#FFA500"
                          : item.orderStatus === "DELIVERING"
                          ? "#007BFF"
                          : item.orderStatus === "CANCELLED"
                          ? "#FF3B30"
                          : "#888",
                    },
                  ]}
                >
                  {item.orderStatus}
                </Text>
              </View>
              <Text style={styles.info}>
                Ngày đặt: {new Date(item.orderDate).toLocaleDateString()}
              </Text>
              <Text style={styles.info}>
                Tổng tiền: {item.totalAmount.toLocaleString()} ₫
              </Text>
            </TouchableOpacity>
          )}
        />
      )}

      {/* 🔹 Nút quay lại */}
      <TouchableOpacity style={styles.secondaryButton} onPress={() => router.back()}>
        <Text style={styles.secondaryButtonText}>Quay lại</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 40,
    backgroundColor: "#fff",
    flex: 1,
  },
  header: {
    marginBottom: 20,
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
  filterContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 15,
  },
  filterButton: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 8,
  },
  filterButtonActive: {
    backgroundColor: "#000",
  },
  filterText: {
    color: "#000",
    fontWeight: "500",
  },
  filterTextActive: {
    color: "#fff",
  },
  card: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 14,
    padding: 15,
    marginBottom: 15,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  orderCode: {
    fontWeight: "700",
    fontSize: 16,
    color: "#222",
  },
  statusTag: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    overflow: "hidden",
    textTransform: "capitalize",
  },
  info: {
    fontSize: 14,
    color: "#444",
    marginTop: 3,
  },
  secondaryButton: {
    marginTop: 20,
    backgroundColor: "#fff",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
  },
  secondaryButtonText: {
    color: "#000",
    fontWeight: "600",
    fontSize: 16,
  },
  emptyContainer: {
    alignItems: "center",
    marginVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
