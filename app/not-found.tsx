import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main id="main" className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p className="eyebrow mb-4">Error 404</p>
      <h1 className="display text-7xl md:text-9xl">Lost in style</h1>
      <p className="mt-5 max-w-md text-sm text-muted">The page you're looking for has moved or doesn't exist. Let's get you back to something beautiful.</p>
      <div className="mt-10 flex gap-3"><ButtonLink href="/">Home</ButtonLink><ButtonLink href="/shop" variant="outline">Shop all</ButtonLink></div>
    </main>
  );
}
