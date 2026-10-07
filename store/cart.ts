import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { CartItem } from "@/types";

interface CartState {
  items: CartItem[];
  couponCode: string;
  addItem: (item: Omit<CartItem, "key" | "quantity">, quantity?: number) => { added: number; capped: boolean };
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  clear: () => void;
  setItems: (items: CartItem[]) => void;
  setCoupon: (code: string) => void;
}

export const itemKey = (productId: string, size: string, color: string) => `${productId}|${size}|${color}`;

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      couponCode: "",
      addItem: (item, quantity = 1) => {
        const key = itemKey(item.productId, item.size, item.color);
        const existing = get().items.find((i) => i.key === key);
        const max = Math.max(1, Math.min(10, item.maxQty));
        const current = existing?.quantity || 0;
        const next = Math.min(max, current + quantity);
        const added = next - current;
        set({
          items: existing
            ? get().items.map((i) => (i.key === key ? { ...i, quantity: next, maxQty: item.maxQty, price: item.price } : i))
            : [...get().items, { ...item, key, quantity: next }],
        });
        return { added, capped: next < current + quantity };
      },
      setQty: (key, qty) =>
        set({
          items: get()
            .items.map((i) => (i.key === key ? { ...i, quantity: Math.max(1, Math.min(i.maxQty, 10, qty)) } : i)),
        }),
      remove: (key) => set({ items: get().items.filter((i) => i.key !== key) }),
      clear: () => set({ items: [], couponCode: "" }),
      setItems: (items) => set({ items }),
      setCoupon: (couponCode) => set({ couponCode }),
    }),
    {
      name: "verano-cart",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (s) => ({ items: s.items, couponCode: s.couponCode }),
    }
  )
);

export const cartCount = (items: CartItem[]) => items.reduce((n, i) => n + i.quantity, 0);
export const cartSubtotal = (items: CartItem[]) => items.reduce((n, i) => n + i.price * i.quantity, 0);
