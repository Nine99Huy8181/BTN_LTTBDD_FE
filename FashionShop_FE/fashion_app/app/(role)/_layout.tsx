// app/(role)/_layout.tsx
import { useAuth } from '../../hooks/AuthContext';
import { Stack } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';

export default function RoleLayout() {
  const { user, isInitializing } = useAuth();

  if (isInitializing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Render từng role layout riêng biệt
  if (user?.role === 'SUPER') {
    return <SuperLayout />;
  } else if (user?.role === 'ADMIN') {
    return <AdminLayout />;
  } else {
    return <CustomerLayout />;
  }
}

function SuperLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(super)" options={{ headerShown: false }} />
    </Stack>
  );
}

function AdminLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(admin)" options={{ headerShown: false }} />
    </Stack>
  );
}

function CustomerLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(customer)" options={{ headerShown: false }} />
    </Stack>
  );
}