"use client";
import { toast } from "sonner";
import { adminFetch } from "@/components/admin/api";
import { ResourceManager } from "@/components/admin/resource-manager";
import { Badge } from "@/components/admin/ui";
import { formatDate } from "@/lib/utils";

const TONE: Record<string, "gray" | "green" | "red" | "amber" | "blue"> = { REQUESTED: "amber", APPROVED: "blue", RECEIVED: "blue", REFUNDED: "green", REJECTED: "red" };
const NEXT: Record<string, { status: string; label: string }[]> = {
  REQUESTED: [{ status: "APPROVED", label: "Approve" }, { status: "REJECTED", label: "Reject" }],
  APPROVED: [{ status: "RECEIVED", label: "Mark received" }, { status: "REJECTED", label: "Reject" }],
  RECEIVED: [{ status: "REFUNDED", label: "Mark refunded" }],
};

export function ReturnsAdmin() {
  const act = async (row: any, status: string, reload: () => void) => {
    const adminNote = window.prompt(`Optional note to the customer for “${status.toLowerCase()}”:`) || undefined;
    try { await adminFetch(`/api/admin/returns/${row._id}`, "PATCH", { status, adminNote }); toast.success(`Marked ${status.toLowerCase()}`); reload(); }
    catch (e: any) { toast.error(e.message); }
  };
  return (
    <ResourceManager
      resource="returns" title="Returns & exchanges" singular="Return" canCreate={false} canDelete={false} fields={[]}
      description="Approve requests, mark goods received (restocks inventory) and record refunds. Customers are emailed at each step."
      statusFilter={Object.keys(TONE).map((s) => ({ value: s, label: s[0] + s.slice(1).toLowerCase() }))}
      columns={[
        { key: "order", label: "Order", render: (r) => <div><p className="font-medium">{r.orderNumber}</p><p className="text-xs text-muted">{formatDate(r.createdAt)}</p></div> },
        { key: "user", label: "Customer", render: (r) => <div>{r.user?.name}<p className="text-xs text-muted">{r.user?.email}</p></div> },
        { key: "type", label: "Type", render: (r) => <Badge>{r.type}</Badge> },
        { key: "items", label: "Items", render: (r) => <div className="max-w-xs text-xs">{r.items.map((i: any) => `${i.name} ×${i.quantity}`).join(", ")}<p className="mt-1 text-muted">{r.reason}{r.note ? ` — ${r.note}` : ""}</p></div> },
        { key: "status", label: "Status", render: (r) => <Badge tone={TONE[r.status]}>{r.status}</Badge> },
      ]}
      rowActions={(r, reload) => (
        <span className="mr-2 inline-flex gap-1">
          {(NEXT[r.status] || []).map((n) => <button key={n.status} onClick={() => act(r, n.status, reload)} className="border border-line px-2.5 py-1 text-xs hover:bg-neutral-50">{n.label}</button>)}
        </span>
      )}
    />
  );
}
