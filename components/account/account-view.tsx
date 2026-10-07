"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import { PackageOpen } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Field, Input, Select } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { WishlistView } from "@/components/account/wishlist-view";
import { INDIAN_STATES, isAdminRole } from "@/lib/constants";
import { cn, formatDate, formatINR } from "@/lib/utils";

const TABS = [["profile", "Profile"], ["orders", "Orders"], ["wishlist", "Wishlist"], ["addresses", "Addresses"], ["settings", "Settings"]] as const;
const STATUS_STYLE: Record<string, string> = {
  Delivered: "bg-green-50 text-green-800", Cancelled: "bg-red-50 text-red-800", Returned: "bg-red-50 text-red-800",
  Shipped: "bg-blue-50 text-blue-800", "Out for Delivery": "bg-blue-50 text-blue-800",
};

async function api(url: string, method = "GET", body?: unknown) {
  const r = await fetch(url, { method, headers: body ? { "Content-Type": "application/json" } : undefined, body: body ? JSON.stringify(body) : undefined });
  const d = await r.json();
  if (!r.ok) throw new Error(d.error || "Something went wrong");
  return d;
}

function ProfileTab() {
  const { update } = useSession();
  const [u, setU] = useState<any>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => { api("/api/account/profile").then((d) => setU(d.user)).catch(() => {}); }, []);
  if (!u) return <Skeleton className="h-64 max-w-xl" />;
  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true);
    try { await api("/api/account/profile", "PUT", { name: u.name, phone: u.phone || "" }); await update(); toast.success("Profile updated"); }
    catch (err: any) { toast.error(err.message); } finally { setBusy(false); }
  };
  return (
    <form onSubmit={save} className="max-w-xl space-y-5">
      <Field label="Full name"><Input value={u.name} onChange={(e) => setU({ ...u, name: e.target.value })} required minLength={2} /></Field>
      <Field label="Email" hint={u.emailVerified ? "Verified" : "Not verified yet"}><Input value={u.email} disabled /></Field>
      <Field label="Phone"><Input value={u.phone || ""} onChange={(e) => setU({ ...u, phone: e.target.value })} inputMode="tel" /></Field>
      <Button type="submit" loading={busy}>Save changes</Button>
    </form>
  );
}

function OrdersTab() {
  const [orders, setOrders] = useState<any[] | null>(null);
  useEffect(() => { api("/api/orders").then((d) => setOrders(d.orders)).catch(() => setOrders([])); }, []);
  if (!orders) return <div className="space-y-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-24 w-full" />)}</div>;
  if (!orders.length) return <EmptyState icon={PackageOpen} title="No orders yet" text="When you place an order, you'll be able to track it here." ctaText="Start shopping" ctaHref="/shop" />;
  return (
    <ul className="space-y-4">
      {orders.map((o) => (
        <li key={o._id} className="border border-line p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div><p className="font-medium">{o.orderNumber}</p><p className="text-xs text-muted">{formatDate(o.createdAt)} · {o.items.reduce((n: number, i: any) => n + i.quantity, 0)} items</p></div>
            <span className={cn("px-3 py-1 text-[11px] uppercase tracking-[0.14em]", STATUS_STYLE[o.status] || "bg-soft")}>{o.status}</span>
            <p className="font-medium">{formatINR(o.total)}</p>
            <Link href={`/order/${o._id}`} className="link-underline text-[11px] uppercase tracking-[0.2em]">Track order</Link>
          </div>
          <p className="mt-3 line-clamp-1 text-sm text-muted">{o.items.map((i: any) => i.name).join(", ")}</p>
        </li>
      ))}
    </ul>
  );
}

const blank = { label: "Home", fullName: "", phone: "", line1: "", line2: "", city: "", state: "", pincode: "", isDefault: false };

function AddressesTab() {
  const [list, setList] = useState<any[] | null>(null);
  const [form, setForm] = useState<any | null>(null);
  const [busy, setBusy] = useState(false);
  const load = useCallback(() => api("/api/account/addresses").then((d) => setList(d.addresses)).catch(() => setList([])), []);
  useEffect(() => { load(); }, [load]);
  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true);
    try {
      const { _id, user: _u, createdAt: _c, updatedAt: _up, __v, ...body } = form;
      await api(_id ? `/api/account/addresses/${_id}` : "/api/account/addresses", _id ? "PUT" : "POST", body);
      toast.success("Address saved"); setForm(null); load();
    } catch (err: any) { toast.error(err.message); } finally { setBusy(false); }
  };
  const del = async (id: string) => { try { await api(`/api/account/addresses/${id}`, "DELETE"); load(); } catch (e: any) { toast.error(e.message); } };
  const set = (k: string) => (e: React.ChangeEvent<any>) => setForm({ ...form, [k]: e.target.value });

  if (form) {
    return (
      <form onSubmit={save} className="grid max-w-2xl gap-4 sm:grid-cols-2">
        <Field label="Label"><Input value={form.label} onChange={set("label")} /></Field>
        <Field label="Full name"><Input value={form.fullName} onChange={set("fullName")} required /></Field>
        <Field label="Phone"><Input value={form.phone} onChange={set("phone")} required inputMode="tel" /></Field>
        <Field label="PIN code"><Input value={form.pincode} onChange={set("pincode")} required maxLength={6} inputMode="numeric" /></Field>
        <Field label="Address line 1" className="sm:col-span-2"><Input value={form.line1} onChange={set("line1")} required /></Field>
        <Field label="Address line 2" className="sm:col-span-2"><Input value={form.line2 || ""} onChange={set("line2")} /></Field>
        <Field label="City"><Input value={form.city} onChange={set("city")} required /></Field>
        <Field label="State"><Select value={form.state} onChange={set("state")} required><option value="">Select</option>{INDIAN_STATES.map((s) => <option key={s}>{s}</option>)}</Select></Field>
        <label className="flex items-center gap-2 text-sm sm:col-span-2"><input type="checkbox" className="accent-black" checked={!!form.isDefault} onChange={(e) => setForm({ ...form, isDefault: e.target.checked })} />Make this my default address</label>
        <div className="flex gap-3 sm:col-span-2"><Button type="submit" loading={busy}>Save address</Button><Button type="button" variant="outline" onClick={() => setForm(null)}>Cancel</Button></div>
      </form>
    );
  }
  if (!list) return <Skeleton className="h-40 w-full" />;
  return (
    <div>
      <ul className="grid gap-4 md:grid-cols-2">
        {list.map((a) => (
          <li key={a._id} className="border border-line p-5 text-sm">
            <p className="mb-2 flex items-center gap-2 font-medium">{a.label}{a.isDefault && <span className="bg-ink px-2 py-0.5 text-[10px] uppercase tracking-wider text-white">Default</span>}</p>
            <address className="not-italic text-muted">{a.fullName}<br />{a.line1}{a.line2 && `, ${a.line2}`}<br />{a.city}, {a.state} {a.pincode}<br />{a.phone}</address>
            <div className="mt-4 flex gap-5 text-[11px] uppercase tracking-[0.18em]"><button className="link-underline" onClick={() => setForm(a)}>Edit</button><button className="link-underline" onClick={() => del(a._id)}>Delete</button></div>
          </li>
        ))}
      </ul>
      {!list.length && <p className="mb-6 text-sm text-muted">You haven't saved any addresses yet.</p>}
      <Button className="mt-6" variant="outline" onClick={() => setForm({ ...blank })}>Add new address</Button>
    </div>
  );
}

function SettingsTab() {
  const [cur, setCur] = useState("");
  const [next, setNext] = useState("");
  const [busy, setBusy] = useState(false);
  const change = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true);
    try { await api("/api/account/password", "POST", { current: cur, next }); toast.success("Password changed"); setCur(""); setNext(""); }
    catch (err: any) { toast.error(err.message); } finally { setBusy(false); }
  };
  return (
    <div className="max-w-xl space-y-12">
      <form onSubmit={change} className="space-y-5">
        <h3 className="font-display text-2xl">Change password</h3>
        <Field label="Current password"><Input type="password" autoComplete="current-password" value={cur} onChange={(e) => setCur(e.target.value)} required /></Field>
        <Field label="New password" hint="At least 8 characters with a letter and a number"><Input type="password" autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} required /></Field>
        <Button type="submit" loading={busy}>Update password</Button>
      </form>
      <div><h3 className="mb-4 font-display text-2xl">Session</h3><Button variant="outline" onClick={() => signOut({ callbackUrl: "/" })}>Sign out</Button></div>
    </div>
  );
}

export function AccountView() {
  const sp = useSearchParams();
  const router = useRouter();
  const { data: session } = useSession();
  const tab = (TABS.find(([k]) => k === sp.get("tab")) || TABS[0])[0];
  return (
    <div className="container-wide pb-10 pt-10 md:pt-16">
      <p className="eyebrow mb-3">My account</p>
      <h1 className="display text-5xl md:text-7xl">Hello, {session?.user?.name?.split(" ")[0] || "there"}</h1>
      <div className="mt-10 flex gap-8 overflow-x-auto border-b border-line no-scrollbar" role="tablist">
        {TABS.map(([k, l]) => (
          <button key={k} role="tab" aria-selected={tab === k} onClick={() => router.push(`/account?tab=${k}`, { scroll: false })}
            className={cn("whitespace-nowrap border-b-2 pb-4 text-[11px] font-medium uppercase tracking-[0.2em]", tab === k ? "border-ink" : "border-transparent text-muted hover:text-ink")}>{l}</button>
        ))}
        {isAdminRole(session?.user?.role) && <Link href="/admin" className="ml-auto whitespace-nowrap pb-4 text-[11px] font-medium uppercase tracking-[0.2em] text-muted hover:text-ink">Admin →</Link>}
      </div>
      <div className="py-10" role="tabpanel">
        {tab === "profile" && <ProfileTab />}
        {tab === "orders" && <OrdersTab />}
        {tab === "wishlist" && <WishlistView />}
        {tab === "addresses" && <AddressesTab />}
        {tab === "settings" && <SettingsTab />}
      </div>
    </div>
  );
}
