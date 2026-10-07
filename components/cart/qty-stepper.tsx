"use client";
import { Minus, Plus } from "lucide-react";

export function QtyStepper({ value, max, onChange }: { value: number; max: number; onChange: (n: number) => void }) {
  return (
    <div className="inline-flex items-center border border-line">
      <button type="button" aria-label="Decrease quantity" onClick={() => onChange(value - 1)} disabled={value <= 1} className="h-9 w-9 hover:bg-soft disabled:opacity-40"><Minus className="mx-auto h-3 w-3" /></button>
      <span className="w-8 text-center text-sm" aria-live="polite">{value}</span>
      <button type="button" aria-label="Increase quantity" onClick={() => onChange(value + 1)} disabled={value >= max} className="h-9 w-9 hover:bg-soft disabled:opacity-40"><Plus className="mx-auto h-3 w-3" /></button>
    </div>
  );
}
