"use client";
import { useCallback, useEffect, useState } from "react";
import { adminFetch } from "@/components/admin/api";
import { Badge, Card, PageHeader, Pagination } from "@/components/admin/ui";
import { TableSkeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";

const TONE: Record<string, "gray" | "green" | "red" | "amber" | "blue"> = { create: "green", update: "blue", delete: "red", status: "amber", settings: "gray", other: "gray" };

export function ActivityView() {
  const [items, setItems] = useState<any[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, pages: 1 });
  const [resources, setResources] = useState<string[]>([]);
  const [q, setQ] = useState(""); const [resource, setResource] = useState(""); const [action, setAction] = useState("");
  const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  const load = useCallback(async (page = 1) => {
    setLoading(true); setError("");
    try {
      const d = await adminFetch(`/api/admin/activity?page=${page}&q=${encodeURIComponent(q)}&resource=${resource}&action=${action}`);
      setItems(d.items); setMeta({ total: d.total, page: d.page, pages: d.pages }); setResources(d.resources);
    } catch (e: any) { setError(e.message); } finally { setLoading(false); }
  }, [q, resource, action]);
  useEffect(() => { const t = setTimeout(() => load(1), 300); return () => clearTimeout(t); }, [load]);
  const sel = "h-10 border border-line bg-paper px-3 text-sm";
  return (
    <>
      <PageHeader title="Activity log" description="Who changed what, and when. Every admin and staff action is recorded." />
      <Card>
        <div className="flex flex-wrap gap-3 border-b border-line p-4">
          <input className={`${sel} min-w-[220px] flex-1`} placeholder="Search by person or description…" aria-label="Search activity" value={q} onChange={(e) => setQ(e.target.value)} />
          <select className={sel} aria-label="Area" value={resource} onChange={(e) => setResource(e.target.value)}><option value="">All areas</option>{resources.map((r) => <option key={r}>{r}</option>)}</select>
          <select className={sel} aria-label="Action" value={action} onChange={(e) => setAction(e.target.value)}><option value="">All actions</option>{Object.keys(TONE).map((a) => <option key={a}>{a}</option>)}</select>
        </div>
        {loading ? <TableSkeleton cols={4} /> : error ? <p className="p-10 text-center text-red-600">{error}</p> : items.length === 0 ? <p className="p-12 text-center text-muted">No activity recorded yet.</p> : (
          <div className="overflow-x-auto"><table className="w-full text-left text-sm">
            <thead><tr className="border-b border-line text-xs uppercase tracking-wider text-muted"><th className="px-5 py-3">When</th><th className="px-5 py-3">Who</th><th className="px-5 py-3">Action</th><th className="px-5 py-3">Details</th></tr></thead>
            <tbody className="divide-y divide-line">{items.map((a) => (
              <tr key={a._id}>
                <td className="whitespace-nowrap px-5 py-3 text-muted">{formatDate(a.createdAt, true)}</td>
                <td className="px-5 py-3"><p className="font-medium">{a.userName || "—"}</p><p className="text-xs text-muted">{a.role} · {a.userEmail}</p></td>
                <td className="px-5 py-3"><Badge tone={TONE[a.action]}>{a.action}</Badge> <span className="text-xs text-muted">{a.resource}</span></td>
                <td className="px-5 py-3">{a.summary}</td>
              </tr>))}</tbody>
          </table></div>
        )}
        <Pagination page={meta.page} pages={meta.pages} onChange={load} />
      </Card>
    </>
  );
}
