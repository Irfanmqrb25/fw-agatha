import { Skeleton } from "@/components/ui/skeleton"

export const LoadingSkeleton = () => (
  <div className="space-y-4">
    <div className="flex items-center space-x-4">
      <Skeleton className="h-10 w-[300px]" />
      <Skeleton className="h-10 w-[180px]" />
    </div>
    <div className="rounded-md border">
      <div className="p-4 space-y-4">
        {Array(5).fill(null).map((_, i) => (
          <div key={i} className="flex items-center justify-between">
            <Skeleton className="h-5 w-[100px]" />
            <Skeleton className="h-5 w-[200px]" />
            <Skeleton className="h-5 w-[100px]" />
            <Skeleton className="h-5 w-[100px]" />
            <Skeleton className="h-5 w-[100px]" />
            <Skeleton className="h-10 w-[80px]" />
          </div>
        ))}
      </div>
    </div>
  </div>
) 