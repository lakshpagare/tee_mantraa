"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  BarChart3, Boxes, ClipboardList, FolderTree, Home, Image as ImageIcon, Layers, LayoutDashboard, LogOut, Mail, Menu, MessageSquareQuote,
  Package, Settings, Star, Tag, Users, X, type LucideIcon,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const NAV: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/orders", label: "Orders", icon: ClipboardList },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/inventory", label: "Inventory", icon: Boxes },
  { href: "/admin/coupons", label: "Coupons", icon: Tag },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
  { href: "/admin/homepage", label: "Homepage", icon: Home },
  { href: "/admin/collections", label: "Collections", icon: Layers },
  { href: "/admin/banners", label: "Banners", icon: ImageIcon },
  { href: "/admin/testimonials", label: "Testimonials", icon: MessageSquareQuote },
  { href: "/admin/newsletter", label: "Newsletter", icon: Mail },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminShell({ children, user, brand }: { children: React.ReactNode; user: { name?: string | null; email?: string | null }; brand: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

  const nav = (
    <nav aria-label="Admin" className="flex-1 overflow-y-auto px-3 py-4">
      <ul className="space-y-0.5">
        {NAV.map(({ href, label, icon: Icon }) => (
          <li key={href}>
            <Link href={href} onClick={() => setOpen(false)} aria-current={isActive(href) ? "page" : undefined}
              className={cn("flex items-center gap-3 px-3 py-2.5 text-sm transition-colors", isActive(href) ? "bg-ink text-white" : "text-neutral-600 hover:bg-neutral-100")}>
              <Icon className="h-4 w-4" strokeWidth={1.75} />{label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans text-sm text-ink">
      <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col border-r border-line bg-white lg:flex">
        <div className="border-b border-line px-6 py-5"><p className="font-display text-xl tracking-[0.18em]">{brand}</p><p className="text-[10px] uppercase tracking-[0.25em] text-muted">Admin</p></div>
        {nav}
        <div className="border-t border-line p-4">
          <p className="truncate text-xs font-medium">{user.name}</p><p className="truncate text-xs text-muted">{user.email}</p>
          <div className="mt-3 flex gap-3 text-xs"><Link href="/" className="underline" target="_blank">View store</Link><button onClick={() => signOut({ callbackUrl: "/" })} className="flex items-center gap-1 underline"><LogOut className="h-3 w-3" />Sign out</button></div>
        </div>
      </aside>

      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-white px-4 lg:hidden">
        <p className="font-display text-lg tracking-[0.18em]">{brand} <span className="text-[10px] tracking-widest text-muted">ADMIN</span></p>
        <button aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} onClick={() => setOpen(!open)} className="p-2">{open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
      </header>
      {open && <div className="fixed inset-0 top-14 z-20 flex flex-col bg-white lg:hidden">{nav}</div>}

      <main className="px-4 py-6 lg:ml-60 lg:px-8 lg:py-8">{children}</main>
    </div>
  );
}
