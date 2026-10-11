import { safeEmail, sendOrderEmail } from "@/lib/emails";
import { sendOrderWhatsApp, type OrderKind } from "@/lib/whatsapp";

/** Email + WhatsApp (if configured and opted in). Fire-and-forget: messaging must never break an order flow. */
export function notifyOrder(order: any, kind: OrderKind) {
  safeEmail(() => sendOrderEmail(order, kind));
  safeEmail(() => sendOrderWhatsApp(order, kind));
}
