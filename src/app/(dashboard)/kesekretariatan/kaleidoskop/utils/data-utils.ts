import { KaleidoskopActivityData } from "../actions";
import { JenisIbadat, SubIbadat } from "@prisma/client";

/**
 * Mendapatkan tanggal awal bulan (hari 1 pukul 00:00:00.000)
 */
export function getStartOfMonth(year: number, month: number): Date {
  return new Date(year, month, 1, 0, 0, 0, 0);
}

/**
 * Mendapatkan tanggal akhir bulan (hari terakhir pukul 23:59:59.999)
 * Menangani dengan benar tanggal peralihan bulan (31 Jan, 28/29 Feb, 31 Mar, 30 Apr, dst)
 */
export function getEndOfMonth(year: number, month: number): Date {
  // new Date(year, month + 1, 0) menghasilkan hari terakhir bulan yang benar
  // Ini otomatis menangani perbedaan jumlah hari per bulan dan tahun kabisat
  const lastDay = new Date(year, month + 1, 0);
  // Set waktu ke akhir hari
  lastDay.setHours(23, 59, 59, 999);
  return lastDay;
}

/**
 * Mendapatkan periode bulan dalam format Date range
 */
export function getMonthRange(year: number, month: number): { startDate: Date; endDate: Date } {
  return {
    startDate: getStartOfMonth(year, month),
    endDate: getEndOfMonth(year, month)
  };
}

/**
 * Memfilter data kaleidoskop berdasarkan rentang periode
 */
export function filterDataByPeriode(
  data: KaleidoskopActivityData[],
  bulanAwal: string,
  tahunAwal: string,
  bulanAkhir: string,
  tahunAkhir: string
): KaleidoskopActivityData[] {
  // Konversi ke tipe numerik
  const startMonth = parseInt(bulanAwal);
  const startYear = parseInt(tahunAwal);
  const endMonth = parseInt(bulanAkhir);
  const endYear = parseInt(tahunAkhir);

  // Buat tanggal awal dan akhir menggunakan utility functions
  const startDate = getStartOfMonth(startYear, startMonth);
  const endDate = getEndOfMonth(endYear, endMonth);

  // Filter data berdasarkan tanggal
  return data.filter(item => {
    const itemDate = new Date(item.tanggal);
    return itemDate >= startDate && itemDate <= endDate;
  });
}

/**
 * Mengubah enum JenisIbadat menjadi string yang mudah dibaca
 */
export function formatJenisIbadat(jenisIbadat: JenisIbadat): string {
  const mapping: Record<JenisIbadat, string> = {
    [JenisIbadat.DOA_LINGKUNGAN]: "Doa Lingkungan",
    [JenisIbadat.MISA]: "Misa",
    [JenisIbadat.PERTEMUAN]: "Pertemuan",
    [JenisIbadat.BAKTI_SOSIAL]: "Bakti Sosial",
    [JenisIbadat.KEGIATAN_LAIN]: "Kegiatan Lain",
  };
  
  return mapping[jenisIbadat] || String(jenisIbadat);
}

/**
 * Mengubah enum SubIbadat menjadi string yang mudah dibaca
 */
export function formatSubIbadat(subIbadat: SubIbadat | null): string {
  if (subIbadat === null) return "Umum";
  
  const mapping: Record<SubIbadat, string> = {
    [SubIbadat.IBADAT_SABDA]: "Ibadat Sabda",
    [SubIbadat.IBADAT_SABDA_TEMATIK]: "Ibadat Sabda Tematik",
    [SubIbadat.PRAPASKAH]: "Prapaskah",
    [SubIbadat.BKSN]: "BKSN",
    [SubIbadat.BULAN_ROSARIO]: "Bulan Rosario",
    [SubIbadat.NOVENA_NATAL]: "Novena Natal",
    [SubIbadat.MISA_SYUKUR]: "Misa Syukur",
    [SubIbadat.MISA_REQUEM]: "Misa Requem",
    [SubIbadat.MISA_ARWAH]: "Misa Arwah",
    [SubIbadat.MISA_PELINDUNG]: "Misa Pelindung",
  };
  
  return mapping[subIbadat] || String(subIbadat);
}

/**
 * Mengelompokkan data berdasarkan jenis ibadat dan sub ibadat
 * 
 * @returns Object dengan struktur { [jenisIbadat]: { [subIbadat]: count } }
 */
export function groupDataByJenisIbadat(data: KaleidoskopActivityData[]): Record<string, Record<string, number>> {
  const result: Record<string, Record<string, number>> = {};
  
  data.forEach((item) => {
    // Jika jenis ibadat belum ada, inisialisasi
    if (!result[item.jenisIbadat]) {
      result[item.jenisIbadat] = {};
    }
    
    // Gunakan string key yang aman untuk subIbadat (null menjadi "null")
    const subIbadatKey = item.subIbadat ? item.subIbadat.toString() : "null";
    
    // Jika sub ibadat belum ada, inisialisasi dengan nilai 0
    if (!result[item.jenisIbadat][subIbadatKey]) {
      result[item.jenisIbadat][subIbadatKey] = 0;
    }
    
    // Increment counter
    result[item.jenisIbadat][subIbadatKey]++;
  });
  
  return result;
} 