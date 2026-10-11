"use client";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { RETURN_REASONS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";

const STATUS_COPY: Record<string, string> = { REQUESTED: "Under review", APPROVED: "Approved — pickup will be arranged", REJECTED: "Not approved", RECEIVED: "Items received — processing", REFUNDED: "Refund issued" };

export function ReturnRequest({ orderId, items, deliveredAt }: { orderId: string; items: { _id: string; name: string; quantity: number }[]; deliveredAt: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [existing, setExisting] = useState<any[]>([]);
  const [picked, setPicked] = useState<string[]>([]);
  const [type, setType] = useState<"RETURN" | "EXCHANGE">("RETURN");
  const [reason, setReason] = useState<string>(RETURN_REASONS[0]);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const daysLeft = 7 - Math.floor((Date.now() - new Date(deliveredAt).getTime()) / 86400000);
  const load = useCallback(() => fetch(`/api/returns?orderId=${orderId}`).then((r) => r.json()).then((d) => setExisting(d.returns || [])).catch(() => {}), [orderId]);
  useEffect(() => { load(); }, [load]);

  const active = existing.find((r) => ["REQUESTED", "APPROVED", "RECEIVED"].includes(r.status));
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const r = await fetch("/api/returns", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderId, itemIds: picked, type, reason, note: note || undefined }) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      toast.success("Request submitted. We'll email you an update.");
      setOpen(false); load(); router.refresh();
    } catch (err: any) { toast.error(err.message); } finally { setBusy(false); }
  };

  return (
    <section className="mt-12 border border-line p-6" aria-labelledby="ret-h">
      <h2 id="ret-h" className="font-display text-2xl">Returns &amp; exchanges</h2>
      {existing.map((r) => (
        <p key={r._id} className="mt-3 text-sm"><strong>{r.type === "RETURN" ? "Return" : "Exchange"}</strong> · {STATUS_COPY[r.status]} <span className="text-muted">· {formatDate(r.createdAt)}</span>{r.adminNote && <span className="block text-muted">Note: {r.adminNote}</span>}</p>
      ))}
      {!active && daysLeft > 0 && (<><p className="mt-3 text-sm text-muted">{daysLeft} day{daysLeft > 1 ? "s" : ""} left to request a return or exchange.</p><Button className="mt-4" variant="outline" onClick={() => setOpen(true)}>Request return / exchange</Button></>)}
      {!active && daysLeft <= 0 && !existing.length && <p className="mt-3 text-sm text-muted">The 7-day return window for this order has ended.</p>}

      <Modal open={open} onClose={() => setOpen(false)} title="Request return or exchange" className="max-w-lg">
        <form onSubmit={submit} className="space-y-5 p-8">
          <h3 className="font-display text-3xl">Return or exchange</h3>
          <div className="flex gap-2">{(["RETURN", "EXCHANGE"] as const).map((t) => <button type="button" key={t} aria-pressed={type === t} onClick={() => setType(t)} className={`h-11 flex-1 border text-xs uppercase tracking-[0.18em] ${type === t ? "border-ink bg-ink text-paper" : "border-line"}`}>{t === "RETURN" ? "Return" : "Exchange"}</button>)}</div>
          <fieldset><legend className="mb-2 text-[11px] uppercase tracking-[0.18em] text-muted">Items</legend>
            {items.map((i) => <label key={i._id} className="flex items-center gap-3 py-1.5 text-sm"><input type="checkbox" className="accent-black" checked={picked.includes(i._id)} onChange={() => setPicked(picked.includes(i._id) ? picked.filter((x) => x !== i._id) : [...picked, i._id])} />{i.name} × {i.quantity}</label>)}
          </fieldset>
          <label className="block"><span className="mb-1 block text-[11px] uppercase tracking-[0.18em] text-muted">Reason</span><select value={reason} onChange={(e) => setReason(e.target.value)} className="h-11 w-full border border-line px-3 text-sm">{RETURN_REASONS.map((r) => <option key={r}>{r}</option>)}</select></label>
          <label className="block"><span className="mb-1 block text-[11px] uppercase tracking-[0.18em] text-muted">Details (optional)</span><textarea value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} className="min-h-24 w-full border border-line p-3 text-sm" /></label>
          <Button type="submit" size="lg" className="w-full" loading={busy} disabled={!picked.length}>Submit request</Button>
        </form>
      </Modal>
    </section>
  );
}
