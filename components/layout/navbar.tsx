"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, Menu, Search, ShoppingBag, User } from "lucide-react";
import { useEffect, useState } from "react";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { useSite } from "@/hooks/use-site";
import { cartCount, useCart } from "@/store/cart";
import { useUI } from "@/store/ui";
import { useWishlist } from "@/store/wishlist";
import { cn } from "@/lib/utils";

export const NAV_LINKS = [
  { href: "/shop?new=1", label: "New Arrivals" },
  { href: "/shop?gender=men", label: "Men" },
  { href: "/shop?gender=women", label: "Women" },
  { href: "/collections", label: "Collections" },
  { href: "/shop?sale=1", label: "Sale" },
];

function Badge({ n }: { n: number }) {
  if (!n) return null;
  return (
    <motion.span key={n} initial={{ scale: 0.4 }} animate={{ scale: 1 }} className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-ink px-1 text-[9px] font-medium text-white">
      {n}
    </motion.span>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const site = useSite();
  const { status } = useSession();
  const [scrolled, setScrolled] = useState(false);
  const { menuOpen, setMenuOpen, setSearchOpen, setCartOpen } = useUI();
  const count = useCart((s) => cartCount(s.items));
  const wish = useWishlist((s) => s.ids.length);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 40);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  useEffect(() => setMenuOpen(false), [pathname, setMenuOpen]);

  const transparent = isHome && !scrolled && !menuOpen;
  const iconBtn = "relative flex h-10 w-10 items-center justify-center transition-opacity hover:opacity-60";

  return (
    <>
      <header className={cn("z-50 w-full transition-colors duration-500", isHome ? "fixed inset-x-0 top-0" : "sticky top-0", transparent ? "bg-transparent text-white" : "border-b border-line bg-white/95 text-ink backdrop-blur")}>
        <AnimatePresence initial={false}>
          {!scrolled && site.announcement && (
            <motion.div initial={{ height: 0 }} animate={{ height: 36 }} exit={{ height: 0 }} transition={{ duration: 0.4 }} className="overflow-hidden bg-ink text-white">
              <p className="flex h-9 items-center justify-center px-4 text-center text-[10px] font-medium uppercase tracking-[0.25em]">{site.announcement}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <nav aria-label="Main" className="container-wide flex h-16 items-center justify-between md:h-[68px]">
          <Link href="/" aria-label={`${site.brandName} home`} className="font-display text-2xl font-medium tracking-[0.18em] md:text-[28px]">
            {site.brandName}
          </Link>

          <ul className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-10 lg:flex">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="link-underline text-[11px] font-medium uppercase tracking-[0.22em]">{l.label}</Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-0.5">
            <button className={iconBtn} aria-label="Search" onClick={() => setSearchOpen(true)}><Search className="h-[18px] w-[18px]" strokeWidth={1.5} /></button>
            <Link href={status === "authenticated" ? "/account" : "/login"} className={cn(iconBtn, "hidden lg:flex")} aria-label="Account"><User className="h-[18px] w-[18px]" strokeWidth={1.5} /></Link>
            <Link href="/wishlist" className={cn(iconBtn, "hidden lg:flex")} aria-label={`Wishlist, ${wish} items`}><Heart className="h-[18px] w-[18px]" strokeWidth={1.5} /><Badge n={wish} /></Link>
            <button className={iconBtn} aria-label={`Open cart, ${count} items`} onClick={() => setCartOpen(true)}><ShoppingBag className="h-[18px] w-[18px]" strokeWidth={1.5} /><Badge n={count} /></button>
            <button className={cn(iconBtn, "lg:hidden")} aria-label="Open menu" aria-expanded={menuOpen} onClick={() => setMenuOpen(true)}><Menu className="h-5 w-5" strokeWidth={1.5} /></button>
          </div>
        </nav>
      </header>
      <MobileMenu />
    </>
  );
}
