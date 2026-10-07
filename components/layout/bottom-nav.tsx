"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Heart, Home, Search, Store, User } from "lucide-react";
import { useUI } from "@/store/ui";
import { useWishlist } from "@/store/wishlist";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const pathname = usePathname();
  const { status } = useSession();
  const setSearchOpen = useUI((s) => s.setSearchOpen);
  const wish = useWishlist((s) => s.ids.length);
  const item = (active: boolean) => cn("relative flex flex-1 flex-col items-center gap-1 py-2.5 text-[9px] uppercase tracking-[0.16em]", active ? "text-ink" : "text-muted");
  return (
    <nav aria-label="Quick navigation" className="pb-safe fixed inset-x-0 bottom-0 z-40 flex border-t border-line bg-white/95 backdrop-blur lg:hidden">
      <Link href="/" className={item(pathname === "/")}><Home className="h-5 w-5" strokeWidth={1.4} />Home</Link>
      <Link href="/shop" className={item(pathname.startsWith("/shop"))}><Store className="h-5 w-5" strokeWidth={1.4} />Shop</Link>
      <button onClick={() => setSearchOpen(true)} className={item(false)}><Search className="h-5 w-5" strokeWidth={1.4} />Search</button>
      <Link href="/wishlist" className={item(pathname === "/wishlist")}>
        <span className="relative"><Heart className="h-5 w-5" strokeWidth={1.4} />{wish > 0 && <span className="absolute -right-2 -top-1.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-ink px-1 text-[8px] text-white">{wish}</span>}</span>Wishlist
      </Link>
      <Link href={status === "authenticated" ? "/account" : "/login"} className={item(pathname.startsWith("/account") || pathname === "/login")}><User className="h-5 w-5" strokeWidth={1.4} />Account</Link>
    </nav>
  );
}
