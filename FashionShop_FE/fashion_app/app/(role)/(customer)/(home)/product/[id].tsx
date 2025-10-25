// app/(shared)/product/[id].tsx
import { View, Text, Button, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { productService } from '@/services/product.service';
import { Product } from '@/types';
import { useAuth } from '@/hooks/AuthContext';
import { CartService } from '@/services/cart.service';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const numberId = Number(id); // hoặc parseInt(id)
  const router = useRouter();
  const [product, setProduct] = useState<Product>();
  const { user } = useAuth();

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

      <Button
        title="Add to Cart"
        onPress={async () => {
          if (!user || !user.accountId) {
            Alert.alert('Vui lòng đăng nhập trước khi thêm vào giỏ hàng');
            return;
          }

          const variantId = (product && (product as any).productID) || numberId;
          const result = await CartService.addToCart(user.accountId as number, variantId, 1);
          if (result.success) {
            Alert.alert('Thêm vào giỏ hàng thành công');
          } else {
            Alert.alert('Lỗi', result.message || 'Thêm vào giỏ hàng thất bại');
          }
        }}
      />
      <Button title="Buy Now" />
      <Button title="Reviews" onPress={() => router.push('/(home)/product/reviews/1')} />
        {/* Truong hop can chu y */}
    </View>
  );
}