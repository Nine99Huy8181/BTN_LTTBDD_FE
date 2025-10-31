// app/(customer)/(cart)/checkout.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Routes } from '@/constants';
import { useAuth } from '@/hooks/AuthContext';
import { CartService } from '@/services/cart.service';
import { addressService } from '@/services/address.service';
import { OrderService } from '@/services/order.service';

export default function CheckoutScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [customerId, setCustomerId] = useState<number | null>(null);
  const [addressId, setAddressId] = useState<number | null>(null);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address1, setAddress1] = useState('');
  const [address2, setAddress2] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal' | 'cod'>('card');
  const [note, setNote] = useState('');
  const [isPlacing, setIsPlacing] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!user || !user.accountId) return;
      const customers: any = await CartService.getCustomersByAccountId(user.accountId as number);
      if (!customers || customers.length === 0) return;
      const customerId = customers[0].customerID;
      setCustomerId(customerId);
      // prefill customer info
      if (customers[0].fullName) setFullName(customers[0].fullName);
      if (customers[0].phoneNumber) setPhone(customers[0].phoneNumber);

      // load addresses
      try {
        const addrs: any = await addressService.getAddressesByCustomerId(customerId);
        if (addrs && addrs.length > 0) {
          const a = addrs[0];
          setAddressId(a.addressID ?? null);
          if (a.recipientName) setFullName(a.recipientName);
          if (a.recipientPhone) setPhone(a.recipientPhone);
          if (a.streetAddress) setAddress1(a.streetAddress);
          if (a.district) setDistrict(a.district);
          if (a.city) setCity(a.city);
        }
      } catch (err) {}

      let cart = await CartService.getCartByCustomerId(customerId);
      if (!cart) cart = await CartService.createCart(customerId);
      const cartItems = await CartService.getCartItemsByCartId(cart.cartID);
      setItems(cartItems);
    };
    load();
  }, [user]);

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
      // If address info is provided and not saved, create address first so it's stored
      if (!addressId && (address1 || city || district || fullName || phone)) {
        try {
          const newAddr: any = await addressService.createAddress({
            customer: { customerID: customerId },
            recipientName: fullName,
            recipientPhone: phone,
            streetAddress: address1,
            district,
            city,
          });
          if (newAddr && newAddr.addressID) setAddressId(newAddr.addressID);
        } catch (err) {
          // ignore address create error, continue placing order
        }
      }

      const payload: any = {
        items: items.map((it) => ({ variantID: (it.variant as any).variantID, quantity: it.quantity || 0 })),
        addressID: addressId || undefined,
        paymentMethod,
        notes: note,
      };

      const createdOrder: any = await OrderService.createOrder(payload);

      // clear cart items
      for (const it of items) {
        try {
          await CartService.deleteCartItem(it.cartItemID);
        } catch (err) {}
      }

      Alert.alert('Đặt hàng thành công', 'Cám ơn bạn đã đặt hàng', [
        { text: 'OK', onPress: () => router.replace(Routes.CustomerOrderSuccess) }
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
          <Text style={styles.sectionTitle}>Information</Text>
          <TextInput placeholder="Full name" value={fullName} onChangeText={setFullName} style={styles.input} />
          <TextInput placeholder="Phone number" value={phone} onChangeText={setPhone} style={styles.input} keyboardType="phone-pad" />
          {/* Email removed from checkout UI per project model — not collected here */}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shipping Address</Text>
          <TextInput placeholder="Street / House" value={address1} onChangeText={setAddress1} style={styles.input} />
          <TextInput placeholder="Apartment / Ward" value={address2} onChangeText={setAddress2} style={styles.input} />
          <View style={styles.rowInputs}>
            <TextInput placeholder="City" value={city} onChangeText={setCity} style={[styles.input, { flex: 1 }]} />
            <TextInput placeholder="District" value={district} onChangeText={setDistrict} style={[styles.input, { flex: 1, marginLeft: 8 }]} />
          </View>
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
  content: { padding: 12, paddingBottom: 24 },
  heading: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  section: { backgroundColor: '#fff', padding: 12, borderRadius: 8, marginBottom: 12, borderWidth: 1, borderColor: '#f0f0f0' },
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