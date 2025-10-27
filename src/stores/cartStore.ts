// src/stores/cartStore.ts
import { create } from 'zustand';
import type { CartItem } from '@/types';

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'subtotal'>) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],

  addItem: (item) => {
    const items = get().items;
    const existingItem = items.find(i => i.productId === item.productId);

    if (existingItem) {
      // Si ya existe, incrementar cantidad
      set({
        items: items.map(i =>
          i.productId === item.productId
            ? {
                ...i,
                quantity: i.quantity + item.quantity,
                subtotal: (i.quantity + item.quantity) * i.unitPrice,
              }
            : i
        ),
      });
    } else {
      // Agregar nuevo item
      set({
        items: [
          ...items,
          {
            ...item,
            subtotal: item.quantity * item.unitPrice,
          },
        ],
      });
    }
  },

  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(productId);
      return;
    }

    set({
      items: get().items.map(item =>
        item.productId === productId
          ? {
              ...item,
              quantity,
              subtotal: quantity * item.unitPrice,
            }
          : item
      ),
    });
  },

  removeItem: (productId) => {
    set({
      items: get().items.filter(item => item.productId !== productId),
    });
  },

  clearCart: () => {
    set({ items: [] });
  },

  getTotal: () => {
    return get().items.reduce((sum, item) => sum + item.subtotal, 0);
  },

  getItemCount: () => {
    return get().items.reduce((sum, item) => sum + item.quantity, 0);
  },
}));
