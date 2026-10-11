import { formatINR } from "@/lib/utils";
import { trackingUrl } from "@/lib/carriers";

/**
 * WhatsApp Business Cloud API (Meta). Two ways to message customers:
 *  1) Automatic: this module, when WHATSAPP_TOKEN + WHATSAPP_PHONE_NUMBER_ID are set (customer must opt in at checkout).
 *     Outside a 24-hour customer-service window Meta only delivers pre-approved TEMPLATE messages —
 *     set WHATSAPP_USE_TEMPLATES=true and create the templates listed in the README.
 *  2) Manual: `whatsappLink()` opens WhatsApp (your personal or WhatsApp Business app) with the message pre-filled.
 */
const GRAPH = "https://graph.facebook.com/v21.0";
export const whatsappConfigured = () => !!(process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID);

/** Normalises Indian-style numbers to E.164 digits without "+" (e.g. 98765 43210 -> 919876543210). */
export function normalizePhone(raw?: string | null, defaultCountry = "91"): string | null {
  const d = String(raw || "").replace(/\D/g, "");
  if (d.length === 10) return defaultCountry + d;
  if (d.length === 11 && d.startsWith("0")) return defaultCountry + d.slice(1);
  if (d.length >= 11 && d.length <= 15) return d;
  return null;
}

async function post(body: Record<string, unknown>) {
  const res = await fetch(`${GRAPH}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ messaging_product: "whatsapp", ...body }),
  });
  if (!res.ok) throw new Error(`WhatsApp API ${res.status}: ${(await res.text()).slice(0, 300)}`);
  return res.json();
}

export const sendWhatsAppText = (to: string, text: string) => post({ to, type: "text", text: { body: text, preview_url: true } });

export const sendWhatsAppTemplate = (to: string, name: string, lang: string, params: string[]) =>
  post({ to, type: "template", template: { name, language: { code: lang }, components: params.length ? [{ type: "body", parameters: params.map((p) => ({ type: "text", text: p })) }] : [] } });

export type OrderKind = "placed" | "shipped" | "delivered" | "cancelled" | "returned";

/** Plain-text message body (also used for the manual wa.me link and for non-template sends). */
export function orderMessage(order: any, kind: OrderKind, appUrl = ""): { text: string; params: string[] } {
  const name = String(order.shippingAddress?.fullName || "there").split(" ")[0];
  const link = appUrl ? `${appUrl}/order/${order._id}` : "";
  const track = trackingUrl(order.carrier, order.trackingNumber);
  const extra = { placed: formatINR(order.total), shipped: order.trackingNumber ? `${order.carrier || "Courier"} ${order.trackingNumber}` : "on its way", delivered: "delivered", cancelled: "cancelled", returned: "returned" }[kind];
  const lines = {
    placed: `Hi ${name}, thank you for your order ${order.orderNumber}! Total ${formatINR(order.total)}. We'll update you as it ships.`,
    shipped: `Hi ${name}, your order ${order.orderNumber} has shipped${order.trackingNumber ? ` (${order.carrier || "courier"} ${order.trackingNumber})` : ""}.${track ? ` Track: ${track}` : ""}`,
    delivered: `Hi ${name}, your order ${order.orderNumber} was delivered. We hope you love it! Not right? Request a return within 7 days.`,
    cancelled: `Hi ${name}, your order ${order.orderNumber} has been cancelled. Any payment, points or gift card used will be returned.`,
    returned: `Hi ${name}, your order ${order.orderNumber} is marked as returned.`,
  }[kind];
  return { text: link ? `${lines}\n${link}` : lines, params: [name, order.orderNumber, extra] };
}

/** Sends an order update through the Cloud API if configured and the customer opted in. Never throws into callers. */
export async function sendOrderWhatsApp(order: any, kind: OrderKind) {
  if (!whatsappConfigured() || !order.whatsappOptIn) return;
  const to = normalizePhone(order.shippingAddress?.phone);
  if (!to) return;
  const { text, params } = orderMessage(order, kind, process.env.NEXT_PUBLIC_APP_URL || "");
  if (process.env.WHATSAPP_USE_TEMPLATES === "true") {
    const name = process.env[`WHATSAPP_TEMPLATE_${kind.toUpperCase()}`] || `order_${kind}`;
    await sendWhatsAppTemplate(to, name, process.env.WHATSAPP_TEMPLATE_LANG || "en", params);
  } else {
    await sendWhatsAppText(to, text);
  }
}

/** Click-to-chat link for sending manually from your own WhatsApp (personal or Business app). */
export const whatsappLink = (phone: string | null | undefined, text: string) => {
  const n = normalizePhone(phone);
  return n ? `https://wa.me/${n}?text=${encodeURIComponent(text)}` : null;
};
