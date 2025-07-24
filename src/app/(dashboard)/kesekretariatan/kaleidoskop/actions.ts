"use server";

import { prisma } from "@/lib/db";
import { JenisIbadat, SubIbadat } from "@prisma/client";
import { getMonthRange } from "./utils/data-utils";

export interface KaleidoskopActivityData {
  id: string;
  tanggal: Date;
  jenisIbadat: JenisIbadat;
  subIbadat: SubIbadat | null;
  customSubIbadat: string | null;
  temaIbadat: string | null;
  tuanRumah: string;
  jumlahKKHadir: number;
  totalPeserta: number;
}

export interface StatistikPerJenisIbadat {
  jenisIbadat: JenisIbadat;
  jumlah: number;
  persentase: number;
  subIbadat: {
    nama: SubIbadat | null;
    customNama?: string | null;
    jumlah: number;
  }[];
}

export interface RingkasanKegiatan {
  totalKegiatan: number;
  totalJenisIbadat: number;
  totalSubIbadat: number;
  kehadiranRataRata: number;
  jenisIbadatTerbanyak: JenisIbadat | null;
  totalPeserta: number;
}

/**
 * Mendapatkan semua data aktivitas untuk periode tertentu atau semua data
 */
export async function getKaleidoskopData(
  startDate?: Date,
  endDate?: Date
): Promise<KaleidoskopActivityData[]> {
  try {
    const whereCondition: any = {};
    
    // Jika ada parameter tanggal, gunakan filter
    if (startDate && endDate) {
      // Gunakan endDate langsung tanpa adjustment manual
      // Asumsi endDate sudah berupa tanggal akhir bulan yang benar
      whereCondition.tanggal = {
        gte: startDate,
        lte: endDate,
      };
    }

    const activities = await prisma.doaLingkungan.findMany({
      where: whereCondition,
      include: {
        tuanRumah: true,
      },
      orderBy: {
        tanggal: "asc",
      },
    });

    return activities.map((activity) => ({
      id: activity.id,
      tanggal: activity.tanggal,
      jenisIbadat: activity.jenisIbadat,
      subIbadat: activity.subIbadat,
      customSubIbadat: activity.customSubIbadat,
      temaIbadat: activity.temaIbadat,
      tuanRumah: activity.tuanRumah.namaKepalaKeluarga,
      jumlahKKHadir: activity.jumlahKKHadir,
      totalPeserta: calculateTotalPeserta(activity),
    }));
  } catch (error) {
    throw new Error("Gagal mengambil data kaleidoskop");
  }
}

/**
 * Mendapatkan statistik per jenis ibadat
 */
export async function getStatistikPerJenisIbadat(
  startDate?: Date,
  endDate?: Date
): Promise<StatistikPerJenisIbadat[]> {
  try {
    const whereCondition: any = {};
    
    // Jika ada parameter tanggal, gunakan filter
    if (startDate && endDate) {
      // Gunakan endDate langsung tanpa adjustment manual
      // Asumsi endDate sudah berupa tanggal akhir bulan yang benar
      whereCondition.tanggal = {
        gte: startDate,
        lte: endDate,
      };
    }

    // Ambil data DoaLingkungan
    const activities = await prisma.doaLingkungan.findMany({
      where: whereCondition,
      select: {
        jenisIbadat: true,
        subIbadat: true,
        customSubIbadat: true,
      },
    });

    const totalKegiatan = activities.length;
    if (totalKegiatan === 0) return [];

    // Hitung jumlah per jenis ibadat
    const jenisIbadatCount: Record<JenisIbadat, number> = {} as any;
    const subIbadatPerJenis: Record<JenisIbadat, Record<string, { count: number; isCustom: boolean; customName?: string }>> = {} as any;

    activities.forEach((activity) => {
      // Count jenis ibadat
      if (!jenisIbadatCount[activity.jenisIbadat]) {
        jenisIbadatCount[activity.jenisIbadat] = 0;
        subIbadatPerJenis[activity.jenisIbadat] = {};
      }
      jenisIbadatCount[activity.jenisIbadat]++;

      // Count sub ibadat - prioritaskan customSubIbadat
      let subKey: string;
      let isCustom = false;
      let customName: string | undefined;

      if (activity.customSubIbadat) {
        subKey = `custom_${activity.customSubIbadat}`;
        isCustom = true;
        customName = activity.customSubIbadat;
      } else if (activity.subIbadat) {
        subKey = activity.subIbadat;
        isCustom = false;
      } else {
        subKey = "NULL";
        isCustom = false;
      }

      if (!subIbadatPerJenis[activity.jenisIbadat][subKey]) {
        subIbadatPerJenis[activity.jenisIbadat][subKey] = {
          count: 0,
          isCustom,
          customName
        };
      }
      subIbadatPerJenis[activity.jenisIbadat][subKey].count++;
    });

    // Transform ke format hasil
    const result: StatistikPerJenisIbadat[] = Object.keys(jenisIbadatCount).map(
      (jenisKey) => {
        const jenis = jenisKey as JenisIbadat;
        const jumlah = jenisIbadatCount[jenis];
        const persentase = (jumlah / totalKegiatan) * 100;

        // Transform sub ibadat
        const subIbadatStats = Object.keys(subIbadatPerJenis[jenis]).map(
          (subKey) => {
            const subData = subIbadatPerJenis[jenis][subKey];
            
            if (subData.isCustom) {
              return {
                nama: null,
                customNama: subData.customName || null,
                jumlah: subData.count,
              };
            } else {
              return {
                nama: subKey === "NULL" ? null : (subKey as SubIbadat),
                customNama: null,
                jumlah: subData.count,
              };
            }
          }
        );

        return {
          jenisIbadat: jenis,
          jumlah,
          persentase,
          subIbadat: subIbadatStats,
        };
      }
    );

    // Sort berdasarkan jumlah (terbanyak dulu)
    return result.sort((a, b) => b.jumlah - a.jumlah);
  } catch (error) {
    throw new Error("Gagal mengambil statistik per jenis ibadat");
  }
}

/**
 * Mendapatkan ringkasan kegiatan
 */
export async function getRingkasanKegiatan(
  startDate?: Date,
  endDate?: Date
): Promise<RingkasanKegiatan> {
  try {
    const whereCondition: any = {};
    
    // Jika ada parameter tanggal, gunakan filter
    if (startDate && endDate) {
      // Gunakan endDate langsung tanpa adjustment manual
      // Asumsi endDate sudah berupa tanggal akhir bulan yang benar
      whereCondition.tanggal = {
        gte: startDate,
        lte: endDate,
      };
    }

    // Get all activities in period
    const activities = await prisma.doaLingkungan.findMany({
      where: whereCondition,
    });

    if (activities.length === 0) {
      return {
        totalKegiatan: 0,
        totalJenisIbadat: 0,
        totalSubIbadat: 0,
        kehadiranRataRata: 0,
        jenisIbadatTerbanyak: null,
        totalPeserta: 0,
      };
    }

    // Calculate totals
    const totalKegiatan = activities.length;
    
    // Calculate unique jenis ibadat
    const uniqueJenisIbadat = new Set(
      activities.map((a) => a.jenisIbadat)
    );
    
    // Calculate unique sub ibadat
    const uniqueSubIbadat = new Set(
      activities.filter((a) => a.subIbadat).map((a) => a.subIbadat)
    );
    
    // Calculate average attendance
    const totalHadir = activities.reduce((sum, a) => sum + a.jumlahKKHadir, 0);
    const kehadiranRataRata = totalHadir / totalKegiatan;
    
    // Calculate total peserta
    const totalPeserta = activities.reduce(
      (sum, a) => sum + calculateTotalPeserta(a),
      0
    );
    
    // Find most common jenis ibadat
    const jenisIbadatCount: Record<JenisIbadat, number> = {} as any;
    activities.forEach((a) => {
      if (!jenisIbadatCount[a.jenisIbadat]) {
        jenisIbadatCount[a.jenisIbadat] = 0;
      }
      jenisIbadatCount[a.jenisIbadat]++;
    });
    
    let jenisIbadatTerbanyak: JenisIbadat | null = null;
    let maxCount = 0;
    
    Object.keys(jenisIbadatCount).forEach((jenis) => {
      const jenisKey = jenis as JenisIbadat;
      if (jenisIbadatCount[jenisKey] > maxCount) {
        maxCount = jenisIbadatCount[jenisKey];
        jenisIbadatTerbanyak = jenisKey;
      }
    });

    return {
      totalKegiatan,
      totalJenisIbadat: uniqueJenisIbadat.size,
      totalSubIbadat: uniqueSubIbadat.size,
      kehadiranRataRata,
      jenisIbadatTerbanyak,
      totalPeserta,
    };
  } catch (error) {
    throw new Error("Gagal mengambil ringkasan kegiatan");
  }
}

/**
 * Mendapatkan data kehadiran per bulan
 */
export async function getKehadiranPerBulan(
  tahun: number
): Promise<{ bulan: string; jumlahKehadiran: number }[]> {
  try {
    const namaBulan = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];
    
    const hasil = [];
    
    for (let bulan = 0; bulan < 12; bulan++) {
      // Gunakan utility function untuk mendapatkan range bulan yang konsisten
      const { startDate, endDate } = getMonthRange(tahun, bulan);
      
      const jumlahKehadiran = await prisma.absensiDoling.count({
        where: {
          doaLingkungan: {
            tanggal: {
              gte: startDate,
              lte: endDate,
            },
          },
          hadir: true,
        },
      });
      
      hasil.push({
        bulan: namaBulan[bulan],
        jumlahKehadiran,
      });
    }
    
    return hasil;
  } catch (error) {
    throw new Error("Gagal mengambil data kehadiran per bulan");
  }
}

/**
 * Menghitung total peserta dari sebuah event Doa Lingkungan
 * Menjumlahkan semua kategori peserta
 */
function calculateTotalPeserta(doling: {
  jumlahPeserta?: number;
  bapak?: number;
  ibu?: number;
  omk?: number;
  bir?: number;
  biaBawah?: number;
  biaAtas?: number;
}): number {
  // Jika jumlahPeserta sudah diisi, gunakan itu
  if (doling.jumlahPeserta && doling.jumlahPeserta > 0) {
    return doling.jumlahPeserta;
  }
  
  // Jika tidak, jumlahkan semua kategori
  return (
    (doling.bapak || 0) +
    (doling.ibu || 0) +
    (doling.omk || 0) +
    (doling.bir || 0) +
    (doling.biaBawah || 0) +
    (doling.biaAtas || 0)
  );
} 