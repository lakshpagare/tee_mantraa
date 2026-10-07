import { create } from "zustand";
import type { ProductDTO } from "@/types";

interface UIState {
  cartOpen: boolean;
  searchOpen: boolean;
  menuOpen: boolean;
  quickView: ProductDTO | null;
  quickViewOnAdded: (() => void) | null;
  setCartOpen: (v: boolean) => void;
  setSearchOpen: (v: boolean) => void;
  setMenuOpen: (v: boolean) => void;
  openQuickView: (p: ProductDTO, onAdded?: () => void) => void;
  closeQuickView: () => void;
}

export const useUI = create<UIState>((set) => ({
  cartOpen: false,
  searchOpen: false,
  menuOpen: false,
  quickView: null,
  quickViewOnAdded: null,
  setCartOpen: (cartOpen) => set({ cartOpen, ...(cartOpen ? { searchOpen: false, menuOpen: false } : {}) }),
  setSearchOpen: (searchOpen) => set({ searchOpen, ...(searchOpen ? { cartOpen: false, menuOpen: false } : {}) }),
  setMenuOpen: (menuOpen) => set({ menuOpen }),
  openQuickView: (quickView, onAdded) => set({ quickView, quickViewOnAdded: onAdded ?? null }),
  closeQuickView: () => set({ quickView: null, quickViewOnAdded: null }),
}));
