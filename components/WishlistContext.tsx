import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import apiInstance from '../app/Plugins/api';
import { getUserId } from './getUserId';

interface WishlistContextType {
  wishlistItems: number[];
  isInWishlist: (productId: number) => boolean;
  addToWishlist: (productId: number) => Promise<void>;
  removeFromWishlist: (productId: number) => Promise<void>;
  refreshWishlist: () => Promise<void>;
  loading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

interface WishlistProviderProps {
  children: ReactNode;
}

export const WishlistProvider: React.FC<WishlistProviderProps> = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchWishlist = async () => {
    try {
      const userId = await getUserId();
      if (!userId) return;

      const response = await apiInstance.get(`customer/wishlist/${userId}/`);
      const items = response.data?.map((item: any) => item.product.id) || [];
      setWishlistItems(items);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      setWishlistItems([]);
    }
  };

  const isInWishlist = (productId: number): boolean => {
    return wishlistItems.includes(productId);
  };

  const addToWishlist = async (productId: number) => {
    try {
      setLoading(true);
      const userId = await getUserId();
      if (!userId) throw new Error('User not authenticated');

      const formData = new FormData();
      formData.append('product_id', productId.toString());
      formData.append('user_id', userId);

      await apiInstance.post(`customer/wishlist/${userId}/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // Optimistically update the state
      setWishlistItems(prev => [...prev, productId]);
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId: number) => {
    try {
      setLoading(true);
      const userId = await getUserId();
      if (!userId) throw new Error('User not authenticated');

      const formData = new FormData();
      formData.append('product_id', productId.toString());
      formData.append('user_id', userId);

      await apiInstance.post(`customer/wishlist/${userId}/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // Optimistically update the state
      setWishlistItems(prev => prev.filter(id => id !== productId));
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      // Revert optimistic update on error
      await fetchWishlist();
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const refreshWishlist = async () => {
    await fetchWishlist();
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const value: WishlistContextType = {
    wishlistItems,
    isInWishlist,
    addToWishlist,
    removeFromWishlist,
    refreshWishlist,
    loading
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

export default WishlistContext;

