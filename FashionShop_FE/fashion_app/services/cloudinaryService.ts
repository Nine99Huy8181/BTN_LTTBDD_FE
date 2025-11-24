// services/cloudinaryService.ts
import axios from 'axios';
import * as ImageManipulator from 'expo-image-manipulator';  // Tùy chọn để nén ảnh
import { Platform } from 'react-native';

const CLOUDINARY_CLOUD_NAME = 'dmy3yhqwj';  // Cloud name từ Cloudinary Dashboard
const CLOUDINARY_UPLOAD_PRESET = 'fa-shop';  // Preset phải được set là "unsigned" trong Dashboard
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

/**
 * Nén ảnh trước upload (tùy chọn, để tối ưu kích thước).
 * @param uri URI cục bộ từ ImagePicker.
 * @returns URI mới sau nén.
 */
async function compressImage(uri: string): Promise<string> {
  try {
    const manipulated = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 1600 } }],  // Resize max width 1600px
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }  // Compress 70%
    );
    return manipulated.uri;
  } catch (err) {
    console.log('Compress error:', err);
    return uri;  // Fallback nếu lỗi
  }
}

/**
 * Upload ảnh từ URI lên Cloudinary.
 * @param uri URI cục bộ của ảnh.
 * @returns Promise<string> URL công khai của ảnh đã upload.
 */
export async function uploadImageToCloudinary(uri: string): Promise<string> {
  try {
    // 1. Nén ảnh (tùy chọn)
    const compressedUri = await compressImage(uri);
    console.log('Image compressed');

    // 2. Trong React Native / Expo, gửi file bằng object { uri, name, type }
    // thay vì chuyển thành Blob — cách này tương thích hơn trên thiết bị di động.
    const fileName = `review_${Date.now()}.jpg`;
    let fileUri = compressedUri;
    // Trên Android một số URI cần tiền tố file://
    if (!fileUri.startsWith('file://') && Platform.OS === 'android') {
      fileUri = `file://${fileUri}`;
    }

    // 3. Tạo FormData cho multipart upload (append object với uri)
    const formData = new FormData();
    const file: any = { uri: fileUri, name: fileName, type: 'image/jpeg' };
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', 'product_reviews');

    console.log('FormData created (uri-based):', {
      fileName,
      uploadPreset: CLOUDINARY_UPLOAD_PRESET,
      folder: 'product_reviews',
      cloudName: CLOUDINARY_CLOUD_NAME,
      url: CLOUDINARY_UPLOAD_URL,
      fileUri
    });
// Test connection với cloud name thực
try {
  const testURL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/ping`;
  console.log('Testing connection to:', testURL);
  const testResponse = await fetch(testURL);
  console.log('Connection test status:', testResponse.status);
  const testData = await testResponse.json();
  console.log('Connection test response:', testData);
} catch (err) {
  console.log('Connection test failed:', err);
}

    // 4. Gửi POST request với các headers bổ sung
    console.log('Uploading to:', CLOUDINARY_UPLOAD_URL);
    console.log('Upload preset:', CLOUDINARY_UPLOAD_PRESET);
    console.log('Form data:', {
      // file is sent as {uri,name,type} on RN (not raw blob)
      upload_preset: CLOUDINARY_UPLOAD_PRESET,
      folder: 'product_reviews'
    });
    
    const uploadRes = await fetch(CLOUDINARY_UPLOAD_URL, {
      method: 'POST',
      body: formData,
    });
    
    if (!uploadRes.ok) {
      const errorData = await uploadRes.json();
      console.log('Upload failed with status:', uploadRes.status);
      console.log('Error details:', errorData);
      throw new Error(`Upload failed: ${errorData.error?.message || 'Unknown error'}`);
    }
    const data = await uploadRes.json();

    if (data.secure_url) {
      console.log('Upload success:', data.secure_url);
      return data.secure_url;  // URL HTTPS an toàn
    } else {
      throw new Error('Upload failed: No secure_url');
    }
  } catch (err) {
    console.log('Cloudinary upload error:', err);
    if (axios.isAxiosError(err)) {
      console.log('Error details:', {
        request: err.request,
        response: err.response,
        config: err.config
      });
    }
    throw err;
  }
}