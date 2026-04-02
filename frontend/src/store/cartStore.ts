import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { CartItem, Dish } from '@/types';

interface CartState {
  items: CartItem[];
  totalAmount: number;
  deliveryFee: number;
  finalAmount: number;
  isOpen: boolean;
}

interface CartActions {
  addItem: (dish: Dish, quantity?: number) => void;
  removeItem: (dishId: string) => void;
  updateQuantity: (dishId: string, quantity: number) => void;
  clearCart: () => void;
  syncCart: (serverCart: { items: CartItem[]; totalAmount: number; deliveryFee: number; finalAmount: number }) => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  calculateTotals: () => void;
}

const DELIVERY_FEE = 250;
const MIN_ORDER_AMOUNT = 1200;

export const useCartStore = create<CartState & CartActions>()(
  persist(
    (set, get) => ({
      // State
      items: [],
      totalAmount: 0,
      deliveryFee: DELIVERY_FEE,
      finalAmount: 0,
      isOpen: false,

      // Actions
      addItem: (dish: Dish, quantity = 1) => {
        const items = get().items;
        // Используем _id или id для совместимости
        const dishId = dish._id || dish.id;
        const existingItem = items.find(item => (item.dish._id || item.dish.id) === dishId);

        let newItems: CartItem[];
        if (existingItem) {
          newItems = items.map(item =>
            (item.dish._id || item.dish.id) === dishId
              ? { ...item, quantity: Math.min(item.quantity + quantity, 10) }
              : item
          );
        } else {
          newItems = [...items, { dish, quantity: Math.min(quantity, 10) }];
        }

        set({ items: newItems });
        get().calculateTotals();
      },

      removeItem: (dishId: string) => {
        const items = get().items.filter(item => (item.dish._id || item.dish.id) !== dishId);
        set({ items });
        get().calculateTotals();
      },

      updateQuantity: (dishId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(dishId);
          return;
        }

        const items = get().items.map(item =>
          (item.dish._id || item.dish.id) === dishId
            ? { ...item, quantity: Math.min(quantity, 10) }
            : item
        );

        set({ items });
        get().calculateTotals();
      },

      clearCart: () => {
        set({
          items: [],
          totalAmount: 0,
          finalAmount: 0,
        });
      },

      syncCart: (serverCart) => {
        set({
          items: serverCart.items,
          totalAmount: serverCart.totalAmount,
          deliveryFee: serverCart.deliveryFee,
          finalAmount: serverCart.finalAmount,
        });
      },

      toggleCart: () => {
        set(state => ({ isOpen: !state.isOpen }));
      },

      openCart: () => {
        set({ isOpen: true });
      },

      closeCart: () => {
        set({ isOpen: false });
      },

      calculateTotals: () => {
        const items = get().items;
        const totalAmount = items.reduce(
          (sum, item) => sum + item.dish.price * item.quantity,
          0
        );

        const deliveryFee = totalAmount >= MIN_ORDER_AMOUNT ? DELIVERY_FEE : 0;
        const finalAmount = totalAmount + deliveryFee;

        set({
          totalAmount,
          deliveryFee,
          finalAmount,
        });
      },
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);