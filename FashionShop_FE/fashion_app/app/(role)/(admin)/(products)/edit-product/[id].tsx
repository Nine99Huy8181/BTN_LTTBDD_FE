// app/(admin)/products/edit/[id].tsx
import { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { productService } from '@/services/product.service';
import { Product } from '@/types';

export default function EditProductScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const data = await productService.getProductById(Number(id));
      setProduct(data);
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể tải sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProduct = async () => {
    if (!product?.name || !product?.basePrice || !product?.brand) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
      return;
    }

    try {
      await productService.updateProduct(Number(id), product);
      Alert.alert('Thành công', 'Cập nhật sản phẩm thành công', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể cập nhật');
    }
  };

  if (loading) return <ActivityIndicator size="large" style={{ flex: 1 }} />;
  if (!product) return <Text>Không tìm thấy sản phẩm</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chỉnh sửa sản phẩm #{id}</Text>

      {['name', 'brand', 'basePrice', 'discountPrice', 'description', 'material', 'image'].map(field => (
        <TextInput
          key={field}
          style={styles.input}
          placeholder={field}
          value={String(product[field as keyof Product] ?? '')}
          onChangeText={text => setProduct(prev => ({ ...prev!, [field]: text }))}
          keyboardType={['basePrice', 'discountPrice'].includes(field) ? 'numeric' : 'default'}
        />
      ))}

      <View style={styles.buttonContainer}>
        <Button title="Cập nhật" onPress={handleUpdateProduct} />
        <Button title="Hủy" onPress={() => router.back()} color="gray" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 8, marginBottom: 12 },
  buttonContainer: { marginTop: 16, gap: 8 },
});