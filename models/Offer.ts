import { Schema, model, models, type Model } from "mongoose";

/**
 * Automatic offers (no code needed).
 *  PERCENT_OFF      : buy >= minQty eligible items -> `value`% off those items
 *  BUY_X_GET_Y      : buy `minQty`, get `value` cheapest free (e.g. minQty 2, value 1 = "buy 2 get 1 free")
 *  BUNDLE_PRICE     : any `minQty` eligible items for a fixed total of `value` rupees
 * `flash` offers are time-boxed percentage sales with a visible countdown.
 */
const OfferSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    label: { type: String, default: "" },
    type: { type: String, enum: ["PERCENT_OFF", "BUY_X_GET_Y", "BUNDLE_PRICE"], required: true },
    scope: { type: String, enum: ["all", "category", "collection", "products"], default: "all" },
    refs: [{ type: Schema.Types.ObjectId }],
    minQty: { type: Number, default: 1, min: 1 },
    value: { type: Number, required: true, min: 0 },
    flash: { type: Boolean, default: false },
    startDate: Date,
    endDate: Date,
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);
OfferSchema.index({ active: 1, flash: 1, endDate: 1 });

export const Offer: Model<any> = models.Offer || model("Offer", OfferSchema);
