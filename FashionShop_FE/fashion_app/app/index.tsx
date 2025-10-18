// app/index.tsx
import { View, Text, Button } from 'react-native';
import { router } from 'expo-router';

export default function SplashScreen() {
  // const router = useRouter();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 24 }}>Fashion App - Splash</Text>
      <Button title="Go to Login" onPress={() => router.push('/(auth)/login')} />
      {/* <Button title="Go to Customer" onPress={() => router.push('/(customer)')} />
      <Button title="Go to Admin" onPress={() => router.push('/(admin)')} />
      <Button title="Go to Super" onPress={() => router.push('/(super)')} /> */}
    </View>
  );
}