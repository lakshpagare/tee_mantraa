import type { SiteSettingsDTO } from "@/types";

export const DEFAULT_SETTINGS: SiteSettingsDTO = {
  brandName: "tee-mantraa",
  tagline: "Defined by Style.",
  announcement: "FREE SHIPPING ON ORDERS ABOVE ₹1999",
  freeShippingThreshold: 1999,
  shippingFee: 99,
  expressFee: 149,
  taxRate: 12,
  contactEmail: "hello@tee-mantraa.example",
  contactPhone: "+91 98765 43210",
  instagram: "https://instagram.com",
  facebook: "https://facebook.com",
  youtube: "https://youtube.com",
  whatsapp: "",
  gatewayFeePct: 2,
  alertEmail: "",
  businessName: "",
  gstin: "",
  businessAddress: "",
  businessState: "",
  unserviceablePincodes: "",
};
