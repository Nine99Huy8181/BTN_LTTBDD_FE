// services/wishlist.service.ts
import { api } from './api';

export interface WishlistItem {
  wishlistItemID: number;
  wishlist: {
    wishlistID: number;
  };
  product: {
    productID: number;
    name: string;
    brand: string;
    discountPrice: number;
    averageRating: number;
    image: string;
  };
  addedDate: string;
}

export interface Wishlist {
  wishlistID: number;
  customer: {
    customerID: number;
  };
  createdDate: string;
  items?: WishlistItem[];
}

export const wishlistService = {
  // Lấy wishlist theo customerId
  getByCustomerId: async (customerId: number): Promise<Wishlist> => {
    const response = await api.get(`/wishlists/customer/${customerId}`);
    return response.data;
  },

  // Lấy tất cả items trong wishlist
  getItemsByWishlistId: async (wishlistId: number): Promise<WishlistItem[]> => {
    const response = await api.get(`/wishlist-items/wishlist/${wishlistId}`);
    return response.data;
  },

  // Thêm sản phẩm vào wishlist
  addItem: async (wishlistId: number, productId: number): Promise<WishlistItem> => {
    const response = await api.post('/wishlist-items', {
      wishlist: { wishlistID: wishlistId },
      product: { productID: productId },
      addedDate: new Date().toISOString(),
    });
    return response.data;
  },

  // Xóa item khỏi wishlist
  removeItem: async (wishlistItemId: number): Promise<void> => {
    await api.delete(`/wishlist-items/${wishlistItemId}`);
  },

  // Tạo wishlist mới cho customer
  createWishlist: async (customerId: number): Promise<Wishlist> => {
    const response = await api.post('/wishlists', {
      customer: { customerID: customerId },
      createdDate: new Date().toISOString(),
    });
    return response.data;
  },
};