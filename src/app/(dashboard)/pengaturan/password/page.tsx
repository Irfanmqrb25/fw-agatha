import { Suspense } from "react"
import { Metadata } from "next"
import PasswordForm from "./components/password-form"
import LoadingSkeleton from "./components/loading-skeleton"

export const metadata: Metadata = {
  title: "Ganti Password | Portal Administrasi Lingkungan St. Agatha",
  description: "Halaman untuk mengubah password akun pengguna",
}

export default function GantiPasswordPage() {
  return (
    <div className="p-4 w-full">
      <h1 className="text-2xl font-bold mb-6">Ganti Password</h1>
      
      <div className="max-w-md mx-auto">
        <Suspense fallback={<LoadingSkeleton />}>
          <PasswordForm />
        </Suspense>
      </div>
    </div>
  )
} 