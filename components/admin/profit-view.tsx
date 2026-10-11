"use client";
import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { adminFetch } from "@/components/admin/api";
import { Card, PageHeader, Stat } from "@/components/admin/ui";
import { Skeleton } from "@/components/ui/skeleton";
import { formatINR } from "@/lib/utils";

const RANGES = [["today", "Today"], ["7d", "7 days"], ["30d", "30 days"], ["3m", "3 months"], ["1y", "1 year"]] as const;
const axis = { fontSize: 11, fill: "#6B6B6B" };

export function ProfitView() {
  const [range, setRange] = useState("30d");
  const [d, setD] = useState<any>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let off = false;
    setD(null); setError("");
    adminFetch(`/api/admin/profit?range=${range}`).then((x) => !off && setD(x)).catch((e) => !off && setError(e.message));
    return () => { off = true; };
  }, [range]);

  const t = d?.totals;
  const table = (rows: any[], first: string) => (
    <table className="w-full text-left text-sm">
      <thead><tr className="border-b border-line text-xs uppercase tracking-wider text-muted"><th className="px-5 py-3">{first}</th>{"units" in (rows[0] || {}) && <th className="px-5 py-3">Units</th>}<th className="px-5 py-3">Revenue</th><th className="px-5 py-3">Cost</th><th className="px-5 py-3">Profit</th><th className="px-5 py-3">Margin</th></tr></thead>
      <tbody className="divide-y divide-line">{rows.map((r) => (
        <tr key={r.name}><td className="px-5 py-3 font-medium">{r.name}</td>{"units" in r && <td className="px-5 py-3">{r.units}</td>}<td className="px-5 py-3">{formatINR(r.revenue)}</td><td className="px-5 py-3">{formatINR(r.cogs)}</td><td className={`px-5 py-3 font-medium ${r.profit < 0 ? "text-red-600" : ""}`}>{formatINR(r.profit)}</td><td className="px-5 py-3">{r.margin}%</td></tr>
      ))}</tbody>
    </table>
  );

  return (
    <>
      <PageHeader title="Profit report" description="Estimated from each product's cost price. Add cost prices under Products for accurate margins." actions={
        <div className="flex border border-line bg-paper" role="group" aria-label="Date range">{RANGES.map(([v, l]) => <button key={v} onClick={() => setRange(v)} aria-pressed={range === v} className={`px-3.5 py-2 text-sm ${range === v ? "bg-ink text-paper" : "hover:bg-neutral-50"}`}>{l}</button>)}</div>
      } />
      {error ? <p className="text-red-600">{error}</p> : !d ? <div className="grid gap-4 sm:grid-cols-4">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-28" />)}</div> : (
        <>
          {t.missingCost > 0 && <p className="mb-4 border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">{t.missingCost} sold unit{t.missingCost > 1 ? "s have" : " has"} no cost price, so profit is overstated. Set “Cost price” on those products.</p>}
          <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Stat label="Net sales (incl. GST)" value={formatINR(t.netSales)} sub={`${t.orders} orders · ${t.units} units`} />
            <Stat label="Revenue (ex-GST)" value={formatINR(t.revenueExGst)} sub={`GST ${formatINR(t.gst)}`} />
            <Stat label="Cost of goods" value={formatINR(t.cogs)} />
            <Stat label="Gross profit" value={formatINR(t.grossProfit)} />
            <Stat label="Gateway fees (est.)" value={formatINR(t.gatewayFees)} sub={`${d.feePct}% on online payments`} />
            <Stat label="Net profit" value={formatINR(t.netProfit)} sub={`${d.marginPct}% margin`} tone={t.netProfit < 0 ? "warn" : undefined} />
            <Stat label="Discounts given" value={formatINR(t.discounts)} sub="Offers, coupons, points, gift cards" />
            <Stat label="Shipping collected" value={formatINR(t.shipping)} sub="Courier cost not deducted" />
          </div>
          <Card title="Revenue vs profit (ex-GST)">
            {d.series.length === 0 ? <p className="p-10 text-center text-sm text-muted">No sales in this period.</p> : (
              <div className="h-72 p-4"><ResponsiveContainer width="100%" height="100%"><BarChart data={d.series}><CartesianGrid stroke="#eee" vertical={false} /><XAxis dataKey="date" tick={axis} tickLine={false} /><YAxis tick={axis} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${Math.abs(v) >= 1000 ? `${Math.round(v / 1000)}k` : v}`} /><Tooltip formatter={(v: any) => formatINR(Number(v))} /><Bar dataKey="revenue" fill="#BDBDBD" name="Revenue" /><Bar dataKey="profit" fill="#111111" name="Profit" /></BarChart></ResponsiveContainer></div>
            )}
          </Card>
          <div className="mt-6 grid gap-6 xl:grid-cols-2">
            <Card title="Most profitable products">{d.products.length ? table(d.products, "Product") : <p className="p-8 text-sm text-muted">No data.</p>}</Card>
            <Card title="By category">{d.categories.length ? table(d.categories, "Category") : <p className="p-8 text-sm text-muted">No data.</p>}</Card>
          </div>
        </>
      )}
    </>
  );
}
