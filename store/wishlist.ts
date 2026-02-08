'use client';

import { create } from 'zustand';
import { api, WishlistItem } from '@/lib/api';

interface WishlistState {
  items: WishlistItem[];
  loading: boolean;
  fetchWishlist: (token: string) => Promise<void>;
  addToWishlist: (token: string, productId: string) => Promise<void>;
  removeFromWishlist: (token: string, productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>()((set, get) => ({
  items: [],
  loading: false,

  fetchWishlist: async (token: string) => {
    set({ loading: true });
    try {
      const data = await api.wishlist.get(token);
      set({ items: data.items });
    } catch {
      // silent fail
    } finally {
      set({ loading: false });
    }
  },

  addToWishlist: async (token: string, productId: string) => {
    try {
      const data = await api.wishlist.add(token, productId);
      set({ items: data.items });
    } catch {
      throw new Error('Failed to add to wishlist');
    }
  },

  removeFromWishlist: async (token: string, productId: string) => {
    try {
      const data = await api.wishlist.remove(token, productId);
      set({ items: data.items });
    } catch {
      throw new Error('Failed to remove from wishlist');
    }
  },

  isInWishlist: (productId: string) => {
    return get().items.some((item) => {
      const id = typeof item.productId === 'string' ? item.productId : item.productId._id;
      return id === productId;
    });
  },

  clearWishlist: () => set({ items: [] }),
}));
