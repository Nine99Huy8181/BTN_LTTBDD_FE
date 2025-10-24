// screens/AddProductScreen.tsx
import { View, Text, TextInput, Button, StyleSheet, Alert, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { productService } from '@/services/product.service';
import { Product } from '@/types';

export default function AddProductScreen() {
  const router = useRouter();
  const [product, setProduct] = useState<Partial<Product>>({
    name: '',
    description: '',
    brand: '',
    basePrice: 0,
    discountPrice: 0,
    material: '',
    status: 'active',
    averageRating: 0,
    reviewCount: 0,
    isFeatured: false,
    image: '',
  });

  const handleAddProduct = async () => {
    if (!product.name || !product.basePrice || !product.brand) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ các trường bắt buộc (Tên, Giá, Thương hiệu)');
      return;
    }

    try {
      await productService.createProduct(product as Product);
      Alert.alert('Thành công', 'Sản phẩm đã được thêm');
      router.back();
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể thêm sản phẩm');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Thêm Sản phẩm Mới</Text>

      <TextInput
        style={styles.input}
        placeholder="Tên sản phẩm"
        value={product.name}
        onChangeText={(text) => setProduct({ ...product, name: text })}
      />

      <TextInput
        style={styles.input}
        placeholder="Giá gốc"
        keyboardType="numeric"
        value={product.basePrice?.toString()}
        onChangeText={(text) => setProduct({ ...product, basePrice: parseFloat(text) || 0 })}
      />

      <TextInput
        style={styles.input}
        placeholder="Giá giảm"
        keyboardType="numeric"
        value={product.discountPrice?.toString()}
        onChangeText={(text) => setProduct({ ...product, discountPrice: parseFloat(text) || 0 })}
      />

      <TextInput
        style={styles.input}
        placeholder="Thương hiệu"
        value={product.brand}
        onChangeText={(text) => setProduct({ ...product, brand: text })}
      />

      <TextInput
        style={styles.input}
        placeholder="Mô tả"
        value={product.description}
        onChangeText={(text) => setProduct({ ...product, description: text })}
        multiline
      />

      <TextInput
        style={styles.input}
        placeholder="Chất liệu"
        value={product.material}
        onChangeText={(text) => setProduct({ ...product, material: text })}
      />

      <TextInput
        style={styles.input}
        placeholder="URL hình ảnh"
        value={product.image}
        onChangeText={(text) => setProduct({ ...product, image: text })}
      />

      <TextInput
        style={styles.input}
        placeholder="Trạng thái (active/inactive)"
        value={product.status}
        onChangeText={(text) => setProduct({ ...product, status: text })}
      />

      <View style={styles.switchContainer}>
        <Text style={styles.label}>Nổi bật:</Text>
        <Switch
          value={product.isFeatured}
          onValueChange={(value) => setProduct({ ...product, isFeatured: value })}
        />
      </View>

      <View style={styles.buttonContainer}>
        <Button title="Thêm Sản phẩm" onPress={handleAddProduct} />
        <Button title="Hủy" onPress={() => router.back()} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 16,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginVertical: 8,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  label: {
    fontSize: 16,
    marginRight: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
});