import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface WishlistState {
  ids: string[];
  has: (id: string) => boolean;
  /** Optimistically toggles and syncs with the server for signed-in users. Returns new state. */
  toggle: (id: string) => Promise<boolean>;
  setIds: (ids: string[]) => void;
}

export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      ids: [],
      has: (id) => get().ids.includes(id),
      toggle: async (id) => {
        const had = get().ids.includes(id);
        set({ ids: had ? get().ids.filter((i) => i !== id) : [...get().ids, id] });
        try {
          // 401 for guests is expected; local state is kept and merged on login.
          const res = await fetch("/api/wishlist", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId: id }),
          });
          if (res.ok) set({ ids: (await res.json()).ids });
        } catch {
          /* offline: keep optimistic state */
        }
        return !had;
      },
      setIds: (ids) => set({ ids }),
    }),
    { name: "verano-wishlist", storage: createJSONStorage(() => localStorage), skipHydration: true }
  )
);
