// app/(admin)/_layout.tsx
import { useNotification } from "@/hooks/NotificationContext";
import { Ionicons } from "@expo/vector-icons";
import { Tabs, router } from "expo-router";

export default function AdminLayout() {
  const { unreadCount } = useNotification();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#000000ff",
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Thống kê",
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <Ionicons name="stats-chart" size={24} color={color} />
          ),
        }}
        listeners={() => ({
          tabPress: () => router.replace("/(role)/(admin)/dashboard"),
        })}
      />
      <Tabs.Screen
        name="(products)"
        options={{
          title: "Sản phẩm",
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <Ionicons name="cube" size={24} color={color} />
          ),
        }}
        listeners={() => ({
          tabPress: () => router.replace("/(role)/(admin)/(products)"),
        })}
      />
      <Tabs.Screen
        name="(orders)"
        options={{
          title: "Đơn hàng",
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <Ionicons name="receipt" size={24} color={color} />
          ),
        }}
        listeners={() => ({
          tabPress: () => router.replace("/(role)/(admin)/(orders)"),
        })}
      />
      <Tabs.Screen
        name="notification"
        options={{
          title: "Thông báo",
          headerShown: false,
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
          tabBarIcon: ({ color }) => (
            <Ionicons name="notifications" size={25} color={color} />
          ),
        }}
        listeners={() => ({
          tabPress: () => {
            router.replace("/(role)/(admin)/notification");
          },
        })}
      />
      <Tabs.Screen
        name="(more)"
        options={{
          title: "Thêm",
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <Ionicons name="menu" size={24} color={color} />
          ),
        }}
        listeners={() => ({
          tabPress: () => router.replace("/(role)/(admin)/(more)"),
        })}
      />
    </Tabs>
  );
}
