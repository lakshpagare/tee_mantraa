"use client";
import { useEffect } from "react";
import { Button, ButtonLink } from "@/components/ui/button";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <main id="main" className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p className="eyebrow mb-4">Something went wrong</p>
      <h1 className="display text-6xl md:text-8xl">We hit a snag</h1>
      <p className="mt-5 max-w-md text-sm text-muted">An unexpected error occurred. Please try again — if it keeps happening, contact support.</p>
      <div className="mt-10 flex gap-3"><Button onClick={reset}>Try again</Button><ButtonLink href="/" variant="outline">Home</ButtonLink></div>
    </main>
  );
}
