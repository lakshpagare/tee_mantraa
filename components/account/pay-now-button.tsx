"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useSite } from "@/hooks/use-site";
import { openRazorpay } from "@/lib/razorpay-client";

export function PayNowButton({ orderId, name, email, phone }: { orderId: string; name?: string; email?: string; phone?: string }) {
  const router = useRouter();
  const site = useSite();
  const [busy, setBusy] = useState(false);
  const pay = async () => {
    setBusy(true);
    try {
      const r = await fetch("/api/payments/create", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderId }) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      const paid = await openRazorpay({ keyId: d.razorpay.keyId, razorpayOrderId: d.razorpay.razorpayOrderId, amount: d.razorpay.amount, name: name || "", email, phone }, site.brandName);
      if (!paid) return toast.error("Payment was not completed");
      const v = await fetch("/api/payments/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderId, ...paid }) });
      const vd = await v.json();
      if (!v.ok) throw new Error(vd.error);
      toast.success("Payment received");
      router.refresh();
    } catch (e: any) {
      toast.error(e.message || "Payment failed");
    } finally {
      setBusy(false);
    }
  };
  return <Button onClick={pay} loading={busy}>Complete payment</Button>;
}
