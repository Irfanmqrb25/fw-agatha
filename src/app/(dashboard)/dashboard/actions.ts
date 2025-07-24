"use server";

import { prisma } from "@/lib/db";
import { unstable_noStore as noStore } from "next/cache";
import { DateRange } from "react-day-picker";
import { KesekretariatanSummary, KeuanganIkataSummary, KeuanganLingkunganSummary } from "./types";
import { TipeTransaksiLingkungan, TipeTransaksiIkata } from "@prisma/client";
import { calculateDanaMandiriArrears, calculateIkataArrears } from "./utils/arrears-utils";
import { createJakartaMonthRange, createJakartaYearRange, nowInJakarta } from "@/lib/timezone";

// Fungsi untuk mendapatkan data Keuangan Lingkungan
export async function getKeuanganLingkunganData(bulan?: number, tahun?: number): Promise<KeuanganLingkunganSummary> {
  noStore(); // Menonaktifkan caching

  try {
    // Gunakan timezone Jakarta untuk konsistensi
    const currentYear = tahun || nowInJakarta().getFullYear();
    let startDate: Date;
    let endDate: Date;
    
    if (bulan && tahun) {
      // Filter berdasarkan bulan dan tahun - konversi bulan dari 1-12 ke 0-11
      const monthIndex = bulan - 1; // Konversi ke index bulan JavaScript (0-11)
      ({ startDate, endDate } = createJakartaMonthRange(tahun, monthIndex));
    } else {
      // Filter berdasarkan tahun saja
      const range = createJakartaYearRange(currentYear);
      startDate = range.startDate;
      endDate = range.endDate;
    }

    // Import fungsi dari kas lingkungan untuk konsistensi
    const { getTransactionsData, getTransactionSummary } = await import("@/app/(dashboard)/lingkungan/kas/components/providers");
    const { calculatePeriodSummary } = await import("@/app/(dashboard)/lingkungan/kas/utils/date-utils");

    // Ambil semua data transaksi
    const transactions = await getTransactionsData();
    
    // Cek apakah ada transaksi saldo awal
    const initialBalanceTransaction = transactions.find(tx => 
      tx.tipeTransaksi === 'LAIN_LAIN' && 
      tx.keterangan === 'SALDO AWAL'
    );
    
    // Gunakan saldo awal dari database jika ada, atau default ke 0
    const globalInitialBalance = initialBalanceTransaction ? initialBalanceTransaction.debit : 0;

    // Jika ada filter bulan dan tahun, buat dateRange menggunakan timezone Jakarta
    let dateRange: DateRange | undefined = undefined;
    if (bulan !== undefined && tahun !== undefined) {
      dateRange = {
        from: startDate,
        to: endDate
      };
    }

    // Gunakan calculatePeriodSummary untuk perhitungan yang konsisten
    const summary = calculatePeriodSummary(transactions, dateRange, globalInitialBalance);

    return {
      saldoAwal: summary.initialBalance,
      totalPemasukan: summary.totalIncome,
      totalPengeluaran: summary.totalExpense,
      saldoAkhir: summary.finalBalance,
    };
  } catch (error) {
    console.error("Error getting keuangan lingkungan data:", error);
    return {
      saldoAwal: 0,
      totalPemasukan: 0,
      totalPengeluaran: 0,
      saldoAkhir: 0,
    };
  }
}

// Fungsi untuk mendapatkan data Keuangan IKATA
export async function getKeuanganIkataData(bulan?: number, tahun?: number): Promise<KeuanganIkataSummary> {
  noStore(); // Menonaktifkan caching

  try {
    // Gunakan timezone Jakarta untuk konsistensi
    const currentDate = nowInJakarta();
    
    // Import fungsi getKasIkataSummary langsung
    const { getKasIkataSummary } = await import("@/app/(dashboard)/ikata/kas/utils/kas-ikata-service");
    
    // Gunakan hasil dari getKasIkataSummary dengan parameter filter
    const summary = await getKasIkataSummary(bulan, tahun);
    // Kembalikan data yang persis sama
    return summary;
  } catch (error) {
    console.error("[getKeuanganIkataData] Error:", error);
    return {
      saldoAwal: 0,
      pemasukan: 0,
      pengeluaran: 0,
      saldoAkhir: 0,
    };
  }
}

// Fungsi untuk mendapatkan data Kesekretariatan
export async function getKesekretariatanData(bulan?: number, tahun?: number): Promise<KesekretariatanSummary> {
  noStore(); // Menonaktifkan caching

  try {
    
    // Gunakan timezone Jakarta untuk konsistensi
    const currentYear = tahun || nowInJakarta().getFullYear();
    
    let monthStart: Date;
    let monthEnd: Date;
    
    if (bulan && tahun) {
      // Filter berdasarkan bulan dan tahun - konversi bulan dari 1-12 ke 0-11
      const monthIndex = bulan - 1; // Konversi ke index bulan JavaScript (0-11)
      ({ startDate: monthStart, endDate: monthEnd } = createJakartaMonthRange(tahun, monthIndex));
    } else {
      // Buat range tahun dalam timezone Jakarta
      ({ startDate: monthStart, endDate: monthEnd } = createJakartaYearRange(currentYear));
    }
    

    // Impor fungsi utilitas untuk perhitungan keluarga
    const { hitungJumlahKepalaKeluarga, hitungTotalJiwa } = await import('./utils/family-utils');

    // Total Kepala Keluarga (aktif)
    const totalKK = await hitungJumlahKepalaKeluarga();

    // Total Jiwa (KK + Pasangan + Tanggungan)
    const jumlahJiwa = await hitungTotalJiwa();

    // KK Bergabung - hanya pada periode yang dipilih
    const kkBergabungCount = await prisma.keluargaUmat.count({
      where: {
        tanggalBergabung: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
    });

    // DEBUG: Cek data mentah sekitar periode
    const debugKeluarga = await prisma.keluargaUmat.findMany({
      where: {
        tanggalBergabung: {
          gte: new Date('2024-12-30'),
          lte: new Date('2025-01-03')
        }
      },
      select: {
        namaKepalaKeluarga: true,
        tanggalBergabung: true
      }
    });
    
    // Detail KK Bergabung
    const detailKKBergabung = await prisma.keluargaUmat.findMany({
      where: {
        tanggalBergabung: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
      select: {
        id: true,
        namaKepalaKeluarga: true,
        tanggalBergabung: true,
      },
      orderBy: {
        tanggalBergabung: 'desc',
      },
    });

    // KK Pindah - hanya pada periode yang dipilih
    const kkPindahCount = await prisma.keluargaUmat.count({
      where: {
        tanggalKeluar: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
    });

    // Detail KK Pindah
    const detailKKPindah = await prisma.keluargaUmat.findMany({
      where: {
        tanggalKeluar: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
      select: {
        id: true,
        namaKepalaKeluarga: true,
        tanggalKeluar: true,
      },
      orderBy: {
        tanggalKeluar: 'desc',
      },
    });

    // Umat Meninggal - total KK, pasangan, dan tanggungan yang meninggal pada periode yang dipilih
    // 1. KK yang meninggal pada periode tersebut
    const kkMeninggal = await prisma.keluargaUmat.count({
      where: {
        status: "MENINGGAL",
        tanggalMeninggal: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
    });
    
    // 2. Pasangan yang meninggal pada periode tersebut
    const pasanganMeninggal = await prisma.pasangan.count({
      where: {
        status: "MENINGGAL",
        tanggalMeninggal: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
    });
    
    // 3. Tanggungan yang meninggal pada periode tersebut
    const tanggunganMeninggal = await prisma.tanggungan.count({
      where: {
        status: "MENINGGAL",
        tanggalMeninggal: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
    });
    
    const umatMeninggalDunia = kkMeninggal + pasanganMeninggal + tanggunganMeninggal;

    // Detail KK Meninggal
    const detailKKMeninggal = await prisma.keluargaUmat.findMany({
      where: {
        status: "MENINGGAL",
        tanggalMeninggal: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
      select: {
        id: true,
        namaKepalaKeluarga: true,
        tanggalMeninggal: true,
      },
      orderBy: {
        tanggalMeninggal: 'desc',
      },
    });

    // Detail Pasangan Meninggal
    const detailPasanganMeninggal = await prisma.pasangan.findMany({
      where: {
        status: "MENINGGAL",
        tanggalMeninggal: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
      select: {
        id: true,
        nama: true,
        tanggalMeninggal: true,
      },
      orderBy: {
        tanggalMeninggal: 'desc',
      },
    });

    // Detail Tanggungan Meninggal
    const detailTanggunganMeninggal = await prisma.tanggungan.findMany({
      where: {
        status: "MENINGGAL",
        tanggalMeninggal: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
      select: {
        id: true,
        nama: true,
        jenisTanggungan: true,
        tanggalMeninggal: true,
      },
      orderBy: {
        tanggalMeninggal: 'desc',
      },
    });

    // Gabungkan detail umat meninggal
    const detailUmatMeninggal = [
      ...detailKKMeninggal.map(kk => ({
        id: kk.id,
        nama: kk.namaKepalaKeluarga,
        tanggal: kk.tanggalMeninggal!,
        statusKeluarga: "Kepala Keluarga"
      })),
      ...detailPasanganMeninggal.map(p => ({
        id: p.id,
        nama: p.nama,
        tanggal: p.tanggalMeninggal!,
        statusKeluarga: "Pasangan"
      })),
      ...detailTanggunganMeninggal.map(t => ({
        id: t.id,
        nama: t.nama,
        tanggal: t.tanggalMeninggal!,
        statusKeluarga: t.jenisTanggungan === "ANAK" ? "Anak" : "Kerabat"
      }))
    ].sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());

    // Tingkat Partisipasi Umat
    // Dapatkan data doa lingkungan pada periode
    const doaLingkunganList = await prisma.doaLingkungan.findMany({
      where: {
        tanggal: {
          gte: monthStart,
          lte: monthEnd,
        },
        jenisIbadat: "DOA_LINGKUNGAN",
      },
      include: {
        absensi: true
      }
    });
    
    // Hitung tingkat partisipasi
    let totalAbsensi = 0;
    let totalHadir = 0;
    
    for (const doling of doaLingkunganList) {
      totalAbsensi += doling.absensi.length;
      totalHadir += doling.absensi.filter(a => a.hadir).length;
    }
    
    const tingkatPartisipasiUmat = totalAbsensi > 0 
      ? (totalHadir / totalAbsensi) * 100 
      : 0;

    return {
      totalKepalaKeluarga: totalKK,
      jumlahJiwa,
      kkBergabung: kkBergabungCount,
      kkPindah: kkPindahCount,
      umatMeninggalDunia,
      tingkatPartisipasiUmat,
      detailKKBergabung: detailKKBergabung.map(kk => ({
        id: kk.id,
        nama: kk.namaKepalaKeluarga,
        tanggal: kk.tanggalBergabung!,
      })),
      detailKKPindah: detailKKPindah.map(kk => ({
        id: kk.id,
        nama: kk.namaKepalaKeluarga,
        tanggal: kk.tanggalKeluar!,
      })),
      detailUmatMeninggal,
    };
  } catch (error) {
    console.error("Error getting kesekretariatan data:", error);
    return {
      totalKepalaKeluarga: 0,
      jumlahJiwa: 0,
      kkBergabung: 0,
      kkPindah: 0,
      umatMeninggalDunia: 0,
      tingkatPartisipasiUmat: 0,
      detailKKBergabung: [],
      detailKKPindah: [],
      detailUmatMeninggal: [],
    };
  }
}

// Fungsi untuk mendapatkan data penunggak Dana Mandiri
export async function getPenunggakDanaMandiriData() {
  try {
    const currentYear = nowInJakarta().getFullYear();
    
    // Gunakan utilitas untuk menghitung tunggakan
    const arrearsData = await calculateDanaMandiriArrears(currentYear);
    
    return arrearsData;
  } catch (error) {
    console.error("Error getting penunggak dana mandiri data:", error);
    return [];
  }
}

// Fungsi untuk mendapatkan data penunggak Ikata
export async function getPenunggakIkataData() {
  try {
    const currentYear = nowInJakarta().getFullYear();
    
    // Gunakan utilitas untuk menghitung tunggakan
    const arrearsData = await calculateIkataArrears(currentYear);
    
    return arrearsData;
  } catch (error) {
    console.error("Error getting penunggak IKATA data:", error);
    return [];
  }
}

// Fungsi khusus untuk debugging transaksi IKATA
export async function debugIkataTransactions(bulan?: number, tahun?: number) {
  noStore();
  
  try {
    // Gunakan bulan dan tahun saat ini, bukan parameter input
    const currentDate = new Date();
    const month = currentDate.getMonth() + 1; // Januari = 1
    const year = currentDate.getFullYear();
    
    // Dapatkan semua transaksi saldo awal
    const saldoAwalTransactions = await prisma.kasIkata.findMany({
      where: {
        tipeTransaksi: TipeTransaksiIkata.LAIN_LAIN,
        keterangan: "SALDO AWAL"
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });
    
    // Filter berdasarkan bulan dan tahun saat ini
    const dateStart = new Date(year, month - 1, 1);
    const dateEnd = new Date(year, month, 0, 23, 59, 59);
    
    // Ambil semua transaksi pemasukan
    const incomeTransactions = await prisma.kasIkata.findMany({
      where: {
        tanggal: {
          gte: dateStart,
          lte: dateEnd,
        },
        jenisTranasksi: "UANG_MASUK",
        keterangan: {
          not: "SALDO AWAL"
        }
      }
    });
    
    // Ambil semua transaksi pengeluaran
    const expenseTransactions = await prisma.kasIkata.findMany({
      where: {
        tanggal: {
          gte: dateStart,
          lte: dateEnd,
        },
        jenisTranasksi: "UANG_KELUAR"
      }
    });
    
    
    // Hitung total
    const totalIncome = incomeTransactions.reduce((sum, tx) => sum + tx.debit, 0);
    const totalExpense = expenseTransactions.reduce((sum, tx) => sum + tx.kredit, 0);
    
    return {
      saldoAwalTransactions,
      incomeTransactions,
      expenseTransactions,
      totals: {
        totalIncome,
        totalExpense
      }
    };
  } catch (error) {
    return null;
  }
}

// Fungsi untuk menganalisis inkonsistensi data jumlah jiwa
export async function analyzeJiwaDataConsistency() {
  noStore();
  
  try {
    const { analyzeFamilyMemberCounts, compareTotalJiwaCalculations } = await import('./utils/fix-family-count');
    
    const [analysisResult, comparisonResult] = await Promise.all([
      analyzeFamilyMemberCounts(),
      compareTotalJiwaCalculations()
    ]);
    
    return {
      success: true,
      analysis: analysisResult,
      comparison: comparisonResult
    };
  } catch (error) {
    console.error("Error analyzing jiwa data consistency:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Fungsi untuk memperbaiki inkonsistensi data jumlah jiwa
export async function fixJiwaDataInconsistency() {
  noStore();
  
  try {
    const { fixAllFamilyMemberCounts } = await import('./utils/fix-family-count');
    
    const result = await fixAllFamilyMemberCounts();
    
    // Revalidate dashboard setelah perbaikan
    if (result.success) {
      const { revalidatePath } = await import('next/cache');
      revalidatePath('/dashboard');
    }
    
    return result;
  } catch (error) {
    console.error("Error fixing jiwa data inconsistency:", error);
    return {
      success: false,
      message: `Gagal memperbaiki data: ${error instanceof Error ? error.message : 'Unknown error'}`,
      details: {
        totalFamilies: 0,
        fixedFamilies: 0,
        inconsistentFamilies: []
      }
    };
  }
}