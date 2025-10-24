// app/(auth)/register.tsx
import { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/hooks/AuthContext';

export default function RegisterScreen() {
  const [form, setForm] = useState({
    email: '', password: '', fullName: '', phoneNumber: '', dateOfBirth: '', gender: 'MALE',
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleRegister = async () => {
    if (Object.values(form).some(v => !v)) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    setLoading(true);
    const { success, error } = await register(
      form.email, form.password, form.fullName,
      form.phoneNumber, form.dateOfBirth, form.gender
    );
    setLoading(false);

    if (success) {
      Alert.alert('Success', 'Registration successful! Please login.', [
        { text: 'OK', onPress: () => router.replace('/(auth)/login') }
      ]);
    } else {
      Alert.alert('Registration Failed', error || 'Please try again');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Register</Text>
      {['email', 'password', 'fullName', 'phoneNumber', 'dateOfBirth'].map(field => (
        <TextInput
          key={field}
          style={styles.input}
          placeholder={field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
          value={form[field as keyof typeof form]}
          onChangeText={text => setForm(prev => ({ ...prev, [field]: text }))}
          secureTextEntry={field === 'password'}
          keyboardType={field === 'email' ? 'email-address' : field === 'phoneNumber' ? 'phone-pad' : 'default'}
        />
      ))}
      <Button title={loading ? "Registering..." : "Register"} onPress={handleRegister} disabled={loading} />
      <Button title="Back to Login" onPress={() => router.back()} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 8, marginBottom: 12 },
});