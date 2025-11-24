// contexts/WishlistContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { wishlistService } from '@/services/wishlist.service';
import { useAuth } from '@/hooks/AuthContext';

interface WishlistContextType {
  wishlistProductIds: Set<number>;
  isLoading: boolean;
  addToWishlist: (productId: number) => Promise<void>;
  removeFromWishlist: (productId: number) => Promise<void>;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [wishlistProductIds, setWishlistProductIds] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  const customerId = user?.customerId;

  const refreshWishlist = async () => {
    if (!customerId) {
      setWishlistProductIds(new Set());
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const wishlist = await wishlistService.getByCustomerId(customerId);
      if (!wishlist?.wishlistID) {
        setWishlistProductIds(new Set());
        return;
      }

      const items = await wishlistService.getItemsByWishlistId(wishlist.wishlistID);
      const ids = new Set(items.map(item => item.product.productID));
      setWishlistProductIds(ids);
    } catch (error) {
      console.log('Failed to load wishlist:', error);
      setWishlistProductIds(new Set());
    } finally {
      setIsLoading(false);
    }
  };

  // Load wishlist khi user thay đổi
  useEffect(() => {
    refreshWishlist();
  }, [customerId]);

  const addToWishlist = async (productId: number) => {
    if (!customerId) return;

    try {
      let wishlist = await wishlistService.getByCustomerId(customerId);
      if (!wishlist) {
        wishlist = await wishlistService.createWishlist(customerId);
      }
      await wishlistService.addItem(wishlist.wishlistID, productId);
      setWishlistProductIds(prev => new Set(prev).add(productId));
    } catch (error) {
      console.log('Add to wishlist failed:', error);
      throw error;
    }
  };

  const removeFromWishlist = async (productId: number) => {
    if (!customerId) return;

    try {
      const wishlist = await wishlistService.getByCustomerId(customerId);
      if (!wishlist?.wishlistID) return;

      const items = await wishlistService.getItemsByWishlistId(wishlist.wishlistID);
      const item = items.find(i => i.product.productID === productId);
      if (item) {
        await wishlistService.removeItem(item.wishlistItemID);
        setWishlistProductIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(productId);
          return newSet;
        });
      }
    } catch (error) {
      console.log('Remove from wishlist failed:', error);
      throw error;
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistProductIds,
        isLoading,
        addToWishlist,
        removeFromWishlist,
        refreshWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

// Hook để dùng ở bất kỳ đâu
export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within WishlistProvider');
  }
  return context;
};