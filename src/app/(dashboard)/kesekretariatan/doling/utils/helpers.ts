import { JadwalDoling, DetilDoling } from "../types";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { JenisIbadat } from "@prisma/client";

/**
 * Format currency to Indonesian Rupiah
 */
export const formatRupiah = (value: number = 0): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value);
};

/**
 * Format date to Indonesian format (dd MMMM yyyy)
 */
export const formatTanggalIndonesia = (date: Date): string => {
  return format(date, "dd MMMM yyyy", { locale: id });
};

/**
 * Format date to short Indonesian format (dd MMM yyyy)
 */
export const formatTanggalSingkat = (date: Date): string => {
  return format(date, "dd MMM yyyy", { locale: id });
};

/**
 * Format date and time (dd MMM yyyy, HH:mm)
 */
export const formatTanggalWaktu = (date: Date, waktu?: string): string => {
  if (waktu) {
    return `${format(date, "dd MMM yyyy", { locale: id })}, ${waktu}`;
  }
  return format(date, "dd MMM yyyy, HH:mm", { locale: id });
};

/**
 * Generate a new unique ID based on existing array
 */
export const generateNewId = <T extends { id: string }>(items: T[]): string => {
  if (items.length === 0) return '1';
  
  // Menggunakan UUID secara default
  return crypto.randomUUID();
};

/**
 * Filter jadwal by date range
 */
export const filterJadwalByDateRange = (
  jadwal: JadwalDoling[], 
  startDate: Date, 
  endDate: Date
): JadwalDoling[] => {
  return jadwal.filter(item => 
    item.tanggal >= startDate && 
    item.tanggal <= endDate
  );
};

/**
 * Get jadwal statistics
 */
export const getJadwalStatistics = (jadwal: JadwalDoling[]) => {
  const total = jadwal.length;
  const selesai = jadwal.filter(j => j.status === "selesai").length;
  const terjadwal = jadwal.filter(j => j.status === "terjadwal").length;
  const dibatalkan = jadwal.filter(j => j.status === "dibatalkan").length;
  
  return { total, selesai, terjadwal, dibatalkan };
};

/**
 * Get detil doling statistics
 */
export const getDetilStatistics = (detil: DetilDoling[]) => {
  const total = detil.length;
  const selesai = detil.filter(d => d.status === "selesai").length;
  const dibatalkan = detil.filter(d => d.status === "dibatalkan").length;
  const disetujui = detil.filter(d => d.approved).length;
  
  // Hitung total kehadiran
  const totalKehadiran = detil.reduce((sum, item) => sum + (item.jumlahKKHadir || 0), 0);
  const rataRataKehadiran = total > 0 ? Math.round(totalKehadiran / total) : 0;
  
  // Hitung total per jenis ibadat
  const doaLingkungan = detil.filter(d => d.jenisIbadat === JenisIbadat.DOA_LINGKUNGAN).length;
  const misa = detil.filter(d => d.jenisIbadat === JenisIbadat.MISA).length;
  const pertemuan = detil.filter(d => d.jenisIbadat === JenisIbadat.PERTEMUAN).length;
  const baktiSosial = detil.filter(d => d.jenisIbadat === JenisIbadat.BAKTI_SOSIAL).length;
  const lainnya = detil.filter(d => d.jenisIbadat === JenisIbadat.KEGIATAN_LAIN).length;
  
  return { 
    total, 
    selesai, 
    dibatalkan, 
    disetujui, 
    totalKehadiran, 
    rataRataKehadiran,
    doaLingkungan,
    misa,
    pertemuan,
    baktiSosial,
    lainnya
  };
};

/**
 * Group jadwal by month and year
 */
export const groupJadwalByMonth = (jadwal: JadwalDoling[]) => {
  const grouped: Record<string, JadwalDoling[]> = {};
  
  jadwal.forEach(item => {
    const year = item.tanggal.getFullYear();
    const month = item.tanggal.getMonth() + 1;
    const key = `${year}-${month}`;
    
    if (!grouped[key]) {
      grouped[key] = [];
    }
    
    grouped[key].push(item);
  });
  
  return grouped;
};

/**
 * Get label for jadwal status
 */
export const getStatusLabel = (status: JadwalDoling['status']): string => {
  switch (status) {
    case 'terjadwal': return 'Terjadwal';
    case 'selesai': return 'Selesai';
    case 'dibatalkan': return 'Dibatalkan';
    default: return status;
  }
};

/**
 * Get jadwal yang akan datang
 */
export const getUpcomingJadwal = (jadwal: JadwalDoling[], daysAhead: number = 14): JadwalDoling[] => {
  const today = new Date();
  const futureDate = new Date();
  futureDate.setDate(today.getDate() + daysAhead);
  
  return jadwal
    .filter(item => 
      item.status === "terjadwal" && 
      item.tanggal >= today && 
      item.tanggal <= futureDate
    )
    .sort((a, b) => a.tanggal.getTime() - b.tanggal.getTime());
}; 