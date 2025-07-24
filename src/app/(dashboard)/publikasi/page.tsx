import { Suspense } from "react"
import PublikasiContent from "./components/publikasi-content"
import { LoadingSkeleton } from "./components/loading-skeleton"

export default function PublikasiPage() {
  return (
    <div className="p-2">
      <h1 className="text-xl font-bold md:px-2">Publikasi</h1>
      <Suspense fallback={<LoadingSkeleton />}>
        <PublikasiContent />
      </Suspense>
    </div>
  )
} 