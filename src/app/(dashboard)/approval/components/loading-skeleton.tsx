import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Skeleton untuk Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-[110px] w-full rounded-xl" />
        ))}
      </div>
      
      {/* Skeleton untuk Tabs */}
      <div className="space-y-4">
        <Skeleton className="h-12 w-[300px] rounded-md" />
        
        <div className="space-y-4">
          <Skeleton className="h-[60px] w-full rounded-md" />
          
          {/* Skeleton untuk Filter */}
          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4 mb-4">
            <Skeleton className="h-10 w-[200px] rounded-md" />
            <Skeleton className="h-10 w-[150px] rounded-md" />
          </div>
          
          {/* Skeleton untuk Tabel */}
          <div className="border rounded-md p-4 space-y-4">
            <Skeleton className="h-8 w-full rounded-md" />
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-md" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 