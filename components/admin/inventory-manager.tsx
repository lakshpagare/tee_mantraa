"use client";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { adminFetch } from "@/components/admin/api";
import { Badge, Card, PageHeader } from "@/components/admin/ui";
import { TableSkeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

function Row({ p, onSaved }: { p: any; onSaved: () => void }) {
  const [stock, setStock] = useState(String(p.stock));
  const [busy, setBusy] = useState(false);
  const available = p.stock - p.reserved;
  const out = available <= 0;
  const low = !out && available <= p.lowStockThreshold;
  const dirty = Number(stock) !== p.stock;
  const save = async () => {
    const n = Number(stock);
    if (!Number.isInteger(n) || n < 0) return toast.error("Enter a whole number, 0 or more");
    setBusy(true);
    try { await adminFetch(`/api/admin/inventory/${p._id}`, "PATCH", { stock: n }); toast.success("Stock updated"); onSaved(); }
    catch (e: any) { toast.error(e.message); } finally { setBusy(false); }
  };
  return (
    <tr className={cn(out ? "bg-red-50/60" : low ? "bg-amber-50/60" : "")}>
      <td className="px-5 py-3"><div className="flex items-center gap-3"><img src={p.images?.[0]} alt="" className="h-12 w-10 object-cover" /><span className="font-medium">{p.name}</span></div></td>
      <td className="px-5 py-3 font-mono text-xs">{p.sku}</td>
      <td className="px-5 py-3"><input type="number" min={0} aria-label={`Stock for ${p.name}`} value={stock} onChange={(e) => setStock(e.target.value)} className="h-9 w-24 border border-line px-2" /></td>
      <td className="px-5 py-3">{p.reserved}</td>
      <td className="px-5 py-3 font-medium">{available}</td>
      <td className="px-5 py-3">{out ? <Badge tone="red">Out of stock</Badge> : low ? <Badge tone="amber">Low stock</Badge> : <Badge tone="green">In stock</Badge>}</td>
      <td className="px-5 py-3 text-right"><button disabled={!dirty || busy} onClick={save} className="h-9 bg-ink px-4 text-white disabled:opacity-30">{busy ? "…" : "Save"}</button></td>
    </tr>
  );
}

export function InventoryManager() {
  const [items, setItems] = useState<any[]>([]);
  const [q, setQ] = useState(""); const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  const load = useCallback(async () => {
    setLoading(true); setError("");
    try { setItems((await adminFetch(`/api/admin/inventory?q=${encodeURIComponent(q)}&filter=${filter}`)).items); }
    catch (e: any) { setError(e.message); } finally { setLoading(false); }
  }, [q, filter]);
  useEffect(() => { const t = setTimeout(load, 300); return () => clearTimeout(t); }, [load]);
  return (
    <>
      <PageHeader title="Inventory" description="Available = stock − reserved (held by unpaid online orders). Low and out-of-stock rows are highlighted." />
      <Card>
        <div className="flex flex-wrap gap-3 border-b border-line p-4">
          <input className="h-10 min-w-[220px] flex-1 border border-line px-3 text-sm" placeholder="Search product or SKU…" aria-label="Search inventory" value={q} onChange={(e) => setQ(e.target.value)} />
          <select className="h-10 w-44 border border-line px-3 text-sm" aria-label="Filter" value={filter} onChange={(e) => setFilter(e.target.value)}><option value="">All products</option><option value="low">Low stock</option><option value="out">Out of stock</option></select>
        </div>
        {loading ? <TableSkeleton cols={6} /> : error ? <div className="p-10 text-center text-red-600">{error}</div> : items.length === 0 ? <div className="p-12 text-center text-muted">No products match.</div> : (
          <div className="overflow-x-auto"><table className="w-full text-left">
            <thead><tr className="border-b border-line text-xs uppercase tracking-wider text-muted">{["Product", "SKU", "Stock", "Reserved", "Available", "Status", ""].map((h) => <th key={h} className="px-5 py-3 font-medium">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-line">{items.map((p) => <Row key={p._id + p.stock} p={p} onSaved={load} />)}</tbody>
          </table></div>
        )}
      </Card>
    </>
  );
}
