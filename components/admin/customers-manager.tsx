"use client";
import { Search } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { adminFetch } from "@/components/admin/api";
import { Badge, Card, PageHeader, Pagination, statusTone } from "@/components/admin/ui";
import { Modal } from "@/components/ui/modal";
import { TableSkeleton } from "@/components/ui/skeleton";
import { cn, formatDate, formatINR } from "@/lib/utils";

function CustomerDetail({ id, onChanged }: { id: string; onChanged: () => void }) {
  const [d, setD] = useState<any>(null);
  const load = useCallback(() => adminFetch(`/api/admin/customers/${id}`).then(setD).catch((e) => toast.error(e.message)), [id]);
  useEffect(() => { load(); }, [load]);
  if (!d) return <div className="p-10 text-sm text-muted">Loading…</div>;
  const toggle = async () => {
    try { await adminFetch(`/api/admin/customers/${id}`, "PATCH", { status: d.user.status === "active" ? "blocked" : "active" }); toast.success("Account updated"); load(); onChanged(); }
    catch (e: any) { toast.error(e.message); }
  };
  return (
    <div className="space-y-6 p-6 font-sans text-sm">
      <div className="pr-10"><h2 className="text-xl font-semibold">{d.user.name}</h2><p className="text-muted">{d.user.email} · {d.user.phone || "No phone"}</p><p className="mt-1 text-xs text-muted">Joined {formatDate(d.user.createdAt)} · {d.user.provider}</p></div>
      <div className="flex items-center justify-between border border-line p-4"><span>Account status: <Badge tone={d.user.status === "active" ? "green" : "red"}>{d.user.status}</Badge></span><button onClick={toggle} className="border border-line px-4 py-2 hover:bg-neutral-50">{d.user.status === "active" ? "Block customer" : "Unblock customer"}</button></div>
      <div><p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">Recent orders</p>
        {d.orders.length === 0 ? <p className="text-muted">No orders yet.</p> : <ul className="divide-y divide-line border border-line">{d.orders.map((o: any) => <li key={o._id} className="flex items-center justify-between p-3"><span className="font-medium">{o.orderNumber}</span><span className="text-muted">{formatDate(o.createdAt)}</span><Badge tone={statusTone(o.status)}>{o.status}</Badge><span>{formatINR(o.total)}</span></li>)}</ul>}
      </div>
      <div><p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">Addresses</p>
        {d.addresses.length === 0 ? <p className="text-muted">None saved.</p> : <ul className="grid gap-3 sm:grid-cols-2">{d.addresses.map((a: any) => <li key={a._id} className="border border-line p-3 text-xs">{a.fullName}<br />{a.line1}, {a.city}, {a.state} {a.pincode}</li>)}</ul>}
      </div>
    </div>
  );
}

export function CustomersManager() {
  const [items, setItems] = useState<any[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, pages: 1 });
  const [q, setQ] = useState(""); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const load = useCallback(async (page = 1) => {
    setLoading(true); setError("");
    try { const d = await adminFetch(`/api/admin/customers?page=${page}&q=${encodeURIComponent(q)}`); setItems(d.items); setMeta({ total: d.total, page: d.page, pages: d.pages }); }
    catch (e: any) { setError(e.message); } finally { setLoading(false); }
  }, [q]);
  useEffect(() => { const t = setTimeout(() => load(1), 300); return () => clearTimeout(t); }, [load]);
  return (
    <>
      <PageHeader title="Customers" description={`${meta.total} customers`} />
      <Card>
        <div className="border-b border-line p-4"><div className="relative max-w-md"><Search className="absolute left-3 top-3 h-4 w-4 text-muted" /><input className="h-10 w-full border border-line pl-9 pr-3 text-sm" placeholder="Search name, email, phone…" aria-label="Search customers" value={q} onChange={(e) => setQ(e.target.value)} /></div></div>
        {loading ? <TableSkeleton cols={7} /> : error ? <div className="p-10 text-center text-red-600">{error}</div> : items.length === 0 ? <div className="p-12 text-center text-muted">No customers found.</div> : (
          <div className="overflow-x-auto"><table className="w-full text-left">
            <thead><tr className="border-b border-line text-xs uppercase tracking-wider text-muted">{["Name", "Email", "Phone", "Orders", "Total spent", "Last order", "Status"].map((h) => <th key={h} className="px-5 py-3 font-medium">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-line">{items.map((c) => (
              <tr key={c._id} className={cn("cursor-pointer hover:bg-neutral-50")} onClick={() => setOpen(c._id)}>
                <td className="px-5 py-3 font-medium">{c.name}</td><td className="px-5 py-3">{c.email}</td><td className="px-5 py-3 text-muted">{c.phone || "—"}</td>
                <td className="px-5 py-3">{c.orders}</td><td className="px-5 py-3">{formatINR(c.totalSpent)}</td><td className="px-5 py-3 text-muted">{c.lastOrder ? formatDate(c.lastOrder) : "—"}</td>
                <td className="px-5 py-3"><Badge tone={c.status === "active" ? "green" : "red"}>{c.status}</Badge></td>
              </tr>))}</tbody>
          </table></div>
        )}
        <Pagination page={meta.page} pages={meta.pages} onChange={load} />
      </Card>
      <Modal open={!!open} onClose={() => setOpen(null)} title="Customer details" side className="max-w-xl">{open && <CustomerDetail id={open} onChanged={() => load(meta.page)} />}</Modal>
    </>
  );
}
