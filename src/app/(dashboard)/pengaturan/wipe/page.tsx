import { Suspense } from "react"
import WipeContent from "./components/wipe-content"
import LoadingSkeleton from "./components/loading-skeleton"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Wipe Data | Portal Administrasi Lingkungan St. Agatha",
  description: "Halaman untuk menghapus data dari database",
}

export default function WipeDataPage() {
  return (
    <div className="p-0 md:p-4">
      <Suspense fallback={<LoadingSkeleton />}>
        <WipeContent />
      </Suspense>
    </div>
  )
} 