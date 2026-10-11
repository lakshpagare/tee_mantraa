import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export const MAX_COMPARE = 3;

interface CompareState {
  ids: string[];
  has: (id: string) => boolean;
  /** Returns "added" | "removed" | "full". */
  toggle: (id: string) => "added" | "removed" | "full";
  clear: () => void;
}

export const useCompare = create<CompareState>()(
  persist(
    (set, get) => ({
      ids: [],
      has: (id) => get().ids.includes(id),
      toggle: (id) => {
        const ids = get().ids;
        if (ids.includes(id)) { set({ ids: ids.filter((i) => i !== id) }); return "removed"; }
        if (ids.length >= MAX_COMPARE) return "full";
        set({ ids: [...ids, id] });
        return "added";
      },
      clear: () => set({ ids: [] }),
    }),
    { name: "tee-mantraa-compare", storage: createJSONStorage(() => localStorage), skipHydration: true }
  )
);
