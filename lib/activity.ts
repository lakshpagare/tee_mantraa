import { ActivityLog } from "@/models/ActivityLog";

type Actor = { id?: string; name?: string | null; email?: string | null; role?: string };

/** Audit trail for admin/staff actions. Fire-and-forget; a logging failure never blocks the action. */
export function logActivity(actor: Actor, action: "create" | "update" | "delete" | "status" | "settings" | "other", resource: string, summary: string, targetId?: string) {
  ActivityLog.create({ user: actor.id, userName: actor.name, userEmail: actor.email, role: actor.role, action, resource, summary: summary.slice(0, 400), targetId })
    .catch((e: any) => console.error("[activity]", e?.message || e));
}

export const labelOf = (doc: any) => doc?.name || doc?.title || doc?.code || doc?.orderNumber || doc?.email || String(doc?._id || "");

/** Names of top-level fields whose values differ (used for "Changed: price, stock"). */
export function changedFields(before: any, after: Record<string, any>) {
  if (!before) return [] as string[];
  return Object.keys(after).filter((k) => JSON.stringify(after[k]) !== JSON.stringify(before[k]) && !(after[k] === undefined));
}
