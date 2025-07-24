// components/ulang-tahun/SkeletonTable.tsx
import { Skeleton } from "@/components/ui/skeleton";

export function SkeletonTable() {
  return (
    <div className="border rounded-md w-full">
      <div className="p-4">
        <Skeleton className="h-6 w-32 mb-4" />
        <div className="grid grid-cols-4 gap-4 mb-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="grid grid-cols-4 gap-4 mb-2">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
