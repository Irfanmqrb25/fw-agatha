'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { IKATASummary } from '../types';
import { formatCurrency } from '@/lib/utils';
import { Wallet, ArrowUpCircle, ArrowDownCircle, PiggyBank } from 'lucide-react';

interface SummaryCardsProps {
  summary: IKATASummary;
}

export function SummaryCards({ summary }: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
      <Card className="gap-0 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Saldo Awal</CardTitle>
          <Wallet className="h-5 w-5 text-blue-600" />
        </CardHeader>
        <CardContent>
          <p className="text-xl sm:text-2xl font-bold">{formatCurrency(summary.saldoAwal)}</p>
        </CardContent>
      </Card>
      <Card className="gap-0 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pemasukan</CardTitle>
          <ArrowUpCircle className="h-5 w-5 text-green-600" />
        </CardHeader>
        <CardContent>
          <p className="text-xl sm:text-2xl font-bold text-green-600">{formatCurrency(summary.pemasukan)}</p>
        </CardContent>
      </Card>
      <Card className="gap-0 bg-gradient-to-br from-red-50 to-red-100 border-red-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pengeluaran</CardTitle>
          <ArrowDownCircle className="h-5 w-5 text-red-600" />
        </CardHeader>
        <CardContent>
          <p className="text-xl sm:text-2xl font-bold text-red-600">{formatCurrency(summary.pengeluaran)}</p>
        </CardContent>
      </Card>
      <Card className="gap-0 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Saldo Akhir</CardTitle>
          <PiggyBank className="h-5 w-5 text-purple-600" />
        </CardHeader>
        <CardContent>
          <p className="text-xl sm:text-2xl font-bold">{formatCurrency(summary.saldoAkhir)}</p>
        </CardContent>
      </Card>
    </div>
  );
} 