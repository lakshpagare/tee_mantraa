import Link from "next/link";
import { Img } from "@/components/ui/img";

export function AuthShell({ title, subtitle, children, footer }: { title: string; subtitle?: string; children: React.ReactNode; footer?: React.ReactNode }) {
  return (
    <div className="grid min-h-[80vh] lg:grid-cols-2">
      <div className="relative hidden lg:block">
        <Img src="/images/editorial/story.svg" alt="" sizes="50vw" priority className="absolute inset-0 h-full w-full" />
        <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/50 to-transparent p-14 text-white">
          <p className="display max-w-md text-6xl">Defined by <em className="font-light">Style.</em></p>
        </div>
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
