import { revalidateTag } from "next/cache";
import { Types } from "mongoose";
import { connectDB } from "@/lib/db";
import { ApiError, handler, ok, requireAccess } from "@/lib/api";
import { RESOURCES } from "@/lib/admin-resources";
import { recomputeRating } from "@/lib/reviews";
import { notifyBackInStock } from "@/lib/stock-alerts";
import { serialize, slugify } from "@/lib/utils";
import { changedFields, labelOf, logActivity } from "@/lib/activity";

type Ctx = { params: Promise<{ resource: string; id: string }> };

async function load(ctx: Ctx) {
  const { resource, id } = await ctx.params;
  const cfg = RESOURCES[resource];
  if (!cfg || !Types.ObjectId.isValid(id)) throw new ApiError(404, "Not found");
  const actor = await requireAccess(cfg.section);
  await connectDB();
  return { resource, id, cfg, actor };
}

export const GET = handler(async (_req: Request, ctx: Ctx) => {
  const { id, cfg } = await load(ctx);
  const doc = await cfg.model.findById(id).lean();
  if (!doc) throw new ApiError(404, "Not found");
  return ok({ item: serialize(doc) });
});

export const PUT = handler(async (req: Request, ctx: Ctx) => {
  const { resource, id, cfg, actor } = await load(ctx);
  let raw: any;
  try { raw = await req.json(); } catch { throw new ApiError(400, "Invalid request body"); }
  const parsed: any = cfg.update.parse(raw);
  const from = cfg.slugFrom || "name";
  if (cfg.autoSlug && !parsed.slug && parsed[from]) parsed.slug = slugify(parsed[from]);
  if (resource === "journal" && parsed.published) {
    const prev: any = await cfg.model.findById(id).select("publishedAt").lean();
    if (!prev?.publishedAt) parsed.publishedAt = new Date();
  }
  // Empty optional values in the form (e.g. cleared compare-at price or date) are removed from the document.
  const set = Object.fromEntries(Object.entries(parsed).filter(([, v]) => v !== undefined));
  const unset: Record<string, 1> = {};
  for (const [k, v] of Object.entries(raw || {})) if ((v === null || v === "") && parsed[k] === undefined) unset[k] = 1;
  const update = Object.keys(unset).length ? { $set: set, $unset: unset } : set;

  const before: any = await cfg.model.findById(id).lean();
  const doc: any = await cfg.model.findByIdAndUpdate(id, update, { new: true, runValidators: true }).lean();
  if (!doc) throw new ApiError(404, "Not found");
  if (resource === "reviews") await recomputeRating(doc.product);
  if (resource === "products" && before && before.stock - before.reserved <= 0 && doc.stock - doc.reserved > 0) await notifyBackInStock(id);
  if (cfg.tag) revalidateTag(cfg.tag);
  const changed = changedFields(before, set);
  logActivity(actor, "update", resource, `Updated ${resource.replace(/s$/, "")} “${labelOf(doc)}”${changed.length ? ` — changed: ${changed.slice(0, 8).join(", ")}` : ""}`, id);
  return ok({ item: serialize(doc) });
});

export const DELETE = handler(async (_req: Request, ctx: Ctx) => {
  const { resource, id, cfg, actor } = await load(ctx);
  const doc: any = await cfg.model.findByIdAndDelete(id).lean();
  if (!doc) throw new ApiError(404, "Not found");
  if (resource === "reviews") await recomputeRating(doc.product);
  if (cfg.tag) revalidateTag(cfg.tag);
  logActivity(actor, "delete", resource, `Deleted ${resource.replace(/s$/, "")} “${labelOf(doc)}”`, id);
  return ok({ ok: true });
});
