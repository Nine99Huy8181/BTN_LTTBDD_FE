// app/(admin)/_layout.tsx
import { Tabs } from 'expo-router';
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
      />
      <Tabs.Screen
        name="(staffs)"
        options={{
          title: 'Staffs',
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <Ionicons name="people" size={24} color={color} />
          ),
        }}
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
      />
    </Tabs>
  );
}