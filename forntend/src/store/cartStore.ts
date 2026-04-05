import { create } from "zustand";

export interface CartItem {
  ticketCategoryId: string;
  categoryName: string;
  price: number;
  quantity: number;
}

interface Cart {
  eventId: string;
  eventTitle: string;
  items: CartItem[];
}

interface CartState {
  cart: Cart | null;
  initCart: (eventId: string, eventTitle: string) => void;
  addItem: (item: Omit<CartItem, "quantity">) => void;
  updateQuantity: (ticketCategoryId: string, quantity: number) => void;
  removeItem: (ticketCategoryId: string) => void;
  clearCart: () => void;
  totalAmount: () => number;
  totalItems: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  cart: null,

  initCart: (eventId, eventTitle) => {
    const existing = get().cart;
    if (existing?.eventId !== eventId) {
      set({ cart: { eventId, eventTitle, items: [] } });
    }
  },

  addItem: (item) => {
    set((state) => {
      if (!state.cart) return state;
      const existing = state.cart.items.find(
        (i) => i.ticketCategoryId === item.ticketCategoryId,
      );
      if (existing) {
        return {
          cart: {
            ...state.cart,
            items: state.cart.items.map((i) =>
              i.ticketCategoryId === item.ticketCategoryId
                ? { ...i, quantity: i.quantity + 1 }
                : i,
            ),
          },
        };
      }
      return {
        cart: {
          ...state.cart,
          items: [...state.cart.items, { ...item, quantity: 1 }],
        },
      };
    });
  },

  updateQuantity: (ticketCategoryId, quantity) => {
    set((state) => {
      if (!state.cart) return state;
      if (quantity <= 0) {
        return {
          cart: {
            ...state.cart,
            items: state.cart.items.filter(
              (i) => i.ticketCategoryId !== ticketCategoryId,
            ),
          },
        };
      }
      return {
        cart: {
          ...state.cart,
          items: state.cart.items.map((i) =>
            i.ticketCategoryId === ticketCategoryId ? { ...i, quantity } : i,
          ),
        },
      };
    });
  },

  removeItem: (ticketCategoryId) => {
    set((state) => ({
      cart: state.cart
        ? {
            ...state.cart,
            items: state.cart.items.filter(
              (i) => i.ticketCategoryId !== ticketCategoryId,
            ),
          }
        : null,
    }));
  },

  clearCart: () => set({ cart: null }),

  totalAmount: () => {
    const { cart } = get();
    if (!cart) return 0;
    return cart.items.reduce((s, i) => s + i.price * i.quantity, 0);
  },

  totalItems: () => {
    const { cart } = get();
    if (!cart) return 0;
    return cart.items.reduce((s, i) => s + i.quantity, 0);
  },
}));
