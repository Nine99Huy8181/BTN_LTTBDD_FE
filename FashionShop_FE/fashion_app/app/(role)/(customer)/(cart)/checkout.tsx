// app/(customer)/(cart)/checkout.tsx
import * as Linking from 'expo-linking';
import React, { useCallback, useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAlertDialog } from '@/hooks/AlertDialogContext';

import { formatCurrencyVND, Routes } from '@/constants';
import { useAuth } from '@/hooks/AuthContext';
import { addressService } from '@/services/address.service';
import { api } from '@/services/api';
import { CartService } from '@/services/cart.service';
import { OrderService } from '@/services/order.service';
import { showToast } from '@/utils/toast';
import { useFocusEffect } from '@react-navigation/native';
import { useLocalSearchParams, useRouter } from 'expo-router';

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
  const { showAlert } = useAlertDialog();

  // Deep Link handler cho VNPay callback
  useEffect(() => {
    const handleDeepLink = (event: { url: string }) => {
      const url = event.url;
      console.log('📱 Deep link received:', url);

      const { queryParams } = Linking.parse(url);
      console.log('📱 VNPAY callback data:', queryParams);

      if (queryParams?.status === 'success') {
        // Clear cart và navigate
        router.replace(`/(role)/(customer)/(cart)/order-success`);
      } else if (queryParams?.status === 'failed') {
        showToast.error('Thanh toán thất bại', 'Vui lòng thử lại');
      }
    };

    // Listen for deep links
    const subscription = Linking.addEventListener('url', handleDeepLink);

    // Check if app was opened via deep link
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink({ url });
      }
    });

    return () => subscription.remove();
  }, [router]);

  const loadAddressAndCart = async (customerId: number, selectedAddressId?: number) => {
    try {
      const addrs: any = await addressService.getAddressesByCustomerId(customerId);
      let selectedAddr;

      if (selectedAddressId) {
        selectedAddr = addrs?.find((a: any) => a.addressID === selectedAddressId);
      }

      if (!selectedAddr) {
        selectedAddr = addrs?.find((a: any) => a.isDefault);
      }

      setDefaultAddress(selectedAddr || null);
      if (selectedAddr) {
        setRecipientName(selectedAddr.recipientName);
        setRecipientPhone(selectedAddr.recipientPhone);
      }
    } catch (err) {
      console.error('Load address error:', err);
    }

    try {
      let cart = await CartService.getCartByCustomerId(customerId);
      if (!cart) cart = await CartService.createCart(customerId);
      const cartItems = await CartService.getCartItemsByCartId(cart.cartID);
      setItems(cartItems);
    } catch (err) {
      console.error('Load cart error:', err);
    }
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

  const handleVNPayPayment = async (orderId: number, amount: number) => {
    console.log('💳 Starting VNPay payment for order:', orderId, 'amount:', amount);
    try {
      // Đảm bảo endpoint đúng - kiểm tra baseURL của api service
      const response = await api.post('/payment/create-payment', {
        amount,
        orderInfo: `Thanh toan don hang ${orderId}`
      });

      console.log('💳 VNPay response:', response.data);

      if (response.data.paymentUrl) {
        console.log('🔗 Opening VNPay URL:', response.data.paymentUrl);

        // Kiểm tra xem URL có thể mở được không
        const supported = await Linking.canOpenURL(response.data.paymentUrl);

        if (supported) {
          await Linking.openURL(response.data.paymentUrl);
        } else {
          console.error('❌ Cannot open URL:', response.data.paymentUrl);
          showToast.error('Lỗi', 'Không thể mở trang thanh toán VNPay');
        }
      } else {
        console.error('❌ No payment URL received');
        showToast.error('Lỗi', 'Không tạo được link thanh toán VNPay');
      }
    } catch (err: any) {
      console.error('❌ VNPay payment error:', err);
      console.error('Error details:', err.response?.data);
      showToast.error('Lỗi', err.response?.data?.message || 'Lỗi khi tạo thanh toán VNPay');
    }
  };

  const placeOrder = async () => {
    if (!customerId) {
      showToast.error('Lỗi', 'Không tìm thấy thông tin khách hàng.');
      return;
    }
    if (!items || items.length === 0) {
      showToast.error('Giỏ hàng rỗng', 'Vui lòng thêm sản phẩm trước khi đặt hàng.');
      return;
    }
    if (!defaultAddress) {
      showToast.error('Lỗi', 'Vui lòng thêm địa chỉ giao hàng');
      return;
    }
    if (!recipientName.trim()) {
      showToast.error('Lỗi', 'Vui lòng nhập tên người nhận');
      return;
    }
    if (!recipientPhone.trim()) {
      showToast.error('Lỗi', 'Vui lòng nhập số điện thoại người nhận');
      return;
    }

    setIsPlacing(true);
    try {
      const payload: any = {
        items: items.map((it) => ({
          variantID: (it.variant as any).variantID,
          quantity: it.quantity || 0
        })),
        addressID: defaultAddress.addressID,
        paymentMethod: paymentMethod === 'cod' ? 'COD' : 'VNPAY',
        notes: note
      };

      console.log('📦 Creating order with payload:', payload);
      const createdOrder: any = await OrderService.createOrder(payload);
      console.log('✅ Order created:', createdOrder);

      if (paymentMethod === 'card') {
        // Thanh toán VNPay
        await handleVNPayPayment(createdOrder.orderID, total);

        // Xóa cart items sau khi mở VNPay (không chờ callback)
        for (const it of items) {
          try {
            await CartService.deleteCartItem(it.cartItemID);
          } catch (err) {
            console.error('Delete cart item error:', err);
          }
        }
      } else {
        // Thanh toán COD
        for (const it of items) {
          try {
            await CartService.deleteCartItem(it.cartItemID);
          } catch (err) {
            console.error('Delete cart item error:', err);
          }
        }

        showAlert('Đặt hàng thành công', 'Cảm ơn bạn đã đặt hàng', [
          { text: 'OK', onPress: () => router.replace('/(role)/(customer)/(cart)/order-success') }
        ]);
      }
    } catch (err: any) {
      console.error('❌ Place order error', err);
      console.error('Error response:', err.response?.data);
      showToast.error('Lỗi', err.response?.data?.message || err?.message || 'Đặt hàng thất bại');
    } finally {
      setIsPlacing(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.content}>
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
                <Text style={styles.prodPrice}>{formatCurrencyVND((it.variant as any)?.product?.discountPrice ?? (it.variant as any)?.product?.basePrice ?? 0)}</Text>
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
        </View>

        <View style={styles.section}>
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
          <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
          <TouchableOpacity
            style={[styles.paymentRow, paymentMethod === 'cod' && styles.paymentActive]}
            onPress={() => setPaymentMethod('cod')}
          >
            <Text>📦  COD</Text>
            <Text style={styles.paymentNote}>Thanh toán khi nhận hàng</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.paymentRow, paymentMethod === 'card' && styles.paymentActive]}
            onPress={() => setPaymentMethod('card')}
          >
            <Text>💳  VNPay</Text>
            <Text style={styles.paymentNote}>Thanh toán qua VNPay</Text>
          </TouchableOpacity>

        </View>

        <View style={styles.sectionRow}>
          <View style={{ flex: 1 }}>
            <View style={styles.summaryLine}><Text>Tạm tính</Text><Text>{formatCurrencyVND(total)}</Text></View>
            <View style={styles.summaryLine}><Text>Phí vận chuyển</Text><Text>{formatCurrencyVND(0)}</Text></View>
            <View style={styles.summaryLine}><Text>Giảm giá</Text><Text>{formatCurrencyVND(0)}</Text></View>
            <View style={styles.summaryLine}><Text style={{ fontWeight: '700' }}>Tổng tiền</Text><Text style={{ fontWeight: '700' }}>{formatCurrencyVND(total)}</Text></View>
          </View>
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>

      <View style={styles.footer}>
        <Text style={{ fontWeight: '700', marginBottom: 6 }}>Ghi chú</Text>
        <TextInput placeholder="Nhập ghi chú..." value={note} onChangeText={setNote} style={styles.noteInput} />
        <TouchableOpacity
          style={[styles.placeBtn, isPlacing && { opacity: 0.5 }]}
          onPress={placeOrder}
          disabled={isPlacing}
        >
          <Text style={{ color: '#fff', fontWeight: '700' }}>
            {isPlacing ? 'Đang xử lý...' : 'Đặt hàng'}
          </Text>
        </TouchableOpacity>
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
  cartRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, borderTopColor: '#c3c3c3' },
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
  noteInput: { borderWidth: 1, borderColor: '#eee', borderRadius: 8, padding: 8, height: 80, marginBottom: 8 },
  placeBtn: { backgroundColor: '#000', padding: 14, borderRadius: 8, alignItems: 'center' },
});