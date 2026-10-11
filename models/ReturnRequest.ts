import { Schema, model, models, type Model } from "mongoose";

const ReturnSchema = new Schema(
  {
    order: { type: Schema.Types.ObjectId, ref: "Order", required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    orderNumber: String,
    type: { type: String, enum: ["RETURN", "EXCHANGE"], default: "RETURN" },
    items: [{ itemId: String, name: String, quantity: Number, product: Schema.Types.ObjectId }],
    reason: { type: String, required: true },
    note: String,
    status: { type: String, enum: ["REQUESTED", "APPROVED", "REJECTED", "RECEIVED", "REFUNDED"], default: "REQUESTED", index: true },
    adminNote: String,
    refundAmount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const ReturnRequest: Model<any> = models.ReturnRequest || model("ReturnRequest", ReturnSchema);
