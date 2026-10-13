"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  BarChart3, BookOpen, Boxes, History, Percent, TrendingUp, ClipboardList, FolderTree, Gift, RotateCcw, ShieldCheck, Home, Image as ImageIcon, Layers, LayoutDashboard, LogOut, Mail, Menu, MessageSquareQuote,
  Package, Settings, Star, Tag, Users, X, type LucideIcon,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { canAccess } from "@/lib/constants";
import { Logo } from "@/components/logo";

const NAV: { href: string; label: string; icon: LucideIcon; section: string }[] = [
  { section: "dashboard", href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { section: "products", href: "/admin/products", label: "Products", icon: Package },
  { section: "categories", href: "/admin/categories", label: "Categories", icon: FolderTree },
  { section: "orders", href: "/admin/orders", label: "Orders", icon: ClipboardList },
  { section: "returns", href: "/admin/returns", label: "Returns", icon: RotateCcw },
  { section: "customers", href: "/admin/customers", label: "Customers", icon: Users },
  { section: "inventory", href: "/admin/inventory", label: "Inventory", icon: Boxes },
  { section: "coupons", href: "/admin/coupons", label: "Coupons", icon: Tag },
  { section: "giftcards", href: "/admin/giftcards", label: "Gift cards", icon: Gift },
  { section: "offers", href: "/admin/offers", label: "Offers & flash sales", icon: Percent },
  { section: "reviews", href: "/admin/reviews", label: "Reviews", icon: Star },
  { section: "homepage", href: "/admin/homepage", label: "Homepage", icon: Home },
  { section: "collections", href: "/admin/collections", label: "Collections", icon: Layers },
  { section: "banners", href: "/admin/banners", label: "Banners", icon: ImageIcon },
  { section: "testimonials", href: "/admin/testimonials", label: "Testimonials", icon: MessageSquareQuote },
  { section: "newsletter", href: "/admin/newsletter", label: "Newsletter", icon: Mail },
  { section: "journal", href: "/admin/journal", label: "Journal", icon: BookOpen },
  { section: "analytics", href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { section: "profit", href: "/admin/profit", label: "Profit report", icon: TrendingUp },
  { section: "activity", href: "/admin/activity", label: "Activity log", icon: History },
  { section: "settings", href: "/admin/settings", label: "Settings", icon: Settings },
  { section: "team", href: "/admin/team", label: "Team & roles", icon: ShieldCheck },
];

export function AdminShell({ children, user, brand, role }: { children: React.ReactNode; user: { name?: string | null; email?: string | null }; brand: string; role: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

  const nav = (
    <nav aria-label="Admin" className="flex-1 overflow-y-auto px-3 py-4">
      <ul className="space-y-0.5">
        {NAV.filter((n) => canAccess(role, n.section)).map(({ href, label, icon: Icon }) => (
          <li key={href}>
            <Link href={href} onClick={() => setOpen(false)} aria-current={isActive(href) ? "page" : undefined}
              className={cn("flex items-center gap-3 px-3 py-2.5 text-sm transition-colors", isActive(href) ? "bg-ink text-paper" : "text-neutral-600 hover:bg-neutral-100")}>
              <Icon className="h-4 w-4" strokeWidth={1.75} />{label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );

  return (
    <div data-admin className="min-h-screen bg-[#fafafa] font-sans text-sm text-ink">
      <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col border-r border-line bg-paper lg:flex">
        <div className="border-b border-line px-6 py-5"><Logo name={brand} size="sm" tone="deep" /><p className="text-[10px] uppercase tracking-[0.25em] text-muted">Admin</p></div>
        {nav}
        <div className="border-t border-line p-4">
          <p className="truncate text-xs font-medium">{user.name}</p><p className="truncate text-xs text-muted">{user.email} · {role.replace("_", " ")}</p>
          <div className="mt-3 flex gap-3 text-xs"><Link href="/" className="underline" target="_blank">View store</Link><button onClick={() => signOut({ callbackUrl: "/" })} className="flex items-center gap-1 underline"><LogOut className="h-3 w-3" />Sign out</button></div>
        </div>
      </aside>

      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-paper px-4 lg:hidden">
        <span className="flex items-center gap-2"><Logo name={brand} size="sm" tone="deep" /><span className="text-[10px] tracking-widest text-muted">ADMIN</span></span>
        <button aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} onClick={() => setOpen(!open)} className="p-2">{open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
      </header>
      {open && <div className="fixed inset-0 top-14 z-20 flex flex-col bg-paper lg:hidden">{nav}</div>}

      <main className="px-4 py-6 lg:ml-60 lg:px-8 lg:py-8">{children}</main>
    </div>
  );
}
