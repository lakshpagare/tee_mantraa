import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";
import { ReturnRequest } from "@/models/ReturnRequest";
import { ApiError, handler, ok, parseBody, requireUser } from "@/lib/api";
import { returnRequestSchema } from "@/lib/validators";
import { safeEmail, sendReturnEmail } from "@/lib/emails";
import { serialize } from "@/lib/utils";

const WINDOW_DAYS = 7;

export const GET = handler(async (req: Request) => {
  const user = await requireUser();
  const orderId = new URL(req.url).searchParams.get("orderId");
  await connectDB();
  const items = await ReturnRequest.find({ user: user.id, ...(orderId ? { order: orderId } : {}) }).sort({ createdAt: -1 }).lean();
  return ok({ returns: serialize(items) });
});

export const POST = handler(async (req: Request) => {
  const user = await requireUser();
  const b = await parseBody(req, returnRequestSchema);
  await connectDB();
  const order: any = await Order.findOne({ _id: b.orderId, user: user.id });
  if (!order) throw new ApiError(404, "Order not found");
  if (order.status !== "Delivered") throw new ApiError(409, "Returns can be requested once the order is delivered");
  const delivered = [...order.timeline].reverse().find((t: any) => t.status === "Delivered")?.at || order.updatedAt;
  if (Date.now() - new Date(delivered).getTime() > WINDOW_DAYS * 86400000) throw new ApiError(409, `The ${WINDOW_DAYS}-day return window for this order has passed`);
  if (await ReturnRequest.exists({ order: order._id, status: { $in: ["REQUESTED", "APPROVED", "RECEIVED"] } })) throw new ApiError(409, "A return request is already open for this order");

  const picked = order.items.filter((i: any) => b.itemIds.includes(String(i._id)));
  if (!picked.length) throw new ApiError(422, "Select at least one item from this order");
  const ret = await ReturnRequest.create({
    order: order._id, user: user.id, orderNumber: order.orderNumber, type: b.type, reason: b.reason, note: b.note,
    items: picked.map((i: any) => ({ itemId: String(i._id), name: i.name, quantity: i.quantity, product: i.product })),
  });
  order.timeline.push({ status: order.status, note: `${b.type === "RETURN" ? "Return" : "Exchange"} requested`, at: new Date() });
  await order.save();
  safeEmail(() => sendReturnEmail(order.shippingAddress.email, ret));
  return ok({ ok: true, id: String(ret._id) }, 201);
});
