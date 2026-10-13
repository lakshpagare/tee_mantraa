import Link from "next/link";
import { Img } from "@/components/ui/img";

export function AuthShell({ title, subtitle, children, footer }: { title: string; subtitle?: string; children: React.ReactNode; footer?: React.ReactNode }) {
  return (
    <div className="grid min-h-[80vh] lg:grid-cols-2">
      <div className="relative hidden bg-[#0a0a0a] lg:block">
        <Img src="/brand/logo-art.jpg" alt="tee-mantraa" sizes="50vw" className="absolute inset-0 h-full w-full" imgClassName="object-contain" />
      </div>
      <div className="flex items-center justify-center px-5 py-16">
        <div className="w-full max-w-md">
          <Link href="/" className="eyebrow mb-8 inline-block link-underline">← Back to store</Link>
          <h1 className="display text-5xl">{title}</h1>
          {subtitle && <p className="mt-3 text-sm text-muted">{subtitle}</p>}
          <div className="mt-10">{children}</div>
          {footer && <div className="mt-8 text-sm text-muted">{footer}</div>}
        </div>
      </div>
    </div>
  );
}
