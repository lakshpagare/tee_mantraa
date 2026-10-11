"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

const REASONS = ["Ordered by mistake", "Found a better price", "Delivery is taking too long", "Want to change size / colour", "Other"];

export function CancelOrder({ orderId, paid }: { orderId: string; paid: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState(REASONS[0]);
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    setBusy(true);
    try {
      const r = await fetch(`/api/orders/${orderId}/cancel`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reason }) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      toast.success(d.refunded ? "Order cancelled. Your refund has been initiated." : "Order cancelled.");
      setOpen(false);
      router.refresh();
    } catch (e: any) { toast.error(e.message || "Could not cancel the order"); } finally { setBusy(false); }
  };
  return (
    <>
      <button onClick={() => setOpen(true)} className="link-underline text-[11px] font-medium uppercase tracking-[0.2em] text-red-700">Cancel order</button>
      <Modal open={open} onClose={() => setOpen(false)} title="Cancel order" className="max-w-md">
        <div className="space-y-5 p-8">
          <h3 className="font-display text-3xl">Cancel this order?</h3>
          <p className="text-sm text-muted">{paid ? "Your payment will be refunded to the original method (5–7 business days). " : ""}Points or gift card balance you used will be returned. This can't be undone.</p>
          <label className="block"><span className="mb-1 block text-[11px] uppercase tracking-[0.18em] text-muted">Reason</span>
            <select value={reason} onChange={(e) => setReason(e.target.value)} className="h-11 w-full border border-line bg-paper px-3 text-sm">{REASONS.map((r) => <option key={r}>{r}</option>)}</select></label>
          <div className="flex gap-3"><Button variant="outline" className="flex-1" onClick={() => setOpen(false)}>Keep order</Button><Button variant="danger" className="flex-1" loading={busy} onClick={submit}>Cancel order</Button></div>
        </div>
      </Modal>
    </>
  );
}
