// app/(customer)/(cart)/checkout.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Routes } from '@/constants';
import { useAuth } from '@/hooks/AuthContext';
import { CartService } from '@/services/cart.service';
import { addressService } from '@/services/address.service';
import { OrderService } from '@/services/order.service';

export default function CheckoutScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { selectedAddressId } = useLocalSearchParams();
  const [items, setItems] = useState<any[]>([]);
  const [customerId, setCustomerId] = useState<number | null>(null);
  const [defaultAddress, setDefaultAddress] = useState<any>(null);
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal' | 'cod'>('card');
  const [note, setNote] = useState('');
  const [isPlacing, setIsPlacing] = useState(false);

  const loadAddressAndCart = async (customerId: number, selectedAddressId?: number) => {
    // load addresses
    try {
      const addrs: any = await addressService.getAddressesByCustomerId(customerId);
      let selectedAddr;
      
      if (selectedAddressId) {
        // Nếu có selectedAddressId, tìm địa chỉ được chọn
        selectedAddr = addrs?.find((a: any) => a.addressID === selectedAddressId);
      }
      
      if (!selectedAddr) {
        // Nếu không có địa chỉ được chọn, dùng địa chỉ mặc định
        selectedAddr = addrs?.find((a: any) => a.isDefault);
      }

      setDefaultAddress(selectedAddr || null);
      if (selectedAddr) {
        setRecipientName(selectedAddr.recipientName);
        setRecipientPhone(selectedAddr.recipientPhone);
      }
    } catch (err) { }

    let cart = await CartService.getCartByCustomerId(customerId);
    if (!cart) cart = await CartService.createCart(customerId);
    const cartItems = await CartService.getCartItemsByCartId(cart.cartID);
    setItems(cartItems);
  };

  const loadData = async () => {
    if (!user || !user.accountId) return;
    const customers: any = await CartService.getCustomersByAccountId(user.accountId as number);
    if (!customers || customers.length === 0) return;
    const customerId = customers[0].customerID;
    setCustomerId(customerId);
    await loadAddressAndCart(customerId);
  };

  useEffect(() => {
    loadData();
  }, [user]);

  // Reload data when screen is focused or selectedAddressId changes
  useFocusEffect(
    useCallback(() => {
      if (customerId) {
        loadAddressAndCart(customerId, selectedAddressId ? Number(selectedAddressId) : undefined);
      }
    }, [customerId, selectedAddressId])
  );

  const total = items.reduce((s, it) => {
    const price = (it.variant && (it.variant as any).product && ((it.variant as any).product.discountPrice ?? (it.variant as any).product.basePrice)) || 0;
    return s + (price * (it.quantity || 0));
  }, 0);

  const placeOrder = async () => {
    if (!customerId) {
      Alert.alert('Lỗi', 'Không tìm thấy thông tin khách hàng.');
      return;
    }
    if (!items || items.length === 0) {
      Alert.alert('Giỏ hàng rỗng', 'Vui lòng thêm sản phẩm trước khi đặt hàng.');
      return;
    }

    setIsPlacing(true);
    try {
      // Check if address exists
      if (!defaultAddress) {
        Alert.alert('Lỗi', 'Vui lòng thêm địa chỉ giao hàng');
        return;
      }

      // Validate recipient information
      if (!recipientName.trim()) {
        Alert.alert('Lỗi', 'Vui lòng nhập tên người nhận');
        return;
      }
      if (!recipientPhone.trim()) {
        Alert.alert('Lỗi', 'Vui lòng nhập số điện thoại người nhận');
        return;
      }

      const payload: any = {
        items: items.map((it) => ({ variantID: (it.variant as any).variantID, quantity: it.quantity || 0 })),
        addressID: defaultAddress.addressID,
        recipientName: recipientName.trim(),
        recipientPhone: recipientPhone.trim(),
        paymentMethod,
        notes: note,
      };

      const createdOrder: any = await OrderService.createOrder(payload);

      // clear cart items
      for (const it of items) {
        try {
          await CartService.deleteCartItem(it.cartItemID);
        } catch (err) { }
      }

      Alert.alert('Đặt hàng thành công', 'Cám ơn bạn đã đặt hàng', [
        { text: 'OK', onPress: () => router.replace('/(role)/(customer)/(cart)/order-success') }
      ]);
    } catch (err: any) {
      console.error('Place order error', err);
      Alert.alert('Lỗi', err?.message || 'Đặt hàng thất bại');
    } finally {
      setIsPlacing(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>Checkout</Text>

        <View style={styles.section}>
          {items.map((it) => {
            const uri = (it.variant as any)?.product?.image;
            return (
              <View key={it.cartItemID} style={styles.cartRow}>
                {uri ? (
                  <Image source={{ uri }} style={styles.thumb} />
                ) : (
                  <View style={styles.thumb} />
                )}
                <View style={{ flex: 1 }}>
                  <Text style={styles.prodTitle}>{(it.variant as any)?.product?.name}</Text>
                  <Text style={styles.prodSize}>size:{(it.variant as any)?.size}</Text>
                </View>
                <Text style={styles.prodPrice}>${((it.variant as any)?.product?.discountPrice ?? (it.variant as any)?.product?.basePrice ?? 0).toFixed(2)}</Text>
              </View>
            );
          })}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin người nhận</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Họ tên:</Text>
            <TextInput
              style={[styles.infoValue, styles.editableInput]}
              value={recipientName}
              onChangeText={setRecipientName}
              placeholder="Nhập tên người nhận"
            />
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Số điện thoại:</Text>
            <TextInput
              style={[styles.infoValue, styles.editableInput]}
              value={recipientPhone}
              onChangeText={setRecipientPhone}
              placeholder="Nhập số điện thoại người nhận"
              keyboardType="phone-pad"
            />
          </View>
        </View>        <View style={styles.section}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }} >
            <Text style={styles.sectionTitle}>Địa chỉ giao hàng</Text>
            {!defaultAddress ? (
              <TouchableOpacity
                onPress={() => router.push({ 
                  pathname: Routes.CustomerAddressBook as any,
                  params: { fromCheckout: '1' }
                })}
              >
                <Text style={{ color: 'blue' }}>Thêm địa chỉ</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => router.push({ 
                  pathname: Routes.CustomerAddressBook as any,
                  params: { fromCheckout: '1' }
                })}
              >
                <Text style={{ color: 'blue' }}>Thay đổi địa chỉ</Text>
              </TouchableOpacity>
            )}
          </View>

          {!defaultAddress ? (
            <View style={styles.emptyAddress}>
              <Text style={{ color: '#666', marginBottom: 10 }}>Bạn chưa có địa chỉ nào</Text>
              <TouchableOpacity
                style={[styles.primaryButton, { paddingHorizontal: 20 }]}
                onPress={() => router.push({ 
                  pathname: Routes.CustomerAddressBook as any,
                  params: { fromCheckout: '1' }
                })}
              >
                <Text style={styles.primaryButtonText}>Thêm địa chỉ mới</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.addressCard}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={styles.recipientName}>{defaultAddress.recipientName}</Text>
                <Text style={styles.defaultTag}>Mặc định</Text>
              </View>
              <Text style={styles.addressText}>{defaultAddress.recipientPhone}</Text>
              <Text style={styles.addressText}>
                {defaultAddress.streetAddress}, {defaultAddress.district}, {defaultAddress.city}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment method</Text>
          <TouchableOpacity style={[styles.paymentRow, paymentMethod === 'card' && styles.paymentActive]} onPress={() => setPaymentMethod('card')}>
            <Text>💳  Credit card</Text>
            <Text style={styles.paymentNote}>Credit card</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.paymentRow, paymentMethod === 'paypal' && styles.paymentActive]} onPress={() => setPaymentMethod('paypal')}>
            <Text>🅿️  Paypal</Text>
            <Text style={styles.paymentNote}>Paypal</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.paymentRow, paymentMethod === 'cod' && styles.paymentActive]} onPress={() => setPaymentMethod('cod')}>
            <Text>📦  Cash on Delivery</Text>
            <Text style={styles.paymentNote}>Pay on delivery</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.sectionTitle}>Order summary</Text>
            <View style={styles.summaryLine}><Text>Total</Text><Text>${total.toFixed(2)}</Text></View>
            <View style={styles.summaryLine}><Text>Shipping Fee</Text><Text>$0.00</Text></View>
            <View style={styles.summaryLine}><Text>Discount</Text><Text>$0.00</Text></View>
            <View style={styles.summaryLine}><Text style={{ fontWeight: '700' }}>Sub Total</Text><Text style={{ fontWeight: '700' }}>${total.toFixed(2)}</Text></View>
          </View>
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>

      <View style={styles.footer}>
        <Text style={{ fontWeight: '700', marginBottom: 6 }}>Notes</Text>
        <TextInput placeholder="Take note" value={note} onChangeText={setNote} style={styles.noteInput} />
        <TouchableOpacity style={styles.placeBtn} onPress={placeOrder}><Text style={{ color: '#fff', fontWeight: '700' }}>Place Order</Text></TouchableOpacity>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  editableInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 8,
    flex: 1,
    marginLeft: 8,
  },
  content: { padding: 12, paddingBottom: 24 },
  heading: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  section: { backgroundColor: '#fff', padding: 12, borderRadius: 8, marginBottom: 12, borderWidth: 1, borderColor: '#f0f0f0' },
  emptyAddress: { alignItems: 'center', padding: 20 },
  addressCard: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8
  },
  selectedAddress: {
    borderColor: '#000',
    backgroundColor: '#fafafa'
  },
  recipientName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4
  },
  defaultTag: {
    backgroundColor: '#000',
    color: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 12
  },
  addressText: {
    color: '#666',
    marginBottom: 2
  },
  primaryButton: {
    backgroundColor: '#000',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center'
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '600'
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start'
  },
  infoLabel: {
    width: 100,
    color: '#666',
    fontSize: 14
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
    color: '#000',
    fontWeight: '500'
  },
  sectionTitle: { fontWeight: '700', marginBottom: 8 },
  cartRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  thumb: { width: 56, height: 56, borderRadius: 8, marginRight: 12, backgroundColor: '#f0f0f0' },
  prodTitle: { fontWeight: '600' },
  prodSize: { color: '#666', fontSize: 12 },
  prodPrice: { marginLeft: 'auto', fontWeight: '700' },
  input: { borderWidth: 1, borderColor: '#eee', padding: 10, borderRadius: 6, marginTop: 8 },
  rowInputs: { flexDirection: 'row', marginTop: 8 },
  paymentRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, borderWidth: 1, borderColor: '#eee', borderRadius: 8, marginTop: 8 },
  paymentActive: { borderColor: '#000' },
  paymentNote: { color: '#666' },
  sectionRow: { flexDirection: 'row', marginTop: 8 },
  summaryLine: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  footer: { padding: 12, borderTopWidth: 1, borderColor: '#eee', backgroundColor: '#fff' },
  noteInput: { borderWidth: 1, borderColor: '#eee', borderRadius: 8, padding: 8, height: 60, marginBottom: 8 },
  placeBtn: { backgroundColor: '#000', padding: 14, borderRadius: 8, alignItems: 'center' },
});
