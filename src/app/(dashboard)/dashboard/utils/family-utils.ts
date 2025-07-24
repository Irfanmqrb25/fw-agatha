/**
 * Utilitas untuk perhitungan data keluarga umat
 */
import { prisma } from "@/lib/db";
import { StatusKehidupan } from "@prisma/client";

/**
 * Fungsi untuk menghitung jumlah kepala keluarga aktif
 * Kepala keluarga aktif adalah yang masih hidup dan tidak pindah
 */
export async function hitungJumlahKepalaKeluarga(): Promise<number> {
  try {
    // Hanya hitung kepala keluarga yang status HIDUP dan tidak pindah (tanggalKeluar = null)
    return await prisma.keluargaUmat.count({
      where: {
        status: StatusKehidupan.HIDUP,
        tanggalKeluar: null
      }
    });
  } catch (error) {
    console.error("Error menghitung jumlah kepala keluarga:", error);
    return 0;
  }
}

/**
 * Fungsi untuk menghitung total jumlah jiwa dari semua keluarga aktif
 * Ini menghitung semua anggota keluarga: KK, pasangan, dan tanggungan
 * Anggota yang meninggal tidak dihitung, keluarga yang pindah tidak dihitung
 */
export async function hitungTotalJiwa(): Promise<number> {
  try {
    // Ambil semua keluarga aktif (tidak pindah dan kepala keluarga masih hidup)
    const keluargaUmat = await prisma.keluargaUmat.findMany({
      where: {
        status: StatusKehidupan.HIDUP,
        tanggalKeluar: null
      },
      include: {
        pasangan: true,
        tanggungan: true
      }
    });
    
    // Hitung jumlah jiwa
    let jumlahJiwa = 0;
    
    for (const keluarga of keluargaUmat) {
      // Tambahkan kepala keluarga (selalu dihitung 1 karena sudah difilter yang masih hidup)
      jumlahJiwa += 1;
      
      // Tambahkan pasangan jika ada dan masih hidup
      if (keluarga.pasangan && keluarga.pasangan.status === StatusKehidupan.HIDUP) {
        jumlahJiwa += 1;
      }
      
      // Tambahkan tanggungan yang masih hidup
      if (keluarga.tanggungan && keluarga.tanggungan.length > 0) {
        const tanggunganHidup = keluarga.tanggungan.filter(t => t.status === StatusKehidupan.HIDUP);
        jumlahJiwa += tanggunganHidup.length;
      }
    }
    
    return jumlahJiwa;
  } catch (error) {
    console.error("Error menghitung total jiwa:", error);
    return 0;
  }
}

/**
 * Fungsi untuk menghitung ulang jumlah anggota keluarga untuk satu keluarga
 * dan memperbarui nilai di database
 */
export async function updateJumlahAnggotaKeluarga(keluargaId: string): Promise<boolean> {
  try {
    // Dapatkan data keluarga
    const keluarga = await prisma.keluargaUmat.findUnique({
      where: { id: keluargaId },
      include: {
        pasangan: true,
        tanggungan: true
      }
    });
    
    if (!keluarga) return false;
    
    // Hitung jumlah anggota keluarga yang masih hidup
    let jumlahAnggota = 0;
    
    // Tambahkan kepala keluarga jika masih hidup
    if (keluarga.status === StatusKehidupan.HIDUP) {
      jumlahAnggota += 1;
    }
    
    // Tambahkan pasangan jika ada dan masih hidup
    if (keluarga.pasangan && keluarga.pasangan.status === StatusKehidupan.HIDUP) {
      jumlahAnggota += 1;
    }
    
    // Tambahkan tanggungan yang masih hidup
    if (keluarga.tanggungan && keluarga.tanggungan.length > 0) {
      const tanggunganHidup = keluarga.tanggungan.filter(t => t.status === StatusKehidupan.HIDUP);
      jumlahAnggota += tanggunganHidup.length;
    }
    
    // Update jumlah anggota di database
    await prisma.keluargaUmat.update({
      where: { id: keluargaId },
      data: { jumlahAnggotaKeluarga: jumlahAnggota }
    });
    
    return true;
  } catch (error) {
    console.error("Error update jumlah anggota keluarga:", error);
    return false;
  }
} 