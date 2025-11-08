// app/(admin)/_layout.tsx
import { Tabs, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function AdminLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#2196F3',
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => (
            <Ionicons name="stats-chart" size={24} color={color} />
          ),
        }}
        listeners={() => ({
          tabPress: () => router.replace('/(role)/(admin)/dashboard'),
        })}
      />
      <Tabs.Screen
        name="(products)"
        options={{
          title: 'Products',
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <Ionicons name="cube" size={24} color={color} />
          ),
        }}
        listeners={() => ({
          tabPress: () => router.replace('/(role)/(admin)/(products)'),
        })}
      />
      <Tabs.Screen
        name="(orders)"
        options={{
          title: 'Orders',
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <Ionicons name="receipt" size={24} color={color} />
          ),
        }}
        listeners={() => ({
          tabPress: () => router.replace('/(role)/(admin)/(orders)'),
        })}
      />
      <Tabs.Screen
        name="(more)"
        options={{
          title: 'More',
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <Ionicons name="menu" size={24} color={color} />
          ),
        }}
        listeners={() => ({
          tabPress: () => router.replace('/(role)/(admin)/(more)'),
        })}
      />
    </Tabs>
  );
}