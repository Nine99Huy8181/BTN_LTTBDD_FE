import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { productService } from '@/services/product.service';
import { Product } from '@/types';

export default function AddProductScreen() {
  const router = useRouter();
  const [product, setProduct] = useState<Partial<Product>>({
    name: '',
    basePrice: 0,
    brand: '',
    description: '',
    material: '',
    status: 'active',
    averageRating: 0,
    reviewCount: 0,
    discountPrice: 0,
    isFeatured: false,
  });

  const handleAddProduct = async () => {
    if (!product.name || !product.basePrice || !product.brand) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      await productService.createProduct(product as Product);
      Alert.alert('Success', 'Product added successfully');
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to add product');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add New Product</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Product Name"
        value={product.name}
        onChangeText={(text) => setProduct({ ...product, name: text })}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Price"
        keyboardType="numeric"
        value={product.basePrice?.toString()}
        onChangeText={(text) => setProduct({ ...product, basePrice: parseFloat(text) || 0 })}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Brand"
        value={product.brand}
        onChangeText={(text) => setProduct({ ...product, brand: text })}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Description"
        value={product.description}
        onChangeText={(text) => setProduct({ ...product, description: text })}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Material"
        value={product.material}
        onChangeText={(text) => setProduct({ ...product, material: text })}
      />

      <View style={styles.buttonContainer}>
        <Button title="Add Product" onPress={handleAddProduct} />
        <Button title="Cancel" onPress={() => router.back()} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    marginBottom: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
});