// app/(auth)/register.tsx
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
import { useAuth } from '../../hooks/AuthContext';
import axios from 'axios';
import { Config } from '@/constants';
import Toast from 'react-native-toast-message';

export default function RegisterScreen() {
  const [step, setStep] = useState<'form' | 'otp'>('form');

  // Form data
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');

  // OTP state
  const [otp, setOtp] = useState('');
  const otpInputRef = useRef<TextInput>(null);

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);

  const { register } = useAuth();

  // Countdown 60s
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Gửi OTP
  const sendOtp = async () => {
    setError(null);

    if (!email || !email.includes('@') || !email.includes('.')) {
      setError('Vui lòng nhập email hợp lệ');
      return;
    }
    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
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
      setCountdown(60);
      Toast.show({
        type: 'success',
        text1: 'Đã gửi mã OTP!',
        text2: `Mã đã được gửi đến ${email}`,
      });
      setTimeout(() => otpInputRef.current?.focus(), 300);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Không thể gửi OTP';
      if (msg.toLowerCase().includes('exist') || msg.includes('tồn tại')) {
        setError('Email này đã được đăng ký');
      } else {
        setError(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Gửi lại OTP
  const resendOtp = async () => {
    setError(null);
    setIsLoading(true);
    try {
      await axios.post(`${Config.API_URL}/auth/send-otp`, { email });
      setCountdown(60);
      setOtp('');
      Toast.show({
        type: 'success',
        text1: 'Đã gửi lại mã!',
        text2: 'Kiểm tra email của bạn',
      });
      otpInputRef.current?.focus();
    } catch (err: any) {
      setError('Không thể gửi lại mã. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };

  // Xác minh OTP + Đăng ký
  const verifyAndRegister = async () => {
    if (otp.length !== 6 || !/^\d+$/.test(otp)) {
      setError('Mã OTP phải là 6 chữ số');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Bước 1: Xác minh OTP
      await axios.post(`${Config.API_URL}/auth/verify-otp`, { email, otp });

      // Bước 2: Đăng ký
      const { success, error: regError } = await register(
        email,
        password,
        fullName,
        phoneNumber,
        dateOfBirth,
        gender || 'OTHER'
      );

      if (success) {
        Toast.show({
          type: 'success',
          text1: 'Đăng ký thành công!',
          text2: 'Chào mừng bạn đến với Fashion Store',
        });
        router.replace('/(auth)/login');
      } else {
        setError(regError || 'Đăng ký thất bại');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Mã OTP không đúng hoặc đã hết hạn';
      setError(msg);
      if (msg.includes('hết hạn') || msg.includes('invalid')) {
        setError('Mã OTP đã hết hạn. Vui lòng gửi lại mã mới.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ==================== BƯỚC OTP ====================
  if (step === 'otp') {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
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
                style={[styles.registerButton, (isLoading || otp.length !== 6) && styles.registerButtonDisabled]}
                onPress={verifyAndRegister}
                disabled={isLoading || otp.length !== 6}
              >
                <Text style={styles.registerButtonText}>
                  {isLoading ? 'Đang xử lý...' : 'Hoàn tất đăng ký'}
                </Text>
              </TouchableOpacity>

              <View style={styles.resendContainer}>
                {countdown > 0 ? (
                  <Text style={styles.resendText}>Gửi lại mã sau {countdown}s</Text>
                ) : (
                  <TouchableOpacity onPress={resendOtp} disabled={isLoading}>
                    <Text style={styles.resendLink}>Gửi lại mã OTP</Text>
                  </TouchableOpacity>
                )}
              </View>

              <TouchableOpacity onPress={() => setStep('form')}>
                <Text style={styles.backText}>← Quay lại chỉnh sửa thông tin</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    );
  }

  // ==================== BƯỚC FORM ====================
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            <Text style={styles.brandName}>Fashion Store</Text>
            <Text style={styles.title}>Đăng ký tài khoản</Text>

            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.error}>{error}</Text>
              </View>
            )}

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="username@gmail.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Mật khẩu</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Nhập lại mật khẩu</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Họ và tên</Text>
              <TextInput
                style={styles.input}
                placeholder="Nguyễn Văn A"
                value={fullName}
                onChangeText={setFullName}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Số điện thoại (tùy chọn)</Text>
              <TextInput
                style={styles.input}
                placeholder="0123456789"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
              />
            </View>

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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 20, paddingTop: 60 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
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
    backgroundColor: '#fff',
  },
  otpInput: {
    textAlign: 'center',
    fontSize: 22,
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
  loginContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  loginText: { fontSize: 14, color: '#666' },
  loginLink: { fontSize: 14, color: '#000', fontWeight: '600' },
  backText: { textAlign: 'center', color: '#666', marginTop: 16, fontSize: 14 },
  resendContainer: { alignItems: 'center', marginBottom: 20 },
  resendText: { color: '#666', fontSize: 14 },
  resendLink: { color: '#000', fontWeight: '600', fontSize: 15 },
});