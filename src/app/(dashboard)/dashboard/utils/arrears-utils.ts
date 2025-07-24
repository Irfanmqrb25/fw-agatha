import { prisma } from "@/lib/db";
import { nowInJakarta } from "@/lib/timezone";

/**
 * Fungsi untuk mendapatkan pengaturan iuran dana mandiri berdasarkan tahun
 */
export async function getDanaMandiriSettingByYear(year: number) {
  try {
    const setting = await prisma.danaMandiriSetting.findUnique({
      where: { tahun: year }
    });
    return setting;
  } catch (error) {
    console.error("Error getting dana mandiri setting:", error);
    return null;
  }
}

/**
 * Fungsi untuk mendapatkan pengaturan iuran IKATA berdasarkan tahun
 */
export async function getIkataSettingByYear(year: number) {
  try {
    const setting = await prisma.ikataSetting.findUnique({
      where: { tahun: year }
    });
    return setting;
  } catch (error) {
    console.error("Error getting IKATA setting:", error);
    return null;
  }
}

/**
 * Fungsi untuk menghitung tunggakan dana mandiri secara real-time
 */
export async function calculateDanaMandiriArrears(year?: number) {
  const targetYear = year || nowInJakarta().getFullYear();
  
  try {
    // Ambil pengaturan iuran
    const setting = await getDanaMandiriSettingByYear(targetYear);
    if (!setting) {
      return [];
    }

    // Ambil keluarga dengan data dana mandiri
    const keluarga = await prisma.keluargaUmat.findMany({
      where: {
        tanggalKeluar: null,
        status: "HIDUP",
      },
      select: {
        id: true,
        namaKepalaKeluarga: true,
        alamat: true,
        nomorTelepon: true,
        danaMandiri: {
          where: { tahun: targetYear },
          select: {
            id: true,
            jumlahDibayar: true,
            statusPembayaran: true,
            totalIuran: true,
            periodeBayar: true,
          }
        }
      }
    });

    // Filter dan hitung tunggakan
    const result = [];
    
    for (const k of keluarga) {
      let jumlahTunggakan = 0;
      let hasArrears = false;
      
      if (k.danaMandiri.length === 0) {
        // Belum ada pembayaran sama sekali
        jumlahTunggakan = setting.jumlahIuran;
        hasArrears = true;
      } else {
        // Ada pembayaran, periksa status pembayaran
        const pembayaran = k.danaMandiri[0]; // Ambil pembayaran untuk tahun ini
        
        if (pembayaran.statusPembayaran === "lunas") {
          // Jika status lunas, tidak ada tunggakan
          hasArrears = false;
          jumlahTunggakan = 0;
        } else if (pembayaran.statusPembayaran === "sebagian_bulan") {
          const totalExpected = pembayaran.totalIuran || setting.jumlahIuran;
          jumlahTunggakan = totalExpected - pembayaran.jumlahDibayar;
          hasArrears = jumlahTunggakan > 0;
        } else if (pembayaran.statusPembayaran === "belum_ada_pembayaran") {
          jumlahTunggakan = pembayaran.totalIuran || setting.jumlahIuran;
          hasArrears = true;
        } else {
          // Fallback: hitung berdasarkan total yang sudah dibayar vs yang seharusnya
          const totalDibayar = k.danaMandiri.reduce((sum, payment) => sum + payment.jumlahDibayar, 0);
          const sisaTunggakan = setting.jumlahIuran - totalDibayar;
          
          if (sisaTunggakan > 0) {
            jumlahTunggakan = sisaTunggakan;
            hasArrears = true;
          }
        }
      }
      
      // Hanya masukkan ke hasil jika ada tunggakan
      if (hasArrears && jumlahTunggakan > 0) {
        // Format periode tunggakan berdasarkan data pembayaran
        const periodeTunggakan = formatPeriodeTunggakanDanaMandiri(targetYear, k.danaMandiri[0]);
        
        result.push({
          id: k.id,
          nama: k.namaKepalaKeluarga,
          periodeTunggakan: periodeTunggakan || formatPeriodeTunggakan(targetYear),
          jumlahTunggakan
        });
      }
    }
    
    return result;
  } catch (error) {
    console.error("Error calculating dana mandiri arrears:", error);
    return [];
  }
}

/**
 * Fungsi untuk menghitung tunggakan IKATA secara real-time
 */
export async function calculateIkataArrears(year?: number) {
  const targetYear = year || nowInJakarta().getFullYear();
  
  try {
    // Ambil pengaturan iuran IKATA
    const setting = await getIkataSettingByYear(targetYear);
    if (!setting) {
      return [];
    }

    // Ambil keluarga dengan data iuran IKATA
    const keluarga = await prisma.keluargaUmat.findMany({
      where: {
        tanggalKeluar: null,
        status: "HIDUP",
      },
      select: {
        id: true,
        namaKepalaKeluarga: true,
        alamat: true,
        nomorTelepon: true,
        iurataIkata: {
          where: { tahun: targetYear }
        }
      }
    });

    // Filter dan hitung tunggakan
    const result = [];
    
    for (const k of keluarga) {
      let jumlahTunggakan = 0;
      let hasArrears = false;
      
      if (k.iurataIkata.length === 0) {
        // Belum ada pembayaran sama sekali
        jumlahTunggakan = setting.jumlahIuran;
        hasArrears = true;
      } else {
        const iuran = k.iurataIkata[0]; // Ambil data iuran untuk tahun ini
        
        if (iuran.status === "BELUM_BAYAR") {
          jumlahTunggakan = iuran.totalIuran || setting.jumlahIuran;
          hasArrears = true;
        } else if (iuran.status === "SEBAGIAN_BULAN") {
          const totalExpected = iuran.totalIuran || setting.jumlahIuran;
          jumlahTunggakan = totalExpected - iuran.jumlahDibayar;
          hasArrears = jumlahTunggakan > 0;
        }
        // Jika status LUNAS, tidak ada tunggakan (hasArrears = false)
      }
      
      // Hanya masukkan ke hasil jika ada tunggakan
      if (hasArrears && jumlahTunggakan > 0) {
        // Format periode tunggakan berdasarkan data pembayaran
        const periodeTunggakan = formatPeriodeTunggakanIkata(targetYear, k.iurataIkata);
        
        result.push({
          id: k.id,
          nama: k.namaKepalaKeluarga,
          periodeTunggakan,
          jumlahTunggakan
        });
      }
    }
    
    return result;
  } catch (error) {
    console.error("Error calculating IKATA arrears:", error);
    return [];
  }
}

/**
 * Fungsi untuk menghitung tunggakan dana mandiri dengan format lengkap (untuk modul dana mandiri)
 */
export async function calculateDanaMandiriArrearsDetailed(year?: number) {
  const targetYear = year || nowInJakarta().getFullYear();
  
  try {
    // Ambil pengaturan iuran
    const setting = await getDanaMandiriSettingByYear(targetYear);
    if (!setting) {
      return [];
    }

    // Ambil keluarga dengan data dana mandiri
    const keluarga = await prisma.keluargaUmat.findMany({
      where: {
        tanggalKeluar: null,
        status: "HIDUP",
      },
      select: {
        id: true,
        namaKepalaKeluarga: true,
        alamat: true,
        nomorTelepon: true,
        danaMandiri: {
          where: { tahun: targetYear },
          select: {
            id: true,
            jumlahDibayar: true,
            statusPembayaran: true,
            totalIuran: true,
            periodeBayar: true,
          }
        }
      }
    });

    // Filter dan hitung tunggakan dengan detail lengkap
    const result = [];
    
    for (const k of keluarga) {
      let totalTunggakan = 0;
      let hasArrears = false;
      
      if (k.danaMandiri.length === 0) {
        // Belum ada pembayaran sama sekali
        totalTunggakan = setting.jumlahIuran;
        hasArrears = true;
      } else {
        // Ada pembayaran, periksa status pembayaran
        const pembayaran = k.danaMandiri[0]; // Ambil pembayaran untuk tahun ini
        
        if (pembayaran.statusPembayaran === "lunas") {
          // Jika status lunas, tidak ada tunggakan
          hasArrears = false;
          totalTunggakan = 0;
        } else if (pembayaran.statusPembayaran === "sebagian_bulan") {
          const totalExpected = pembayaran.totalIuran || setting.jumlahIuran;
          totalTunggakan = totalExpected - pembayaran.jumlahDibayar;
          hasArrears = totalTunggakan > 0;
        } else if (pembayaran.statusPembayaran === "belum_ada_pembayaran") {
          totalTunggakan = pembayaran.totalIuran || setting.jumlahIuran;
          hasArrears = true;
        } else {
          // Fallback: hitung berdasarkan total yang sudah dibayar vs yang seharusnya
          const totalDibayar = k.danaMandiri.reduce((sum, payment) => sum + payment.jumlahDibayar, 0);
          const sisaTunggakan = setting.jumlahIuran - totalDibayar;
          
          if (sisaTunggakan > 0) {
            totalTunggakan = sisaTunggakan;
            hasArrears = true;
          }
        }
      }
      
      // Hanya masukkan ke hasil jika ada tunggakan
      if (hasArrears && totalTunggakan > 0) {
        result.push({
          keluargaId: k.id,
          namaKepalaKeluarga: k.namaKepalaKeluarga,
          alamat: k.alamat || "",
          nomorTelepon: k.nomorTelepon || "",
          tahunTertunggak: [targetYear],
          totalTunggakan
        });
      }
    }
    
    return result;
  } catch (error) {
    console.error("Error calculating dana mandiri arrears detailed:", error);
    return [];
  }
}

/**
 * Fungsi untuk menghitung tunggakan IKATA dengan format lengkap (untuk modul IKATA)
 */
export async function calculateIkataArrearsDetailed(year?: number) {
  const targetYear = year || nowInJakarta().getFullYear();
  
  try {
    // Ambil pengaturan iuran IKATA
    const setting = await getIkataSettingByYear(targetYear);
    if (!setting) {
      return [];
    }

    // Ambil keluarga dengan data iuran IKATA
    const keluarga = await prisma.keluargaUmat.findMany({
      where: {
        tanggalKeluar: null,
        status: "HIDUP",
      },
      select: {
        id: true,
        namaKepalaKeluarga: true,
        alamat: true,
        nomorTelepon: true,
        iurataIkata: {
          where: { tahun: targetYear }
        }
      }
    });

    // Filter dan hitung tunggakan dengan detail lengkap
    const result = [];
    
    for (const k of keluarga) {
      let totalTunggakan = 0;
      let hasArrears = false;
      
      if (k.iurataIkata.length === 0) {
        // Belum ada pembayaran sama sekali
        totalTunggakan = setting.jumlahIuran;
        hasArrears = true;
      } else {
        const iuran = k.iurataIkata[0]; // Ambil data iuran untuk tahun ini
        
        if (iuran.status === "BELUM_BAYAR") {
          totalTunggakan = iuran.totalIuran || setting.jumlahIuran;
          hasArrears = true;
        } else if (iuran.status === "SEBAGIAN_BULAN") {
          const totalExpected = iuran.totalIuran || setting.jumlahIuran;
          totalTunggakan = totalExpected - iuran.jumlahDibayar;
          hasArrears = totalTunggakan > 0;
        }
        // Jika status LUNAS, tidak ada tunggakan (hasArrears = false)
      }
      
      // Hanya masukkan ke hasil jika ada tunggakan
      if (hasArrears && totalTunggakan > 0) {
        result.push({
          keluargaId: k.id,
          namaKepalaKeluarga: k.namaKepalaKeluarga,
          alamat: k.alamat || "",
          nomorTelepon: k.nomorTelepon || "",
          tahunTertunggak: [targetYear],
          totalTunggakan,
          iuranData: k.iurataIkata // Tambahkan data iuran untuk keperluan format periode
        });
      }
    }
    
    return result;
  } catch (error) {
    console.error("Error calculating IKATA arrears detailed:", error);
    return [];
  }
}

/**
 * Fungsi untuk memformat periode tunggakan
 */
export function formatPeriodeTunggakan(year: number, isMultiYear = false, years?: number[]) {
  const getBulanIndonesia = (bulan: number) => {
    const namaBulan = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];
    return namaBulan[bulan];
  };

  if (isMultiYear && years && years.length > 1) {
    const sortedYears = [...years].sort((a, b) => a - b);
    return `${sortedYears[0]} - ${sortedYears[sortedYears.length - 1]}`;
  }

  // Untuk tunggakan, tampilkan periode penuh (Januari-Desember)
  return `${getBulanIndonesia(0)}-${getBulanIndonesia(11)} ${year}`;
}

/**
 * Fungsi untuk memformat periode tunggakan IKATA berdasarkan pembayaran
 */
export function formatPeriodeTunggakanIkata(year: number, iuranData?: any) {
  const getBulanIndonesia = (bulan: number) => {
    const namaBulan = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];
    return namaBulan[bulan - 1]; // bulan dalam database dimulai dari 1
  };

  // Jika tidak ada data iuran, berarti belum bayar sama sekali
  if (!iuranData || iuranData.length === 0) {
    return `${getBulanIndonesia(1)}-${getBulanIndonesia(12)} ${year}`;
  }

  // Cari data iuran untuk tahun yang diminta
  const iuranTahunIni = iuranData.find((iuran: any) => iuran.tahun === year);
  
  if (!iuranTahunIni) {
    return `${getBulanIndonesia(1)}-${getBulanIndonesia(12)} ${year}`;
  }

  // Jika status LUNAS, tidak ada tunggakan
  if (iuranTahunIni.status === "LUNAS") {
    return ""; // Tidak ada tunggakan
  }

  // Jika status SEBAGIAN_BULAN, hitung periode yang belum dibayar
  if (iuranTahunIni.status === "SEBAGIAN_BULAN" && iuranTahunIni.bulanAkhir) {
    const bulanTerbayar = iuranTahunIni.bulanAkhir;
    if (bulanTerbayar >= 12) {
      return ""; // Sudah bayar sampai Desember, tidak ada tunggakan
    }
    const bulanMulaiTunggakan = bulanTerbayar + 1;
    return `${getBulanIndonesia(bulanMulaiTunggakan)}-${getBulanIndonesia(12)} ${year}`;
  }

  // Jika status BELUM_BAYAR, tampilkan periode penuh
  return `${getBulanIndonesia(1)}-${getBulanIndonesia(12)} ${year}`;
}

/**
 * Fungsi untuk memformat periode tunggakan dana mandiri berdasarkan pembayaran
 */
export function formatPeriodeTunggakanDanaMandiri(year: number, pembayaranData?: any) {
  const getBulanIndonesia = (bulan: number) => {
    const namaBulan = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];
    return namaBulan[bulan - 1]; // bulan dalam database dimulai dari 1
  };

  // Jika tidak ada data pembayaran, berarti belum bayar sama sekali
  if (!pembayaranData) {
    return `${getBulanIndonesia(1)}-${getBulanIndonesia(12)} ${year}`;
  }

  // Jika status lunas, tidak ada tunggakan
  if (pembayaranData.statusPembayaran === "lunas") {
    return ""; // Tidak ada tunggakan
  }

  // Jika status sebagian_bulan, hitung periode yang belum dibayar
  if (pembayaranData.statusPembayaran === "sebagian_bulan" && pembayaranData.periodeBayar) {
    const bulanTerbayar = pembayaranData.periodeBayar;
    if (bulanTerbayar >= 12) {
      return ""; // Sudah bayar sampai Desember, tidak ada tunggakan
    }
    const bulanMulaiTunggakan = bulanTerbayar + 1;
    return `${getBulanIndonesia(bulanMulaiTunggakan)}-${getBulanIndonesia(12)} ${year}`;
  }

  // Jika status belum_ada_pembayaran, tampilkan periode penuh
  return `${getBulanIndonesia(1)}-${getBulanIndonesia(12)} ${year}`;
}

/**
 * Fungsi untuk memformat mata uang Rupiah
 */
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
} 