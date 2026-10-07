import { z } from "zod";
import { Types } from "mongoose";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { Order } from "@/models/Order";
import { Address } from "@/models/Address";
import { ApiError, handler, ok, parseBody, requireAdmin } from "@/lib/api";
import { serialize } from "@/lib/utils";

type Ctx = { params: Promise<{ id: string }> };

export const GET = handler(async (_req: Request, { params }: Ctx) => {
  await requireAdmin();
  const { id } = await params;
  if (!Types.ObjectId.isValid(id)) throw new ApiError(404, "Customer not found");
  await connectDB();
  const [user, orders, addresses] = await Promise.all([
    User.findById(id).lean(),
    Order.find({ user: id }).sort({ createdAt: -1 }).limit(20).select("orderNumber total status createdAt").lean(),
    Address.find({ user: id }).lean(),
  ]);
  if (!user) throw new ApiError(404, "Customer not found");
  return ok(serialize({ user, orders, addresses }));
});

export const PATCH = handler(async (req: Request, { params }: Ctx) => {
  const admin = await requireAdmin();
  const { id } = await params;
  const { status } = await parseBody(req, z.object({ status: z.enum(["active", "blocked"]) }));
  if (id === admin.id) throw new ApiError(400, "You cannot change your own account status");
  await connectDB();
  const r = await User.updateOne({ _id: id, role: "USER" }, { status });
  if (!r.matchedCount) throw new ApiError(404, "Customer not found");
  return ok({ ok: true });
});
