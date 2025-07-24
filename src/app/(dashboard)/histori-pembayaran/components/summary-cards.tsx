"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatRupiah } from "../utils"
import { Wallet, Users } from "lucide-react"

interface SummaryCardsProps {
  danaMandiriTotal: number
  danaMandiriCount: number
  ikataTotal: number
  ikataCount: number
}

export function SummaryCards({ 
  danaMandiriTotal, 
  danaMandiriCount, 
  ikataTotal, 
  ikataCount 
}: SummaryCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 gap-0">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Dana Mandiri</CardTitle>
          <Wallet className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatRupiah(danaMandiriTotal)}</div>
          <p className="text-xs text-muted-foreground">
            Total pembayaran Dana Mandiri yang sudah disetor ({danaMandiriCount} transaksi)
          </p>
        </CardContent>
      </Card>
      <Card className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800 gap-0">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">IKATA</CardTitle>
          <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatRupiah(ikataTotal)}</div>
          <p className="text-xs text-muted-foreground">
            Total pembayaran IKATA yang sudah lunas ({ikataCount} transaksi)
          </p>
        </CardContent>
      </Card>
    </div>
  )
} 