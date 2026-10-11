"use client";
import { useEffect } from "react";
import { track } from "@/components/analytics";

/** Fires a single "purchase" analytics event for a freshly placed order. */
export function PurchaseTracker({ orderId, orderNumber, total, items }: { orderId: string; orderNumber: string; total: number; items: { sku: string; name: string; price: number; quantity: number }[] }) {
  useEffect(() => {
    const key = `tm-purchase-${orderId}`;
    try { if (sessionStorage.getItem(key)) return; sessionStorage.setItem(key, "1"); } catch {}
    track("purchase", { transaction_id: orderNumber, value: total, currency: "INR", items: items.map((i) => ({ item_id: i.sku, item_name: i.name, price: i.price, quantity: i.quantity })) });
  }, [orderId, orderNumber, total, items]);
  return null;
}
