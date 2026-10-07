"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { adminFetch } from "@/components/admin/api";
import { Badge, Card, PageHeader, Stat, statusTone } from "@/components/admin/ui";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, formatINR } from "@/lib/utils";

const RANGES = [["today", "Today"], ["7d", "7 days"], ["30d", "30 days"], ["3m", "3 months"], ["1y", "1 year"]] as const;
const COLORS = ["#111111", "#6B6B6B", "#A8A8A8", "#D4D4D4"];
const axis = { fontSize: 11, fill: "#6B6B6B" };

function useStats(range: string) {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let off = false;
    setData(null); setError("");
    adminFetch(`/api/admin/stats?range=${range}`).then((d) => !off && setData(d)).catch((e) => !off && setError(e.message));
    return () => { off = true; };
  }, [range]);
  return { data, error };
}

const ChartBox = ({ children }: { children: React.ReactElement }) => <div className="h-64 w-full p-4"><ResponsiveContainer width="100%" height="100%">{children}</ResponsiveContainer></div>;
const Empty = () => <p className="p-10 text-center text-sm text-muted">No data for this period yet.</p>;

function Charts({ d }: { d: any }) {
  const has = d.revenueSeries.length > 0;
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <Card title="Revenue">{has ? <ChartBox><AreaChart data={d.revenueSeries}><defs><linearGradient id="rv" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#111" stopOpacity={0.15} /><stop offset="100%" stopColor="#111" stopOpacity={0} /></linearGradient></defs><CartesianGrid stroke="#eee" vertical={false} /><XAxis dataKey="date" tick={axis} tickLine={false} /><YAxis tick={axis} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v >= 1000 ? `${Math.round(v / 1000)}k` : v}`} /><Tooltip formatter={(v: any) => formatINR(Number(v))} /><Area type="monotone" dataKey="revenue" stroke="#111" strokeWidth={2} fill="url(#rv)" /></AreaChart></ChartBox> : <Empty />}</Card>
      <Card title="Orders">{has ? <ChartBox><BarChart data={d.revenueSeries}><CartesianGrid stroke="#eee" vertical={false} /><XAxis dataKey="date" tick={axis} tickLine={false} /><YAxis tick={axis} tickLine={false} axisLine={false} allowDecimals={false} /><Tooltip /><Bar dataKey="orders" fill="#111" /></BarChart></ChartBox> : <Empty />}</Card>
      <Card title="Customer growth">{d.customerSeries.length ? <ChartBox><LineChart data={d.customerSeries}><CartesianGrid stroke="#eee" vertical={false} /><XAxis dataKey="date" tick={axis} tickLine={false} /><YAxis tick={axis} tickLine={false} axisLine={false} allowDecimals={false} /><Tooltip /><Line type="monotone" dataKey="customers" stroke="#111" strokeWidth={2} dot={false} /></LineChart></ChartBox> : <Empty />}</Card>
      <Card title="Top categories (revenue)">{d.topCategories.length ? <ChartBox><BarChart data={d.topCategories} layout="vertical" margin={{ left: 30 }}><CartesianGrid stroke="#eee" horizontal={false} /><XAxis type="number" tick={axis} tickLine={false} tickFormatter={(v) => `₹${Math.round(v / 1000)}k`} /><YAxis type="category" dataKey="name" tick={axis} tickLine={false} width={90} /><Tooltip formatter={(v: any) => formatINR(Number(v))} /><Bar dataKey="revenue" fill="#111" /></BarChart></ChartBox> : <Empty />}</Card>
    </div>
  );
}

export function DashboardView() {
  const { data: d, error } = useStats("30d");
  if (error) return <p className="text-red-600">{error}</p>;
  if (!d) return <><PageHeader title="Dashboard" /><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-28" />)}</div></>;
  return (
    <>
      <PageHeader title="Dashboard" description="Store performance at a glance (last 30 days for charts)." />
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Total revenue" value={formatINR(d.totalRevenue)} sub="Excludes cancelled & returned" />
        <Stat label="Total orders" value={d.totalOrders} />
        <Stat label="Total customers" value={d.totalCustomers} />
        <Stat label="Total products" value={d.totalProducts} />
        <Stat label="Today's sales" value={formatINR(d.todaySales)} sub={`${d.todayOrders} orders`} />
        <Stat label="Monthly revenue" value={formatINR(d.monthlyRevenue)} sub="Month to date" />
        <Stat label="Pending orders" value={d.pendingOrders} tone={d.pendingOrders ? "warn" : undefined} />
        <Stat label="Low stock products" value={d.lowStock.length} tone={d.lowStock.length ? "warn" : undefined} />
      </div>
      <Charts d={d} />
      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Card title="Recent orders" action={<Link href="/admin/orders" className="text-xs underline">View all</Link>} className="xl:col-span-2">
          {d.recentOrders.length === 0 ? <Empty /> : <ul className="divide-y divide-line">{d.recentOrders.map((o: any) => <li key={o._id} className="flex items-center justify-between gap-3 px-5 py-3"><div><p className="font-medium">{o.orderNumber}</p><p className="text-xs text-muted">{o.shippingAddress?.fullName} · {formatDate(o.createdAt)}</p></div><Badge tone={statusTone(o.status)}>{o.status}</Badge><p className="font-medium">{formatINR(o.total)}</p></li>)}</ul>}
        </Card>
        <div className="space-y-6">
          <Card title="Top selling products">{d.topProducts.length === 0 ? <Empty /> : <ul className="divide-y divide-line">{d.topProducts.map((p: any) => <li key={p._id} className="flex items-center gap-3 px-5 py-3"><img src={p.image} alt="" className="h-12 w-10 object-cover" /><div className="min-w-0 flex-1"><p className="truncate font-medium">{p.name}</p><p className="text-xs text-muted">{p.units} sold</p></div><span className="text-sm">{formatINR(p.revenue)}</span></li>)}</ul>}</Card>
          <Card title="Low stock" action={<Link href="/admin/inventory" className="text-xs underline">Inventory</Link>}>{d.lowStock.length === 0 ? <p className="p-5 text-sm text-muted">All products are well stocked.</p> : <ul className="divide-y divide-line">{d.lowStock.map((p: any) => <li key={p._id} className="flex items-center justify-between px-5 py-3"><span className="truncate">{p.name}</span><Badge tone={p.stock - p.reserved <= 0 ? "red" : "amber"}>{Math.max(0, p.stock - p.reserved)} left</Badge></li>)}</ul>}</Card>
        </div>
      </div>
    </>
  );
}

export function AnalyticsView() {
  const [range, setRange] = useState("30d");
  const { data: d, error } = useStats(range);
  return (
    <>
      <PageHeader title="Analytics" description="Sales, products and customers over time." actions={
        <div className="flex border border-line bg-white" role="group" aria-label="Date range">{RANGES.map(([v, l]) => <button key={v} onClick={() => setRange(v)} aria-pressed={range === v} className={`px-3.5 py-2 text-sm ${range === v ? "bg-ink text-white" : "hover:bg-neutral-50"}`}>{l}</button>)}</div>
      } />
      {error ? <p className="text-red-600">{error}</p> : !d ? <div className="grid gap-4 sm:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28" />)}</div> : (
        <>
          <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Stat label="Revenue" value={formatINR(d.periodRevenue)} />
            <Stat label="Orders" value={d.periodOrders} />
            <Stat label="Products sold" value={d.periodUnits} />
            <Stat label="Average order value" value={formatINR(d.averageOrderValue)} />
          </div>
          <Charts d={d} />
          <div className="mt-6 grid gap-6 xl:grid-cols-3">
            <Card title="Top products" className="xl:col-span-2">{d.topProducts.length === 0 ? <Empty /> : <table className="w-full text-left"><thead><tr className="border-b border-line text-xs uppercase tracking-wider text-muted"><th className="px-5 py-3">Product</th><th className="px-5 py-3">Units</th><th className="px-5 py-3">Revenue</th></tr></thead><tbody className="divide-y divide-line">{d.topProducts.map((p: any) => <tr key={p._id}><td className="px-5 py-3 font-medium">{p.name}</td><td className="px-5 py-3">{p.units}</td><td className="px-5 py-3">{formatINR(p.revenue)}</td></tr>)}</tbody></table>}</Card>
            <Card title="Payment methods">{d.paymentSplit.length ? <ChartBox><PieChart><Pie data={d.paymentSplit} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80}>{d.paymentSplit.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip /></PieChart></ChartBox> : <Empty />}</Card>
          </div>
          <Card title="Conversion metrics" className="mt-6">
            <div className="grid gap-4 p-5 text-sm sm:grid-cols-3">
              <div><p className="text-xs uppercase tracking-wider text-muted">Orders in period</p><p className="mt-1 text-xl font-semibold">{d.conversion.orders}</p></div>
              <div><p className="text-xs uppercase tracking-wider text-muted">Sessions</p><p className="mt-1 text-xl font-semibold">{d.conversion.tracked ? d.conversion.sessions : "Not connected"}</p></div>
              <div><p className="text-xs uppercase tracking-wider text-muted">Conversion rate</p><p className="mt-1 text-xl font-semibold">{d.conversion.tracked ? "—" : "Needs traffic data"}</p></div>
            </div>
            <p className="border-t border-line px-5 py-3 text-xs text-muted">Visitor sessions aren't recorded by the app itself. Connect Google Analytics or Plausible and feed sessions into <code>/api/admin/stats</code> to enable conversion rate.</p>
          </Card>
        </>
      )}
    </>
  );
}
