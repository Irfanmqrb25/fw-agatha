import { ChangeEvent } from 'react';
import { PeriodFilter as Period } from '../types';

interface PeriodSelectorProps {
  period: Period;
  onChange: (period: Period) => void;
}

export function PeriodSelector({ period, onChange }: PeriodSelectorProps) {
  // Mendapatkan bulan dan tahun saat ini
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1; // 1-12
  const currentYear = currentDate.getFullYear();

  // Menetapkan nilai awal jika period kosong
  if (!period.bulan && !period.tahun) {
    onChange({ bulan: currentMonth, tahun: currentYear });
  }

  // Array bulan untuk dropdown
  const months = [
    { value: 1, label: 'Januari' },
    { value: 2, label: 'Februari' },
    { value: 3, label: 'Maret' },
    { value: 4, label: 'April' },
    { value: 5, label: 'Mei' },
    { value: 6, label: 'Juni' },
    { value: 7, label: 'Juli' },
    { value: 8, label: 'Agustus' },
    { value: 9, label: 'September' },
    { value: 10, label: 'Oktober' },
    { value: 11, label: 'November' },
    { value: 12, label: 'Desember' }
  ];

  // Array tahun untuk dropdown (5 tahun ke belakang sampai 5 tahun ke depan dari tahun saat ini)
  const startYear = currentYear - 5;
  const endYear = currentYear + 5;
  const years = Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);

  // Handler untuk perubahan bulan
  const handleMonthChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const newMonth = parseInt(e.target.value, 10);
    const newPeriod = { ...period, bulan: newMonth };
    onChange(newPeriod);
  };

  // Handler untuk perubahan tahun
  const handleYearChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const newYear = parseInt(e.target.value, 10);
    const newPeriod = { ...period, tahun: newYear };
    onChange(newPeriod);
  };

  return (
    <div className="flex space-x-2 items-center">
      <label className="text-sm font-medium">Periode:</label>
      <select
        value={period.bulan || currentMonth}
        onChange={handleMonthChange}
        className="select select-bordered select-sm"
      >
        {months.map((month) => (
          <option key={month.value} value={month.value}>
            {month.label}
          </option>
        ))}
      </select>
      <select
        value={period.tahun || currentYear}
        onChange={handleYearChange}
        className="select select-bordered select-sm"
      >
        {years.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>
    </div>
  );
} 