import { Suspense } from "react"
import DanaMandiriContent from "./components/dana-mandiri-content"
import LoadingSkeleton from "./components/loading-skeleton"

export default function DanaMandiriPage() {
  return (
    <div className="p-2 md:p-4">
      <Suspense fallback={<LoadingSkeleton />}>
        <DanaMandiriContent />
      </Suspense>
    </div>
  )
} 