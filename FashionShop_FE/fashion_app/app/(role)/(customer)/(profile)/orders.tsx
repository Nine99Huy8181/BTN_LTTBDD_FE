// app/(role)/(customer)/(profile)/orders.tsx
import { useAuth } from '@/hooks/AuthContext';
import { getOrdersByCustomer } from "@/services/order.service";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from "react-native";

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
        const data = await getOrdersByCustomer(customerId);
        setOrders(data);
        setFiltered(data);
      } catch (error) {
        console.error("Lỗi tải danh sách đơn hàng:", error);
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
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#000" />
        <Text>Đang tải danh sách đơn hàng...</Text>
      </View>
    );

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 10 }}>
        Danh sách Đơn hàng
      </Text>

      {/* Bộ lọc */}
      <View style={{ flexDirection: "row", marginBottom: 10, flexWrap: "wrap" }}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            onPress={() => applyFilter(f)}
            style={{
              backgroundColor: selectedFilter === f ? "#007AFF" : "#E0E0E0",
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 15,
              marginRight: 8,
              marginBottom: 6,
            }}
          >
            <Text style={{ color: selectedFilter === f ? "#fff" : "#000" }}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Danh sách */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.orderID.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={{
              padding: 14,
              marginVertical: 8,
              borderWidth: 1,
              borderColor: "#ccc",
              borderRadius: 10,
            }}
            onPress={() => router.push(`/order-detail/${item.orderID}`)}
          >
            <Text style={{ fontWeight: "bold" }}>Mã đơn: #{item.orderID}</Text>
            <Text>Ngày đặt: {new Date(item.orderDate).toLocaleDateString()}</Text>
            <Text>Trạng thái: {item.orderStatus}</Text>
            <Text>Tổng tiền: {item.totalAmount.toLocaleString()} ₫</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
