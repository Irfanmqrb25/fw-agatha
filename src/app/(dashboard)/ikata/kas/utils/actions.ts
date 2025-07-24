'use server';

import { revalidatePath } from "next/cache";
import { createKasIkataTransaction, updateKasIkataTransaction, deleteKasIkataTransaction } from "./kas-ikata-service";
import { JenisTransaksi, TipeTransaksiIkata, StatusApproval } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { TransactionData } from "../types";

// Create transaction
export async function createTransaction(data: {
  tanggal: Date;
  jenisTranasksi: JenisTransaksi;
  tipeTransaksi: TipeTransaksiIkata;
  keterangan?: string;
  jumlah: number;
  keluargaId?: string;
  totalIuran?: number;
  statusPembayaran?: string;
  periodeBayar?: string[];
}) {
  try {

    // Validasi data
    if (!data.tanggal || !data.jenisTranasksi || !data.tipeTransaksi || !data.jumlah) {
      throw new Error("Data transaksi tidak lengkap");
    }

    // Validasi tipe transaksi sesuai jenis
    if (data.jenisTranasksi === JenisTransaksi.UANG_MASUK) {
      switch (data.tipeTransaksi) {
        case TipeTransaksiIkata.IURAN_ANGGOTA:
        case TipeTransaksiIkata.TRANSFER_DANA_DARI_LINGKUNGAN:
        case TipeTransaksiIkata.SUMBANGAN_ANGGOTA:
        case TipeTransaksiIkata.PENERIMAAN_LAIN:
          break;
        default:
          throw new Error("Tipe transaksi tidak sesuai dengan jenis transaksi uang masuk");
      }
    }

    if (data.jenisTranasksi === JenisTransaksi.UANG_KELUAR) {
      switch (data.tipeTransaksi) {
        case TipeTransaksiIkata.UANG_DUKA_PAPAN_BUNGA:
        case TipeTransaksiIkata.KUNJUNGAN_KASIH:
        case TipeTransaksiIkata.CINDERAMATA_KELAHIRAN:
        case TipeTransaksiIkata.CINDERAMATA_PERNIKAHAN:
        case TipeTransaksiIkata.UANG_AKOMODASI:
        case TipeTransaksiIkata.PEMBELIAN:
        case TipeTransaksiIkata.LAIN_LAIN:
          break;
        default:
          throw new Error("Tipe transaksi tidak sesuai dengan jenis transaksi uang keluar");
      }
    }

    // Tentukan debit dan kredit berdasarkan jenis transaksi
    const debit = data.jenisTranasksi === JenisTransaksi.UANG_MASUK ? data.jumlah : 0;
    const kredit = data.jenisTranasksi === JenisTransaksi.UANG_KELUAR ? data.jumlah : 0;


    // Buat transaksi baru
    const transaction = await createKasIkataTransaction({
      tanggal: data.tanggal,
      jenisTranasksi: data.jenisTranasksi,
      tipeTransaksi: data.tipeTransaksi,
      keterangan: data.keterangan || '',
      debit,
      kredit,
      keluargaId: data.keluargaId,
      totalIuran: data.totalIuran,
      statusPembayaran: data.statusPembayaran,
      periodeBayar: data.periodeBayar
    });
    
    if (!transaction) {
      throw new Error("Gagal membuat transaksi: Tidak ada respons dari server");
    }
    
    revalidatePath('/ikata/kas');
    revalidatePath('/dashboard');
    return transaction;
  } catch (error: any) {
    console.error("[createTransaction] Error:", error);
    throw new Error(error.message || "Gagal membuat transaksi kas IKATA");
  }
}

// Update transaction
export async function updateTransaction(id: string, data: {
  tanggal: Date;
  jenisTranasksi: JenisTransaksi;
  tipeTransaksi: TipeTransaksiIkata;
  keterangan?: string;
  jumlah: number;
  keluargaId?: string;
  totalIuran?: number;
  statusPembayaran?: string;
  periodeBayar?: string[];
}) {
  try {
    // Tentukan debit dan kredit berdasarkan jenis transaksi
    const debit = data.jenisTranasksi === JenisTransaksi.UANG_MASUK ? data.jumlah : 0;
    const kredit = data.jenisTranasksi === JenisTransaksi.UANG_KELUAR ? data.jumlah : 0;
    
    // Update transaksi
    const transaction = await updateKasIkataTransaction(id, {
      tanggal: data.tanggal,
      jenisTranasksi: data.jenisTranasksi,
      tipeTransaksi: data.tipeTransaksi,
      keterangan: data.keterangan,
      debit,
      kredit,
      keluargaId: data.keluargaId,
      totalIuran: data.totalIuran,
      statusPembayaran: data.statusPembayaran,
      periodeBayar: data.periodeBayar
    });
    
    revalidatePath('/ikata/kas');
    revalidatePath('/dashboard');
    return transaction;
  } catch (error) {
    console.error("Error updating transaction:", error);
    throw new Error("Gagal memperbarui transaksi kas IKATA");
  }
}

// Delete transaction
export async function deleteTransaction(id: string) {
  try {
    const transaction = await deleteKasIkataTransaction(id);
    
    revalidatePath('/ikata/kas');
    revalidatePath('/dashboard');
    return transaction;
  } catch (error) {
    console.error("Error deleting transaction:", error);
    throw new Error("Gagal menghapus transaksi kas IKATA");
  }
}

// Set jumlah iuran IKATA
export async function setIkataDues(formData: FormData) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user.role !== "BENDAHARA" && session.user.role !== "WAKIL_BENDAHARA" && session.user.role !== "SUPER_USER")) {
      throw new Error("Anda tidak memiliki izin untuk mengatur iuran IKATA")
    }

    const year = parseInt(formData.get("year") as string)
    const amount = parseFloat(formData.get("amount") as string)

    if (!year || !amount) {
      throw new Error("Data iuran tidak lengkap")
    }

    // Simpan pengaturan di database
    await prisma.ikataSetting.upsert({
      where: {
        tahun: year
      },
      update: {
        jumlahIuran: amount
      },
      create: {
        tahun: year,
        jumlahIuran: amount
      }
    })
    
    // Dapatkan semua keluarga
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
          where: {
            tahun: year
          }
        }
      }
    })

    // Filter keluarga yang belum bayar untuk tahun ini
    const belumBayar = keluarga.filter(k => k.iurataIkata.length === 0)
    
    // Buat array untuk menyimpan operasi database
    const operations = [];
    
    // Mendapatkan semua pengaturan iuran IKATA yang ada
    const settingIuran = await prisma.ikataSetting.findMany();
    
    // Proses untuk semua keluarga yang belum bayar
    for (const kel of belumBayar) {
      // Cari apakah keluarga sudah ada di daftar tunggakan
      const existingArrear = await prisma.ikataArrears.findUnique({
        where: { keluargaId: kel.id }
      });
      
      if (existingArrear) {
        // Jika sudah ada, perbarui tahun tertunggak dan total tunggakan
        let tahunTertunggak = existingArrear.tahunTertunggak;
        if (!tahunTertunggak.includes(year)) {
          tahunTertunggak.push(year);
        }
        
        // Hitung ulang total tunggakan berdasarkan tahun-tahun tertunggak
        let totalTunggakan = 0;
        for (const tahun of tahunTertunggak) {
          const setting = settingIuran.find(s => s.tahun === tahun);
          if (tahun === year) {
            // Gunakan nilai iuran yang baru untuk tahun yang sedang diatur
            totalTunggakan += amount;
          } else if (setting) {
            // Gunakan nilai dari database untuk tahun lain
            totalTunggakan += setting.jumlahIuran;
          }
        }
        
        operations.push(
          prisma.ikataArrears.update({
            where: { keluargaId: kel.id },
            data: {
              tahunTertunggak,
              totalTunggakan
            }
          })
        );
      } else {
        // Jika belum ada, buat baru
        operations.push(
          prisma.ikataArrears.create({
            data: {
              keluargaId: kel.id,
              namaKepalaKeluarga: kel.namaKepalaKeluarga,
              alamat: kel.alamat || "",
              nomorTelepon: kel.nomorTelepon || "",
              tahunTertunggak: [year],
              totalTunggakan: amount
            }
          })
        );
      }
    }
    
    // Perbarui total tunggakan untuk keluarga yang sudah memiliki tunggakan tahun ini
    const existingArrears = await prisma.ikataArrears.findMany({
      where: {
        tahunTertunggak: {
          has: year
        }
      }
    });
    
    for (const arrear of existingArrears) {
      // Hanya perbarui total tunggakan jika tahun ini termasuk dalam tunggakan
      if (arrear.tahunTertunggak.includes(year)) {
        // Hitung ulang total tunggakan
        let totalTunggakan = 0;
        for (const tahun of arrear.tahunTertunggak) {
          if (tahun === year) {
            totalTunggakan += amount;
          } else {
            const setting = settingIuran.find(s => s.tahun === tahun);
            if (setting) {
              totalTunggakan += setting.jumlahIuran;
            }
          }
        }
        
        // Hanya tambahkan ke operasi jika keluarga belum diproses sebelumnya
        const alreadyProcessed = belumBayar.some(k => k.id === arrear.keluargaId);
        if (!alreadyProcessed) {
          operations.push(
            prisma.ikataArrears.update({
              where: { keluargaId: arrear.keluargaId },
              data: {
                totalTunggakan
              }
            })
          );
        }
      }
    }
    
    // Jalankan semua operasi database dalam satu transaksi
    if (operations.length > 0) {
      await prisma.$transaction(operations);
    }
    
    // Revalidasi path untuk memperbarui UI
    revalidatePath("/ikata/kas")

    return { success: true, data: { year, amount, updatedCount: operations.length } }
  } catch (error) {
    console.error("Error saat mengatur iuran IKATA:", error)
    return { success: false, error: error instanceof Error ? error.message : "Gagal mengatur iuran IKATA" }
  }
}

// Dapatkan pengaturan iuran IKATA berdasarkan tahun
export async function getIkataSetting(year: number) {
  try {
    // Cek hak akses (opsional, bisa dihapus jika semua pengguna boleh melihat setting)
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      throw new Error("Anda harus login untuk melihat data ini")
    }
    
    // Ambil data setting dari database
    const setting = await prisma.ikataSetting.findUnique({
      where: {
        tahun: year
      }
    })
    
    // Jika tidak ada setting untuk tahun tersebut, gunakan nilai default 0
    const amount = setting?.jumlahIuran || 0
    
    return { success: true, data: { year, amount } }
  } catch (error) {
    console.error("Error saat mengambil setting iuran IKATA:", error)
    return { success: false, error: error instanceof Error ? error.message : "Gagal mengambil setting iuran IKATA" }
  }
}

// Fungsi untuk mengambil data transaksi terbaru
export async function getLatestTransactionData() {
  try {
    const transactions = await prisma.kasIkata.findMany({
      orderBy: {
        tanggal: 'desc'
      }
    });
    
    if (!transactions) {
      return {
        success: false,
        error: "Data transaksi tidak ditemukan",
        data: [] as {
          id: string;
          tanggal: Date;
          keterangan: string | null;
          jenisTransaksi: JenisTransaksi;
          tipeTransaksi: TipeTransaksiIkata;
          debit: number;
          kredit: number;
          locked: boolean;
          createdAt: Date;
          updatedAt: Date;
        }[]
      };
    }
    
    // Konversi data dari database ke format UI
    const mappedData = transactions.map(tx => ({
      id: tx.id,
      tanggal: tx.tanggal,
      keterangan: tx.keterangan,
      jenisTransaksi: tx.jenisTranasksi,
      tipeTransaksi: tx.tipeTransaksi,
      debit: tx.debit,
      kredit: tx.kredit,
      locked: tx.locked,
      createdAt: tx.createdAt,
      updatedAt: tx.updatedAt
    }));

    return {
      success: true,
      data: mappedData
    };
  } catch (error) {
    console.error("Error fetching latest transaction data:", error);
    return {
      success: false,
      error: "Gagal mengambil data transaksi terbaru",
      data: [] as {
        id: string;
        tanggal: Date;
        keterangan: string | null;
        jenisTransaksi: JenisTransaksi;
        tipeTransaksi: TipeTransaksiIkata;
        debit: number;
        kredit: number;
        locked: boolean;
        createdAt: Date;
        updatedAt: Date;
      }[]
    };
  }
} 