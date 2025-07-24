import { Skeleton } from "@/components/ui/skeleton"

export default function LoadingSkeleton() {
  return (
    <div className="space-y-8 p-2">
      {/* Filter Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-40" />
        </div>
      </div>
      
      {/* Keuangan Lingkungan Skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-48" />
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          {Array(4).fill(null).map((_, i) => (
            <Skeleton key={`kl-${i}`} className="h-24 w-full" />
          ))}
        </div>
      </div>
      
      {/* Keuangan IKATA Skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-36" />
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          {Array(4).fill(null).map((_, i) => (
            <Skeleton key={`ki-${i}`} className="h-24 w-full" />
          ))}
        </div>
      </div>
      
      {/* Kesekretariatan Skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-40" />
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {Array(6).fill(null).map((_, i) => (
            <Skeleton key={`ks-${i}`} className="h-24 w-full" />
          ))}
        </div>
      </div>
      
      {/* Penunggak Skeleton */}
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-6 w-64" />
          <Skeleton className="h-10 w-40" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  )
} 