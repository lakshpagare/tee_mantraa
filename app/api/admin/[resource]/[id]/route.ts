import { Types } from "mongoose";
import { connectDB } from "@/lib/db";
import { ApiError, handler, ok, parseBody, requireAdmin } from "@/lib/api";
import { RESOURCES } from "@/lib/admin-resources";
import { recomputeRating } from "@/lib/reviews";
import { serialize, slugify } from "@/lib/utils";

type Ctx = { params: Promise<{ resource: string; id: string }> };

async function load(ctx: Ctx) {
  await requireAdmin();
  const { resource, id } = await ctx.params;
  const cfg = RESOURCES[resource];
  if (!cfg || !Types.ObjectId.isValid(id)) throw new ApiError(404, "Not found");
  await connectDB();
  return { resource, id, cfg };
}

export const GET = handler(async (_req: Request, ctx: Ctx) => {
  const { id, cfg } = await load(ctx);
  const doc = await cfg.model.findById(id).lean();
  if (!doc) throw new ApiError(404, "Not found");
  return ok({ item: serialize(doc) });
});

export const PUT = handler(async (req: Request, ctx: Ctx) => {
  const { resource, id, cfg } = await load(ctx);
  const data: any = await parseBody(req, cfg.update);
  if (cfg.autoSlug && !data.slug && data.name) data.slug = slugify(data.name);
  const doc: any = await cfg.model.findByIdAndUpdate(id, data, { new: true, runValidators: true }).lean();
  if (!doc) throw new ApiError(404, "Not found");
  if (resource === "reviews") await recomputeRating(doc.product);
  return ok({ item: serialize(doc) });
});

export const DELETE = handler(async (_req: Request, ctx: Ctx) => {
  const { resource, id, cfg } = await load(ctx);
  const doc: any = await cfg.model.findByIdAndDelete(id).lean();
  if (!doc) throw new ApiError(404, "Not found");
  if (resource === "reviews") await recomputeRating(doc.product);
  return ok({ ok: true });
});
