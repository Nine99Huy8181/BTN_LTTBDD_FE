// app/(admin)/_layout.tsx
import { useNotification } from "@/hooks/NotificationContext";
import { Ionicons } from "@expo/vector-icons";
import { Tabs, router } from "expo-router";

export default function AdminLayout() {
  const { unreadCount } = useNotification();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#2196F3",
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Dashboard",
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
          title: "Products",
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
          title: "Orders",
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
          title: "Notification",
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
          title: "More",
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
