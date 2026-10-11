import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface RecentState {
  ids: string[];
  push: (id: string) => void;
}

export const useRecent = create<RecentState>()(
  persist(
    (set, get) => ({
      ids: [],
      push: (id) => set({ ids: [id, ...get().ids.filter((i) => i !== id)].slice(0, 10) }),
    }),
    { name: "tee-mantraa-recent", storage: createJSONStorage(() => localStorage), skipHydration: true }
  )
);
