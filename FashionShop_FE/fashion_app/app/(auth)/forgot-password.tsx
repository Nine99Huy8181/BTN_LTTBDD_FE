// app/(auth)/forgot-password.tsx
import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, StatusBar } from 'react-native';
import { router } from 'expo-router';
import axios from 'axios';
import { Config } from '@/constants';
import Toast from 'react-native-toast-message';

export default function ForgotPasswordScreen() {
  const [step, setStep] = useState<'email' | 'otp' | 'newpass'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const sendOtp = async () => {
    setError('');
    if (!email.includes('@')) return setError('Email không hợp lệ');
    setLoading(true);
    try {
      await axios.post(`${Config.API_URL}/auth/forgot-password`, { email });
      setStep('otp');
      Toast.show({ type: 'success', text1: 'Đã gửi OTP!', text2: `Kiểm tra email: ${email}` });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không tìm thấy tài khoản');
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (otp.length !== 6) return setError('Nhập đủ 6 số');
    setLoading(true);
    try {
      await axios.post(`${Config.API_URL}/auth/verify-otp-forgot`, { email, otp });
      setStep('newpass');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Mã OTP sai hoặc hết hạn');
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async () => {
    if (newPassword.length < 6) return setError('Mật khẩu ít nhất 6 ký tự');
    if (newPassword !== confirmPassword) return setError('Mật khẩu không khớp');
    setLoading(true);
    try {
      await axios.post(`${Config.API_URL}/auth/reset-password`, {
        email,
        otp,
        newPassword,
        confirmPassword
      });
      Toast.show({ type: 'success', text1: 'Thành công!', text2: 'Mật khẩu đã được thay đổi' });
      router.replace('/(auth)/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Đặt lại mật khẩu thất bại');
    } finally {
      setLoading(false);
    }
  };

  // Bước 3: Đặt mật khẩu mới
  if (step === 'newpass') {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{flex:1}}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.card}>
              <Text style={styles.brandName}>Fashion Store</Text>
              <Text style={styles.title}>Đặt lại mật khẩu</Text>
              {error ? <Text style={styles.error}>{error}</Text> : null}

              <TextInput
                style={styles.input}
                placeholder="Mật khẩu mới"
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
              />
              <TextInput
                style={styles.input}
                placeholder="Nhập lại mật khẩu"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={resetPassword}
                disabled={loading}
              >
                <Text style={styles.buttonText}>
                  {loading ? 'Đang xử lý...' : 'Hoàn tất'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    );
  }

  // Bước 2: Nhập OTP
  if (step === 'otp') {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{flex:1}}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.card}>
              <Text style={styles.brandName}>Fashion Store</Text>
              <Text style={styles.title}>Nhập mã OTP</Text>
              <Text style={styles.subtitle}>Mã đã được gửi đến{'\n'}<Text style={{fontWeight:'600'}}>{email}</Text></Text>
              {error ? <Text style={styles.error}>{error}</Text> : null}

              <TextInput
                style={[styles.input, {textAlign:'center', fontSize:28, letterSpacing:8}]}
                placeholder="000000"
                value={otp}
                onChangeText={setOtp}
                keyboardType="number-pad"
                maxLength={6}
                autoFocus
              />

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={verifyOtp}
                disabled={loading}
              >
                <Text style={styles.buttonText}>
                  {loading ? 'Đang xác nhận...' : 'Tiếp tục'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setStep('email')}>
                <Text style={styles.backText}>Quay lại</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    );
  }

  // Bước 1: Nhập email
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{flex:1}}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.card}>
            <Text style={styles.brandName}>Fashion Store</Text>
            <Text style={styles.title}>Quên mật khẩu?</Text>
            <Text style={styles.subtitle}>Nhập email để đặt lại mật khẩu</Text>
            {error ? <Text style={styles.error}>{error}</Text> : null}

            <TextInput
              style={styles.input}
              placeholder="email@gmail.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={sendOtp}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Đang gửi...' : 'Gửi mã OTP'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.backText}>Quay lại đăng nhập</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  card: { backgroundColor: '#fff', borderRadius: 24, padding: 32, elevation: 5, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 },
  brandName: { fontSize: 32, fontFamily: 'Georgia', fontStyle: 'italic', textAlign: 'center', color: '#000', marginBottom: 40 },
  title: { fontSize: 28, fontWeight: '600', textAlign: 'center', marginBottom: 16 },
  subtitle: { textAlign: 'center', color: '#666', marginBottom: 24, lineHeight: 20 },
  input: { height: 50, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 16, marginBottom: 16, backgroundColor: '#fff' },
  button: { backgroundColor: '#000', height: 50, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  error: { color: '#c00', textAlign: 'center', marginBottom: 16 },
  backText: { textAlign: 'center', color: '#666', marginTop: 20 },
});