import { Schema, model, models, type Model } from "mongoose";

const SiteSettingsSchema = new Schema(
  {
    key: { type: String, default: "site", unique: true },
    brandName: { type: String, default: "VÉRANO" },
    tagline: { type: String, default: "Defined by Style." },
    announcement: { type: String, default: "FREE SHIPPING ON ORDERS ABOVE ₹1999" },
    freeShippingThreshold: { type: Number, default: 1999 },
    shippingFee: { type: Number, default: 99 },
    expressFee: { type: Number, default: 149 },
    taxRate: { type: Number, default: 12 },
    contactEmail: { type: String, default: "hello@verano.example" },
    contactPhone: { type: String, default: "+91 98765 43210" },
    instagram: { type: String, default: "https://instagram.com" },
    facebook: { type: String, default: "https://facebook.com" },
    youtube: { type: String, default: "https://youtube.com" },
  },
  { timestamps: true }
);

export const SiteSettings: Model<any> = models.SiteSettings || model("SiteSettings", SiteSettingsSchema);
