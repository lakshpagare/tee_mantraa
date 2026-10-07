import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";
import { ApiError, handler, ok, requireUser } from "@/lib/api";
import { isAdminRole } from "@/lib/constants";
import { serialize } from "@/lib/utils";
import { Types } from "mongoose";

export const GET = handler(async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const user = await requireUser();
  const { id } = await params;
  if (!Types.ObjectId.isValid(id)) throw new ApiError(404, "Order not found");
  await connectDB();
  const order = await Order.findById(id).lean<any>();
  if (!order || (String(order.user) !== user.id && !isAdminRole(user.role))) throw new ApiError(404, "Order not found");
  return ok({ order: serialize(order) });
});
