import { Suspense } from "react"
import HistoriPembayaranContent from "./components/histori-pembayaran-content"
import LoadingSkeleton from "./components/loading-skeleton"

export default function HistoriPembayaranPage() {
  return (
    <div className="p-2 md:p-4">
      <Suspense fallback={<LoadingSkeleton />}>
        <HistoriPembayaranContent />
      </Suspense>
    </div>
  )
} 