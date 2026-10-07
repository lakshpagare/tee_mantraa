import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Check } from "lucide-react";
import { Types } from "mongoose";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";
import { Img } from "@/components/ui/img";
import { ButtonLink } from "@/components/ui/button";
import { PayNowButton } from "@/components/account/pay-now-button";
import { TIMELINE_STEPS, ORDER_STATUSES } from "@/lib/constants";
import { formatDate, formatINR, serialize } from "@/lib/utils";

export const metadata: Metadata = { title: "Order", robots: { index: false } };

export default async function OrderPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ placed?: string }> }) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const { id } = await params;
  const { placed } = await searchParams;
  if (!Types.ObjectId.isValid(id)) notFound();
  await connectDB();
  const doc = await Order.findOne({ _id: id, user: session.user.id }).lean<any>();
  if (!doc) notFound();
  const o = serialize(doc);
  const cancelled = o.status === "Cancelled" || o.status === "Returned";
  const stepIdx = Math.max(0, ORDER_STATUSES.indexOf(o.status));
  const reach = (s: string) => ORDER_STATUSES.indexOf(s as any);
  const needsPayment = o.paymentMethod === "RAZORPAY" && o.paymentStatus !== "PAID" && o.status === "Pending" && o.stockState === "RESERVED";

  return (
    <div className="container-wide max-w-5xl pb-10 pt-10 md:pt-16">
      {placed && !cancelled && (
        <div className="mb-10 flex items-start gap-4 border border-ink p-6">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink text-white"><Check className="h-4 w-4" /></span>
          <div><h2 className="font-display text-3xl">Thank you for your order</h2><p className="mt-1 text-sm text-muted">A confirmation has been recorded for order {o.orderNumber}. We'll update you as it ships.</p></div>
        </div>
      )}
      <p className="eyebrow mb-2">Order</p>
      <h1 className="display text-4xl md:text-6xl">{o.orderNumber}</h1>
      <p className="mt-2 text-sm text-muted">Placed on {formatDate(o.createdAt, true)} · {o.paymentMethod === "COD" ? "Cash on Delivery" : "Online payment"} · Payment {o.paymentStatus.toLowerCase()}</p>

      {needsPayment && <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border border-line bg-soft p-5"><p className="text-sm">Your payment is pending. Complete it to confirm this order.</p><PayNowButton orderId={o._id} name={o.shippingAddress?.fullName} email={o.shippingAddress?.email} phone={o.shippingAddress?.phone} /></div>}

      <section className="mt-12" aria-label="Order progress">
        {cancelled ? (
          <p className="border border-line p-5 text-sm">This order was <strong>{o.status.toLowerCase()}</strong>.</p>
        ) : (
          <ol className="grid grid-cols-5 gap-2">
            {TIMELINE_STEPS.map((s) => {
              const done = stepIdx >= reach(s.status);
              return (
                <li key={s.label} className="text-center">
                  <div className={`mb-3 h-1 ${done ? "bg-ink" : "bg-line"}`} />
                  <p className={`text-[10px] uppercase tracking-[0.14em] md:text-xs ${done ? "text-ink" : "text-muted"}`}>{s.label}</p>
                </li>
              );
            })}
          </ol>
        )}
        {o.status === "Out for Delivery" && <p className="mt-4 text-sm text-muted">Your order is out for delivery today.</p>}
        {o.trackingNumber && <p className="mt-4 text-sm">Tracking number: <strong>{o.trackingNumber}</strong></p>}
      </section>

      <div className="mt-14 grid gap-12 lg:grid-cols-[1fr_340px]">
        <ul className="divide-y divide-line border-y border-line">
          {o.items.map((i: any) => (
            <li key={i._id} className="flex gap-4 py-5">
              <Link href={`/product/${i.slug}`} className="w-20 shrink-0"><Img src={i.image} alt={i.name} ratio="4/5" sizes="80px" /></Link>
              <div className="flex-1 text-sm"><p className="font-medium">{i.name}</p><p className="text-xs text-muted">{i.color} · {i.size} · Qty {i.quantity}</p></div>
              <span className="text-sm">{formatINR(i.price * i.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="space-y-8 text-sm">
          <dl className="space-y-2">
            <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd>{formatINR(o.subtotal)}</dd></div>
            {o.discount > 0 && <div className="flex justify-between"><dt className="text-muted">Discount {o.couponCode && `(${o.couponCode})`}</dt><dd>−{formatINR(o.discount)}</dd></div>}
            <div className="flex justify-between"><dt className="text-muted">Shipping</dt><dd>{o.shipping ? formatINR(o.shipping) : "Free"}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Tax (incl.)</dt><dd>{formatINR(o.tax)}</dd></div>
            <div className="flex justify-between border-t border-line pt-3 text-base font-medium"><dt>Total</dt><dd>{formatINR(o.total)}</dd></div>
          </dl>
          <div><p className="eyebrow mb-2">Ship to</p><address className="not-italic text-muted">{o.shippingAddress.fullName}<br />{o.shippingAddress.line1}{o.shippingAddress.line2 && `, ${o.shippingAddress.line2}`}<br />{o.shippingAddress.city}, {o.shippingAddress.state} {o.shippingAddress.pincode}<br />{o.shippingAddress.phone}</address></div>
          <div><p className="eyebrow mb-2">History</p><ul className="space-y-2">{[...o.timeline].reverse().map((t: any, k: number) => <li key={k}><span className="font-medium">{t.status}</span> <span className="text-muted">· {t.note} · {formatDate(t.at, true)}</span></li>)}</ul></div>
        </div>
      </div>
      <div className="mt-12 flex gap-3"><ButtonLink href="/account?tab=orders" variant="outline">All orders</ButtonLink><ButtonLink href="/shop">Continue shopping</ButtonLink></div>
    </div>
  );
}
