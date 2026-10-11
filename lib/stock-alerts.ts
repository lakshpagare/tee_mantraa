import { Product } from "@/models/Product";
import { StockAlert } from "@/models/StockAlert";
import { safeEmail, sendBackInStock } from "@/lib/emails";

/** Email everyone waiting on this product and clear their alerts. Call after stock goes from 0 to >0. */
export async function notifyBackInStock(productId: string) {
  const product: any = await Product.findById(productId).select("name slug stock reserved").lean();
  if (!product || product.stock - product.reserved <= 0) return;
  const alerts: any[] = await StockAlert.find({ product: productId }).lean();
  for (const a of alerts) safeEmail(() => sendBackInStock(a.email, product));
  if (alerts.length) await StockAlert.deleteMany({ product: productId });
}
