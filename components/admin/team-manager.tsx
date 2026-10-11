"use client";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { adminFetch } from "@/components/admin/api";
import { Badge, Card, PageHeader } from "@/components/admin/ui";

const ROLES = ["USER", "STAFF", "ADMIN", "SUPER_ADMIN"] as const;
const DESC: Record<string, string> = {
  STAFF: "Orders, returns, customers (view), inventory, reviews, dashboard",
  ADMIN: "Everything except team & roles",
  SUPER_ADMIN: "Everything, including team & roles",
};

export function TeamManager() {
  const [items, setItems] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    setLoading(true);
    try { setItems((await adminFetch(`/api/admin/team?q=${encodeURIComponent(q)}`)).items); } catch (e: any) { toast.error(e.message); } finally { setLoading(false); }
  }, [q]);
  useEffect(() => { const t = setTimeout(load, 300); return () => clearTimeout(t); }, [load]);

  const setRole = async (id: string, role: string) => {
    try { await adminFetch(`/api/admin/team/${id}`, "PATCH", { role }); toast.success("Role updated — takes effect within a few minutes or on next sign-in"); load(); }
    catch (e: any) { toast.error(e.message); }
  };
  return (
    <>
      <PageHeader title="Team & roles" description="Search a user by name or email to give them access. Only super admins can see this page." />
      <Card className="mb-6 p-5"><ul className="grid gap-2 text-sm sm:grid-cols-3">{Object.entries(DESC).map(([r, d]) => <li key={r}><Badge>{r}</Badge><p className="mt-1 text-xs text-muted">{d}</p></li>)}</ul></Card>
      <Card>
        <div className="border-b border-line p-4"><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search any user by name or email…" aria-label="Search users" className="h-10 w-full max-w-md border border-line px-3 text-sm" /></div>
        {loading ? <p className="p-8 text-muted">Loading…</p> : items.length === 0 ? <p className="p-8 text-muted">No users found.</p> : (
          <table className="w-full text-left">
            <thead><tr className="border-b border-line text-xs uppercase tracking-wider text-muted"><th className="px-5 py-3">User</th><th className="px-5 py-3">Role</th></tr></thead>
            <tbody className="divide-y divide-line">{items.map((u) => (
              <tr key={u._id}><td className="px-5 py-3"><p className="font-medium">{u.name}</p><p className="text-xs text-muted">{u.email}</p></td>
                <td className="px-5 py-3"><select aria-label={`Role for ${u.name}`} value={u.role} onChange={(e) => setRole(u._id, e.target.value)} className="h-9 border border-line px-2 text-sm">{ROLES.map((r) => <option key={r}>{r}</option>)}</select></td></tr>
            ))}</tbody>
          </table>
        )}
      </Card>
    </>
  );
}
