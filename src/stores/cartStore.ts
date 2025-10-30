// src/stores/cartStore.ts
import { create } from 'zustand';

export interface CartItem {
  varietyId: string;
  productName: string;
  quantity: number;  // Cantidad de unidades O cantidad de paquetes
  unitPrice: number;
  subtotal: number;
  isSpecialPrice?: boolean;
  specialPriceReason?: string;
  packageLabel?: string;
  packageQuantity?: number;  // ← NUEVO: Cantidad de unidades por paquete (ej: 3kg)
  packageCount?: number;     // ← NUEVO: Cantidad de paquetes (ej: 2 paquetes)
}

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'subtotal'>) => void;
  updateQuantity: (itemId: string, quantity: number) => void;  // Cambiar a itemId único
  removeItem: (itemId: string) => void;  // Cambiar a itemId único
  clearCart: () => void;
  getTotal: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],

  addItem: (item) => {
    const subtotal = item.quantity * item.unitPrice;
    set((state) => ({
      items: [...state.items, { ...item, subtotal }],
    }));
  },

  updateQuantity: (itemId, quantity) => {
    if (quantity <= 0) {
      set((state) => ({
        items: state.items.filter((item, index) => {
          const id = item.packageLabel 
            ? `${item.varietyId}-${item.packageLabel}-${index}`
            : `${item.varietyId}-${index}`;
          return id !== itemId;
        }),
      }));
    } else {
      set((state) => ({
        items: state.items.map((item, index) => {
          const id = item.packageLabel 
            ? `${item.varietyId}-${item.packageLabel}-${index}`
            : `${item.varietyId}-${index}`;
          
          if (id === itemId) {
            // Si es paquete, recalcular basado en packageCount
            if (item.packageLabel && item.packageQuantity) {
              const newTotalQuantity = item.packageQuantity * quantity;
              return { 
                ...item, 
                packageCount: quantity,
                quantity: newTotalQuantity,
                subtotal: newTotalQuantity * item.unitPrice 
              };
            }
            // Si es custom, actualizar cantidad directamente
            return { 
              ...item, 
              quantity, 
              subtotal: quantity * item.unitPrice 
            };
          }
          return item;
        }),
      }));
    }
  },

  removeItem: (itemId) => {
    set((state) => ({
      items: state.items.filter((item, index) => {
        const id = item.packageLabel 
          ? `${item.varietyId}-${item.packageLabel}-${index}`
          : `${item.varietyId}-${index}`;
        return id !== itemId;
      }),
    }));
  },

  clearCart: () => {
    set({ items: [] });
  },

  getTotal: () => {
    return get().items.reduce((sum, item) => sum + item.subtotal, 0);
  },
}));
