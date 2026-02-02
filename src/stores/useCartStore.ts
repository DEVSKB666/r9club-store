import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartProduct {
  id: string;
  title: string;
  artist: string;
  price: number;
  coverImage: string;
}

interface CartState {
  items: CartProduct[];

  // Actions
  addItem: (product: CartProduct) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  isInCart: (productId: string) => boolean;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product) => {
        const { items } = get();
        // Digital product - no duplicates allowed
        if (!items.find((item) => item.id === product.id)) {
          set({ items: [...items, product] });
        }
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== productId),
        }));
      },

      clearCart: () => set({ items: [] }),

      isInCart: (productId) => get().items.some((item) => item.id === productId),

      getTotalItems: () => get().items.length,

      getTotalPrice: () =>
        get().items.reduce((sum, item) => sum + item.price, 0),
    }),
    {
      name: 'r9club-cart',
    }
  )
);
