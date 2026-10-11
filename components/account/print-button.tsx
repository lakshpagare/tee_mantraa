"use client";
import { Printer } from "lucide-react";

export function PrintButton() {
  return (
    <button onClick={() => window.print()} className="no-print inline-flex h-11 items-center gap-2 bg-ink px-6 text-[11px] font-medium uppercase tracking-[0.2em] text-paper">
      <Printer className="h-4 w-4" />Print / Save as PDF
    </button>
  );
}
