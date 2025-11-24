// app/product/reviews/[id].tsx
import React, { useState, useEffect } from 'react';
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
  ActivityIndicator,
  Modal,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { useAuth } from '../../../../../../hooks/AuthContext';
import { api } from '../../../../../../services/api';
import { uploadImageToCloudinary } from '../../../../../../services/cloudinaryService'; // Thay đổi import
import { SafeAreaView } from 'react-native-safe-area-context';
import { OrderService } from '../../../../../../services/order.service';
import { showToast } from '../../../../../../utils/toast';
import { Ionicons } from '@expo/vector-icons';
type ReviewItem = {
  id: string;
  rating: number;
  comment: string;
  author: string;
  date: string;
};

export default function ProductReviewScreen() {
  const { id } = useLocalSearchParams(); // id is orderId
  const router = useRouter();

  const [rating, setRating] = useState('5');
  const [comment, setComment] = useState('');
  const [imageUris, setImageUris] = useState<string[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const auth = useAuth();
  const [orderData, setOrderData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [canReview, setCanReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  useEffect(() => {
    fetchOrderData();
  }, [id]);

  const fetchOrderData = async () => {
    try {
      setLoading(true);
      const data = await OrderService.getOrderDetail(Number(id));
      setOrderData(data);
      
      console.log('[DEBUG fetchOrderData] Order data:', data);
      console.log('[DEBUG fetchOrderData] orderItems:', data.orderItems);
      
      // TODO: Enforce DELIVERED status in production
      // For now, allow review for testing purposes
      setCanReview(true);
      
      // Auto-select product based on quantity
      if (data.orderItems && data.orderItems.length > 0) {
        console.log('[DEBUG fetchOrderData] Found ' + data.orderItems.length + ' items');
        
        if (data.orderItems.length === 1) {
          // Auto-select nếu chỉ có 1 sản phẩm
          const firstProduct = data.orderItems[0]?.variant?.product?.productID;
          console.log('[DEBUG fetchOrderData] Single item - Auto-selecting product ID:', firstProduct);
          if (firstProduct) {
            setSelectedProductId(firstProduct);
          }
        } else {
          // Multiple items - let user choose
          console.log('[DEBUG fetchOrderData] Multiple items - User must choose');
          // Don't set selectedProductId, let user click to select
        }
      } else {
        console.log('[DEBUG fetchOrderData] No orderItems found');
      }
    } catch (error) {
      console.log('Error fetching order:', error);
      console.log('Không thể tải thông tin đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  async function pickImage() {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        showToast.error('Quyền truy cập bị từ chối', 'Cần quyền truy cập thư viện ảnh để chọn ảnh');
        return;
      }

      // ... (Phần chọn ảnh không đổi) ...
      // @ts-ignore - accommodate multiple SDK typings
      const mediaTypesValue = (ImagePicker as any).MediaType?.Images ?? (ImagePicker as any).MediaTypeOptions?.Images;

      // Allow up to 3 images total per review
      const MAX_IMAGES = 3;
      const remaining = Math.max(0, MAX_IMAGES - imageUris.length);
      if (remaining <= 0) {
        showToast.error('Giới hạn ảnh', `Bạn chỉ có thể chọn tối đa ${MAX_IMAGES} ảnh cho một đánh giá.`);
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
        showToast.info('Đang tải ảnh', 'Vui lòng chờ ảnh được tải lên server...');

        // Ensure we don't exceed MAX_IMAGES even if picker returns more
        const toUpload = assets.slice(0, remaining);
        const uploadPromises = toUpload.map(asset => uploadImageToCloudinary(asset.uri));
        const uploadedUrls = await Promise.all(uploadPromises);

        setImageUris(prev => [...prev, ...uploadedUrls].slice(0, MAX_IMAGES));
        showToast.success('Thành công', `${uploadedUrls.length} ảnh đã được tải lên.`);
      }
    } catch (err) {
      console.log('pickImage/uploadImage error', err);
      showToast.error('Lỗi', 'Không thể chọn hoặc tải ảnh lên');
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
  //     console.log('uriToBase64 error', err);
  //     throw err;
  //   }
  // }

  async function submitReviewToBackend(ratingNum: number, commentText: string, uris: string[]) {
    if (!selectedProductId) {
      const errMsg = 'Vui lòng chọn sản phẩm để đánh giá';
      console.log('[DEBUG submitReviewToBackend] Error:', errMsg);
      showToast.error('Lỗi', errMsg);
      throw new Error(errMsg);
    }

    // 3. Build body MỚI (sử dụng URLs)
    const body = {
      productID: selectedProductId,
      rating: ratingNum,
      comment: commentText,
      // Gửi mảng các URL đã upload lên Cloudinary cho Backend
      images: uris,
    };

    console.log('[DEBUG submitReviewToBackend] Submitting review with body:', body);

    try {
      const res = await api.post('/reviews', body); // dùng axios instance đã config
      console.log('[DEBUG submitReviewToBackend] Review saved successfully:', res.data);
      return res.data; // dữ liệu server trả về
    } catch (err: any) {
      console.log('[DEBUG submitReviewToBackend] API error:', err.response?.data || err.message);
      const errorMsg = err.response?.data?.message || err.message || 'Không thể gửi đánh giá tới server';
      throw new Error(errorMsg);
    }
  }

  function addReview() {
    const parsed = parseInt(rating + '', 10);
    if (isNaN(parsed) || parsed < 1 || parsed > 5) {
      showToast.error('Lỗi', 'Rating phải là số từ 1 đến 5');
      return;
    }
    if (!comment.trim()) {
      showToast.error('Lỗi', 'Vui lòng nhập nội dung bình luận');
      return;
    }

    console.log('[DEBUG addReview] selectedProductId:', selectedProductId);
    console.log('[DEBUG addReview] imageUris:', imageUris);
    console.log('[DEBUG addReview] rating:', parsed);
    console.log('[DEBUG addReview] comment:', comment);

    // Submit to backend BEFORE resetting form!
    const imagesToSubmit = [...imageUris]; // Make a copy
    
    submitReviewToBackend(parsed, comment.trim(), imagesToSubmit)
      .then(() => {
        console.log('[DEBUG addReview] Review submitted successfully!');
        // Reset form AFTER successful submission
        setComment('');
        setRating('5');
        setImageUris([]);
        setReviewSuccess(true);
      })
      .catch(err => {
        console.log('[DEBUG addReview] Failed to submit review:', err);
        const errorMsg = err.message || 'Không thể gửi đánh giá tới server';
        showToast.error('Lỗi', errorMsg);
      });
  }

  function renderStars(n: number) {
    return '★'.repeat(n) + '☆'.repeat(Math.max(0, 5 - n));
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={{ marginTop: 16, textAlign: 'center' }}>Đang tải thông tin đơn hàng...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (reviewSuccess) {
    return (
      <Modal transparent visible={true} animationType="fade">
        <View style={styles.centeredView}>
          <View style={styles.successModal}>
            <Text style={styles.successIcon}>✓</Text>
            <Text style={styles.successTitle}>Cảm ơn bạn!</Text>
            <Text style={styles.successText}>Đánh giá của bạn đã được gửi thành công</Text>
            
            <View style={styles.successButtonContainer}>
              <TouchableOpacity
                style={[styles.successBtn, styles.viewReviewBtn]}
                onPress={() => {
                  setReviewSuccess(false);
                  router.push(`/(role)/(customer)/(home)/product/${selectedProductId}`);
                }}
              >
                <Text style={styles.viewReviewText}>Xem đánh giá</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.successBtn, styles.backBtn]}
                onPress={() => router.back()}
              >
                <Text style={styles.backBtnText}>Quay lại</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}><Ionicons name="arrow-back" size={22}/></Text>
          </TouchableOpacity>
          <Text style={styles.title}>Gửi đánh giá cho sản phẩm</Text>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.form}>
            <Text style={styles.label}>Sản phẩm</Text>
            {orderData?.orderItems && orderData.orderItems.length > 0 ? (
              <View style={{ marginBottom: 16 }}>
                {orderData.orderItems.map((item: any, index: number) => {
                  const productId = item.variant?.product?.productID;
                  const productName = item.variant?.product?.name || 'Sản phẩm không xác định';
                  
                  return (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.productSelect,
                        selectedProductId === productId && styles.productSelectActive
                      ]}
                      onPress={() => setSelectedProductId(productId)}
                    >
                      <Text style={[
                        styles.productSelectText,
                        selectedProductId === productId && styles.productSelectTextActive
                      ]}>
                        {selectedProductId === productId ? '✓ ' : '○ '}{productName}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : (
              <Text style={{ color: '#999', marginBottom: 16 }}>Không có sản phẩm trong đơn hàng</Text>
            )}

            <Text style={styles.label}>Chọn số sao đánh giá</Text>
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setRating(star.toString())}
                  style={styles.starButton}
                >
                  <Text style={[
                    styles.starText,
                    { color: Number(rating) >= star ? '#f5a623' : '#ddd' }
                  ]}>
                    ★
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  backText: {
    fontSize: 16,
    color: '#000',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    flex: 1,
  },
  content: {
    padding: 16,
  },
  form: {
    backgroundColor: '#fff',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#000',
  },
  
  // Product Selection Styles
  productSelect: {
    backgroundColor: '#f8f8f8',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#f8f8f8',
  },
  productSelectActive: {
    backgroundColor: '#fff',
    borderColor: '#000',
  },
  productSelectText: {
    fontSize: 15,
    color: '#666',
  },
  productSelectTextActive: {
    fontSize: 15,
    color: '#000',
    fontWeight: '600',
  },
  
  // Star Rating Styles
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 20,
    gap: 8,
  },
  starButton: {
    padding: 4,
  },
  starText: {
    fontSize: 40,
  },
  
  // Input Styles
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    marginBottom: 20,
    backgroundColor: '#f8f8f8',
    textAlignVertical: 'top',
  },
  
  // Image Selection Styles
  imageSection: {
    marginBottom: 20,
  },
  imagePickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  pickImageBtn: {
    backgroundColor: '#f8f8f8',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
  },
  pickImageText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  imageCount: {
    marginLeft: 12,
    fontSize: 14,
    color: '#666',
  },
  imagePreviewContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 8,
  },
  imageWrapper: {
    position: 'relative',
  },
  previewImage: {
    width: 90,
    height: 90,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  removeImageBtn: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#ff4444',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  removeImageText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    lineHeight: 16,
  },
  
  // Submit Button
  submit: {
    backgroundColor: '#000',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Success Modal Styles
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  successModal: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    width: '85%',
    maxWidth: 400,
  },
  successIcon: {
    fontSize: 60,
    color: '#4CAF50',
    marginBottom: 16,
    fontWeight: 'bold',
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
  },
  successText: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  successButtonContainer: {
    width: '100%',
    gap: 12,
  },
  successBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  viewReviewBtn: {
    backgroundColor: '#000',
  },
  viewReviewText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  backBtn: {
    backgroundColor: '#f8f8f8',
  },
  backBtnText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
});