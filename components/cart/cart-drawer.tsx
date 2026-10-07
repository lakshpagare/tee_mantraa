"use client";
import Link from "next/link";
import { ShoppingBag, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Img } from "@/components/ui/img";
import { Modal } from "@/components/ui/modal";
import { ButtonLink } from "@/components/ui/button";
import { FreeShippingBar } from "@/components/cart/free-shipping-bar";
import { QtyStepper } from "@/components/cart/qty-stepper";
import { cartCount, cartSubtotal, useCart } from "@/store/cart";
import { useUI } from "@/store/ui";
import { formatINR } from "@/lib/utils";

export function CartDrawer() {
  const { cartOpen, setCartOpen } = useUI();
  const { items, setQty, remove } = useCart();
  const subtotal = cartSubtotal(items);
  const close = () => setCartOpen(false);

  return (
    <Modal open={cartOpen} onClose={close} title="Shopping bag" side className="max-w-md !overflow-hidden flex flex-col">
      <div className="flex h-full flex-col">
        <div className="border-b border-line px-6 py-5">
          <h2 className="font-display text-2xl">Your Bag <span className="text-muted">({cartCount(items)})</span></h2>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <ShoppingBag className="mb-4 h-8 w-8" strokeWidth={1.25} />
            <p className="font-display text-2xl">Your bag is empty</p>
            <p className="mt-2 text-sm text-muted">Discover pieces made for everyday.</p>
            <ButtonLink href="/shop" className="mt-6" onClick={close}>Start shopping</ButtonLink>
          </div>
        ) : (
          <>
            <div className="border-b border-line px-6 py-4"><FreeShippingBar subtotal={subtotal} /></div>
            <ul className="flex-1 divide-y divide-line overflow-y-auto px-6" data-lenis-prevent>
              <AnimatePresence initial={false}>
                {items.map((i) => (
                  <motion.li key={i.key} layout initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, height: 0 }} className="flex gap-4 py-5">
                    <Link href={`/product/${i.slug}`} onClick={close} className="w-24 shrink-0"><Img src={i.image} alt={i.name} ratio="4/5" sizes="96px" /></Link>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex justify-between gap-2">
                        <Link href={`/product/${i.slug}`} onClick={close} className="text-sm leading-snug">{i.name}</Link>
                        <button aria-label={`Remove ${i.name}`} onClick={() => remove(i.key)} className="text-muted hover:text-ink"><X className="h-4 w-4" /></button>
                      </div>
                      <p className="mt-1 text-xs text-muted">{i.color} · {i.size}</p>
                      <div className="mt-auto flex items-center justify-between pt-3">
                        <QtyStepper value={i.quantity} max={i.maxQty} onChange={(n) => setQty(i.key, n)} />
                        <span className="text-sm">{formatINR(i.price * i.quantity)}</span>
                      </div>
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
            <div className="border-t border-line p-6">
              <div className="mb-1 flex justify-between text-sm"><span>Subtotal</span><span className="font-medium">{formatINR(subtotal)}</span></div>
              <p className="mb-4 text-xs text-muted">Shipping and taxes calculated at checkout.</p>
              <div className="grid grid-cols-2 gap-3">
                <ButtonLink href="/cart" variant="outline" onClick={close}>View cart</ButtonLink>
                <ButtonLink href="/checkout" onClick={close}>Checkout</ButtonLink>
              </div>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
