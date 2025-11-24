import { api } from './api';
import { DeviceEventEmitter } from 'react-native';

export interface Customer {
  customerID: number;
  fullName?: string;
}

export interface Cart {
  cartID: number;
  customer: Customer;
  updatedDate?: string;
  totalAmount?: number;
}

export interface ProductVariant {
  variantID: number;
  size?: string;
  product?: any;
}

export interface CartItem {
  cartItemID: number;
  cart: Cart;
  variant: ProductVariant;
  quantity: number;
}

const CartService = {
  getCustomersByAccountId: async (accountId: number): Promise<Customer[] | null> => {
    const res = await api.get(`/customers/account/${accountId}`);
    return res.data; // controller returns List<Customer>
  },

  getCartByCustomerId: async (customerId: number): Promise<Cart | null> => {
    try {
      const res = await api.get(`/carts/customer/${customerId}`);
      return res.data;
    } catch (err: any) {
      // If 404 or not found, return null
      return null;
    }
  },

  createCart: async (customerId: number): Promise<Cart> => {
    const res = await api.post('/carts', { customer: { customerID: customerId } });
    return res.data;
  },

  getCartItemsByCartId: async (cartId: number): Promise<CartItem[]> => {
    const res = await api.get(`/cart-items/cart/${cartId}`);
    return res.data;
  },

  createCartItem: async (cartId: number, variantId: number, quantity = 1): Promise<CartItem> => {
    const body = { cart: { cartID: cartId }, variant: { variantID: variantId }, quantity };
    const res = await api.post('/cart-items', body);
    // notify listeners that cart changed
    try { DeviceEventEmitter.emit('cartUpdated'); } catch(e) {}
    return res.data;
  },

  updateCartItem: async (cartItemId: number, cartId: number, variantId: number, quantity: number): Promise<CartItem> => {
    const body = { cart: { cartID: cartId }, variant: { variantID: variantId }, quantity };
    const res = await api.put(`/cart-items/${cartItemId}`, body);
    try { DeviceEventEmitter.emit('cartUpdated'); } catch(e) {}
    return res.data;
  },

  deleteCartItem: async (cartItemId: number): Promise<void> => {
    await api.delete(`/cart-items/${cartItemId}`);
    try { DeviceEventEmitter.emit('cartUpdated'); } catch(e) {}
  },

  addToCart: async (accountId: number, variantId: number, quantity = 1): Promise<{ success: boolean; message?: string; items?: CartItem[] }> => {
    try {
      // 1. get customer id by account
      const customers: any = await CartService.getCustomersByAccountId(accountId);
      if (!customers || customers.length === 0) {
        return { success: false, message: 'Customer not found for this account' };
      }
      const customerId = customers[0].customerID;

      // 2. get or create cart
      let cart = await CartService.getCartByCustomerId(customerId);
      if (!cart) {
        cart = await CartService.createCart(customerId);
      }

      const cartId = cart.cartID;

      // 3. check cart items
      const items = await CartService.getCartItemsByCartId(cartId);
      const existing = items.find((it: any) => it.variant && it.variant.variantID === variantId);

      if (existing) {
        // update quantity
        await CartService.updateCartItem(existing.cartItemID, cartId, variantId, existing.quantity + quantity);
      } else {
        await CartService.createCartItem(cartId, variantId, quantity);
      }

      // return latest items
      const latest = await CartService.getCartItemsByCartId(cartId);
  try { DeviceEventEmitter.emit('cartUpdated'); } catch(e) {}
      return { success: true, items: latest };
    } catch (error: any) {
      console.log('Add to cart error', error);
      return { success: false, message: error.message || 'Add to cart failed' };
    }
  },
};

export { CartService };
