import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingSkeleton() {
    return (
        <div className="space-y-6">
            {/* Skeleton untuk Card Statistik */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-[110px] w-full rounded-xl" />
                ))}
            </div>
            
            {/* Skeleton untuk Filter */}
            <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4">
                <Skeleton className="h-10 w-[200px] rounded-md" />
                <Skeleton className="h-10 w-[180px] rounded-md" />
            </div>
            
            {/* Skeleton untuk Tabel */}
            <div className="rounded-md border">
                <div className="p-4">
                    <Skeleton className="h-10 w-full rounded-md mb-4" />
                    <div className="space-y-2">
                        {[...Array(5)].map((_, i) => (
                            <Skeleton key={i} className="h-16 w-full rounded-md" />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}