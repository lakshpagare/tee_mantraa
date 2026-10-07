import { Schema, model, models, type Model } from "mongoose";
import { ORDER_STATUSES } from "@/lib/constants";

/** OrderItem: embedded sub-document with a snapshot of the product at purchase time. */
export const OrderItemSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true },
    slug: String,
    image: String,
    sku: String,
    size: String,
    color: String,
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: true }
);

const AddressSnapshot = new Schema(
  {
    fullName: String,
    phone: String,
    email: String,
    line1: String,
    line2: String,
    city: String,
    state: String,
    pincode: String,
    country: { type: String, default: "India" },
  },
  { _id: false }
);

const TimelineSchema = new Schema(
  { status: String, note: String, at: { type: Date, default: Date.now } },
  { _id: false }
);

const OrderSchema = new Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    items: { type: [OrderItemSchema], validate: (v: any[]) => v.length > 0 },
    shippingAddress: AddressSnapshot,
    deliveryMethod: { type: String, enum: ["standard", "express"], default: "standard" },
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    shipping: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    total: { type: Number, required: true },
    couponCode: String,
    paymentMethod: { type: String, enum: ["RAZORPAY", "COD"], required: true },
    paymentStatus: { type: String, enum: ["PENDING", "PAID", "FAILED", "REFUNDED"], default: "PENDING" },
    razorpayOrderId: { type: String, index: true },
    razorpayPaymentId: String,
    status: { type: String, enum: ORDER_STATUSES, default: "Pending", index: true },
    /** Inventory state: RESERVED (held, unpaid) -> COMMITTED (stock deducted) -> RELEASED (returned) */
    stockState: { type: String, enum: ["RESERVED", "COMMITTED", "RELEASED"], default: "RESERVED" },
    timeline: { type: [TimelineSchema], default: [] },
    trackingNumber: String,
  },
  { timestamps: true }
);
OrderSchema.index({ createdAt: -1 });

export const Order: Model<any> = models.Order || model("Order", OrderSchema);
