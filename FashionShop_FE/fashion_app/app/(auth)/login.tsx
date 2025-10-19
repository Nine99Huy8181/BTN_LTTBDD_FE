import { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../hooks/AuthContext';
import { Routes } from '@/constants';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { login, user } = useAuth();

  // Watch user thay đổi
  useEffect(() => {
    if (isLoggingIn && user) {
      console.log('User logged in:', user);
      router.replace('/(role)');
      setIsLoggingIn(false);
    }
  }, [user, isLoggingIn]);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    const { success, error: errorMessage } = await login(username, password);
    if (!success) {
      setError(errorMessage || 'Login failed');
      setIsLoggingIn(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      {error && <Text style={styles.error}>{error}</Text>}
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
      />
      <Button title="Login" onPress={handleLogin} disabled={isLoggingIn} />
      <Button title="Đăng ký" onPress={() => router.push(Routes.AuthRegister)} />
      <Button title="Quên mật khẩu" onPress={() => router.push(Routes.AuthForgotPassword)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
  },
  error: {
    color: 'red',
    marginBottom: 15,
    textAlign: 'center',
  },
});