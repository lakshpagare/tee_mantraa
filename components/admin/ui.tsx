import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div><h1 className="text-2xl font-semibold tracking-tight">{title}</h1>{description && <p className="mt-1 text-sm text-muted">{description}</p>}</div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Card({ children, className, title, action }: { children: ReactNode; className?: string; title?: string; action?: ReactNode }) {
  return (
    <section className={cn("border border-line bg-white", className)}>
      {title && <header className="flex items-center justify-between border-b border-line px-5 py-3.5"><h2 className="text-sm font-semibold">{title}</h2>{action}</header>}
      {children}
    </section>
  );
}

export function Stat({ label, value, sub, tone }: { label: string; value: ReactNode; sub?: string; tone?: "warn" }) {
  return (
    <div className="border border-line bg-white p-5">
      <p className="text-xs uppercase tracking-wider text-muted">{label}</p>
      <p className={cn("mt-2 text-2xl font-semibold tracking-tight", tone === "warn" && "text-amber-600")}>{value}</p>
      {sub && <p className="mt-1 text-xs text-muted">{sub}</p>}
    </div>
  );
}

export function Pagination({ page, pages, onChange }: { page: number; pages: number; onChange: (p: number) => void }) {
  if (pages <= 1) return null;
  return (
    <div className="flex items-center justify-between border-t border-line px-5 py-3 text-sm">
      <span className="text-muted">Page {page} of {pages}</span>
      <div className="flex gap-2">
        <button disabled={page <= 1} onClick={() => onChange(page - 1)} className="border border-line px-3 py-1.5 hover:bg-soft disabled:opacity-40">Previous</button>
        <button disabled={page >= pages} onClick={() => onChange(page + 1)} className="border border-line px-3 py-1.5 hover:bg-soft disabled:opacity-40">Next</button>
      </div>
    </div>
  );
}

export const Badge = ({ children, tone = "gray" }: { children: ReactNode; tone?: "gray" | "green" | "red" | "amber" | "blue" }) => (
  <span className={cn("inline-block px-2 py-0.5 text-xs font-medium", { gray: "bg-neutral-100 text-neutral-700", green: "bg-green-50 text-green-800", red: "bg-red-50 text-red-800", amber: "bg-amber-50 text-amber-800", blue: "bg-blue-50 text-blue-800" }[tone])}>{children}</span>
);

export const statusTone = (s: string): "gray" | "green" | "red" | "amber" | "blue" =>
  ({ Delivered: "green", Confirmed: "blue", Processing: "blue", Shipped: "blue", "Out for Delivery": "blue", Cancelled: "red", Returned: "red", Pending: "amber", PAID: "green", PENDING: "amber", FAILED: "red", REFUNDED: "gray", APPROVED: "green", REJECTED: "red" } as const)[s as "Delivered"] || "gray";
