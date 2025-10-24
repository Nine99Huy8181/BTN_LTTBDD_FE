// app/(shared)/product/[id].tsx
import { View, Text, Button } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { productService } from '@/services/product.service';
import { Product } from '@/types';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const numberId = Number(id); // hoặc parseInt(id)
  const router = useRouter();
  const [product, setProduct] = useState<Product>();

    useEffect(() => {
      const fetchProduct = async () => {
        try {
          const data = await productService.getProductById(numberId);
          setProduct(data);
        } catch (err) {
          //
        }
      };
  
      fetchProduct();
    }, []);
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 20 }}>Màn hình Chi tiết Sản phẩm {id}</Text>
      <Text style={{ fontSize: 20 }}>{product?.name}</Text>
      <Text style={{ fontSize: 20 }}>{product?.averageRating}</Text>
      <Text style={{ fontSize: 20 }}>{product?.createdDate}</Text>
      <Text style={{ fontSize: 20 }}>{product?.description}</Text>
      <Text style={{ fontSize: 20 }}>{product?.brand}</Text>

      <Button title="Reviews" onPress={() => router.push('/(home)/product/reviews/1')} />
        {/* Truong hop can chu y */}
    </View>
  );
}