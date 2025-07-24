'use server';

import { prisma } from "@/lib/db";
import { JenisTransaksi, StatusIuran, TipeTransaksiIkata } from "@prisma/client";
import { DelinquentPayment } from "../types";
import { revalidatePath } from "next/cache";
import { calculateIkataArrearsDetailed, formatPeriodeTunggakanIkata } from "../../../dashboard/utils/arrears-utils";

// Fungsi untuk mendapatkan data penunggak iuran IKATA
export async function getDelinquentPayments(year?: number): Promise<DelinquentPayment[]> {
  try {
    // Gunakan tahun saat ini jika tidak ada yang diberikan
    const currentYear = year || new Date().getFullYear();
    
    // Gunakan utility function untuk menghitung tunggakan
    const arrearsData = await calculateIkataArrearsDetailed(currentYear);
    
    // Konversi ke format DelinquentPayment
    const delinquentPayments: DelinquentPayment[] = arrearsData.map(arrear => {
      // Hitung periode tunggakan berdasarkan data pembayaran
      const periodeTunggakan = formatPeriodeTunggakanIkata(currentYear, arrear.iuranData);
      
      // Tentukan periode awal dan akhir berdasarkan status pembayaran
      let periodeAwal = `${currentYear}-01`;
      let periodeAkhir = `${currentYear}-12`;
      
      if (arrear.iuranData && arrear.iuranData.length > 0) {
        const iuran = arrear.iuranData[0];
        if (iuran.status === "SEBAGIAN_BULAN" && iuran.bulanAkhir) {
          // Jika sebagian bulan, periode awal dimulai dari bulan setelah bulan terakhir yang dibayar
          const bulanMulai = iuran.bulanAkhir + 1;
          if (bulanMulai <= 12) {
            periodeAwal = `${currentYear}-${bulanMulai.toString().padStart(2, '0')}`;
          }
        }
      }
      
      return {
        id: arrear.keluargaId,
        kepalaKeluarga: arrear.namaKepalaKeluarga,
        keluargaId: arrear.keluargaId,
        periodeAwal,
        periodeAkhir,
        jumlahTunggakan: arrear.totalTunggakan,
        status: arrear.totalTunggakan > 0 ? 'belum_lunas' : 'belum_lunas',
        totalIuran: arrear.totalTunggakan,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        periodeTunggakan // Tambahkan field untuk menampilkan periode yang sudah diformat
      };
    });
    
    return delinquentPayments;
  } catch (error) {
    console.error("Error fetching delinquent payments:", error);
    throw new Error("Gagal mengambil data penunggak iuran IKATA");
  }
}

// Fungsi untuk mengirim notifikasi kepada penunggak iuran
export async function sendNotificationToDelinquents(delinquentIds: string[], message: string) {
  try {
    // Ambil data keluarga penunggak untuk mendapatkan user IDs
    // delinquentIds berisi keluargaId, bukan id dari tabel IuranIkata
    const keluargaWithUsers = await prisma.keluargaUmat.findMany({
      where: {
        id: { in: delinquentIds }
      },
      include: {
        users: true
      }
    });
    
    // Array untuk menyimpan operasi bulk create notifikasi
    const notificationData = [];
    
    // Persiapkan data notifikasi untuk setiap user yang terkait dengan keluarga penunggak
    for (const keluarga of keluargaWithUsers) {
      const users = keluarga.users;
      
      for (const user of users) {
        notificationData.push({
          pesan: message || `Mohon segera melunasi iuran IKATA untuk tahun ${new Date().getFullYear()}.`,
          userId: user.id,
          dibaca: false
        });
      }
    }
    
    // Buat notifikasi secara bulk jika ada data
    if (notificationData.length > 0) {
      await prisma.notification.createMany({
        data: notificationData
      });
    }
    
    return { 
      success: true, 
      count: notificationData.length, 
      message: `${notificationData.length} notifikasi berhasil dikirim.` 
    };
  } catch (error) {
    console.error("Error sending notifications:", error);
    throw new Error("Gagal mengirim notifikasi");
  }
}

// Fungsi untuk mengatur nilai iuran IKATA
export async function setIuranIkata(
  keluargaId: string, 
  tahun: number, 
  jumlahDibayar: number, 
  status: StatusIuran, 
  bulanAkhir?: number,
  totalIuran: number = 120000
) {
  try {
    // Cek apakah data iuran sudah ada
    const existingIuran = await prisma.iuranIkata.findFirst({
      where: {
        keluargaId,
        tahun
      }
    });
    
    // Tanggal saat ini untuk transaksi
    const tanggalTransaksi = new Date();
    
    // Buat atau update data iuran
    let updatedIuran;
    
    // Data yang akan diupdate/dibuat
    const iuranData = {
      status,
      jumlahDibayar,
      totalIuran,
      bulanAwal: 1, // Selalu mulai dari Januari
      ...(status === StatusIuran.SEBAGIAN_BULAN && bulanAkhir ? { bulanAkhir } : { bulanAkhir: 12 })
    };
    
    if (existingIuran) {
      // Update data iuran yang ada
      updatedIuran = await prisma.iuranIkata.update({
        where: {
          id: existingIuran.id
        },
        data: iuranData
      });
    } else {
      // Buat data iuran baru
      updatedIuran = await prisma.iuranIkata.create({
        data: {
          keluargaId,
          tahun,
          ...iuranData
        }
      });
    }
    
    // Dapatkan nama kepala keluarga
    const keluarga = await prisma.keluargaUmat.findUnique({
      where: { id: keluargaId },
      select: { namaKepalaKeluarga: true }
    });
    
    // Catat transaksi di KasIkata
    await prisma.kasIkata.create({
      data: {
        tanggal: tanggalTransaksi,
        jenisTranasksi: JenisTransaksi.UANG_MASUK,
        tipeTransaksi: TipeTransaksiIkata.IURAN_ANGGOTA,
        keterangan: `Pembayaran iuran IKATA tahun ${tahun} - ${keluarga?.namaKepalaKeluarga || 'Anggota'}`,
        debit: jumlahDibayar,
        kredit: 0
      }
    });
    
    // Revalidasi jalur untuk memperbarui UI
    revalidatePath('/ikata/monitoring');
    revalidatePath('/ikata/kas');
    revalidatePath('/dashboard');
    
    return updatedIuran;
  } catch (error) {
    console.error("Error setting iuran IKATA:", error);
    throw new Error("Gagal mengatur nilai iuran IKATA");
  }
}

// Fungsi untuk mendapatkan pengaturan nilai iuran IKATA
export async function getIuranSetting() {
  try {
    // Ambil pengaturan iuran IKATA dari database
    const setting = await prisma.ikataSetting.findFirst({
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    if (setting) {
      return {
        bulanan: setting.jumlahIuran / 12,
        tahunan: setting.jumlahIuran
      };
    }
    
    // Jika tidak ada pengaturan, kembalikan nilai default
    return {
      bulanan: 10000,
      tahunan: 120000
    };
  } catch (error) {
    console.error("Error getting iuran setting:", error);
    throw new Error("Gagal mendapatkan pengaturan nilai iuran IKATA");
  }
} 