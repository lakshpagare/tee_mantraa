"use client";
import { Search } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { adminFetch } from "@/components/admin/api";
import { Badge, Card, PageHeader, Pagination, statusTone } from "@/components/admin/ui";
import { Modal } from "@/components/ui/modal";
import { TableSkeleton } from "@/components/ui/skeleton";
import { ORDER_STATUSES, TIMELINE_STEPS } from "@/lib/constants";
import { cn, formatDate, formatINR } from "@/lib/utils";

const field = "h-10 w-full border border-line bg-white px-3 text-sm focus:border-ink focus:outline-none";

function OrderDetail({ id, onClose, onChanged }: { id: string; onClose: () => void; onChanged: () => void }) {
  const [o, setO] = useState<any>(null);
  const [status, setStatus] = useState("");
  const [note, setNote] = useState("");
  const [tracking, setTracking] = useState("");
  const [payStatus, setPayStatus] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => adminFetch(`/api/admin/orders/${id}`).then((d) => { setO(d.order); setStatus(d.order.status); setTracking(d.order.trackingNumber || ""); setPayStatus(d.order.paymentStatus); }).catch((e) => toast.error(e.message)), [id]);
  useEffect(() => { load(); }, [load]);

  const save = async () => {
    setBusy(true);
    try {
      await adminFetch(`/api/admin/orders/${id}`, "PATCH", { status: status !== o.status ? status : undefined, note: note || undefined, trackingNumber: tracking, paymentStatus: payStatus !== o.paymentStatus ? payStatus : undefined });
      toast.success("Order updated"); setNote(""); await load(); onChanged();
    } catch (e: any) { toast.error(e.message); } finally { setBusy(false); }
  };

  if (!o) return <div className="p-10 text-sm text-muted">Loading order…</div>;
  const idx = ORDER_STATUSES.indexOf(o.status);
  const cancelled = o.status === "Cancelled" || o.status === "Returned";
  return (
    <div className="space-y-7 p-6 font-sans text-sm">
      <div className="pr-10"><h2 className="text-xl font-semibold">{o.orderNumber}</h2><p className="text-muted">{formatDate(o.createdAt, true)}</p></div>

      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">Timeline</p>
        {cancelled ? <Badge tone="red">{o.status}</Badge> : (
          <ol className="grid grid-cols-5 gap-1">{TIMELINE_STEPS.map((s) => { const done = idx >= ORDER_STATUSES.indexOf(s.status); return <li key={s.label}><div className={cn("h-1", done ? "bg-ink" : "bg-line")} /><p className={cn("mt-1.5 text-[11px]", done ? "font-medium" : "text-muted")}>{s.label}</p></li>; })}</ol>
        )}
        <ul className="mt-4 space-y-1 text-xs text-muted">{[...o.timeline].reverse().map((t: any, i: number) => <li key={i}><strong className="text-ink">{t.status}</strong> — {t.note} · {formatDate(t.at, true)}</li>)}</ul>
      </div>

      <div className="grid gap-5 border-y border-line py-5 sm:grid-cols-2">
        <div><p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted">Customer</p><p className="font-medium">{o.user?.name || o.shippingAddress?.fullName}</p><p>{o.user?.email || o.shippingAddress?.email}</p><p>{o.shippingAddress?.phone}</p></div>
        <div><p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted">Shipping address</p><address className="not-italic">{o.shippingAddress?.fullName}<br />{o.shippingAddress?.line1}{o.shippingAddress?.line2 && `, ${o.shippingAddress.line2}`}<br />{o.shippingAddress?.city}, {o.shippingAddress?.state} {o.shippingAddress?.pincode}</address><p className="mt-1 text-xs text-muted">Delivery: {o.deliveryMethod}</p></div>
        <div><p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted">Payment</p><p>{o.paymentMethod === "COD" ? "Cash on Delivery" : "Razorpay"} <Badge tone={statusTone(o.paymentStatus)}>{o.paymentStatus}</Badge></p>{o.razorpayPaymentId && <p className="mt-1 break-all font-mono text-xs text-muted">{o.razorpayPaymentId}</p>}</div>
        <div><p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted">Inventory</p><p>{o.stockState}</p></div>
      </div>

      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">Items</p>
        <ul className="divide-y divide-line border border-line">
          {o.items.map((i: any) => <li key={i._id} className="flex items-center gap-3 p-3"><img src={i.image} alt="" className="h-14 w-11 object-cover" /><div className="flex-1"><p className="font-medium">{i.name}</p><p className="text-xs text-muted">{i.sku} · {i.color} · {i.size} · Qty {i.quantity}</p></div><p>{formatINR(i.price * i.quantity)}</p></li>)}
        </ul>
        <dl className="ml-auto mt-3 max-w-xs space-y-1">
          <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd>{formatINR(o.subtotal)}</dd></div>
          {o.discount > 0 && <div className="flex justify-between"><dt className="text-muted">Discount {o.couponCode && `(${o.couponCode})`}</dt><dd>−{formatINR(o.discount)}</dd></div>}
          <div className="flex justify-between"><dt className="text-muted">Shipping</dt><dd>{formatINR(o.shipping)}</dd></div>
          <div className="flex justify-between font-semibold"><dt>Total</dt><dd>{formatINR(o.total)}</dd></div>
        </dl>
      </div>

      <div className="space-y-3 border-t border-line pt-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted">Update order</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <label><span className="mb-1 block text-xs">Status</span><select className={field} value={status} onChange={(e) => setStatus(e.target.value)}>{ORDER_STATUSES.map((s) => <option key={s}>{s}</option>)}</select></label>
          <label><span className="mb-1 block text-xs">Payment status</span><select className={field} value={payStatus} onChange={(e) => setPayStatus(e.target.value)}>{["PENDING", "PAID", "FAILED", "REFUNDED"].map((s) => <option key={s}>{s}</option>)}</select></label>
          <label><span className="mb-1 block text-xs">Tracking number</span><input className={field} value={tracking} onChange={(e) => setTracking(e.target.value)} /></label>
          <label><span className="mb-1 block text-xs">Note (optional)</span><input className={field} value={note} onChange={(e) => setNote(e.target.value)} maxLength={200} /></label>
        </div>
        <p className="text-xs text-muted">Cancelling or returning an order releases its inventory automatically.</p>
        <div className="flex justify-end gap-3"><button onClick={onClose} className="h-10 border border-line px-5">Close</button><button onClick={save} disabled={busy} className="h-10 bg-ink px-6 text-white disabled:opacity-50">{busy ? "Saving…" : "Save changes"}</button></div>
      </div>
    </div>
  );
}

export function OrdersManager() {
  const [items, setItems] = useState<any[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, pages: 1 });
  const [q, setQ] = useState(""); const [status, setStatus] = useState(""); const [payment, setPayment] = useState("");
  const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  const [open, setOpen] = useState<string | null>(null);

  const load = useCallback(async (page = 1) => {
    setLoading(true); setError("");
    try {
      const d = await adminFetch(`/api/admin/orders?page=${page}&q=${encodeURIComponent(q)}&status=${status}&payment=${payment}`);
      setItems(d.items); setMeta({ total: d.total, page: d.page, pages: d.pages });
    } catch (e: any) { setError(e.message); } finally { setLoading(false); }
  }, [q, status, payment]);
  useEffect(() => { const t = setTimeout(() => load(1), 300); return () => clearTimeout(t); }, [load]);

  return (
    <>
      <PageHeader title="Orders" description={`${meta.total} orders`} />
      <Card>
        <div className="flex flex-wrap gap-3 border-b border-line p-4">
          <div className="relative min-w-[220px] flex-1"><Search className="absolute left-3 top-3 h-4 w-4 text-muted" /><input className={cn(field, "pl-9")} placeholder="Search order #, name, email, phone…" aria-label="Search orders" value={q} onChange={(e) => setQ(e.target.value)} /></div>
          <select className={cn(field, "w-44")} aria-label="Status" value={status} onChange={(e) => setStatus(e.target.value)}><option value="">All statuses</option>{ORDER_STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
          <select className={cn(field, "w-40")} aria-label="Payment" value={payment} onChange={(e) => setPayment(e.target.value)}><option value="">All payments</option><option value="RAZORPAY">Razorpay</option><option value="COD">COD</option></select>
        </div>
        {loading ? <TableSkeleton cols={6} /> : error ? <div className="p-10 text-center text-red-600">{error}</div> : items.length === 0 ? <div className="p-12 text-center text-muted">No orders match.</div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead><tr className="border-b border-line text-xs uppercase tracking-wider text-muted">{["Order", "Customer", "Date", "Payment", "Total", "Status", ""].map((h) => <th key={h} className="px-5 py-3 font-medium">{h}</th>)}</tr></thead>
              <tbody className="divide-y divide-line">
                {items.map((o) => (
                  <tr key={o._id} className="cursor-pointer hover:bg-neutral-50" onClick={() => setOpen(o._id)}>
                    <td className="px-5 py-3 font-medium">{o.orderNumber}</td>
                    <td className="px-5 py-3">{o.user?.name || o.shippingAddress?.fullName}<p className="text-xs text-muted">{o.user?.email}</p></td>
                    <td className="px-5 py-3 text-muted">{formatDate(o.createdAt)}</td>
                    <td className="px-5 py-3"><Badge tone={statusTone(o.paymentStatus)}>{o.paymentMethod} · {o.paymentStatus}</Badge></td>
                    <td className="px-5 py-3 font-medium">{formatINR(o.total)}</td>
                    <td className="px-5 py-3"><Badge tone={statusTone(o.status)}>{o.status}</Badge></td>
                    <td className="px-5 py-3 text-right"><button className="text-xs underline" aria-label={`View order ${o.orderNumber}`}>View</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination page={meta.page} pages={meta.pages} onChange={load} />
      </Card>
      <Modal open={!!open} onClose={() => setOpen(null)} title="Order details" side className="max-w-2xl">{open && <OrderDetail id={open} onClose={() => setOpen(null)} onChanged={() => load(meta.page)} />}</Modal>
    </>
  );
}
