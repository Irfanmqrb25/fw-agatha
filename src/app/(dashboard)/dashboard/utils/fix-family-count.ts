/**
 * Script utilitas untuk memperbaiki inkonsistensi data jumlah jiwa
 * Menghitung ulang dan menyinkronkan field jumlahAnggotaKeluarga berdasarkan data aktual
 */

import { prisma } from "@/lib/db";
import { StatusKehidupan } from "@prisma/client";

/**
 * Fungsi untuk memperbaiki semua data jumlah anggota keluarga
 * yang tidak konsisten dengan data aktual
 */
export async function fixAllFamilyMemberCounts(): Promise<{
  success: boolean;
  message: string;
  details: {
    totalFamilies: number;
    fixedFamilies: number;
    inconsistentFamilies: Array<{
      id: string;
      nama: string;
      oldCount: number;
      newCount: number;
      actualMembers: {
        kepalaKeluarga: boolean;
        pasangan: boolean;
        tanggungan: number;
      };
    }>;
  };
}> {
  try {
    // Ambil semua keluarga dengan data lengkap
    const allFamilies = await prisma.keluargaUmat.findMany({
      include: {
        pasangan: true,
        tanggungan: true,
      },
    });

    const inconsistentFamilies: Array<{
      id: string;
      nama: string;
      oldCount: number;
      newCount: number;
      actualMembers: {
        kepalaKeluarga: boolean;
        pasangan: boolean;
        tanggungan: number;
      };
    }> = [];

    let fixedCount = 0;

    for (const keluarga of allFamilies) {
      // Hitung jumlah anggota keluarga yang sebenarnya
      let actualCount = 0;
      
      // Tambahkan kepala keluarga jika masih hidup
      const kepalaKeluargaHidup = keluarga.status === StatusKehidupan.HIDUP;
      if (kepalaKeluargaHidup) {
        actualCount += 1;
      }
      
      // Tambahkan pasangan jika ada dan masih hidup
      const pasanganHidup = keluarga.pasangan && keluarga.pasangan.status === StatusKehidupan.HIDUP;
      if (pasanganHidup) {
        actualCount += 1;
      }
      
      // Tambahkan semua tanggungan yang masih hidup
      const tanggunganHidup = keluarga.tanggungan.filter(t => t.status === StatusKehidupan.HIDUP);
      const jumlahTanggungan = tanggunganHidup.length;
      actualCount += jumlahTanggungan;

      // Bandingkan dengan data yang tersimpan
      const storedCount = keluarga.jumlahAnggotaKeluarga;
      
      if (actualCount !== storedCount) {
        // Data tidak konsisten, catat untuk diperbaiki
        inconsistentFamilies.push({
          id: keluarga.id,
          nama: keluarga.namaKepalaKeluarga,
          oldCount: storedCount,
          newCount: actualCount,
          actualMembers: {
            kepalaKeluarga: kepalaKeluargaHidup,
            pasangan: !!pasanganHidup,
            tanggungan: jumlahTanggungan,
          },
        });

        // Update data di database
        await prisma.keluargaUmat.update({
          where: { id: keluarga.id },
          data: { jumlahAnggotaKeluarga: actualCount },
        });

        fixedCount++;
      }
    }

    return {
      success: true,
      message: `Berhasil memperbaiki ${fixedCount} dari ${allFamilies.length} keluarga`,
      details: {
        totalFamilies: allFamilies.length,
        fixedFamilies: fixedCount,
        inconsistentFamilies,
      },
    };
  } catch (error) {
    console.error("Error fixing family member counts:", error);
    return {
      success: false,
      message: `Gagal memperbaiki data: ${error instanceof Error ? error.message : 'Unknown error'}`,
      details: {
        totalFamilies: 0,
        fixedFamilies: 0,
        inconsistentFamilies: [],
      },
    };
  }
}

/**
 * Fungsi untuk menganalisis inkonsistensi data tanpa memperbaikinya
 */
export async function analyzeFamilyMemberCounts(): Promise<{
  totalFamilies: number;
  consistentFamilies: number;
  inconsistentFamilies: Array<{
    id: string;
    nama: string;
    storedCount: number;
    actualCount: number;
    difference: number;
    breakdown: {
      kepalaKeluarga: boolean;
      pasangan: boolean;
      tanggungan: number;
    };
  }>;
}> {
  try {
    // Ambil semua keluarga dengan data lengkap
    const allFamilies = await prisma.keluargaUmat.findMany({
      include: {
        pasangan: true,
        tanggungan: true,
      },
    });

    const inconsistentFamilies: Array<{
      id: string;
      nama: string;
      storedCount: number;
      actualCount: number;
      difference: number;
      breakdown: {
        kepalaKeluarga: boolean;
        pasangan: boolean;
        tanggungan: number;
      };
    }> = [];

    let consistentCount = 0;

    for (const keluarga of allFamilies) {
      // Hitung jumlah anggota keluarga yang sebenarnya
      let actualCount = 0;
      
      // Tambahkan kepala keluarga jika masih hidup
      const kepalaKeluargaHidup = keluarga.status === StatusKehidupan.HIDUP;
      if (kepalaKeluargaHidup) {
        actualCount += 1;
      }
      
      // Tambahkan pasangan jika ada dan masih hidup
      const pasanganHidup = keluarga.pasangan && keluarga.pasangan.status === StatusKehidupan.HIDUP;
      if (pasanganHidup) {
        actualCount += 1;
      }
      
      // Tambahkan semua tanggungan yang masih hidup
      const tanggunganHidup = keluarga.tanggungan.filter(t => t.status === StatusKehidupan.HIDUP);
      const jumlahTanggungan = tanggunganHidup.length;
      actualCount += jumlahTanggungan;

      // Bandingkan dengan data yang tersimpan
      const storedCount = keluarga.jumlahAnggotaKeluarga;
      
      if (actualCount !== storedCount) {
        inconsistentFamilies.push({
          id: keluarga.id,
          nama: keluarga.namaKepalaKeluarga,
          storedCount,
          actualCount,
          difference: actualCount - storedCount,
          breakdown: {
            kepalaKeluarga: kepalaKeluargaHidup,
            pasangan: !!pasanganHidup,
            tanggungan: jumlahTanggungan,
          },
        });
      } else {
        consistentCount++;
      }
    }

    return {
      totalFamilies: allFamilies.length,
      consistentFamilies: consistentCount,
      inconsistentFamilies,
    };
  } catch (error) {
    console.error("Error analyzing family member counts:", error);
    return {
      totalFamilies: 0,
      consistentFamilies: 0,
      inconsistentFamilies: [],
    };
  }
}

/**
 * Fungsi untuk menghitung total jiwa dengan dua metode berbeda
 * untuk membandingkan hasilnya
 */
export async function compareTotalJiwaCalculations(): Promise<{
  methodA: {
    name: string;
    total: number;
    description: string;
  };
  methodB: {
    name: string;
    total: number;
    description: string;
  };
  difference: number;
  isConsistent: boolean;
}> {
  try {
    // Metode A: Menggunakan fungsi hitungTotalJiwa yang sudah ada
    const { hitungTotalJiwa } = await import('./family-utils');
    const totalMethodA = await hitungTotalJiwa();

    // Metode B: Menjumlahkan field jumlahAnggotaKeluarga dari semua keluarga aktif
    const totalMethodB = await prisma.keluargaUmat.aggregate({
      where: {
        status: StatusKehidupan.HIDUP,
        tanggalKeluar: null,
      },
      _sum: {
        jumlahAnggotaKeluarga: true,
      },
    });

    const methodBTotal = totalMethodB._sum.jumlahAnggotaKeluarga || 0;
    const difference = totalMethodA - methodBTotal;

    return {
      methodA: {
        name: "Perhitungan Aktual",
        total: totalMethodA,
        description: "Menghitung berdasarkan data KK hidup + pasangan hidup + tanggungan aktual",
      },
      methodB: {
        name: "Field Database",
        total: methodBTotal,
        description: "Menjumlahkan field jumlahAnggotaKeluarga dari keluarga aktif",
      },
      difference,
      isConsistent: difference === 0,
    };
  } catch (error) {
    console.error("Error comparing total jiwa calculations:", error);
    return {
      methodA: { name: "Error", total: 0, description: "Gagal menghitung" },
      methodB: { name: "Error", total: 0, description: "Gagal menghitung" },
      difference: 0,
      isConsistent: false,
    };
  }
} 