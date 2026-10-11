import type { Metadata } from "next";
import { CompareView } from "@/components/product/compare-view";

export const metadata: Metadata = { title: "Compare", robots: { index: false } };
export default function ComparePage() {
  return (
    <div className="container-wide pb-10 pt-10 md:pt-16">
      <p className="eyebrow mb-3">Side by side</p>
      <h1 className="display mb-10 text-5xl md:text-7xl">Compare</h1>
      <CompareView />
    </div>
  );
}
