// app/(customer)/(cart)/index.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, Button, Image, TouchableOpacity, StyleSheet, FlatList, Alert, Animated } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { Routes } from '@/constants';
import { useAuth } from '@/hooks/AuthContext';
import { CartService, CartItem } from '@/services/cart.service';
import { Swipeable } from 'react-native-gesture-handler';

export default function CartScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([] as CartItem[]);
  const [loading, setLoading] = useState(false);

  const loadCart = async () => {
    if (!user || !user.accountId) return;
    setLoading(true);
    try {
      const customers: any = await CartService.getCustomersByAccountId(user.accountId as number);
      if (!customers || customers.length === 0) return;
      const customerId = customers[0].customerID;
      let cart = await CartService.getCartByCustomerId(customerId);
      if (!cart) cart = await CartService.createCart(customerId);
      const cartItems = await CartService.getCartItemsByCartId(cart.cartID);
      setItems(cartItems);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Reload when screen is focused (so after addToCart navigation back, it refreshes)
  useFocusEffect(
    useCallback(() => {
      loadCart();
    }, [user])
  );

  const changeQuantity = async (item: CartItem, delta: number) => {
    const current = item.quantity || 0;
    const newQty = current + delta;
    try {
      if (newQty <= 0) {
        // delete the item
        await CartService.deleteCartItem(item.cartItemID);
      } else {
        await CartService.updateCartItem(item.cartItemID, item.cart.cartID, item.variant.variantID, newQty);
      }
      await loadCart();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not update quantity');
    }
  };

  const deleteItem = async (item: CartItem) => {
    try {
      await CartService.deleteCartItem(item.cartItemID);
      await loadCart();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not delete item');
    }
  };

  const total = items.reduce((s, it) => {
    const price = (it.variant && (it.variant as any).product && ((it.variant as any).product.discountPrice ?? (it.variant as any).product.basePrice)) || 0;
    return s + (price * (it.quantity || 0));
  }, 0);

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(i) => String(i.cartItemID)}
        renderItem={({ item }) => {
          const rightAction = (progress: any, dragX: any) => {
            const trans = dragX.interpolate({ inputRange: [-100, 0], outputRange: [0, 100], extrapolate: 'clamp' });
            return (
              <TouchableOpacity onPress={() => deleteItem(item)} style={styles.rightAction}>
                <Animated.Text style={[styles.rightActionText, { transform: [{ translateX: trans }] }]}>🗑 Delete</Animated.Text>
              </TouchableOpacity>
            );
          };

          return (
            <Swipeable renderRightActions={rightAction} overshootRight={false}>
              <View style={styles.itemRow}>
                <Image source={{ uri: (item.variant as any)?.product?.image || '' }} style={styles.image} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.title}>{(item.variant as any)?.product?.name}</Text>
                  <Text style={styles.size}>size:{(item.variant as any)?.size}</Text>
                  <View style={styles.qtyRow}>
                    <TouchableOpacity onPress={() => changeQuantity(item, -1)} style={styles.qtyBtn}><Text>-</Text></TouchableOpacity>
                    <Text style={styles.qtyText}>{item.quantity}</Text>
                    <TouchableOpacity onPress={() => changeQuantity(item, 1)} style={styles.qtyBtn}><Text>+</Text></TouchableOpacity>
                    <Text style={styles.price}>${((item.variant as any)?.product?.discountPrice ?? (item.variant as any)?.product?.basePrice ?? 0).toFixed(2)}</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={() => deleteItem(item)} style={styles.trashBtn}>
                  <Text style={{ color: '#900', fontWeight: '700' }}>🗑</Text>
                </TouchableOpacity>
              </View>
            </Swipeable>
          );
        }}
        ListEmptyComponent={() => <Text style={{ padding: 16 }}>Giỏ hàng trống</Text>}
      />

      <View style={styles.summary}>
        <Text style={styles.summaryText}>Total</Text>
        <Text style={styles.summaryAmount}>${total.toFixed(2)}</Text>
      </View>

      <TouchableOpacity style={styles.checkoutBtn} onPress={() => router.push(Routes.CustomerCheckout)}>
        <Text style={{ color: '#fff', fontWeight: '600' }}>Checkout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1},
  itemRow: { flexDirection: 'row', padding: 8, borderBottomWidth: 1, borderColor: '#eee', alignItems: 'center' },
  image: { width: 64, height: 64, borderRadius: 8, marginRight: 12, backgroundColor: '#f0f0f0' },
  title: { fontSize: 14, fontWeight: '600' },
  size: { fontSize: 12, color: '#666' },
  qtyRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  qtyBtn: { width: 28, height: 28, borderRadius: 4, backgroundColor: '#f5f5f5', alignItems: 'center', justifyContent: 'center' },
  qtyText: { marginHorizontal: 8, minWidth: 20, textAlign: 'center' },
  price: { marginLeft: 'auto', fontWeight: '600' },
  trashBtn: { padding: 8, marginLeft: 8 },
  summary: { flexDirection: 'row', justifyContent: 'space-between', padding: 12 },
  summaryText: { fontSize: 16 },
  summaryAmount: { fontSize: 18, fontWeight: '700' },
  checkoutBtn: { backgroundColor: '#000', padding: 14, margin: 12, borderRadius: 8, alignItems: 'center' },
  rightAction: { backgroundColor: '#ffdddd', justifyContent: 'center', alignItems: 'flex-end', paddingHorizontal: 20 },
  rightActionText: { color: '#900', fontWeight: '700' },
});