'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PeriodFilter as PeriodFilterType } from '../types';

interface PeriodFilterProps {
  period: PeriodFilterType;
  onPeriodChange: (period: PeriodFilterType) => void;
}

export function PeriodFilter({ period, onPeriodChange }: PeriodFilterProps) {
  // Mendapatkan tahun saat ini
  const currentYear = new Date().getFullYear();
  
  // Membuat array tahun dari 5 tahun ke belakang sampai 5 tahun ke depan
  const startYear = currentYear - 5;
  const endYear = currentYear + 5;
  const years = Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);
  
  return (
    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
      <Select
        value={period.bulan.toString()}
        onValueChange={(value) => onPeriodChange({ ...period, bulan: parseInt(value) })}
      >
        <SelectTrigger className="w-full sm:w-[120px] md:w-[180px]">
          <SelectValue placeholder="Pilih Bulan" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="0">Semua Bulan</SelectItem>
          {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
            <SelectItem key={month} value={month.toString()}>
              {new Date(2000, month - 1).toLocaleString('id-ID', { month: 'long' })}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={period.tahun.toString()}
        onValueChange={(value) => onPeriodChange({ ...period, tahun: parseInt(value) })}
      >
        <SelectTrigger className="w-full sm:w-[120px] md:w-[180px]">
          <SelectValue placeholder="Pilih Tahun" />
        </SelectTrigger>
        <SelectContent>
          {years.map((year) => (
            <SelectItem key={year} value={year.toString()}>
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
} 