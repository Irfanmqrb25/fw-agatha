"use client";

import { useState } from "react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";

interface PeriodeSelectorProps {
  bulan: string;
  setBulan: (value: string) => void;
  tahun: string;
  setTahun: (value: string) => void;
  onFilter: () => void;
}

export function PeriodeSelector({
  bulan,
  setBulan,
  tahun,
  setTahun,
  onFilter,
}: PeriodeSelectorProps) {
  const namaBulan = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  // Mendapatkan tahun saat ini dan rentang -5 sampai +5 tahun
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => (currentYear - 5 + i).toString());

  return (
    <div className="grid gap-4 mb-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Filter Bulan */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Bulan</label>
          <Select value={bulan} onValueChange={setBulan}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Pilih Bulan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Bulan</SelectItem>
              {namaBulan.map((namabulan, index) => (
                <SelectItem key={index} value={index.toString()}>
                  {namabulan}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Filter Tahun */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Tahun</label>
          <Select value={tahun} onValueChange={setTahun}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Pilih Tahun" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Tahun</SelectItem>
              {years.map((year) => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={onFilter} className="flex items-center gap-1.5">
          <Calendar className="h-4 w-4" />
          Terapkan Filter
        </Button>
      </div>
    </div>
  );
} 