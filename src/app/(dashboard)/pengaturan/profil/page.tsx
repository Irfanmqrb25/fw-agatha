import { Suspense } from "react"
import { Metadata } from "next"
import ProfileContent from "./components/profile-content"
import LoadingSkeleton from "./components/loading-skeleton"

// Metadata halaman
export const metadata: Metadata = {
  title: "Profil - Portal Administrasi Lingkungan St. Agatha",
  description: "Pengaturan data Kepala Keluarga, Pasangan, dan Tanggungan"
}

export default function ProfilPage() {
  return (
    <div className="p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Profil</h1>
        <p className="text-muted-foreground">
          Pengaturan data Kepala Keluarga, Pasangan, dan Tanggungan
        </p>
      </div>
      <Suspense fallback={<LoadingSkeleton />}>
        <ProfileContent />
      </Suspense>
    </div>
  )
} 