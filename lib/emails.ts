import { sendMail } from "@/lib/mail";
import { getSettings } from "@/lib/data";
import { appUrl, formatINR } from "@/lib/utils";
import { trackingUrl } from "@/lib/carriers";

const esc = (s: unknown) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

async function layout(title: string, body: string) {
  const s = await getSettings();
  return `<div style="font-family:Georgia,'Times New Roman',serif;max-width:560px;margin:0 auto;padding:32px 24px;color:#111">
  <p style="font-size:22px;letter-spacing:.02em;margin:0 0 24px">${esc(s.brandName)}</p>
  <h1 style="font-weight:400;font-size:28px;margin:0 0 16px">${esc(title)}</h1>${body}
  <hr style="border:none;border-top:1px solid #e8e8e8;margin:32px 0 16px"/>
  <p style="font-size:12px;color:#777;font-family:Arial,sans-serif">${esc(s.brandName)} · ${esc(s.contactEmail)}</p></div>`;
}

const itemsTable = (items: any[]) =>
  `<table style="width:100%;border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px">${items
    .map((i) => `<tr><td style="padding:8px 0;border-bottom:1px solid #eee">${esc(i.name)}<br/><span style="color:#777;font-size:12px">${esc(i.color)} · ${esc(i.size)} · Qty ${i.quantity}</span></td><td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right">${formatINR(i.price * i.quantity)}</td></tr>`)
    .join("")}</table>`;

const btn = (href: string, label: string) => `<p><a href="${href}" style="display:inline-block;background:#111;color:#fff;padding:12px 24px;text-decoration:none;font-family:Arial,sans-serif;font-size:12px;letter-spacing:.15em;text-transform:uppercase">${esc(label)}</a></p>`;

/** Fire-and-forget wrapper: email problems must never break an order flow. */
export function safeEmail(fn: () => Promise<unknown>) {
  fn().catch((e) => console.error("[email]", e?.message || e));
}

export async function sendOrderEmail(order: any, kind: "placed" | "shipped" | "delivered" | "cancelled" | "returned") {
  const to = order.shippingAddress?.email;
  if (!to) return;
  const url = `${appUrl()}/order/${order._id}`;
  const copy = {
    placed: ["Thank you for your order", `We've received order <strong>${esc(order.orderNumber)}</strong> and are getting it ready.`],
    shipped: ["Your order is on its way", `Order <strong>${esc(order.orderNumber)}</strong> has shipped.`],
    delivered: ["Your order was delivered", `Order <strong>${esc(order.orderNumber)}</strong> has been delivered. We hope you love it — a review means a lot to us.`],
    cancelled: ["Your order was cancelled", `Order <strong>${esc(order.orderNumber)}</strong> has been cancelled. Any payment, points or gift card balance used will be returned.`],
    returned: ["Your return was processed", `Order <strong>${esc(order.orderNumber)}</strong> is marked as returned.`],
  }[kind];
  const track = kind === "shipped" ? trackingUrl(order.carrier, order.trackingNumber) : null;
  const body = `<p style="font-family:Arial,sans-serif;font-size:14px;line-height:1.6">${copy[1]}</p>${itemsTable(order.items)}
  <p style="font-family:Arial,sans-serif;font-size:14px;text-align:right"><strong>Total ${formatINR(order.total)}</strong></p>
  ${kind === "shipped" && order.trackingNumber ? `<p style="font-family:Arial,sans-serif;font-size:14px">${esc(order.carrier || "Tracking")}: <strong>${esc(order.trackingNumber)}</strong>${track ? ` — <a href="${track}">Track shipment</a>` : ""}</p>` : ""}
  ${btn(url, "View order")}`;
  await sendMail(to, `${copy[0]} · ${order.orderNumber}`, await layout(copy[0], body));
}

export async function sendReturnEmail(email: string, ret: any) {
  const msg: Record<string, string> = {
    REQUESTED: "We've received your request and will review it within one business day.",
    APPROVED: "Your request is approved. Please pack the items with original tags; our team will contact you for pickup.",
    REJECTED: "We're sorry — we couldn't approve this request.",
    RECEIVED: "We've received your items and are processing your refund/exchange.",
    REFUNDED: "Your refund has been issued to the original payment method. It may take 5–7 days to reflect.",
  };
  const body = `<p style="font-family:Arial,sans-serif;font-size:14px;line-height:1.6">Order ${esc(ret.orderNumber)} · ${esc(ret.type.toLowerCase())}<br/>${esc(msg[ret.status] || "")}</p>${ret.adminNote ? `<p style="font-family:Arial,sans-serif;font-size:14px">Note from our team: ${esc(ret.adminNote)}</p>` : ""}`;
  await sendMail(email, `Return update · ${ret.orderNumber}`, await layout(`Return ${ret.status.toLowerCase()}`, body));
}

export async function sendBackInStock(email: string, product: any) {
  const url = `${appUrl()}/product/${product.slug}`;
  await sendMail(email, `Back in stock: ${product.name}`, await layout("It's back", `<p style="font-family:Arial,sans-serif;font-size:14px">${esc(product.name)} is available again. Sizes go quickly — grab yours.</p>${btn(url, "Shop now")}`));
}

export async function sendLowStockAlert(products: { name: string; sku: string; available: number }[]) {
  const s = await getSettings();
  const to = s.alertEmail || s.contactEmail;
  if (!to || !products.length) return;
  const rows = products.map((p) => `<li>${esc(p.name)} (${esc(p.sku)}) — <strong>${p.available}</strong> left</li>`).join("");
  await sendMail(to, "Low stock alert", await layout("Low stock", `<ul style="font-family:Arial,sans-serif;font-size:14px">${rows}</ul>${btn(`${appUrl()}/admin/inventory`, "Open inventory")}`));
}

export async function sendAbandonedCart(email: string, name: string, items: { name: string; price: number; quantity: number; color?: string; size?: string }[]) {
  const body = `<p style="font-family:Arial,sans-serif;font-size:14px">Hi ${esc(name.split(" ")[0] || "there")}, you left a few things in your bag:</p>${itemsTable(items.map((i) => ({ ...i, color: i.color || "", size: i.size || "" })))}${btn(`${appUrl()}/cart`, "Complete your order")}`;
  await sendMail(email, "You left something behind", await layout("Still thinking it over?", body));
}
