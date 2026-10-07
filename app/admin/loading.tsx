import { TableSkeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return <div className="border border-line bg-white" aria-busy="true"><TableSkeleton rows={10} cols={5} /></div>;
}
