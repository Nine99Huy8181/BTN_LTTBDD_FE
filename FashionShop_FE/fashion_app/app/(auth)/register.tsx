// app/(auth)/register.tsx
import React, { useState } from 'react';
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
import { useAlertDialog } from '@/hooks/AlertDialogContext'; // Đảm bảo đúng đường dẫn

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState(''); // DD/MM/YYYY
  const [gender, setGender] = useState<'Nam' | 'Nữ' | ''>('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isRegistering, setIsRegistering] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const { register } = useAuth();
  const { showAlert } = useAlertDialog();

  // Chuyển DD/MM/YYYY → YYYY-MM-DD
  const formatDateToISO = (ddmmyyyy: string): string => {
    if (!ddmmyyyy) return '';
    const [d, m, y] = ddmmyyyy.split('/');
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  };

  // Chuyển giới tính sang backend (MALE / FEMALE)
  const mapGenderToEnglish = (gender: 'Nam' | 'Nữ' | ''): string => {
    if (gender === 'Nam') return 'Nam';
    if (gender === 'Nữ') return 'Nữ';
    return '';
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!fullName.trim()) newErrors.fullName = 'Vui lòng nhập họ và tên';
    else if (fullName.trim().length < 2) newErrors.fullName = 'Họ và tên phải có ít nhất 2 ký tự';

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) newErrors.email = 'Vui lòng nhập email';
    else if (!emailRegex.test(email.trim())) newErrors.email = 'Email không đúng định dạng';

    if (!password) newErrors.password = 'Vui lòng nhập mật khẩu';
    else if (password.length < 6) newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';

    if (password !== confirmPassword) newErrors.confirmPassword = 'Mật khẩu nhập lại không khớp';

    const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})\b/;
    if (!phoneNumber.trim()) newErrors.phoneNumber = 'Vui lòng nhập số điện thoại';
    else if (!phoneRegex.test(phoneNumber)) newErrors.phoneNumber = 'Số điện thoại không hợp lệ (VD: 0901234567)';

    const dobRegex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/(19|20)\d{2}$/;
    if (!dateOfBirth.trim()) newErrors.dateOfBirth = 'Vui lòng nhập ngày sinh';
    else if (!dobRegex.test(dateOfBirth)) newErrors.dateOfBirth = 'Ngày sinh không đúng định dạng DD/MM/YYYY';
    else {
      const [d, m, y] = dateOfBirth.split('/').map(Number);
      const birthDate = new Date(y, m - 1, d);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const mDiff = today.getMonth() - birthDate.getMonth();
      if (mDiff < 0 || (mDiff === 0 && today.getDate() < birthDate.getDate())) age--;
      if (age < 13) newErrors.dateOfBirth = 'Bạn phải từ 13 tuổi trở lên để đăng ký';
    }

    if (!gender) newErrors.gender = 'Vui lòng chọn giới tính';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setIsRegistering(true);
    setErrors({});

    try {
      const isoDateOfBirth = formatDateToISO(dateOfBirth);
      const genderEn = mapGenderToEnglish(gender);

      const { success, error: errorMessage } = await register(
        email.trim(),
        password,
        fullName.trim(),
        phoneNumber,
        isoDateOfBirth,
        genderEn
      );

      if (success) {
        showAlert(
          'Thành công!',
          'Đăng ký tài khoản thành công. Vui lòng đăng nhập.',
          [{ text: 'OK', onPress: () => router.replace('/(auth)/login') || router.back() }]
        );
      } else {
        let message = 'Đăng ký thất bại. Vui lòng thử lại.';

        if (errorMessage) {
          if (errorMessage.toLowerCase().includes('email')) message = 'Email này đã được sử dụng.';
          else if (errorMessage.toLowerCase().includes('phone') || errorMessage.includes('điện thoại'))
            message = 'Số điện thoại đã được đăng ký.';
          else message = errorMessage;
        }

        setErrors({ submit: message });
        showAlert('Đăng ký thất bại', message, [{ text: 'OK' }]);
      }
    } catch (err) {
      const msg = 'Lỗi kết nối. Vui lòng kiểm tra mạng và thử lại.';
      setErrors({ submit: msg });
      showAlert('Lỗi', msg, [{ text: 'OK' }]);
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={styles.card}>
            <Text style={styles.brandName}>Fashion Store</Text>
            <Text style={styles.title}>Đăng ký tài khoản</Text>

            {/* Lỗi chung */}
            {errors.submit && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{errors.submit}</Text>
              </View>
            )}

            {/* Họ và tên */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Họ và tên</Text>
              <TextInput
                style={[styles.input, focusedInput === 'fullName' && styles.inputFocused]}
                placeholder="Nguyễn Văn A"
                placeholderTextColor="#999"
                value={fullName}
                onChangeText={setFullName}
                onFocus={() => setFocusedInput('fullName')}
                onBlur={() => setFocusedInput(null)}
              />
              {errors.fullName && <Text style={styles.errorText}>{errors.fullName}</Text>}
            </View>

            {/* Email */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={[styles.input, focusedInput === 'email' && styles.inputFocused]}
                placeholder="example@gmail.com"
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
                onFocus={() => setFocusedInput('email')}
                onBlur={() => setFocusedInput(null)}
                autoCapitalize="none"
                keyboardType="email-address"
              />
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            {/* Mật khẩu */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Mật khẩu</Text>
              <TextInput
                style={[styles.input, focusedInput === 'password' && styles.inputFocused]}
                placeholder="Ít nhất 6 ký tự"
                placeholderTextColor="#999"
                value={password}
                onChangeText={setPassword}
                onFocus={() => setFocusedInput('password')}
                onBlur={() => setFocusedInput(null)}
                secureTextEntry
                autoCapitalize="none"
              />
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
            </View>

            {/* Nhập lại mật khẩu */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Nhập lại mật khẩu</Text>
              <TextInput
                style={[styles.input, focusedInput === 'confirmPassword' && styles.inputFocused]}
                placeholder="Nhập lại mật khẩu"
                placeholderTextColor="#999"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                onFocus={() => setFocusedInput('confirmPassword')}
                onBlur={() => setFocusedInput(null)}
                secureTextEntry
                autoCapitalize="none"
              />
              {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
            </View>

            {/* Số điện thoại */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Số điện thoại</Text>
              <TextInput
                style={[styles.input, focusedInput === 'phoneNumber' && styles.inputFocused]}
                placeholder="0901234567"
                placeholderTextColor="#999"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                onFocus={() => setFocusedInput('phoneNumber')}
                onBlur={() => setFocusedInput(null)}
                keyboardType="phone-pad"
                maxLength={10}
              />
              {errors.phoneNumber && <Text style={styles.errorText}>{errors.phoneNumber}</Text>}
            </View>

            {/* Ngày sinh */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Ngày sinh (DD/MM/YYYY)</Text>
              <TextInput
                style={[styles.input, focusedInput === 'dateOfBirth' && styles.inputFocused]}
                placeholder="01/01/2000"
                placeholderTextColor="#999"
                value={dateOfBirth}
                onChangeText={setDateOfBirth}
                onFocus={() => setFocusedInput('dateOfBirth')}
                onBlur={() => setFocusedInput(null)}
                maxLength={10}
              />
              {errors.dateOfBirth && <Text style={styles.errorText}>{errors.dateOfBirth}</Text>}
            </View>

            {/* Giới tính */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Giới tính</Text>
              <View style={styles.genderContainer}>
                <TouchableOpacity
                  style={[styles.genderButton, gender === 'Nam' && styles.genderButtonSelected]}
                  onPress={() => setGender('Nam')}
                >
                  <Text style={[styles.genderText, gender === 'Nam' && styles.genderTextSelected]}>Nam</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.genderButton, gender === 'Nữ' && styles.genderButtonSelected]}
                  onPress={() => setGender('Nữ')}
                >
                  <Text style={[styles.genderText, gender === 'Nữ' && styles.genderTextSelected]}>Nữ</Text>
                </TouchableOpacity>
              </View>
              {errors.gender && <Text style={styles.errorText}>{errors.gender}</Text>}
            </View>

            {/* Nút đăng ký */}
            <TouchableOpacity
              style={[styles.registerButton, isRegistering && styles.registerButtonDisabled]}
              onPress={handleRegister}
              disabled={isRegistering}
            >
              <Text style={styles.registerButtonText}>
                {isRegistering ? 'Đang đăng ký...' : 'Đăng ký'}
              </Text>
            </TouchableOpacity>

            {/* Đăng nhập */}
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

// Styles giữ nguyên đẹp như cũ
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
  errorContainer: { backgroundColor: '#ffebee', padding: 12, borderRadius: 8, marginBottom: 16 },
  inputContainer: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '500', color: '#000', marginBottom: 8 },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 15,
    backgroundColor: '#fff',
  },
  inputFocused: { borderColor: '#000', borderWidth: 1.5 },
  errorText: { color: '#d32f2f', fontSize: 12, marginTop: 4 },
  genderContainer: { flexDirection: 'row', gap: 16 },
  genderButton: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  genderButtonSelected: { backgroundColor: '#000', borderColor: '#000' },
  genderText: { fontSize: 15, color: '#333' },
  genderTextSelected: { color: '#fff', fontWeight: '600' },
  registerButton: {
    backgroundColor: '#000',
    height: 54,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  registerButtonDisabled: { opacity: 0.7 },
  registerButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  loginContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  loginText: { fontSize: 14, color: '#666' },
  loginLink: { fontSize: 14, color: '#000', fontWeight: '600' },
});