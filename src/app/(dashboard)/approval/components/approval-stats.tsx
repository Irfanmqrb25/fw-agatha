"use client"

import { ApprovalStats as ApprovalStatsType } from "../types"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import {
  FileText,
  Clock,
  CheckCircle2,
  Wallet2,
} from "lucide-react"

interface ApprovalStatsProps {
  stats: ApprovalStatsType
}

export function ApprovalStats({ stats }: ApprovalStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Permohonan */}
      <Card className="gap-0 bg-blue-50 border-blue-200">
        <CardHeader className="pb-2 flex flex-row items-center gap-2">
          <div className="rounded-full bg-blue-100 p-2 mr-2">
            <FileText className="h-6 w-6 text-blue-500" />
          </div>
          <div>
            <CardTitle className="text-sm font-medium">Total Permohonan</CardTitle>
            <CardDescription>Jumlah keseluruhan</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-700">{stats.total}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.pending} menunggu persetujuan
          </p>
        </CardContent>
      </Card>
      
      {/* Menunggu Persetujuan */}
      <Card className="gap-0 bg-yellow-50 border-yellow-200">
        <CardHeader className="pb-2 flex flex-row items-center gap-2">
          <div className="rounded-full bg-yellow-100 p-2 mr-2">
            <Clock className="h-6 w-6 text-yellow-600" />
          </div>
          <div>
            <CardTitle className="text-sm font-medium">Menunggu Persetujuan</CardTitle>
            <CardDescription>Butuh tindakan</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.total > 0 ? Math.round((stats.pending / stats.total) * 100) : 0}% dari total
          </p>
        </CardContent>
      </Card>
      
      {/* Disetujui */}
      <Card className="gap-0 bg-green-50 border-green-200">
        <CardHeader className="pb-2 flex flex-row items-center gap-2">
          <div className="rounded-full bg-green-100 p-2 mr-2">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <CardTitle className="text-sm font-medium">Disetujui</CardTitle>
            <CardDescription>Telah diintegrasikan</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.thisMonthApproved} bulan ini
          </p>
        </CardContent>
      </Card>
      
      {/* Total Pemasukan */}
      <Card className="gap-0 bg-emerald-50 border-emerald-200">
        <CardHeader className="pb-2 flex flex-row items-center gap-2">
          <div className="rounded-full bg-emerald-100 p-2 mr-2">
            <Wallet2 className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <CardTitle className="text-sm font-medium">Total Pemasukan</CardTitle>
            <CardDescription>Yang telah disetujui</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-emerald-700">Rp {stats.totalAmount.toLocaleString('id-ID')}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Rp {stats.thisMonthAmount.toLocaleString('id-ID')} bulan ini
          </p>
        </CardContent>
      </Card>
    </div>
  )
} 