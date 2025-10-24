// screens/EditProductScreen.tsx
import { View, Text, TextInput, Button, StyleSheet, Alert, Switch } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { productService } from '@/services/product.service';
import { Product } from '@/types';

export default function EditProductScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProduct();
  }, []);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await productService.getProductById(Number(id));
      setProduct(response);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải thông tin sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProduct = async () => {
    if (!product?.name || !product?.basePrice || !product?.brand) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ các trường bắt buộc (Tên, Giá, Thương hiệu)');
      return;
    }

    try {
      await productService.updateProduct(Number(id), product);
      Alert.alert('Thành công', 'Sản phẩm đã được cập nhật');
      router.back();
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể cập nhật sản phẩm');
    }
  };

  if (loading || !product) {
    return (
      <View style={styles.container}>
        <Text>Đang tải...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sửa Sản phẩm {id}</Text>

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
        value={product.basePrice.toString()}
        onChangeText={(text) => setProduct({ ...product, basePrice: parseFloat(text) || 0 })}
      />

      <TextInput
        style={styles.input}
        placeholder="Giá giảm"
        keyboardType="numeric"
        value={product.discountPrice.toString()}
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
        <Button title="Cập nhật Sản phẩm" onPress={handleUpdateProduct} />
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