"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "../utils"
import { DollarSign, UserCheck, UserX } from "lucide-react"

interface SummaryCardsProps {
  totalCollected: number
  paidCount: number
  unpaidCount: number
}

export function SummaryCards({
  totalCollected,
  paidCount,
  unpaidCount
}: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="gap-2 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Jumlah Iuran Terkumpul</CardTitle>
          <DollarSign className="h-5 w-5 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalCollected)}</div>
        </CardContent>
      </Card>
      
      <Card className="gap-2 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Jumlah KK Lunas</CardTitle>
          <UserCheck className="h-5 w-5 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{paidCount} KK</div>
        </CardContent>
      </Card>
      
      <Card className="gap-2 bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Jumlah KK Belum Lunas</CardTitle>
          <UserX className="h-5 w-5 text-amber-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{unpaidCount} KK</div>
        </CardContent>
      </Card>
    </div>
  )
} 