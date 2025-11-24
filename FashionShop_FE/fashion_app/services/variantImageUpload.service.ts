// services/variantImageUpload.service.ts
import * as ImageManipulator from 'expo-image-manipulator';
import { Platform } from 'react-native';

const CLOUDINARY_CLOUD_NAME = 'duffcwady';
const CLOUDINARY_UPLOAD_PRESET = 'new_variant_fashop';
const CLOUDINARY_FOLDER = 'api_mobile/image_btl/new_variants';

const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

/**
 * Nén ảnh trước khi upload
 */
async function compressImage(uri: string): Promise<string> {
  try {
    const manipulated = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 1600 } }],
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
    );
    return manipulated.uri;
  } catch (err) {
    console.log('Compress error:', err);
    return uri;
  }
}

/**
 * Upload ảnh variant lên Cloudinary
 * @param uri URI local của ảnh từ ImagePicker
 * @returns URL công khai của ảnh trên Cloudinary
 */
export async function uploadVariantImage(uri: string): Promise<string> {
  try {
    // 1. Nén ảnh
    const compressedUri = await compressImage(uri);
    console.log('Variant image compressed');

    // 2. Tạo tên file với prefix variant
    const fileName = `variant_${Date.now()}.jpg`;
    let fileUri = compressedUri;
    
    if (!fileUri.startsWith('file://') && Platform.OS === 'android') {
      fileUri = `file://${fileUri}`;
    }

    // 3. Tạo FormData
    const formData = new FormData();
    const file: any = { 
      uri: fileUri, 
      name: fileName, 
      type: 'image/jpeg' 
    };
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', CLOUDINARY_FOLDER);

    console.log('Uploading variant image to Cloudinary...');
    
    // 4. Upload lên Cloudinary
    const uploadRes = await fetch(CLOUDINARY_UPLOAD_URL, {
      method: 'POST',
      body: formData,
    });
    
    if (!uploadRes.ok) {
      const errorData = await uploadRes.json();
      console.log('Variant image upload failed:', uploadRes.status, errorData);
      throw new Error(`Upload failed: ${errorData.error?.message || 'Unknown error'}`);
    }
    
    const data = await uploadRes.json();

    if (data.secure_url) {
      console.log('Variant image upload success:', data.secure_url);
      return data.secure_url;
    } else {
      throw new Error('Upload failed: No secure_url returned');
    }
  } catch (err) {
    console.log('Variant image upload error:', err);
    throw err;
  }
}

/**
 * Upload nhiều ảnh variant cùng lúc
 * @param uris Mảng các URI local
 * @returns Mảng các URL trên Cloudinary
 */
export async function uploadMultipleVariantImages(uris: string[]): Promise<string[]> {
  const uploadPromises = uris.map(uri => uploadVariantImage(uri));
  return Promise.all(uploadPromises);
}

/**
 * Validate URI trước khi upload
 */
export function isValidImageUri(uri: string): boolean {
  return !!uri && (
    uri.startsWith('file://') || 
    uri.startsWith('content://') || 
    uri.startsWith('ph://')
  );
}
