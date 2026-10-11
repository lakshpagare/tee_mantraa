import { z } from "zod";
import { Types } from "mongoose";
import { connectDB } from "@/lib/db";
import { Product } from "@/models/Product";
import { ApiError, handler, ok, parseBody, requireAccess } from "@/lib/api";
import { notifyBackInStock } from "@/lib/stock-alerts";
import { logActivity } from "@/lib/activity";

export const PATCH = handler(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const actor = await requireAccess("inventory");
  const { id } = await params;
  if (!Types.ObjectId.isValid(id)) throw new ApiError(404, "Product not found");
  const b = await parseBody(req, z.object({ stock: z.number().int().min(0).max(100000), lowStockThreshold: z.number().int().min(0).optional() }));
  await connectDB();
  const before: any = await Product.findById(id).select("stock reserved").lean();
  if (!before) throw new ApiError(404, "Product not found");
  await Product.updateOne({ _id: id }, b);
  logActivity(actor, "update", "inventory", `Stock set ${before.stock} → ${b.stock}`, id);
  if (before.stock - before.reserved <= 0 && b.stock - before.reserved > 0) await notifyBackInStock(id);
  return ok({ ok: true });
});
