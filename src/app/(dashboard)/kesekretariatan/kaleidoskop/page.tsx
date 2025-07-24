import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { KaleidoskopContent } from "./components/kaleidoskop-content";
import { getKaleidoskopData, getRingkasanKegiatan } from "./actions";

// Komponen Loading Sederhana
function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-44" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-[400px] w-full" />
    </div>
  )
}

export default async function KaleidoskopPage() {
  // Default menampilkan semua data (tanpa filter tanggal)
  // Mengambil data dari server actions tanpa parameter tanggal
  const activityData = await getKaleidoskopData();
  const summaryData = await getRingkasanKegiatan();
  
  return (
    <div className="p-2 px-4">
      <Suspense fallback={<LoadingSkeleton />}>
        <KaleidoskopContent 
          activityData={activityData}
          summaryData={summaryData}
        />
      </Suspense>
    </div>
  )
} 