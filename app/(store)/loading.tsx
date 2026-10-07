import { Skeleton, ProductGridSkeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container-wide py-16" aria-busy="true" aria-label="Loading">
      <Skeleton className="mb-3 h-3 w-24" />
      <Skeleton className="mb-12 h-12 w-72" />
      <ProductGridSkeleton count={8} />
    </div>
  );
}
