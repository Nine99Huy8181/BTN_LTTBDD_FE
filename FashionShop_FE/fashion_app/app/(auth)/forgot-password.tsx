// app/(auth)/forgot-password.tsx
import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
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
  const [countdown, setCountdown] = useState(0); // 60s cooldown gửi lại OTP

  const otpInputRef = useRef<TextInput>(null);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Bước 1: Gửi OTP (forgot-password)
  const sendOtp = async () => {
    setError('');
    if (!email || !email.includes('@') || !email.includes('.')) {
      return setError('Vui lòng nhập email hợp lệ');
    }

    setLoading(true);
    try {
      await axios.post(`${Config.API_URL}/auth/forgot-password`, { email });
      setStep('otp');
      setCountdown(60);
      Toast.show({
        type: 'success',
        text1: 'Đã gửi mã OTP!',
        text2: `Kiểm tra email: ${email}`,
      });
      setTimeout(() => otpInputRef.current?.focus(), 300);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Không tìm thấy tài khoản với email này';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Gửi lại OTP
  const resendOtp = async () => {
    setError('');
    setLoading(true);
    try {
      await axios.post(`${Config.API_URL}/auth/forgot-password`, { email });
      setCountdown(60);
      setOtp('');
      Toast.show({
        type: 'success',
        text1: 'Đã gửi lại mã!',
        text2: 'Kiểm tra email của bạn',
      });
      otpInputRef.current?.focus();
    } catch (err: any) {
      setError('Không thể gửi lại mã. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // Bước 2: Xác minh OTP
  const verifyOtp = async () => {
    if (otp.length !== 6 || !/^\d+$/.test(otp)) {
      return setError('Mã OTP phải là 6 chữ số');
    }

    setLoading(true);
    setError('');
    try {
      await axios.post(`${Config.API_URL}/auth/verify-otp-forgot`, { email, otp });
      setStep('newpass');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Mã OTP không đúng hoặc đã hết hạn';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Bước 3: Đặt lại mật khẩu
  const resetPassword = async () => {
    if (newPassword.length < 6) return setError('Mật khẩu phải có ít nhất 6 ký tự');
    if (newPassword !== confirmPassword) return setError('Mật khẩu không khớp');

    setLoading(true);
    setError('');
    try {
      await axios.post(`${Config.API_URL}/auth/reset-password`, {
        email,
        otp,                    // backend vẫn cần otp để xác minh lần cuối (an toàn hơn)
        newPassword,
        confirmPassword,
      });

      Toast.show({
        type: 'success',
        text1: 'Thành công!',
        text2: 'Mật khẩu đã được thay đổi',
        position: 'top',
      });

      setTimeout(() => {
        router.replace('/(auth)/login');
      }, 800);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Đặt lại mật khẩu thất bại';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // ===================== BƯỚC 3: ĐẶT MẬT KHẨU MỚI =====================
  if (step === 'newpass') {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.card}>
              <Text style={styles.brandName}>Fashion Store</Text>
              <Text style={styles.title}>Đặt mật khẩu mới</Text>

              {error ? <Text style={styles.error}>{error}</Text> : null}

              <TextInput
                style={styles.input}
                placeholder="Mật khẩu mới (tối thiểu 6 ký tự)"
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
                autoFocus
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

  // ===================== BƯỚC 2: NHẬP OTP =====================
  if (step === 'otp') {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.card}>
              <Text style={styles.brandName}>Fashion Store</Text>
              <Text style={styles.title}>Nhập mã OTP</Text>
              <Text style={styles.subtitle}>
                Mã 6 số đã được gửi đến{'\n'}
                <Text style={{ fontWeight: '600', color: '#000' }}>{email}</Text>
              </Text>

              {error ? <Text style={styles.error}>{error}</Text> : null}

              <TextInput
                ref={otpInputRef}
                style={[styles.input, styles.otpInput]}
                placeholder="000000"
                value={otp}
                onChangeText={setOtp}
                keyboardType="number-pad"
                maxLength={6}
                autoFocus
              />

              <TouchableOpacity
                style={[styles.button, (loading || otp.length !== 6) && styles.buttonDisabled]}
                onPress={verifyOtp}
                disabled={loading || otp.length !== 6}
              >
                <Text style={styles.buttonText}>
                  {loading ? 'Đang xác nhận...' : 'Tiếp tục'}
                </Text>
              </TouchableOpacity>

              <View style={styles.resendContainer}>
                {countdown > 0 ? (
                  <Text style={styles.resendText}>Gửi lại mã sau {countdown}s</Text>
                ) : (
                  <TouchableOpacity onPress={resendOtp} disabled={loading}>
                    <Text style={styles.resendLink}>Gửi lại mã OTP</Text>
                  </TouchableOpacity>
                )}
              </View>

              <TouchableOpacity onPress={() => setStep('email')}>
                <Text style={styles.backText}>← Thay đổi email</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    );
  }

  // ===================== BƯỚC 1: NHẬP EMAIL =====================
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.card}>
            <Text style={styles.brandName}>Fashion Store</Text>
            <Text style={styles.title}>Quên mật khẩu?</Text>
            <Text style={styles.subtitle}>Nhập email để nhận mã đặt lại mật khẩu</Text>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <TextInput
              style={styles.input}
              placeholder="email@gmail.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoFocus
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
              <Text style={styles.backText}>← Quay lại đăng nhập</Text>
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
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 32,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  brandName: { fontSize: 32, fontFamily: 'Georgia', fontStyle: 'italic', textAlign: 'center', color: '#000', marginBottom: 40 },
  title: { fontSize: 28, fontWeight: '600', textAlign: 'center', marginBottom: 16, color: '#000' },
  subtitle: { textAlign: 'center', color: '#666', marginBottom: 24, lineHeight: 22 },
  input: {
    height: 52,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  otpInput: {
    textAlign: 'center',
    fontSize: 22,
    letterSpacing: 10,
    fontWeight: '600',
    marginBottom: 32,
  },
  button: {
    backgroundColor: '#000',
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  error: { color: '#c00', textAlign: 'center', marginBottom: 16, fontSize: 14 },
  backText: { textAlign: 'center', color: '#666', marginTop: 20, fontSize: 14 },
  resendContainer: { alignItems: 'center', marginVertical: 20 },
  resendText: { color: '#666', fontSize: 14 },
  resendLink: { color: '#000', fontWeight: '600', fontSize: 15 },
});