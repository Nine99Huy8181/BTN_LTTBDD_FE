// app/product/reviews/[id].tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  StyleSheet,
  Image,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { useAuth } from '../../../../../../hooks/AuthContext';
import { api } from '../../../../../../services/api';
import { uploadImageToCloudinary } from '../../../../../../services/cloudinaryService'; // Thay đổi import
type ReviewItem = {
  id: string;
  rating: number;
  comment: string;
  author: string;
  date: string;
};

export default function ProductReviewScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [rating, setRating] = useState('5');
  const [comment, setComment] = useState('');
  const [imageUris, setImageUris] = useState<string[]>([]);
  const auth = useAuth();

  async function pickImage() {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Quyền truy cập bị từ chối', 'Cần quyền truy cập thư viện ảnh để chọn ảnh');
        return;
      }

      // ... (Phần chọn ảnh không đổi) ...
      // @ts-ignore - accommodate multiple SDK typings
      const mediaTypesValue = (ImagePicker as any).MediaType?.Images ?? (ImagePicker as any).MediaTypeOptions?.Images;

      // Allow up to 3 images total per review
      const MAX_IMAGES = 3;
      const remaining = Math.max(0, MAX_IMAGES - imageUris.length);
      if (remaining <= 0) {
        Alert.alert('Giới hạn ảnh', `Bạn chỉ có thể chọn tối đa ${MAX_IMAGES} ảnh cho một đánh giá.`);
        return;
      }
      const pickerOptions: any = { quality: 0.6, allowsMultipleSelection: true, selectionLimit: remaining }; // Giới hạn ảnh
      if (mediaTypesValue !== undefined) pickerOptions.mediaTypes = mediaTypesValue;

      const result = await ImagePicker.launchImageLibraryAsync(pickerOptions);

      // @ts-ignore
      const cancelled = result.cancelled ?? result.canceled ?? false;
      // @ts-ignore
      const assets = result.assets ?? (result.uri ? [{ uri: result.uri }] : []);

      if (!cancelled && assets.length > 0) {
        Alert.alert('Đang tải ảnh', 'Vui lòng chờ ảnh được tải lên server...');

        // Ensure we don't exceed MAX_IMAGES even if picker returns more
        const toUpload = assets.slice(0, remaining);
        const uploadPromises = toUpload.map(asset => uploadImageToCloudinary(asset.uri));
        const uploadedUrls = await Promise.all(uploadPromises);

        setImageUris(prev => [...prev, ...uploadedUrls].slice(0, MAX_IMAGES));
        Alert.alert('Thành công', `${uploadedUrls.length} ảnh đã được tải lên.`);
      }
    } catch (err) {
      console.error('pickImage/uploadImage error', err);
      Alert.alert('Lỗi', 'Không thể chọn hoặc tải ảnh lên');
    }
  }

  function removeImage(uri: string) {
    setImageUris(prev => prev.filter(u => u !== uri));
  }

  // async function uriToBase64(uri: string) {
  //   try {
  //     // Some Expo versions don't expose EncodingType in types, cast to any to avoid TS error
  //     const encodingAny: any = (FileSystem as any).EncodingType ? (FileSystem as any).EncodingType.Base64 : 'base64';
  //     const b = await FileSystem.readAsStringAsync(uri, { encoding: encodingAny });
  //     return b;
  //   } catch (err) {
  //     console.error('uriToBase64 error', err);
  //     throw err;
  //   }
  // }

  async function submitReviewToBackend(ratingNum: number, commentText: string, uris: string[]) {
    // const token = await auth.getToken();
    // if (!token) {
    //   Alert.alert('Không đăng nhập', 'Vui lòng đăng nhập để gửi đánh giá');
    //   return;
    // }

    // 3. Build body MỚI (sử dụng URLs)
    const body = {
      productID: Number(id),
      rating: ratingNum,
      comment: commentText,
      // Gửi mảng các URL đã upload lên Cloudinary cho Backend
      images: uris,
    };


 try {
    const res = await api.post('/reviews', body); // dùng axios instance đã config
    console.log('Review saved', res.data);

    setImageUris([]); // reset danh sách ảnh
    return res.data; // dữ liệu server trả về
  } catch (err: any) {
    console.error('Failed to submit review:', err.response?.data || err.message);
    Alert.alert('Lỗi', 'Không thể gửi đánh giá tới server');
  }
  }

  function addReview() {
    const parsed = parseInt(rating + '', 10);
    if (isNaN(parsed) || parsed < 1 || parsed > 5) {
      Alert.alert('Lỗi', 'Rating phải là số từ 1 đến 5');
      return;
    }
    if (!comment.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập nội dung bình luận');
      return;
    }

    const newReview: ReviewItem = {
      id: Date.now().toString(),
      rating: parsed,
      comment: comment.trim(),
      author: 'Bạn',
      date: new Date().toISOString(),
    };

    // Reset form and submit to backend
    setComment('');
    setRating('5');
    setImageUris([]);

    // Real backend submission (includes images)
    submitReviewToBackend(parsed, newReview.comment, imageUris).then(() => {
      Alert.alert('Thành công', 'Đã gửi đánh giá. Cảm ơn bạn!');
    }).catch(err => {
      console.error('Failed to submit review:', err);
      Alert.alert('Lỗi', 'Không thể gửi đánh giá tới server');
    });
  }

  function renderStars(n: number) {
    return '★'.repeat(n) + '☆'.repeat(Math.max(0, 5 - n));
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Gửi đánh giá cho sản phẩm #{id}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.form}>
          <Text style={styles.label}>Rating (1-5)</Text>
          <TextInput
            value={rating}
            onChangeText={setRating}
            keyboardType="numeric"
            style={styles.input}
            placeholder="5"
            maxLength={1}
          />

          <Text style={styles.label}>Nội dung bình luận</Text>
          <TextInput
            value={comment}
            onChangeText={setComment}
            style={[styles.input, { height: 120 }]}
            placeholder="Viết nhận xét của bạn..."
            multiline
          />

          <View style={{ marginBottom: 8 }}>
            <Text style={styles.label}>Ảnh (tùy chọn)</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity style={[styles.submit, { backgroundColor: '#4CAF50', paddingHorizontal: 12 }]} onPress={pickImage}>
                <Text style={styles.submitText}>Chọn ảnh</Text>
              </TouchableOpacity>
              <Text style={{ marginLeft: 8 }}>{imageUris.length} ảnh đã chọn</Text>
            </View>

            {imageUris.length > 0 && (
              <ScrollView horizontal style={{ marginTop: 8 }}>
                {imageUris.map(uri => (
                  <View key={uri} style={{ marginRight: 8, alignItems: 'center' }}>
                    <Image source={{ uri }} style={{ width: 80, height: 80, borderRadius: 6 }} />
                    <TouchableOpacity onPress={() => removeImage(uri)} style={{ marginTop: 4 }}>
                      <Text style={{ color: 'red', fontSize: 12 }}>Xóa</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            )}
          </View>

          <TouchableOpacity style={styles.submit} onPress={addReview}>
            <Text style={styles.submitText}>Gửi bình luận</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  backButton: { padding: 6, marginRight: 8 },
  backText: { color: '#007AFF' },
  title: { fontSize: 16, fontWeight: '600' },
  content: { padding: 12, paddingBottom: 40 },
  form: { marginBottom: 16, backgroundColor: '#fafafa', padding: 12, borderRadius: 8 },
  label: { fontSize: 13, marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 6, padding: 8, marginBottom: 10, backgroundColor: '#fff' },
  submit: { backgroundColor: '#007AFF', padding: 10, borderRadius: 6, alignItems: 'center' },
  submitText: { color: '#fff', fontWeight: '600' },
  sectionTitle: { fontSize: 15, fontWeight: '700' },
  listHeader: { marginBottom: 8 },
  reviewCard: { backgroundColor: '#fff', padding: 12, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: '#f0f0f0' },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  author: { fontWeight: '700' },
  stars: { color: '#f5a623' },
  date: { fontSize: 11, color: '#666', marginBottom: 6 },
  comment: { fontSize: 14, color: '#333' },
});