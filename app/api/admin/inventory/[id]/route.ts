import { z } from "zod";
import { Types } from "mongoose";
import { connectDB } from "@/lib/db";
import { Product } from "@/models/Product";
import { ApiError, handler, ok, parseBody, requireAdmin } from "@/lib/api";

export const PATCH = handler(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  await requireAdmin();
  const { id } = await params;
  if (!Types.ObjectId.isValid(id)) throw new ApiError(404, "Product not found");
  const b = await parseBody(req, z.object({ stock: z.number().int().min(0).max(100000), lowStockThreshold: z.number().int().min(0).optional() }));
  await connectDB();
  const r = await Product.updateOne({ _id: id }, b);
  if (!r.matchedCount) throw new ApiError(404, "Product not found");
  return ok({ ok: true });
});
