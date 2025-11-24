// app/(customer)/(cart)/index.tsx
import { formatCurrencyVND, Routes } from '@/constants';
import { useAuth } from '@/hooks/AuthContext';
import { CartItem, CartService } from '@/services/cart.service';
import { showToast } from '@/utils/toast';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  Animated,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CartScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
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
      setItems(cartItems || []);
    } catch (err) {
      console.log('Load cart error:', err);
    } finally {
      setLoading(false);
    }
  };

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
        await CartService.deleteCartItem(item.cartItemID);
      } else {
        await CartService.updateCartItem(
          item.cartItemID,
          item.cart.cartID,
          item.variant.variantID,
          newQty
        );
      }
      await loadCart();
    } catch (err: any) {
      showToast.error('Lỗi', err.message || 'Không thể cập nhật số lượng');
    }
  };

  const deleteItem = async (item: CartItem) => {
    try {
      await CartService.deleteCartItem(item.cartItemID);
      await loadCart();
      showToast.success('Đã xóa', 'Sản phẩm đã được xóa khỏi giỏ hàng');
    } catch (err: any) {
      showToast.error('Lỗi', err.message || 'Không thể xóa sản phẩm');
    }
  };

  const total = items.reduce((sum, it) => {
    const product = (it.variant as any)?.product;
    const price = product?.discountPrice ?? product?.basePrice ?? 0;
    return sum + price * (it.quantity || 0);
  }, 0);

  const isCartEmpty = items.length === 0;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.titleCart}>Giỏ hàng của bạn</Text>

        <FlatList
          data={items}
          keyExtractor={(i) => String(i.cartItemID)}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Giỏ hàng trống</Text>
              <Text style={styles.emptySubText}>
                Hãy thêm sản phẩm bạn thích nhé!</Text>
            </View>
          )}
          renderItem={({ item }) => {
            const rightAction = (progress: Animated.AnimatedInterpolation<number>, dragX: Animated.AnimatedInterpolation<number>) => {
              const trans = dragX.interpolate({
                inputRange: [-100, 0],
                outputRange: [0, 100],
                extrapolate: 'clamp',
              });
              return (
                <TouchableOpacity onPress={() => deleteItem(item)} style={styles.rightAction}>
                  <Animated.Text
                    style={[
                      styles.rightActionText,
                      { transform: [{ translateX: trans }] },
                    ]}
                  >
                    Xóa
                  </Animated.Text>
                </TouchableOpacity>
              );
            };

            const product = (item.variant as any)?.product;

            return (
              <Swipeable renderRightActions={rightAction} overshootRight={false}>
                <View style={styles.itemRow}>
                  <Image
                    source={{ uri: product?.image || 'https://res.cloudinary.com/dkokkltme/image/upload/v1763744948/messi_cvs6lc.avif' }}
                    style={styles.image}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.title} numberOfLines={2}>
                      {product?.name}
                    </Text>
                    <Text style={styles.size}>Size: {(item.variant as any)?.size}</Text>

                    <View style={styles.qtyRow}>
                      <TouchableOpacity
                        onPress={() => changeQuantity(item, -1)}
                        style={styles.qtyBtn}
                      >
                        <Text style={styles.qtyBtnText}>-</Text>
                      </TouchableOpacity>

                      <Text style={styles.qtyText}>{item.quantity}</Text>

                      <TouchableOpacity
                        onPress={() => changeQuantity(item, 1)}
                        style={styles.qtyBtn}
                      >
                        <Text style={styles.qtyBtnText}>+</Text>
                      </TouchableOpacity>

                      <Text style={styles.price}>
                        {formatCurrencyVND(
                          product?.discountPrice ?? product?.basePrice ?? 0
                        )}
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity onPress={() => deleteItem(item)} style={styles.trashBtn}>
                    <Text style={{ fontSize: 20 }}>Trash</Text>
                  </TouchableOpacity>
                </View>
              </Swipeable>
            );
          }}
        />

        {/* Tổng tiền - chỉ hiện khi có sản phẩm */}
        {!isCartEmpty && (
          <View style={styles.summary}>
            <Text style={styles.summaryText}>Tổng cộng</Text>
            <Text style={styles.summaryAmount}>{formatCurrencyVND(total)}</Text>
          </View>
        )}

        {/* Nút hành động chính */}
        <TouchableOpacity
          style={[
            styles.actionButton,
            isCartEmpty ? styles.actionButtonEmpty : styles.actionButtonCheckout,
          ]}
          onPress={() => {
            if (isCartEmpty) {
              router.push('/(role)/(customer)/(home)');
            } else {
              router.push(Routes.CustomerCheckout);
            }
          }}
        >
          <Text style={styles.actionButtonText}>
            {isCartEmpty ? 'Mua sắm ngay' : 'Thanh toán'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1 },
  titleCart: {
    fontWeight: 'bold',
    fontSize: 22,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },

  // Empty state
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#888',
  },

  // Item
  itemRow: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderColor: '#eee',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  image: {
    width: 72,
    height: 72,
    borderRadius: 12,
    marginRight: 12,
    backgroundColor: '#f0f0f0',
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  size: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  qtyBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  qtyText: {
    marginHorizontal: 16,
    minWidth: 30,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  price: {
    marginLeft: 'auto',
    fontWeight: '700',
    color: '#e74c3c',
    fontSize: 15,
  },
  trashBtn: {
    padding: 8,
    marginLeft: 8,
  },

  // Swipe delete
  rightAction: {
    backgroundColor: '#e74c3c',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: 24,
    borderRadius: 8,
    marginVertical: 4,
    marginRight: 12,
  },
  rightActionText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },

  // Summary
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#f9f9f9',
  },
  summaryText: {
    fontSize: 18,
    fontWeight: '600',
  },
  summaryAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#e74c3c',
  },

  // Action button
  actionButton: {
    marginHorizontal: 16,
    marginVertical: 12,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionButtonCheckout: {
    backgroundColor: '#000',
  },
  actionButtonEmpty: {
    backgroundColor: '#000000ff',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
});