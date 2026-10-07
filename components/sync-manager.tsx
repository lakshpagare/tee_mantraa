"use client";
import { useSession } from "next-auth/react";
import { useEffect, useRef } from "react";
import { useCart } from "@/store/cart";
import { useWishlist } from "@/store/wishlist";
import type { CartItem } from "@/types";

/** Rehydrates persisted stores and syncs cart/wishlist with the server for signed-in users. */
export function SyncManager() {
  const { status, data } = useSession();
  const synced = useRef<string | null>(null);

  useEffect(() => {
    useCart.persist.rehydrate();
    useWishlist.persist.rehydrate();
  }, []);

  // Merge guest data with account data once per sign-in.
  useEffect(() => {
    if (status !== "authenticated" || !data?.user?.id || synced.current === data.user.id) return;
    synced.current = data.user.id;
    (async () => {
      try {
        const local = useWishlist.getState().ids;
        const w = await fetch("/api/wishlist", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ids: local }) });
        if (w.ok) useWishlist.getState().setIds((await w.json()).ids);

        const c = await fetch("/api/cart");
        if (c.ok) {
          const server: CartItem[] = (await c.json()).items;
          const merged = new Map<string, CartItem>(server.map((i) => [i.key, i]));
          for (const l of useCart.getState().items) {
            const ex = merged.get(l.key);
            merged.set(l.key, ex ? { ...ex, quantity: Math.min(ex.maxQty, Math.max(ex.quantity, l.quantity)) } : l);
          }
          useCart.getState().setItems([...merged.values()]);
        }
      } catch {
        /* non-fatal */
      }
    })();
  }, [status, data?.user?.id]);

  // Persist cart changes to the account (debounced).
  useEffect(() => {
    if (status !== "authenticated") return;
    let t: ReturnType<typeof setTimeout>;
    const unsub = useCart.subscribe((s) => {
      clearTimeout(t);
      t = setTimeout(() => {
        fetch("/api/cart", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items: s.items.map((i) => ({ productId: i.productId, size: i.size, color: i.color, quantity: i.quantity })) }),
        }).catch(() => {});
      }, 800);
    });
    return () => {
      clearTimeout(t);
      unsub();
    };
  }, [status]);

  return null;
}
