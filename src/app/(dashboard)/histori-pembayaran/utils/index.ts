import { DanaMandiriHistory, IkataHistory } from "../types";
import { StatusIuran } from "@prisma/client";

// Fungsi untuk mendapatkan warna badge berdasarkan status dana mandiri
export function getDanaMandiriStatusColor(statusSetor: boolean): string {
  return statusSetor
    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
    : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
}

// Fungsi untuk mendapatkan warna badge berdasarkan status ikata
export function getIkataStatusColor(status: StatusIuran): string {
  switch (status) {
    case "LUNAS":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    case "SEBAGIAN_BULAN":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    case "BELUM_BAYAR":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
  }
}

// Fungsi untuk memformat status ikata menjadi teks yang mudah dibaca
export function formatStatusIkata(status: StatusIuran): string {
  switch (status) {
    case "LUNAS":
      return "Lunas";
    case "SEBAGIAN_BULAN":
      return "Sebagian Bulan";
    case "BELUM_BAYAR":
      return "Belum Bayar";
    default:
      return status;
  }
}

// Fungsi untuk memformat mata uang sebagai Rupiah
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Fungsi untuk mendapatkan nama bulan
export function getMonthName(month: number): string {
  const months = [
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
  
  return months[month - 1] || "";
}

// Fungsi untuk mendapatkan rentang bulan (untuk IKATA)
export function getMonthRange(bulanAwal: number | null, bulanAkhir: number | null): string {
  // Jika kedua bulan null, kembalikan pesan yang lebih informatif
  if (bulanAwal === null && bulanAkhir === null) {
    return "Belum ada data bulan";
  }
  
  // Jika salah satu null, gunakan nilai default
  const startMonth = bulanAwal || 1; // Default ke Januari jika null
  const endMonth = bulanAkhir || 12; // Default ke Desember jika null
  
  // Validasi bulan (1-12)
  const validStartMonth = Math.max(1, Math.min(12, startMonth));
  const validEndMonth = Math.max(1, Math.min(12, endMonth));
  
  if (validStartMonth === validEndMonth) {
    return getMonthName(validStartMonth);
  }
  
  return `${getMonthName(validStartMonth)} - ${getMonthName(validEndMonth)}`;
}

// Fungsi untuk memfilter data Dana Mandiri berdasarkan tahun
export function filterDanaMandiriByYear(
  data: DanaMandiriHistory[],
  year?: number
): DanaMandiriHistory[] {
  if (!year) return data;
  return data.filter((payment) => payment.tahun === year);
}

// Fungsi untuk memfilter data IKATA berdasarkan tahun
export function filterIkataByYear(
  data: IkataHistory[],
  year?: number
): IkataHistory[] {
  if (!year) return data;
  return data.filter((payment) => payment.tahun === year);
}

// Fungsi untuk mendapatkan daftar tahun unik dari data Dana Mandiri
export function getUniqueDanaMandiriYears(data: DanaMandiriHistory[]): number[] {
  const years = data.map((payment) => payment.tahun);
  return [...new Set(years)].sort((a, b) => b - a); // Descending order
}

// Fungsi untuk mendapatkan daftar tahun unik dari data IKATA
export function getUniqueIkataYears(data: IkataHistory[]): number[] {
  const years = data.map((payment) => payment.tahun);
  return [...new Set(years)].sort((a, b) => b - a); // Descending order
}

// Fungsi untuk menggabungkan tahun dari kedua jenis pembayaran
export function getCombinedYears(
  danaMandiriData: DanaMandiriHistory[],
  ikataData: IkataHistory[]
): number[] {
  const danaMandiriYears = getUniqueDanaMandiriYears(danaMandiriData);
  const ikataYears = getUniqueIkataYears(ikataData);
  
  const allYears = [...danaMandiriYears, ...ikataYears];
  return [...new Set(allYears)].sort((a, b) => b - a); // Descending order
}
