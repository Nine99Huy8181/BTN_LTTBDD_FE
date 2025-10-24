// app/(admin)/products/add.tsx
import { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { productService } from '@/services/product.service';

export default function AddProductScreen() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    brand: '',
    basePrice: '',
    discountPrice: '',
    description: '',
    material: '',
    image: '',
    status: 'ACTIVE',
    isFeatured: false,
  });

  const handleAddProduct = async () => {
    if (!form.name || !form.brand || !form.basePrice) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên, thương hiệu và giá');
      return;
    }

    try {
      await productService.createProduct({
        ...form,
        basePrice: parseFloat(form.basePrice),
        discountPrice: parseFloat(form.discountPrice) || undefined,
        isFeatured: form.isFeatured === true,
      });
      Alert.alert('Thành công', 'Thêm sản phẩm thành công', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể thêm sản phẩm');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Thêm sản phẩm mới</Text>

      {['name', 'brand', 'basePrice', 'discountPrice', 'description', 'material', 'image'].map(field => (
        <TextInput
          key={field}
          style={styles.input}
          placeholder={field === 'basePrice' ? 'Giá gốc' : field === 'discountPrice' ? 'Giá khuyến mãi' : field}
          value={form[field as keyof typeof form]}
          onChangeText={text => setForm(prev => ({ ...prev, [field]: text }))}
          keyboardType={['basePrice', 'discountPrice'].includes(field) ? 'numeric' : 'default'}
        />
      ))}

      <View style={styles.buttonContainer}>
        <Button title="Thêm sản phẩm" onPress={handleAddProduct} />
        <Button title="Hủy" onPress={() => router.back()} color="gray" />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 8, marginBottom: 12 },
  buttonContainer: { marginTop: 16, gap: 8 },
});