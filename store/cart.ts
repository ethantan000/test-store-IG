'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product, ProductVariant } from '@/lib/api';
import { generateCartKey } from '@/lib/utils';

export interface CartItem {
  productId: string;
  title: string;
  price: number;
  image: string;
  variant: ProductVariant;
  quantity: number;
  slug: string;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  addItem: (product: Product, variant: ProductVariant, quantity?: number) => void;
  removeItem: (key: string) => void;
  updateQuantity: (key: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  getItemCount: () => number;
  getSubtotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (product, variant, quantity = 1) => {
        const key = generateCartKey(product._id, variant.sku);
        const items = get().items;
        const existing = items.find(
          (item) => generateCartKey(item.productId, item.variant.sku) === key
        );

        if (existing) {
          set({
            items: items.map((item) =>
              generateCartKey(item.productId, item.variant.sku) === key
                ? { ...item, quantity: item.quantity + quantity }
                : item
            ),
          });
        } else {
          set({
            items: [
              ...items,
              {
                productId: product._id,
                title: product.title,
                price: product.price + (variant.priceModifier || 0),
                image: product.images[0] || '',
                variant,
                quantity,
                slug: product.slug,
              },
            ],
          });
        }
      },

      removeItem: (key) => {
        set({
          items: get().items.filter(
            (item) => generateCartKey(item.productId, item.variant.sku) !== key
          ),
        });
      },

      updateQuantity: (key, quantity) => {
        if (quantity <= 0) {
          get().removeItem(key);
          return;
        }
        set({
          items: get().items.map((item) =>
            generateCartKey(item.productId, item.variant.sku) === key
              ? { ...item, quantity }
              : item
          ),
        });
      },

      clearCart: () => set({ items: [] }),
      toggleCart: () => set({ isOpen: !get().isOpen }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      getItemCount: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
      getSubtotal: () =>
        get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    }),
    {
      name: 'viralgoods-cart',
      partialize: (state) => ({ items: state.items }),
    }
  )
);
