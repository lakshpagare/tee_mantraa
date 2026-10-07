import Link from "next/link";
import { Facebook, Instagram, Truck, RefreshCw, ShieldCheck, Youtube } from "lucide-react";
import { NewsletterForm } from "@/components/layout/newsletter-form";
import { formatINR } from "@/lib/utils";
import type { SiteSettingsDTO } from "@/types";

const COLS = [
  { title: "Shop", links: [["New Arrivals", "/shop?new=1"], ["Men", "/shop?gender=men"], ["Women", "/shop?gender=women"], ["Shirts", "/shop?category=shirts"], ["T-Shirts", "/shop?category=t-shirts"], ["Hoodies", "/shop?category=hoodies"], ["Jeans", "/shop?category=jeans"], ["Sale", "/shop?sale=1"]] },
  { title: "Help", links: [["Contact", "/contact"], ["Shipping", "/shipping"], ["Returns", "/returns"], ["FAQ", "/faq"], ["Size Guide", "/size-guide"]] },
  { title: "Company", links: [["About", "/about"], ["Our Story", "/our-story"], ["Careers", "/careers"]] },
  { title: "Legal", links: [["Privacy Policy", "/privacy-policy"], ["Terms", "/terms"], ["Refund Policy", "/refund-policy"]] },
];

export function Footer({ settings, content }: { settings: SiteSettingsDTO; content: { about: string; copyright: string } }) {
  const social = [
    { href: settings.instagram, label: "Instagram", Icon: Instagram },
    { href: settings.facebook, label: "Facebook", Icon: Facebook },
    { href: settings.youtube, label: "YouTube", Icon: Youtube },
  ];
  return (
    <footer className="mt-24 border-t border-line bg-soft">
      <div className="border-b border-line">
        <div className="container-wide grid gap-6 py-8 text-xs uppercase tracking-[0.16em] md:grid-cols-3">
          <p className="flex items-center gap-3"><Truck className="h-5 w-5" strokeWidth={1.25} />Free shipping over {formatINR(settings.freeShippingThreshold)}</p>
          <p className="flex items-center gap-3"><RefreshCw className="h-5 w-5" strokeWidth={1.25} />7-day easy returns</p>
          <p className="flex items-center gap-3"><ShieldCheck className="h-5 w-5" strokeWidth={1.25} />100% secure payments</p>
        </div>
      </div>

      <div className="container-wide grid gap-12 py-16 lg:grid-cols-[1.2fr_2fr_1.3fr]">
        <div>
          <p className="font-display text-3xl tracking-[0.18em]">{settings.brandName}</p>
          <p className="mt-1 font-display text-lg italic text-muted">{settings.tagline}</p>
          <p className="mt-5 max-w-xs text-sm text-muted">{content.about}</p>
          <div className="mt-6 flex gap-3">
            {social.map(({ href, label, Icon }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="flex h-10 w-10 items-center justify-center rounded-full border border-line transition-colors hover:border-ink hover:bg-ink hover:text-white">
                <Icon className="h-4 w-4" strokeWidth={1.5} />
              </a>
            ))}
          </div>
        </div>

        <nav aria-label="Footer" className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {COLS.map((c) => (
            <div key={c.title}>
              <p className="eyebrow mb-4 !text-ink">{c.title}</p>
              <ul className="space-y-2.5">
                {c.links.map(([label, href]) => (
                  <li key={label}><Link href={href} className="link-underline text-sm text-muted transition-colors hover:text-ink">{label}</Link></li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div>
          <p className="eyebrow mb-4 !text-ink">Let's get in touch</p>
          <p className="mb-2 text-sm text-muted">Join for early access to drops and private offers.</p>
          <NewsletterForm />
          <p className="mt-2 text-xs text-muted">{settings.contactEmail} · {settings.contactPhone}</p>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="container-wide flex flex-col items-center justify-between gap-4 py-6 text-xs text-muted md:flex-row">
          <p>© {new Date().getFullYear()} {settings.brandName}. {content.copyright}</p>
          <ul className="flex flex-wrap items-center gap-2" aria-label="Accepted payments">
            {["VISA", "Mastercard", "RuPay", "UPI", "Razorpay", "COD"].map((p) => (
              <li key={p} className="border border-line bg-white px-2.5 py-1 text-[10px] font-medium tracking-wider text-ink">{p}</li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
