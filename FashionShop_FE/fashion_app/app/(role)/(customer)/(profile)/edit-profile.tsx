import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';

// Dữ liệu giả (giả lập từ backend)
const fakeUser = {
  fullName: 'Nguyễn Văn A',
  phoneNumber: '0901234567',
  email: 'nguyenvana@example.com',
  dateOfBirth: new Date('1995-05-20'),
  gender: 'Nam',
  avatar: null,
  loyaltyPoints: 1250,
};

export default function EditProfileScreen() {
  const router = useRouter();
  const [form, setForm] = useState({ ...fakeUser });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showGenderPicker, setShowGenderPicker] = useState(false);

  // Xử lý chọn ảnh
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Cần quyền truy cập thư viện ảnh!');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
  };

  // Xử lý ngày sinh
  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setForm({ ...form, dateOfBirth: selectedDate });
    }
  };

  // Lưu hồ sơ
  const handleSave = () => {
    Alert.alert('Thành công', 'Cập nhật hồ sơ thành công!', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chỉnh sửa hồ sơ</Text>
          <TouchableOpacity onPress={handleSave}>
            <Text style={styles.saveText}>Lưu</Text>
          </TouchableOpacity>
        </View>

        {/* Avatar */}
        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={pickImage}>
            {form.avatar ? (
              <Image source={{ uri: form.avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={40} color="#aaa" />
              </View>
            )}
            <View style={styles.cameraIcon}>
              <Ionicons name="camera" size={20} color="#fff" />
            </View>
          </TouchableOpacity>
          <Text style={styles.changePhotoText}>Thay đổi ảnh đại diện</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Họ và tên</Text>
            <TextInput
              style={styles.input}
              value={form.fullName}
              onChangeText={(text) => setForm({ ...form, fullName: text })}
              placeholder="Nhập họ tên"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Số điện thoại</Text>
            <TextInput
              style={styles.input}
              value={form.phoneNumber}
              onChangeText={(text) => setForm({ ...form, phoneNumber: text })}
              keyboardType="phone-pad"
              placeholder="090xxx"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value={form.email}
              editable={false}
            />
            <Text style={styles.hint}>Email không thể thay đổi</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Ngày sinh</Text>
            <TouchableOpacity
              style={styles.input}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={form.dateOfBirth ? styles.dateText : styles.placeholder}>
                {form.dateOfBirth
                  ? form.dateOfBirth.toLocaleDateString('vi-VN')
                  : 'Chọn ngày sinh'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Giới tính</Text>
            <TouchableOpacity
              style={styles.input}
              onPress={() => setShowGenderPicker(true)}
            >
              <Text style={form.gender ? styles.dateText : styles.placeholder}>
                {form.gender || 'Chọn giới tính'}
              </Text>
            </TouchableOpacity>
            {showGenderPicker && (
              <View style={styles.genderPicker}>
                {['Nam', 'Nữ', 'Khác'].map((g) => (
                  <TouchableOpacity
                    key={g}
                    style={styles.genderOption}
                    onPress={() => {
                      setForm({ ...form, gender: g });
                      setShowGenderPicker(false);
                    }}
                  >
                    <Text style={styles.genderText}>{g}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <View style={styles.loyaltyBox}>
            <Ionicons name="star" size={20} color="#FFD700" />
            <Text style={styles.loyaltyText}>
              Điểm tích lũy: <Text style={styles.points}>{form.loyaltyPoints}</Text>
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// === STYLES ===
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#333' },
  saveText: { fontSize: 16, color: '#000000ff', fontWeight: '600' },
  avatarSection: { alignItems: 'center', marginVertical: 24 },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#000000ff',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  changePhotoText: { marginTop: 12, color: '#666', fontSize: 14 },
  form: { paddingHorizontal: 16 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, color: '#333', marginBottom: 8, fontWeight: '500' },
  input: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 12,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  disabledInput: { backgroundColor: '#f5f5f5', color: '#999' },
  hint: { fontSize: 12, color: '#999', marginTop: 4 },
  dateText: { color: '#333' },
  placeholder: { color: '#aaa' },
  genderPicker: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    overflow: 'hidden',
  },
  genderOption: {
    padding: 14,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  genderText: { fontSize: 15, color: '#333' },
  loyaltyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff9c4',
    padding: 16,
    borderRadius: 12,
    marginTop: 10,
  },
  loyaltyText: { marginLeft: 10, fontSize: 15, color: '#333' },
  points: { fontWeight: 'bold', color: '#000000ff' },
});