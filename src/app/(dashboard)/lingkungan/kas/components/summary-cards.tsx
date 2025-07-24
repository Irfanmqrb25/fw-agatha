"use client"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ArrowDownCircle, ArrowUpCircle, Wallet, PiggyBank } from "lucide-react"

interface SummaryCardsProps {
  initialBalance: number;
  totalIncome: number;
  totalExpense: number;
  finalBalance: number;
}

export function SummaryCards({ 
  initialBalance, 
  totalIncome, 
  totalExpense, 
  finalBalance 
}: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="gap-2 bg-blue-50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Saldo Awal</CardTitle>
          <Wallet className="h-5 w-5 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">Rp {initialBalance.toLocaleString('id-ID')}</div>
        </CardContent>
      </Card>
      <Card className="gap-2 bg-green-50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pemasukan</CardTitle>
          <ArrowUpCircle className="h-5 w-5 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">Rp {totalIncome.toLocaleString('id-ID')}</div>
        </CardContent>
      </Card>
      <Card className="gap-2 bg-red-50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pengeluaran</CardTitle>
          <ArrowDownCircle className="h-5 w-5 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">Rp {totalExpense.toLocaleString('id-ID')}</div>
        </CardContent>
      </Card>
      <Card className="gap-2 bg-purple-50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Saldo Akhir</CardTitle>
          <PiggyBank className="h-5 w-5 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">Rp {finalBalance.toLocaleString('id-ID')}</div>
        </CardContent>
      </Card>
    </div>
  );
} 