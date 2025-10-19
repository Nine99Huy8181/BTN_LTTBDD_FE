// app/index.tsx
import { View, Text, Button } from 'react-native';
import { router } from 'expo-router';
import { Routes } from '@/constants';

export default function SplashScreen() {
  // const router = useRouter();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 24 }}>Fashion App - Splash</Text>
      <Button title="Go to Login" onPress={() => router.push(Routes.AuthLogin)} />
    </View>
  );
}