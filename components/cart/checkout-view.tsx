"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Field, Input, Select } from "@/components/ui/form";
import { Img } from "@/components/ui/img";
import { Skeleton } from "@/components/ui/skeleton";
import { CouponBox, TotalsTable } from "@/components/cart/order-summary";
import { useCartTotals } from "@/hooks/use-cart-totals";
import { useSite } from "@/hooks/use-site";
import { openRazorpay } from "@/lib/razorpay-client";
import { INDIAN_STATES } from "@/lib/constants";
import { addressFormSchema, type AddressForm } from "@/lib/validators";
import { useCart } from "@/store/cart";
import { cn, formatINR } from "@/lib/utils";

type Delivery = "standard" | "express";
type Payment = "RAZORPAY" | "COD";

function Section({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-line pt-8">
      <h2 className="mb-6 flex items-center gap-3 font-display text-3xl"><span className="flex h-7 w-7 items-center justify-center rounded-full border border-ink font-sans text-xs">{n}</span>{title}</h2>
      {children}
    </section>
  );
}

export function CheckoutView() {
  const router = useRouter();
  const { data: session } = useSession();
  const site = useSite();
  const clear = useCart((s) => s.clear);
  const [mounted, setMounted] = useState(false);
  const [delivery, setDelivery] = useState<Delivery>("standard");
  const [payment, setPayment] = useState<Payment>("RAZORPAY");
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState<any[]>([]);
  const { items, couponCode, error, applying, apply, remove, totals } = useCartTotals(delivery);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<AddressForm>({ resolver: zodResolver(addressFormSchema), defaultValues: { state: "" } });

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (!session?.user) return;
    reset((v) => ({ ...v, fullName: v.fullName || session.user.name || "", email: v.email || session.user.email || "" }));
    fetch("/api/account/addresses").then((r) => r.json()).then((d) => {
      setSaved(d.addresses || []);
      const def = (d.addresses || []).find((a: any) => a.isDefault) || d.addresses?.[0];
      if (def) fill(def);
    }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id]);

  const fill = (a: any) => reset((v) => ({ ...v, fullName: a.fullName, phone: a.phone, line1: a.line1, line2: a.line2 || "", city: a.city, state: a.state, pincode: a.pincode }));

  const onSubmit = handleSubmit(async (v) => {
    if (!items.length) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.productId, size: i.size, color: i.color, quantity: i.quantity })),
          address: { ...v, line2: v.line2 || undefined },
          deliveryMethod: delivery,
          paymentMethod: payment,
          couponCode: couponCode || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not place your order");

      clear(); // order now owns the items (and any stock reservation)
      if (payment === "COD") {
        router.push(`/order/${data.orderId}?placed=1`);
        return;
      }
      const paid = await openRazorpay({ keyId: data.razorpay.keyId, razorpayOrderId: data.razorpay.razorpayOrderId, amount: data.razorpay.amount, name: v.fullName, email: v.email, phone: v.phone }, site.brandName);
      if (!paid) {
        toast.error("Payment was not completed. You can retry from your order page.");
        router.push(`/order/${data.orderId}`);
        return;
      }
      const ver = await fetch("/api/payments/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderId: data.orderId, ...paid }) });
      const vd = await ver.json();
      if (!ver.ok) throw new Error(vd.error || "Payment verification failed");
      router.push(`/order/${data.orderId}?placed=1`);
    } catch (e: any) {
      toast.error(e.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  });

  if (!mounted) return <div className="container-wide py-16"><Skeleton className="h-[480px] w-full" /></div>;
  if (!items.length) return <EmptyState icon={ShoppingBag} title="Your bag is empty" text="Add a few pieces before checking out." ctaText="Shop now" ctaHref="/shop" />;

  const opt = (active: boolean) => cn("flex cursor-pointer items-center justify-between gap-4 border p-4 transition-colors", active ? "border-ink bg-soft" : "border-line hover:border-ink");

  return (
    <div className="container-wide pb-10 pt-10 md:pt-16">
      <h1 className="display mb-10 text-5xl md:text-7xl">Checkout</h1>
      <form onSubmit={onSubmit} noValidate className="grid gap-12 lg:grid-cols-[1fr_440px] lg:gap-20">
        <div className="space-y-10">
          <Section n={1} title="Customer information">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name" error={errors.fullName?.message}><Input autoComplete="name" aria-invalid={!!errors.fullName} {...register("fullName")} /></Field>
              <Field label="Phone" error={errors.phone?.message}><Input autoComplete="tel" inputMode="tel" aria-invalid={!!errors.phone} {...register("phone")} /></Field>
              <Field label="Email" error={errors.email?.message} className="sm:col-span-2"><Input type="email" autoComplete="email" aria-invalid={!!errors.email} {...register("email")} /></Field>
            </div>
          </Section>

          <Section n={2} title="Shipping address">
            {saved.length > 1 && (
              <div className="mb-5 flex flex-wrap gap-2">
                {saved.map((a) => <button type="button" key={a._id} onClick={() => fill(a)} className="border border-line px-3 py-2 text-xs hover:border-ink">{a.label || "Saved"} · {a.line1.slice(0, 18)}…</button>)}
              </div>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Address line 1" error={errors.line1?.message} className="sm:col-span-2"><Input autoComplete="address-line1" aria-invalid={!!errors.line1} {...register("line1")} /></Field>
              <Field label="Address line 2 (optional)" className="sm:col-span-2"><Input autoComplete="address-line2" {...register("line2")} /></Field>
              <Field label="City" error={errors.city?.message}><Input autoComplete="address-level2" aria-invalid={!!errors.city} {...register("city")} /></Field>
              <Field label="State" error={errors.state?.message}>
                <Select aria-invalid={!!errors.state} {...register("state")}><option value="">Select state</option>{INDIAN_STATES.map((s) => <option key={s}>{s}</option>)}</Select>
              </Field>
              <Field label="PIN code" error={errors.pincode?.message}><Input inputMode="numeric" maxLength={6} autoComplete="postal-code" aria-invalid={!!errors.pincode} {...register("pincode")} /></Field>
            </div>
          </Section>

          <Section n={3} title="Delivery method">
            <div className="space-y-3" role="radiogroup" aria-label="Delivery method">
              <label className={opt(delivery === "standard")}><span className="flex items-center gap-3"><input type="radio" className="accent-black" checked={delivery === "standard"} onChange={() => setDelivery("standard")} /><span><span className="block text-sm font-medium">Standard</span><span className="text-xs text-muted">3–7 business days</span></span></span><span className="text-sm">{totals.subtotal - totals.discount >= site.freeShippingThreshold ? "Free" : formatINR(site.shippingFee)}</span></label>
              <label className={opt(delivery === "express")}><span className="flex items-center gap-3"><input type="radio" className="accent-black" checked={delivery === "express"} onChange={() => setDelivery("express")} /><span><span className="block text-sm font-medium">Express</span><span className="text-xs text-muted">1–3 business days</span></span></span><span className="text-sm">{formatINR(site.expressFee)}</span></label>
            </div>
          </Section>

          <Section n={4} title="Payment method">
            <div className="space-y-3" role="radiogroup" aria-label="Payment method">
              <label className={opt(payment === "RAZORPAY")}><span className="flex items-center gap-3"><input type="radio" className="accent-black" checked={payment === "RAZORPAY"} onChange={() => setPayment("RAZORPAY")} /><span><span className="block text-sm font-medium">Pay online</span><span className="text-xs text-muted">UPI, cards, netbanking &amp; wallets via Razorpay</span></span></span></label>
              <label className={opt(payment === "COD")}><span className="flex items-center gap-3"><input type="radio" className="accent-black" checked={payment === "COD"} onChange={() => setPayment("COD")} /><span><span className="block text-sm font-medium">Cash on Delivery</span><span className="text-xs text-muted">Pay when your order arrives</span></span></span></label>
            </div>
          </Section>
        </div>

        <aside className="h-fit space-y-6 bg-soft p-6 md:p-8 lg:sticky lg:top-28" aria-label="Order summary">
          <h2 className="font-display text-3xl">Order summary</h2>
          <ul className="max-h-72 space-y-4 overflow-y-auto pr-1" data-lenis-prevent>
            {items.map((i) => (
              <li key={i.key} className="flex gap-3">
                <div className="relative w-16 shrink-0"><Img src={i.image} alt={i.name} ratio="4/5" sizes="64px" /><span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-ink px-1 text-[10px] text-white">{i.quantity}</span></div>
                <div className="min-w-0 flex-1 text-sm"><p className="line-clamp-1">{i.name}</p><p className="text-xs text-muted">{i.color} · {i.size}</p></div>
                <span className="text-sm">{formatINR(i.price * i.quantity)}</span>
              </li>
            ))}
          </ul>
          <CouponBox code={couponCode} error={error} applying={applying} onApply={apply} onRemove={remove} />
          <TotalsTable t={totals} />
          <Button type="submit" size="lg" className="w-full" loading={submitting}>{payment === "COD" ? "Place order" : `Pay ${formatINR(totals.total)}`}</Button>
          <p className="text-center text-xs text-muted">Payments are processed securely. We never see your card details.</p>
        </aside>
      </form>
    </div>
  );
}
