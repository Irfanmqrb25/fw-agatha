"use client";

import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { BarChart2, ChartPie, Calendar, Users } from "lucide-react";

interface RingkasanCardProps {
  totalKegiatan: number;
  totalJenisIbadat: number;
  totalSubIbadat?: number;
  periodeLabel: string;
}

export function RingkasanCard({ 
  totalKegiatan, 
  totalJenisIbadat, 
  totalSubIbadat = 0,
  periodeLabel 
}: RingkasanCardProps) {
  // Format angka dengan pemisah ribuan
  const formatNumber = (num: number): string => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-sm">
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-blue-700">{formatNumber(totalKegiatan)}</div>
              <div className="text-xs font-medium text-blue-600 mt-0.5">Total Kegiatan</div>
              <div className="text-xs text-blue-500 mt-0.5">Jumlah pertemuan doling</div>
            </div>
            <div className="p-2 bg-blue-200 rounded-full">
              <Calendar className="h-5 w-5 text-blue-700" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-sm">
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-purple-700">{formatNumber(totalJenisIbadat)}</div>
              <div className="text-xs font-medium text-purple-600 mt-0.5">Jenis Ibadat</div>
              <div className="text-xs text-purple-500 mt-0.5">Ragam kategori ibadat</div>
            </div>
            <div className="p-2 bg-purple-200 rounded-full">
              <ChartPie className="h-5 w-5 text-purple-700" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-rose-50 to-rose-100 border-rose-200 shadow-sm">
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-rose-700">{formatNumber(totalSubIbadat)}</div>
              <div className="text-xs font-medium text-rose-600 mt-0.5">Sub Ibadat</div>
              <div className="text-xs text-rose-500 mt-0.5">Variasi sub kegiatan ibadat</div>
            </div>
            <div className="p-2 bg-rose-200 rounded-full">
              <BarChart2 className="h-5 w-5 text-rose-700" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 shadow-sm">
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-medium text-emerald-700">Periode Data</div>
              <div className="text-sm font-bold text-emerald-800 mt-0.5">{periodeLabel}</div>
              <div className="text-xs text-emerald-600 mt-0.5">Rentang waktu yang dipilih</div>
            </div>
            <div className="p-2 bg-emerald-200 rounded-full">
              <Users className="h-5 w-5 text-emerald-700" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 