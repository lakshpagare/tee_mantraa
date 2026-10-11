import { Types } from "mongoose";
import { connectDB } from "@/lib/db";
import { ReturnRequest } from "@/models/ReturnRequest";
import { Order } from "@/models/Order";
import { Product } from "@/models/Product";
import { ApiError, handler, ok, parseBody, requireAccess } from "@/lib/api";
import { returnUpdateSchema } from "@/lib/validators";
import { safeEmail, sendReturnEmail } from "@/lib/emails";
import { notifyBackInStock } from "@/lib/stock-alerts";
import { serialize } from "@/lib/utils";
import { logActivity } from "@/lib/activity";

export const PATCH = handler(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const actor = await requireAccess("returns");
  const { id } = await params;
  if (!Types.ObjectId.isValid(id)) throw new ApiError(404, "Not found");
  const b = await parseBody(req, returnUpdateSchema);
  await connectDB();
  const ret: any = await ReturnRequest.findById(id);
  if (!ret) throw new ApiError(404, "Not found");
  if (ret.status === b.status) throw new ApiError(409, `Already ${b.status.toLowerCase()}`);

  const order: any = await Order.findById(ret.order);
  // Restock when the goods are physically back (once).
  if (b.status === "RECEIVED" && ret.status !== "RECEIVED" && ret.status !== "REFUNDED" && ret.type === "RETURN") {
    for (const i of ret.items) {
      if (i.product) await Product.updateOne({ _id: i.product }, { $inc: { stock: i.quantity, sold: -i.quantity } });
      if (i.product) await notifyBackInStock(String(i.product));
    }
  }
  if (b.status === "REFUNDED" && order) {
    const refund = b.refundAmount ?? ret.items.reduce((s: number, i: any) => s + (order.items.find((x: any) => String(x._id) === i.itemId)?.price || 0) * i.quantity, 0);
    ret.refundAmount = refund;
    order.paymentStatus = "REFUNDED";
    order.timeline.push({ status: order.status, note: `Refund of ₹${refund} issued for return`, at: new Date() });
    await order.save();
  }
  ret.status = b.status;
  if (b.adminNote !== undefined) ret.adminNote = b.adminNote;
  await ret.save();
  logActivity(actor, "status", "returns", `Return for ${ret.orderNumber} → ${b.status}`, id);
  if (order) safeEmail(() => sendReturnEmail(order.shippingAddress.email, ret));
  return ok({ item: serialize(ret.toObject()) });
});
