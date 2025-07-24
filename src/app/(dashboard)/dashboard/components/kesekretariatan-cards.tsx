import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { KesekretariatanSummary } from "../types"
import { formatPercentage, formatDate } from "../utils"
import { Users, User, UserPlus, UserMinus, HeartPulse, Percent } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface KesekretariatanCardsProps {
  data: KesekretariatanSummary
}

export function KesekretariatanCards({ data }: KesekretariatanCardsProps) {
  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      <Card className="bg-blue-100">
        <CardHeader className="pb-2 flex flex-row items-center gap-3">
          <Users className="w-7 h-7 text-blue-700" />
          <div>
            <CardDescription className="text-blue-900">Total Kepala Keluarga</CardDescription>
            <CardTitle className="text-xl text-blue-800">{data.totalKepalaKeluarga}</CardTitle>
          </div>
        </CardHeader>
      </Card>
      <Card className="bg-indigo-100">
        <CardHeader className="pb-2 flex flex-row items-center gap-3">
          <User className="w-7 h-7 text-indigo-700" />
          <div>
            <CardDescription className="text-indigo-900">Jumlah Jiwa</CardDescription>
            <CardTitle className="text-xl text-indigo-800">{data.jumlahJiwa}</CardTitle>
          </div>
        </CardHeader>
      </Card>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Card className="bg-green-100 cursor-help">
              <CardHeader className="pb-2 flex flex-row items-center gap-3">
                <UserPlus className="w-7 h-7 text-green-700" />
                <div>
                  <CardDescription className="text-green-900">KK Bergabung</CardDescription>
                  <CardTitle className="text-xl text-green-800">{data.kkBergabung}</CardTitle>
                </div>
              </CardHeader>
            </Card>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs p-2 text-gray-700 bg-white shadow-lg rounded-md">
            <div className="font-medium text-sm mb-1">Daftar Keluarga Bergabung:</div>
            {data.detailKKBergabung.length > 0 ? (
              <ul className="text-xs space-y-1">
                {data.detailKKBergabung.map((kk) => (
                  <li key={kk.id} className="flex justify-between">
                    <span>{kk.nama}</span>
                    <span className="text-gray-500 ml-2">{formatDate(new Date(kk.tanggal))}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-xs text-gray-500">Tidak ada data</div>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Card className="bg-amber-100 cursor-help">
              <CardHeader className="pb-2 flex flex-row items-center gap-3">
                <UserMinus className="w-7 h-7 text-amber-700" />
                <div>
                  <CardDescription className="text-amber-900">KK Pindah</CardDescription>
                  <CardTitle className="text-xl text-amber-800">{data.kkPindah}</CardTitle>
                </div>
              </CardHeader>
            </Card>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs p-2 text-gray-700 bg-white shadow-lg rounded-md">
            <div className="font-medium text-sm mb-1">Daftar Keluarga Pindah:</div>
            {data.detailKKPindah.length > 0 ? (
              <ul className="text-xs space-y-1">
                {data.detailKKPindah.map((kk) => (
                  <li key={kk.id} className="flex justify-between">
                    <span>{kk.nama}</span>
                    <span className="text-gray-500 ml-2">{formatDate(new Date(kk.tanggal))}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-xs text-gray-500">Tidak ada data</div>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Card className="bg-red-100 cursor-help">
              <CardHeader className="pb-2 flex flex-row items-center gap-3">
                <HeartPulse className="w-7 h-7 text-red-700" />
                <div>
                  <CardDescription className="text-red-900">Umat Meninggal Dunia</CardDescription>
                  <CardTitle className="text-xl text-red-800">{data.umatMeninggalDunia}</CardTitle>
                </div>
              </CardHeader>
            </Card>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs p-2 text-gray-700 bg-white shadow-lg rounded-md">
            <div className="font-medium text-sm mb-1">Daftar Umat Meninggal Dunia:</div>
            {data.detailUmatMeninggal.length > 0 ? (
              <ul className="text-xs space-y-1">
                {data.detailUmatMeninggal.map((umat) => (
                  <li key={umat.id} className="flex justify-between">
                    <span>
                      {umat.nama} <span className="text-gray-500">({umat.statusKeluarga})</span>
                    </span>
                    <span className="text-gray-500 ml-2">{formatDate(new Date(umat.tanggal))}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-xs text-gray-500">Tidak ada data</div>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <Card className="bg-purple-100">
        <CardHeader className="pb-2 flex flex-row items-center gap-3">
          <Percent className="w-7 h-7 text-purple-700" />
          <div>
            <CardDescription className="text-purple-900">Tingkat Partisipasi Umat</CardDescription>
            <CardTitle className="text-xl text-purple-800">{formatPercentage(data.tingkatPartisipasiUmat)}</CardTitle>
          </div>
        </CardHeader>
      </Card>
    </div>
  )
} 