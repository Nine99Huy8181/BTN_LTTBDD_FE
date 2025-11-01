// app/_layout.tsx
import { WishlistProvider } from '@/hooks/WishlistContext';
import { AuthProvider, useAuth } from '../hooks/AuthContext';
import { Stack } from 'expo-router';
import { View, ActivityIndicator} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';


function RootLayoutContent() {
  const { user, isInitializing } = useAuth();
  // Show loading screen while initializing
  if (isInitializing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const initialRouteName = user ? '(role)' : '(auth)';

  return (
    <Stack
      screenOptions={{ headerShown: false }}
      initialRouteName={initialRouteName}
      key={user ? 'authenticated' : 'unauthenticated'}
    >
      <Stack.Screen name="index" /> {/* Splash */}
      <Stack.Screen name="(role)" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <WishlistProvider>
            <RootLayoutContent />
            <Toast/>
        </WishlistProvider>
      </AuthProvider>
    </GestureHandlerRootView>

  );
}