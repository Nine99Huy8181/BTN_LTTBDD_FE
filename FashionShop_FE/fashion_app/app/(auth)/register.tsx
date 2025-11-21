// app/(auth)/register.tsx
import { useState } from 'react';
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
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../hooks/AuthContext';
import axios from 'axios';
import { Config } from '@/constants';
import Toast from 'react-native-toast-message';

export default function RegisterScreen() {
  // Bước hiện tại: 'form' hoặc 'otp'
  const [step, setStep] = useState<'form' | 'otp'>('form');

  // Form data
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');

  // OTP
  const [otp, setOtp] = useState('');

  // UI state
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const { register } = useAuth();

  // Gửi OTP
  const sendOtp = async () => {
    setError(null);

    if (!email.includes('@') || !email.includes('.')) {
      setError('Vui lòng nhập email hợp lệ');
      return;
    }
    if (password !== confirmPassword) {
      setError('Mật khẩu không khớp');
      return;
    }
    if (!fullName.trim()) {
      setError('Vui lòng nhập họ tên');
      return;
    }

    setIsLoading(true);
    try {
      await axios.post(`${Config.API_URL}/auth/send-otp`, { email });
      setStep('otp');
      Toast.show({
        type: 'success',
        text1: 'Đã gửi mã OTP!',
        text2: `Kiểm tra email: ${email}`,
      });
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Không thể gửi OTP';
      setError(msg);
      if (msg.toLowerCase().includes('exists')) {
        setError('Email này đã được đăng ký');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Xác minh OTP + Đăng ký
  const verifyAndRegister = async () => {
    if (otp.length !== 6) {
      setError('Vui lòng nhập đủ 6 số');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Bước 1: Xác minh OTP
      await axios.post(`${Config.API_URL}/auth/verify-otp`, { email, otp });

      // Bước 2: Đăng ký tài khoản
      const { success, error: regError } = await register(
        email,
        password,
        fullName,
        phoneNumber || '',
        dateOfBirth || '',
        gender || 'OTHER'
      );

      if (success) {
        Toast.show({
          type: 'success',
          text1: 'Đăng ký thành công!',
          text2: 'Bây giờ bạn có thể đăng nhập',
        });
        router.back();
      } else {
        setError(regError || 'Đăng ký thất bại');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Mã OTP không đúng hoặc đã hết hạn';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // ==================== BƯỚC 2: NHẬP OTP ====================
  if (step === 'otp') {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.card}>
              <Text style={styles.brandName}>Fashion Store</Text>
              <Text style={styles.title}>Xác minh email</Text>

              <Text style={styles.otpSubtitle}>
                Chúng tôi đã gửi mã 6 số đến{'\n'}
                <Text style={{ fontWeight: '600', color: '#000' }}>{email}</Text>
              </Text>

              {error && (
                <View style={styles.errorContainer}>
                  <Text style={styles.error}>{error}</Text>
                </View>
              )}

              <TextInput
                style={[styles.input, styles.otpInput]}
                placeholder="000000"
                value={otp}
                onChangeText={setOtp}
                keyboardType="number-pad"
                maxLength={6}
                autoFocus
              />

              <TouchableOpacity
                style={[styles.registerButton, isLoading && styles.registerButtonDisabled]}
                onPress={verifyAndRegister}
                disabled={isLoading || otp.length !== 6}
              >
                <Text style={styles.registerButtonText}>
                  {isLoading ? 'Đang xác nhận...' : 'Hoàn tất đăng ký'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setStep('form')}>
                <Text style={styles.backText}>← Quay lại chỉnh sửa</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    );
  }

  // ==================== BƯỚC 1: FORM ĐĂNG KÝ ====================
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            <Text style={styles.brandName}>Fashion Store</Text>
            <Text style={styles.title}>Register</Text>

            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.error}>{error}</Text>
              </View>
            )}

            {/* Email */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={[styles.input, focusedInput === 'email' && styles.inputFocused]}
                placeholder="username@gmail.com"
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
                onFocus={() => setFocusedInput('email')}
                onBlur={() => setFocusedInput(null)}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            {/* Password */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={[styles.input, focusedInput === 'password' && styles.inputFocused]}
                placeholder="••••••••"
                placeholderTextColor="#999"
                value={password}
                onChangeText={setPassword}
                onFocus={() => setFocusedInput('password')}
                onBlur={() => setFocusedInput(null)}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            {/* Confirm Password */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Nhập lại mật khẩu</Text>
              <TextInput
                style={[styles.input, focusedInput === 'confirm' && styles.inputFocused]}
                placeholder="••••••••"
                placeholderTextColor="#999"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                onFocus={() => setFocusedInput('confirm')}
                onBlur={() => setFocusedInput(null)}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            {/* Full Name */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Họ và tên</Text>
              <TextInput
                style={[styles.input, focusedInput === 'name' && styles.inputFocused]}
                placeholder="Nguyễn Văn A"
                placeholderTextColor="#999"
                value={fullName}
                onChangeText={setFullName}
                onFocus={() => setFocusedInput('name')}
                onBlur={() => setFocusedInput(null)}
              />
            </View>

            {/* Phone (tùy chọn) */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Số điện thoại (tùy chọn)</Text>
              <TextInput
                style={[styles.input, focusedInput === 'phone' && styles.inputFocused]}
                placeholder="0123456789"
                placeholderTextColor="#999"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
              />
            </View>

            {/* Nút Tiếp tục → Gửi OTP */}
            <TouchableOpacity
              style={[styles.registerButton, isLoading && styles.registerButtonDisabled]}
              onPress={sendOtp}
              disabled={isLoading}
            >
              <Text style={styles.registerButtonText}>
                {isLoading ? 'Đang gửi mã...' : 'Gửi mã xác minh'}
              </Text>
            </TouchableOpacity>

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Đã có tài khoản? </Text>
              <TouchableOpacity onPress={() => router.back()}>
                <Text style={styles.loginLink}>Đăng nhập ngay</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

// STYLE GIỮ NGUYÊN 100% + thêm vài dòng cho OTP
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 20, paddingTop: 60 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  brandName: {
    fontSize: 32,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
    textAlign: 'center',
    color: '#000',
    marginBottom: 40,
  },
  title: { fontSize: 28, fontWeight: '600', color: '#000', marginBottom: 24, textAlign: 'center' },
  otpSubtitle: { textAlign: 'center', color: '#666', marginBottom: 32, lineHeight: 22 },
  errorContainer: { backgroundColor: '#fee', padding: 12, borderRadius: 8, marginBottom: 16 },
  error: { color: '#c00', fontSize: 14, textAlign: 'center' },
  inputContainer: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '500', color: '#000', marginBottom: 8 },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#000',
    backgroundColor: '#fff',
  },
  inputFocused: { borderColor: '#000', borderWidth: 1.5 },
  otpInput: {
    textAlign: 'center',
    fontSize: 28,
    letterSpacing: 10,
    fontWeight: '600',
    marginBottom: 32,
  },
  registerButton: {
    backgroundColor: '#000',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  registerButtonDisabled: { opacity: 0.7 },
  registerButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  loginContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  loginText: { fontSize: 14, color: '#666' },
  loginLink: { fontSize: 14, color: '#000', fontWeight: '600' },
  backText: { textAlign: 'center', color: '#666', marginTop: 16, fontSize: 14 },
});