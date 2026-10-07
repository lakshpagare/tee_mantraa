"use client";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useSite } from "@/hooks/use-site";
import { useLockScroll } from "@/hooks/use-lock-scroll";
import { useUI } from "@/store/ui";
import { isAdminRole } from "@/lib/constants";

const MAIN = [
  { href: "/shop?new=1", label: "New Arrivals" },
  { href: "/shop?gender=men", label: "Men" },
  { href: "/shop?gender=women", label: "Women" },
  { href: "/collections", label: "Collections" },
  { href: "/shop?sale=1", label: "Sale" },
];

export function MobileMenu() {
  const { menuOpen, setMenuOpen } = useUI();
  const { data } = useSession();
  const site = useSite();
  useLockScroll(menuOpen);
  const close = () => setMenuOpen(false);
  const secondary = [
    { href: data?.user ? "/account" : "/login", label: data?.user ? "My Account" : "Sign in" },
    { href: "/wishlist", label: "Wishlist" },
    { href: "/contact", label: "Contact" },
    { href: "/faq", label: "FAQ" },
    ...(isAdminRole(data?.user?.role) ? [{ href: "/admin", label: "Admin" }] : []),
  ];

  return (
    <AnimatePresence>
      {menuOpen && (
        <motion.div
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          data-lenis-prevent
          className="fixed inset-0 z-[70] flex flex-col overflow-y-auto bg-white"
          initial={{ clipPath: "inset(0 0 100% 0)" }}
          animate={{ clipPath: "inset(0 0 0% 0)" }}
          exit={{ clipPath: "inset(0 0 100% 0)" }}
          transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
        >
          <div className="container-wide flex h-16 shrink-0 items-center justify-between">
            <span className="font-display text-2xl tracking-[0.18em]">{site.brandName}</span>
            <button aria-label="Close menu" onClick={close} className="flex h-10 w-10 items-center justify-center"><X className="h-5 w-5" /></button>
          </div>
          <nav className="container-wide flex flex-1 flex-col justify-center pb-10" aria-label="Mobile">
            <ul className="space-y-1">
              {MAIN.map((l, i) => (
                <li key={l.href} className="overflow-hidden">
                  <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} transition={{ delay: 0.25 + i * 0.07, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>
                    <Link href={l.href} onClick={close} className="block py-1.5 font-display text-[44px] font-light leading-tight">{l.label}</Link>
                  </motion.div>
                </li>
              ))}
            </ul>
            <motion.ul initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="mt-10 grid grid-cols-2 gap-3 border-t border-line pt-6">
              {secondary.map((l) => (
                <li key={l.href}><Link href={l.href} onClick={close} className="text-[11px] uppercase tracking-[0.22em] text-muted">{l.label}</Link></li>
              ))}
            </motion.ul>
          </nav>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
