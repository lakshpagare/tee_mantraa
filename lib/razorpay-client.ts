"use client";

declare global {
  interface Window {
    Razorpay?: new (opts: any) => { open: () => void; on: (e: string, cb: (r: any) => void) => void };
  }
}

export function loadRazorpay(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if (window.Razorpay) return resolve(true);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

export interface RazorpayInit {
  keyId: string;
  razorpayOrderId: string;
  amount: number;
  name: string;
  email?: string;
  phone?: string;
}

/** Opens Razorpay Checkout. Resolves with signature payload on success, null if dismissed. */
export async function openRazorpay(init: RazorpayInit, brand: string): Promise<null | {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}> {
  const loaded = await loadRazorpay();
  if (!loaded || !window.Razorpay) throw new Error("Payment gateway failed to load. Check your connection.");
  return new Promise((resolve, reject) => {
    const rzp = new window.Razorpay!({
      key: init.keyId,
      amount: init.amount,
      currency: "INR",
      name: brand,
      order_id: init.razorpayOrderId,
      prefill: { name: init.name, email: init.email, contact: init.phone },
      theme: { color: "#111111" },
      handler: (r: any) => resolve(r),
      modal: { ondismiss: () => resolve(null) },
    });
    rzp.on("payment.failed", () => reject(new Error("Payment failed. You have not been charged.")));
    rzp.open();
  });
}
