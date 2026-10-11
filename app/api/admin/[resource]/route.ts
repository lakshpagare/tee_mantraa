import { revalidateTag } from "next/cache";
import { connectDB } from "@/lib/db";
import { ApiError, handler, ok, parseBody, requireAccess } from "@/lib/api";
import { RESOURCES } from "@/lib/admin-resources";
import { escapeRegex, serialize, slugify } from "@/lib/utils";
import { labelOf, logActivity } from "@/lib/activity";

type Ctx = { params: Promise<{ resource: string }> };

export const GET = handler(async (req: Request, { params }: Ctx) => {
  const { resource } = await params;
  const cfg = RESOURCES[resource];
  if (!cfg) throw new ApiError(404, "Not found");
  await requireAccess(cfg.section);
  const sp = new URL(req.url).searchParams;
  const page = Math.max(1, parseInt(sp.get("page") || "1", 10) || 1);
  const limit = Math.min(200, Math.max(1, parseInt(sp.get("limit") || "20", 10) || 20));
  const q = (sp.get("q") || "").trim().slice(0, 60);
  const filter: any = {};
  if (q) filter.$or = cfg.search.map((f) => ({ [f]: new RegExp(escapeRegex(q), "i") }));
  const status = sp.get("status");
  if (status && resource === "reviews") filter.status = status;
  await connectDB();
  let query = cfg.model.find(filter).sort(cfg.sort).skip((page - 1) * limit).limit(limit);
  if (cfg.populate) query = query.populate(cfg.populate);
  const [items, total] = await Promise.all([query.lean(), cfg.model.countDocuments(filter)]);
  return ok({ items: serialize(items), total, page, pages: Math.max(1, Math.ceil(total / limit)) });
});

export const POST = handler(async (req: Request, { params }: Ctx) => {
  const { resource } = await params;
  const cfg = RESOURCES[resource];
  if (!cfg || !cfg.create) throw new ApiError(404, "Not found");
  const actor = await requireAccess(cfg.section);
  const data: any = await parseBody(req, cfg.create);
  const from = cfg.slugFrom || "name";
  if (cfg.autoSlug && !data.slug) data.slug = slugify(data[from]);
  cfg.beforeCreate?.(data);
  await connectDB();
  const doc = await cfg.model.create(data);
  if (cfg.tag) revalidateTag(cfg.tag);
  logActivity(actor, "create", resource, `Created ${resource.replace(/s$/, "")} “${labelOf(doc)}”`, String(doc._id));
  return ok({ item: serialize(doc.toObject()) }, 201);
});
