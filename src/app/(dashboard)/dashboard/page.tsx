import { Suspense } from "react"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import DashboardContent from "./components/dashboard-content"
import LoadingSkeleton from "./components/loading-skeleton"
import { 
  getKeuanganLingkunganData, 
  getKeuanganIkataData,
  getKesekretariatanData,
  getPenunggakDanaMandiriData,
  getPenunggakIkataData,
  debugIkataTransactions
} from "./actions"
import { getMonthFromQuery, getYearFromQuery } from "./utils"

// Definisikan tipe untuk props halaman
interface DashboardPageProps {
  searchParams: Promise<{
    month?: string;
    year?: string;
  }>;
}

// Pastikan halaman selalu mengambil data terbaru
export const revalidate = 0;
export const dynamic = 'force-dynamic';

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  // Ambil parameter bulan dan tahun dari search params
  const params = await searchParams;
  const month = getMonthFromQuery(params.month);
  const year = getYearFromQuery(params.year);

  // Ambil data session untuk mendapatkan role user
  const session = await getServerSession(authOptions);
  const userRole = session?.user?.role || "UMAT";

  // Ambil data untuk dashboard dengan server actions
  const [
    keuanganLingkunganData,
    keuanganIkataData,
    kesekretariatanData,
    penunggakDanaMandiri,
    penunggakIkata
  ] = await Promise.all([
    getKeuanganLingkunganData(month, year),
    getKeuanganIkataData(month, year),
    getKesekretariatanData(month, year),
    getPenunggakDanaMandiriData(),
    getPenunggakIkataData()
  ]);

  return (
    <div className="p-2">
      <h1 className="text-2xl font-bold md:px-2 mb-6">Dashboard</h1>
      <Suspense fallback={<LoadingSkeleton />}>
        <DashboardContent
          keuanganLingkunganData={keuanganLingkunganData}
          keuanganIkataData={keuanganIkataData}
          kesekretariatanData={kesekretariatanData}
          penunggakDanaMandiri={penunggakDanaMandiri}
          penunggakIkata={penunggakIkata}
          userRole={userRole}
        />
      </Suspense>
    </div>
  )
}