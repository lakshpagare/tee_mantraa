import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Types } from "mongoose";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";
import { PrintButton } from "@/components/account/print-button";
import { getSettings } from "@/lib/data";
import { isPanelRole } from "@/lib/constants";
import { formatDate, formatINR, serialize } from "@/lib/utils";

export const metadata: Metadata = { title: "Invoice", robots: { index: false } };

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const { id } = await params;
  if (!Types.ObjectId.isValid(id)) notFound();
  await connectDB();
  const doc = await Order.findById(id).lean<any>();
  if (!doc || (String(doc.user) !== session.user.id && !isPanelRole(session.user.role))) notFound();
  const o = serialize(doc);
  const s = await getSettings();

  const rate = s.taxRate;
  const afterDiscount = Math.max(0, o.subtotal - o.discount - (o.offerDiscount || 0));
  const tax = o.tax ?? Math.round((afterDiscount * rate) / (100 + rate));
  const taxable = afterDiscount - tax;
  const intra = !!s.businessState && s.businessState.trim().toLowerCase() === String(o.shippingAddress?.state || "").trim().toLowerCase();
  const seller = s.businessName || s.brandName;

  return (
    <div className="container-wide max-w-4xl py-10 text-sm">
      <div className="no-print mb-8 flex justify-end"><PrintButton /></div>
      <div className="border border-line bg-paper p-8 md:p-12 print:border-0 print:p-0">
        <div className="flex flex-wrap items-start justify-between gap-6 border-b border-line pb-6">
          <div>
            <img src="/brand/crest-deep.png" alt="" className="mb-3 h-14 w-auto" width={721} height={560} />
            <p className="font-display text-3xl">{seller}</p>
            {s.businessAddress && <p className="mt-1 max-w-xs whitespace-pre-line text-muted">{s.businessAddress}</p>}
            {s.gstin && <p className="mt-1">GSTIN: <strong>{s.gstin}</strong></p>}
            <p className="text-muted">{s.contactEmail} · {s.contactPhone}</p>
          </div>
          <div className="text-right"><p className="text-[11px] uppercase tracking-[0.2em] text-muted">Tax invoice</p><p className="font-medium">INV-{o.orderNumber}</p><p className="text-muted">Order date: {formatDate(o.createdAt)}</p></div>
        </div>

        <div className="grid gap-6 py-6 sm:grid-cols-2">
          <div><p className="mb-1 text-[11px] uppercase tracking-[0.2em] text-muted">Billed &amp; shipped to</p><address className="not-italic">{o.shippingAddress.fullName}<br />{o.shippingAddress.line1}{o.shippingAddress.line2 && `, ${o.shippingAddress.line2}`}<br />{o.shippingAddress.city}, {o.shippingAddress.state} {o.shippingAddress.pincode}<br />{o.shippingAddress.phone}</address></div>
          <div className="sm:text-right"><p className="mb-1 text-[11px] uppercase tracking-[0.2em] text-muted">Payment</p><p>{o.paymentMethod === "COD" ? "Cash on Delivery" : o.paymentMethod === "CREDITS" ? "Points / gift card" : "Online (Razorpay)"} · {o.paymentStatus}</p></div>
        </div>

        <table className="w-full text-left">
          <thead><tr className="border-y border-line text-[11px] uppercase tracking-[0.16em] text-muted"><th className="py-3">Item</th><th>Qty</th><th className="text-right">Rate (incl. GST)</th><th className="text-right">Amount</th></tr></thead>
          <tbody className="divide-y divide-line">{o.items.map((i: any) => (
            <tr key={i._id}><td className="py-3">{i.name}<br /><span className="text-xs text-muted">{i.sku} · {i.color} · {i.size}</span></td><td>{i.quantity}</td><td className="text-right">{formatINR(i.price)}</td><td className="text-right">{formatINR(i.price * i.quantity)}</td></tr>
          ))}</tbody>
        </table>

        <dl className="ml-auto mt-6 max-w-xs space-y-1.5">
          <div className="flex justify-between"><dt className="text-muted">Items total</dt><dd>{formatINR(o.subtotal)}</dd></div>
          {o.discount > 0 && <div className="flex justify-between"><dt className="text-muted">Discount {o.couponCode && `(${o.couponCode})`}</dt><dd>−{formatINR(o.discount)}</dd></div>}
          {o.offerDiscount > 0 && <div className="flex justify-between"><dt className="text-muted">Offer {o.offerName && `(${o.offerName})`}</dt><dd>−{formatINR(o.offerDiscount)}</dd></div>}
          <div className="flex justify-between"><dt className="text-muted">Taxable value</dt><dd>{formatINR(taxable)}</dd></div>
          {intra ? (<><div className="flex justify-between"><dt className="text-muted">CGST ({rate / 2}%)</dt><dd>{formatINR(tax / 2)}</dd></div><div className="flex justify-between"><dt className="text-muted">SGST ({rate / 2}%)</dt><dd>{formatINR(tax / 2)}</dd></div></>) : <div className="flex justify-between"><dt className="text-muted">IGST ({rate}%)</dt><dd>{formatINR(tax)}</dd></div>}
          {o.loyaltyDiscount > 0 && <div className="flex justify-between"><dt className="text-muted">Reward points</dt><dd>−{formatINR(o.loyaltyDiscount)}</dd></div>}
          {o.giftCardAmount > 0 && <div className="flex justify-between"><dt className="text-muted">Gift card</dt><dd>−{formatINR(o.giftCardAmount)}</dd></div>}
          <div className="flex justify-between"><dt className="text-muted">Shipping</dt><dd>{o.shipping ? formatINR(o.shipping) : "Free"}</dd></div>
          <div className="flex justify-between border-t border-line pt-3 text-base font-semibold"><dt>Total paid / payable</dt><dd>{formatINR(o.total)}</dd></div>
        </dl>
        <p className="mt-8 text-xs text-muted">Prices include GST. This is a computer-generated invoice and does not require a signature. Please verify GSTIN and tax details with your accountant before relying on this document for filing.</p>
      </div>
    </div>
  );
}
