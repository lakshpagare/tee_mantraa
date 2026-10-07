import { z } from "zod";
import { Types } from "mongoose";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";
import { ApiError, handler, ok, parseBody, requireAdmin } from "@/lib/api";
import { ORDER_STATUSES } from "@/lib/constants";
import { commitOrderStock, releaseOrderStock } from "@/lib/orders";
import { serialize } from "@/lib/utils";

const schema = z.object({
  status: z.enum(ORDER_STATUSES).optional(),
  paymentStatus: z.enum(["PENDING", "PAID", "FAILED", "REFUNDED"]).optional(),
  note: z.string().trim().max(200).optional(),
  trackingNumber: z.string().trim().max(60).optional(),
});

type Ctx = { params: Promise<{ id: string }> };

export const GET = handler(async (_req: Request, { params }: Ctx) => {
  await requireAdmin();
  const { id } = await params;
  if (!Types.ObjectId.isValid(id)) throw new ApiError(404, "Order not found");
  await connectDB();
  const order = await Order.findById(id).populate("user", "name email phone").lean();
  if (!order) throw new ApiError(404, "Order not found");
  return ok({ order: serialize(order) });
});

export const PATCH = handler(async (req: Request, { params }: Ctx) => {
  await requireAdmin();
  const { id } = await params;
  if (!Types.ObjectId.isValid(id)) throw new ApiError(404, "Order not found");
  const b = await parseBody(req, schema);
  await connectDB();
  const order: any = await Order.findById(id);
  if (!order) throw new ApiError(404, "Order not found");

  if (b.status && b.status !== order.status) {
    const cancelling = b.status === "Cancelled" || b.status === "Returned";
    if (cancelling) await releaseOrderStock(order);
    else if (order.stockState === "RESERVED") await commitOrderStock(order);
    else if (order.stockState === "RELEASED") throw new ApiError(409, "This order's stock was released. Create a new order instead.");
    order.status = b.status;
    order.timeline.push({ status: b.status, note: b.note || "Status updated by admin", at: new Date() });
    if (b.status === "Delivered" && order.paymentMethod === "COD") order.paymentStatus = "PAID";
  } else if (b.note) {
    order.timeline.push({ status: order.status, note: b.note, at: new Date() });
  }
  if (b.paymentStatus) order.paymentStatus = b.paymentStatus;
  if (b.trackingNumber !== undefined) order.trackingNumber = b.trackingNumber;
  await order.save();
  return ok({ order: serialize(order.toObject()) });
});
