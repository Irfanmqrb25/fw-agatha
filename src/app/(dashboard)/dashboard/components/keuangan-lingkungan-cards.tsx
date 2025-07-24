import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { KeuanganLingkunganSummary } from "../types"
import { formatRupiah } from "../utils"
import { Wallet, ArrowDownCircle, ArrowUpCircle, WalletCards } from "lucide-react"

interface KeuanganLingkunganCardsProps {
  data: KeuanganLingkunganSummary
}

export function KeuanganLingkunganCards({ data }: KeuanganLingkunganCardsProps) {
  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
      <Card className="bg-blue-50">
        <CardHeader className="pb-2 flex flex-row items-center gap-3">
          <Wallet className="w-7 h-7 text-blue-500" />
          <div>
            <CardDescription>Saldo Awal</CardDescription>
            <CardTitle className="text-xl text-blue-600">{formatRupiah(data.saldoAwal)}</CardTitle>
          </div>
        </CardHeader>
      </Card>
      <Card className="bg-green-50">
        <CardHeader className="pb-2 flex flex-row items-center gap-3">
          <ArrowDownCircle className="w-7 h-7 text-green-500" />
          <div>
            <CardDescription>Pemasukan</CardDescription>
            <CardTitle className="text-xl text-green-600">{formatRupiah(data.totalPemasukan)}</CardTitle>
          </div>
        </CardHeader>
      </Card>
      <Card className="bg-red-50">
        <CardHeader className="pb-2 flex flex-row items-center gap-3">
          <ArrowUpCircle className="w-7 h-7 text-red-500" />
          <div>
            <CardDescription>Pengeluaran</CardDescription>
            <CardTitle className="text-xl text-red-600">{formatRupiah(data.totalPengeluaran)}</CardTitle>
          </div>
        </CardHeader>
      </Card>
      <Card className="bg-purple-50">
        <CardHeader className="pb-2 flex flex-row items-center gap-3">
          <WalletCards className="w-7 h-7 text-purple-500" />
          <div>
            <CardDescription>Saldo Akhir</CardDescription>
            <CardTitle className="text-xl text-purple-600">{formatRupiah(data.saldoAkhir)}</CardTitle>
          </div>
        </CardHeader>
      </Card>
    </div>
  )
} 