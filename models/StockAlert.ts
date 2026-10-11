import { Schema, model, models, type Model } from "mongoose";

const StockAlertSchema = new Schema(
  { product: { type: Schema.Types.ObjectId, ref: "Product", required: true }, email: { type: String, required: true, lowercase: true, trim: true } },
  { timestamps: true }
);
StockAlertSchema.index({ product: 1, email: 1 }, { unique: true });

export const StockAlert: Model<any> = models.StockAlert || model("StockAlert", StockAlertSchema);
