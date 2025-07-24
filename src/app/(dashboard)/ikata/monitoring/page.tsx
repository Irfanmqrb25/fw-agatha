import { getDelinquentPayments } from "./utils/monitoring-service";
import { DelinquentPayment } from "./types";
import MonitoringClient from "./components/monitoring-client";

interface MonitoringPenunggakPageProps {
  searchParams: Promise<{
    year?: string;
  }>;
}

export default async function MonitoringPenunggakPage({ 
  searchParams 
}: MonitoringPenunggakPageProps) {
  // Await searchParams untuk kompatibilitas Next.js 15
  const resolvedSearchParams = await searchParams;
  
  // Ambil tahun dari searchParams atau gunakan tahun saat ini
  const year = resolvedSearchParams.year ? parseInt(resolvedSearchParams.year) : new Date().getFullYear();
  
  // Mendapatkan data penunggak iuran
  const delinquentPayments: DelinquentPayment[] = await getDelinquentPayments(year);
  
  return <MonitoringClient delinquentPayments={delinquentPayments} />;
} 