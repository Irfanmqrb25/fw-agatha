import { format } from "date-fns";
import { id } from "date-fns/locale";

// Format angka menjadi format Rupiah
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

// Format persentase
export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

// Format tanggal
export function formatDate(date: Date): string {
  return format(date, "d MMMM yyyy", { locale: id });
}

// Mendapatkan nama bulan
export function getMonthName(monthNumber: number): string {
  const months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];
  
  // Sesuaikan indeks bulan karena array dimulai dari 0
  return months[monthNumber - 1];
}

// Format bulan dan tahun
export function formatMonthYear(month: number, year: number): string {
  return `${getMonthName(month)} ${year}`;
} 