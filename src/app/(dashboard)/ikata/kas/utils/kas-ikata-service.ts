'use server';

import { prisma } from "@/lib/db";
import { JenisTransaksi, TipeTransaksiIkata } from "@prisma/client";
import { revalidatePath } from "next/cache";

// Fungsi untuk mendapatkan data transaksi Kas IKATA
export async function getKasIkataTransactions(bulan?: number, tahun?: number) {
  try {
    // Gunakan bulan dan tahun saat ini jika tidak diberikan
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // Januari = 1
    const currentYear = currentDate.getFullYear();
    
    // Gunakan parameter input jika diberikan, atau default ke bulan dan tahun saat ini
    const month = bulan || currentMonth;
    const year = tahun || currentYear;
    
    // Filter berdasarkan bulan dan tahun
    const dateStart = new Date(year, month - 1, 1);
    const dateEnd = new Date(year, month, 0, 23, 59, 59);

    // Query untuk mendapatkan transaksi
    const transactionQuery = {
      where: { 
        tanggal: {
          gte: dateStart,
          lte: dateEnd
        } 
      },
      orderBy: {
        tanggal: 'desc' as const
      }
    };
    
    const transactions = await prisma.kasIkata.findMany(transactionQuery);
    
    return transactions;
  } catch (error) {
    throw new Error("Gagal mengambil data transaksi kas IKATA");
  }
}

// Fungsi untuk mendapatkan SEMUA data transaksi Kas IKATA tanpa filter periode
export async function getAllKasIkataTransactions() {
  try {
    // Query untuk mendapatkan semua transaksi
    const transactions = await prisma.kasIkata.findMany({
      orderBy: {
        tanggal: 'desc' as const
      }
    });
    
    return transactions;
  } catch (error) {
    throw new Error("Gagal mengambil data transaksi kas IKATA");
  }
}

// Fungsi untuk menghitung saldo awal berdasarkan saldo akhir bulan sebelumnya
async function calculateCorrectSaldoAwal(bulan: number, tahun: number): Promise<number> {
  try {
    // Jika bulan adalah Januari, ada dua kemungkinan:
    // 1. Januari tahun pertama (tahun setting saldo awal) - ambil saldo awal yang di-set
    // 2. Januari tahun selanjutnya - saldo akhir Desember tahun sebelumnya
    if (bulan === 1) {
      // Cek apakah ini adalah tahun pertama dengan saldo awal yang di-set
      const saldoAwalTransaction = await prisma.kasIkata.findFirst({
        where: {
          tipeTransaksi: TipeTransaksiIkata.LAIN_LAIN,
          keterangan: "SALDO AWAL"
        },
        orderBy: {
          updatedAt: 'desc'
        }
      });
      
      if (saldoAwalTransaction) {
        const tahunSaldoAwal = saldoAwalTransaction.tanggal.getFullYear();
        
        // Jika ini adalah tahun yang sama dengan setting saldo awal, gunakan saldo awal
        if (tahun === tahunSaldoAwal) {
          return saldoAwalTransaction.debit;
        }
        
        // Jika ini adalah tahun setelah setting saldo awal, hitung dari saldo akhir Desember tahun sebelumnya
        if (tahun > tahunSaldoAwal) {
          return await calculateSaldoAkhirBulan(12, tahun - 1);
        }
      }
      
      // Jika tidak ada saldo awal di-set atau tahun sebelum setting saldo awal
      return 0;
    }

    // Untuk bulan lainnya (Februari - Desember), hitung saldo akhir bulan sebelumnya
    const bulanSebelumnya = bulan - 1;
    return await calculateSaldoAkhirBulan(bulanSebelumnya, tahun);
  } catch (error) {
    console.error("Error calculating correct saldo awal:", error);
    return 0;
  }
}

// Fungsi untuk menghitung saldo akhir suatu bulan
async function calculateSaldoAkhirBulan(bulan: number, tahun: number): Promise<number> {
  try {
    // Hitung saldo awal hingga akhir bulan yang diminta secara iteratif
    // untuk menghindari recursion yang terlalu dalam
    
    // Dapatkan saldo awal tahun (Januari)
    const saldoAwalTahun = await calculateCorrectSaldoAwal(1, tahun);
    
    let saldoBerjalan = saldoAwalTahun;
    
    // Iterasi dari Januari sampai bulan yang diminta
    for (let currentBulan = 1; currentBulan <= bulan; currentBulan++) {
      // Filter berdasarkan bulan dan tahun
      const dateStart = new Date(tahun, currentBulan - 1, 1);
      const dateEnd = new Date(tahun, currentBulan, 0, 23, 59, 59);

      // Query untuk transaksi pada bulan yang dipilih (kecuali saldo awal)
      const transactions = await prisma.kasIkata.findMany({
        where: {
          tanggal: {
            gte: dateStart,
            lte: dateEnd,
          },
          keterangan: {
            not: "SALDO AWAL"
          }
        },
        select: {
          jenisTranasksi: true,
          debit: true,
          kredit: true
        }
      });
      
      // Hitung pemasukan dan pengeluaran bulan ini
      const pemasukanTxs = transactions.filter(tx => tx.jenisTranasksi === "UANG_MASUK");
      const pengeluaranTxs = transactions.filter(tx => tx.jenisTranasksi === "UANG_KELUAR");
      
      const pemasukan = pemasukanTxs.reduce((sum, tx) => sum + tx.debit, 0);
      const pengeluaran = pengeluaranTxs.reduce((sum, tx) => sum + tx.kredit, 0);
      
      // Update saldo berjalan
      if (currentBulan === 1) {
        // Untuk Januari, saldo awal sudah termasuk
        saldoBerjalan = saldoAwalTahun + pemasukan - pengeluaran;
      } else {
        // Untuk bulan selanjutnya, saldo awal adalah saldo akhir bulan sebelumnya
        saldoBerjalan = saldoBerjalan + pemasukan - pengeluaran;
      }
    }
    
    return saldoBerjalan;
  } catch (error) {
    console.error("Error calculating saldo akhir bulan:", error);
    return 0;
  }
}

// Fungsi untuk mendapatkan ringkasan Kas IKATA
export async function getKasIkataSummary(bulan?: number, tahun?: number) {
  try {
    // Gunakan bulan dan tahun saat ini jika tidak diberikan
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // Januari = 1
    const currentYear = currentDate.getFullYear();
    
    // Gunakan parameter input jika diberikan, atau default ke bulan dan tahun saat ini
    const month = bulan || currentMonth;
    const year = tahun || currentYear;
    
    // Filter berdasarkan bulan dan tahun
    const dateStart = new Date(year, month - 1, 1);
    const dateEnd = new Date(year, month, 0, 23, 59, 59);

    // Dapatkan saldo awal yang benar (berdasarkan saldo akhir bulan sebelumnya)
    const saldoAwal = await calculateCorrectSaldoAwal(month, year);
    
    // Query untuk transaksi pada bulan yang dipilih
    const transactionQuery = {
      where: {
        tanggal: {
          gte: dateStart,
          lte: dateEnd,
        },
        keterangan: {
          not: "SALDO AWAL" // Jangan hitung transaksi saldo awal
        }
      }
    };
    
    // Dapatkan semua transaksi untuk bulan ini
    const transactions = await prisma.kasIkata.findMany({
      where: transactionQuery.where,
      select: {
        id: true,
        tanggal: true,
        jenisTranasksi: true,
        debit: true,
        kredit: true
      }
    });
    
    // Hitung pemasukan dan pengeluaran
    const pemasukanTxs = transactions.filter(tx => tx.jenisTranasksi === "UANG_MASUK");
    const pengeluaranTxs = transactions.filter(tx => tx.jenisTranasksi === "UANG_KELUAR");
    
    const pemasukan = pemasukanTxs.reduce((sum, tx) => sum + tx.debit, 0);
    const pengeluaran = pengeluaranTxs.reduce((sum, tx) => sum + tx.kredit, 0);
    
    // Hitung saldo akhir
    const saldoAkhir = saldoAwal + pemasukan - pengeluaran;
    
    const result = {
      saldoAwal,
      pemasukan,
      pengeluaran,
      saldoAkhir
    };
    
    return result;
  } catch (error) {
    throw new Error("Gagal menghitung ringkasan kas IKATA");
  }
}

// Fungsi untuk mendapatkan ringkasan SEMUA transaksi Kas IKATA tanpa filter periode
export async function getAllKasIkataSummary() {
  try {
    // Dapatkan saldo awal dari transaksi SALDO AWAL
    const saldoAwalTransaction = await prisma.kasIkata.findFirst({
      where: {
        tipeTransaksi: TipeTransaksiIkata.LAIN_LAIN,
        keterangan: "SALDO AWAL"
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });
    
    const saldoAwal = saldoAwalTransaction ? saldoAwalTransaction.debit : 0;
    
    // Dapatkan semua transaksi kecuali saldo awal
    const transactions = await prisma.kasIkata.findMany({
      where: {
        keterangan: {
          not: "SALDO AWAL" // Jangan hitung transaksi saldo awal
        }
      },
      select: {
        id: true,
        tanggal: true,
        jenisTranasksi: true,
        debit: true,
        kredit: true
      }
    });
    
    // Hitung pemasukan dan pengeluaran
    const pemasukanTxs = transactions.filter(tx => tx.jenisTranasksi === "UANG_MASUK");
    const pengeluaranTxs = transactions.filter(tx => tx.jenisTranasksi === "UANG_KELUAR");
    
    const pemasukan = pemasukanTxs.reduce((sum, tx) => sum + tx.debit, 0);
    const pengeluaran = pengeluaranTxs.reduce((sum, tx) => sum + tx.kredit, 0);
    
    // Hitung saldo akhir
    const saldoAkhir = saldoAwal + pemasukan - pengeluaran;
    
    const result = {
      saldoAwal,
      pemasukan,
      pengeluaran,
      saldoAkhir
    };
    
    return result;
  } catch (error) {
    throw new Error("Gagal menghitung ringkasan kas IKATA");
  }
}

// Fungsi untuk mendapatkan data keluarga umat (untuk dropdown)
export async function getKeluargaUmatList() {
  try {
    const keluarga = await prisma.keluargaUmat.findMany({
      select: {
        id: true,
        namaKepalaKeluarga: true
      },
      orderBy: {
        namaKepalaKeluarga: 'asc'
      }
    });
    
    return keluarga;
  } catch (error) {
    console.error("Error fetching keluarga umat list:", error);
    throw new Error("Gagal mengambil data keluarga umat");
  }
}

// Fungsi untuk membuat transaksi Kas IKATA baru
export async function createKasIkataTransaction(data: {
  tanggal: Date;
  jenisTranasksi: JenisTransaksi;
  tipeTransaksi: TipeTransaksiIkata;
  keterangan?: string;
  debit: number;
  kredit: number;
  keluargaId?: string;
  totalIuran?: number;
  statusPembayaran?: string;
  periodeBayar?: string[];
}) {
  try {

    // Validasi data dasar
    if (!data.tanggal || !data.jenisTranasksi || !data.tipeTransaksi) {
      throw new Error("Data transaksi tidak lengkap");
    }

    // Validasi prasyarat: saldo awal harus sudah diset
    const prerequisiteCheck = await validateIkataTransactionPrerequisites();
    if (!prerequisiteCheck.valid) {
      throw new Error(prerequisiteCheck.error || "Gagal validasi prasyarat");
    }

    // Validasi tipe transaksi sesuai dengan jenis transaksi
    const validasiTipeTransaksi = validateTransactionType(data.jenisTranasksi, data.tipeTransaksi);
    if (!validasiTipeTransaksi.valid) {
      throw new Error(validasiTipeTransaksi.error || "Tipe transaksi tidak valid");
    }

    // Pastikan tanggal valid dengan membuat objek Date baru
    const validDate = new Date(data.tanggal);
    if (isNaN(validDate.getTime())) {
      throw new Error("Tanggal tidak valid");
    }
    
    // Data untuk tabel KasIkata
    const kasIkataData = {
      tanggal: validDate,
      jenisTranasksi: data.jenisTranasksi,
      tipeTransaksi: data.tipeTransaksi,
      keterangan: data.keterangan || '',
      debit: data.debit,
      kredit: data.kredit,
      locked: false
    };

    // Mulai transaksi database
    const result = await prisma.$transaction(async (tx) => {
      // Buat transaksi di KasIkata
      const transaction = await tx.kasIkata.create({
        data: kasIkataData
      });

      // Penanganan khusus berdasarkan tipe transaksi
      switch (data.tipeTransaksi) {
        case TipeTransaksiIkata.IURAN_ANGGOTA:
          if (!data.keluargaId) {
            throw new Error("ID keluarga diperlukan untuk transaksi iuran anggota");
          }
          await handleIuranAnggota({ 
            ...data, 
            transaction,
            statusPembayaran: data.statusPembayaran,
            periodeBayar: data.periodeBayar 
          }, validDate);
          break;

        case TipeTransaksiIkata.SUMBANGAN_ANGGOTA:
          if (!data.keluargaId) {
            throw new Error("ID keluarga diperlukan untuk transaksi sumbangan anggota");
          }
          await handleSumbanganAnggota({ ...data, transaction }, validDate);
          break;

        case TipeTransaksiIkata.TRANSFER_DANA_DARI_LINGKUNGAN:
          await handleTransferDana({ ...data, transaction }, validDate);
          break;

        default:
          if (data.jenisTranasksi === JenisTransaksi.UANG_KELUAR) {
            await handlePengeluaran({ ...data, transaction }, validDate);
          }
      }

      return transaction;
    });

    // Revalidasi path untuk memperbarui UI
    revalidatePath("/ikata/kas");

    return result;
  } catch (error) {
    console.error("[createKasIkataTransaction] Error:", error);
    throw error instanceof Error 
      ? error 
      : new Error("Gagal membuat transaksi kas IKATA");
  }
}

// Fungsi helper untuk validasi tipe transaksi
function validateTransactionType(jenis: JenisTransaksi, tipe: TipeTransaksiIkata): { valid: boolean; error?: string } {
  const tipeUangMasuk = [
    TipeTransaksiIkata.IURAN_ANGGOTA,
    TipeTransaksiIkata.TRANSFER_DANA_DARI_LINGKUNGAN,
    TipeTransaksiIkata.SUMBANGAN_ANGGOTA,
    TipeTransaksiIkata.PENERIMAAN_LAIN
  ];

  const tipeUangKeluar = [
    TipeTransaksiIkata.UANG_DUKA_PAPAN_BUNGA,
    TipeTransaksiIkata.KUNJUNGAN_KASIH,
    TipeTransaksiIkata.CINDERAMATA_KELAHIRAN,
    TipeTransaksiIkata.CINDERAMATA_PERNIKAHAN,
    TipeTransaksiIkata.UANG_AKOMODASI,
    TipeTransaksiIkata.PEMBELIAN,
    TipeTransaksiIkata.LAIN_LAIN
  ];

  if (jenis === JenisTransaksi.UANG_MASUK && !tipeUangMasuk.includes(tipe as any)) {
    return {
      valid: false,
      error: "Tipe transaksi tidak sesuai dengan jenis transaksi uang masuk"
    };
  }

  if (jenis === JenisTransaksi.UANG_KELUAR && !tipeUangKeluar.includes(tipe as any)) {
    return {
      valid: false,
      error: "Tipe transaksi tidak sesuai dengan jenis transaksi uang keluar"
    };
  }

  return { valid: true };
}

// Handler untuk iuran anggota
async function handleIuranAnggota(data: any, validDate: Date) {
  try {
      const tahun = validDate.getFullYear();
      const bulan = validDate.getMonth() + 1;
      
      // Tentukan status berdasarkan statusPembayaran yang dikirim
      let status = "LUNAS";
      let bulanAwal = bulan;
      let bulanAkhir = bulan;
      
      if (data.statusPembayaran) {
        switch (data.statusPembayaran) {
          case 'lunas':
            status = "LUNAS";
            bulanAwal = 1;
            bulanAkhir = 12;
            break;
          case 'sebagian_bulan':
            status = "SEBAGIAN_BULAN";
            // Jika ada periodeBayar, gunakan untuk menentukan bulan
            if (data.periodeBayar && data.periodeBayar.length > 0) {
              const bulanTerbayar = data.periodeBayar.map((periode: string) => {
                const [tahunPeriode, bulanPeriode] = periode.split('-');
                return parseInt(bulanPeriode);
              }).sort((a: number, b: number) => a - b);
              
              bulanAwal = bulanTerbayar[0];
              bulanAkhir = bulanTerbayar[bulanTerbayar.length - 1];
            }
            break;
          case 'belum_ada_pembayaran':
            status = "BELUM_BAYAR";
            bulanAwal = bulan;
            bulanAkhir = bulan;
            break;
          default:
            status = "LUNAS";
            bulanAwal = 1;
            bulanAkhir = 12;
        }
      }
      
      // Update atau buat record IuranIkata
      await prisma.iuranIkata.upsert({
        where: {
          id: await getIuranIkataId(data.keluargaId, tahun)
        },
        update: {
          status: status as any,
          jumlahDibayar: data.debit,
          totalIuran: data.totalIuran || 120000,
          bulanAwal: bulanAwal,
          bulanAkhir: bulanAkhir
        },
        create: {
          keluargaId: data.keluargaId,
          status: status as any,
          tahun: tahun,
          jumlahDibayar: data.debit,
          totalIuran: data.totalIuran || 120000,
          bulanAwal: bulanAwal,
          bulanAkhir: bulanAkhir
        }
      });

    // Update tunggakan
    await updateTunggakan(data.keluargaId, tahun);
  } catch (error) {
    console.error("Error handling iuran anggota:", error);
  }
}

// Handler untuk sumbangan anggota
async function handleSumbanganAnggota(data: any, validDate: Date) {
  try {
    // Dapatkan data keluarga untuk notifikasi
    const keluarga = await prisma.keluargaUmat.findUnique({
      where: { id: data.keluargaId },
      select: {
        namaKepalaKeluarga: true,
        users: {
          select: {
            id: true
          }
        }
      }
    });

    if (keluarga && keluarga.users.length > 0) {
      // Buat notifikasi untuk setiap user dalam keluarga
      await Promise.all(keluarga.users.map(user => 
        prisma.notification.create({
          data: {
            userId: user.id,
            pesan: `Terima kasih atas sumbangan sebesar Rp ${data.debit.toLocaleString('id-ID')} pada tanggal ${validDate.toLocaleDateString('id-ID')}`,
            dibaca: false
          }
        })
      ));
    }
  } catch (error) {
    console.error("Error handling sumbangan anggota:", error);
    // Tidak throw error agar transaksi tetap tersimpan meskipun notifikasi gagal
  }
}

// Handler untuk transfer dana
async function handleTransferDana(data: any, validDate: Date) {
  try {
    // Validasi saldo awal
    const saldoAwalCheck = await checkInitialBalanceIkataExists();
    if (!saldoAwalCheck.exists) {
      throw new Error("Saldo awal IKATA belum diset");
    }

    // Buat transaksi keluar di Kas Lingkungan menggunakan transaksi yang sama
    await prisma.$transaction(async (tx) => {
      await tx.kasLingkungan.create({
        data: {
          tanggal: validDate,
          jenisTranasksi: JenisTransaksi.UANG_KELUAR,
          tipeTransaksi: "TRANSFER_DANA_KE_IKATA",
          keterangan: `Transfer ke IKATA - ${data.keterangan || ''}`,
          debit: 0,
          kredit: data.debit,
          approval: {
            create: {
              status: 'PENDING'
            }
          }
        }
      });
    });

    // Revalidasi path untuk memperbarui UI
    revalidatePath('/ikata/kas');
    revalidatePath('/lingkungan/kas');
    revalidatePath('/dashboard');

  } catch (error) {
    console.error("[handleTransferDana] Error:", error);
    throw error instanceof Error 
      ? error 
      : new Error("Gagal memproses transfer dana dari Kas Lingkungan");
  }
}

// Handler untuk pengeluaran
async function handlePengeluaran(data: any, validDate: Date) {
  try {
    // Implementasi khusus untuk pengeluaran jika diperlukan
    // Misalnya: verifikasi saldo mencukupi, catat di history, dll
    const currentBalance = await getCurrentBalance();
    if (currentBalance < data.kredit) {
      throw new Error("Saldo tidak mencukupi untuk transaksi ini");
    }
  } catch (error) {
    console.error("Error handling pengeluaran:", error);
    throw error;
  }
}

// Helper untuk update tunggakan
async function updateTunggakan(keluargaId: string, tahun: number) {
  try {
    const existingArrear = await prisma.ikataArrears.findUnique({
      where: { keluargaId }
    });

    if (existingArrear) {
      const updatedTahunTertunggak = existingArrear.tahunTertunggak.filter(t => t !== tahun);
      if (updatedTahunTertunggak.length === 0) {
        await prisma.ikataArrears.delete({
          where: { keluargaId }
        });
      } else {
        const settingIuran = await prisma.ikataSetting.findMany({
          where: { tahun: { in: updatedTahunTertunggak } }
        });
        
        const totalTunggakan = settingIuran.reduce((sum, setting) => sum + setting.jumlahIuran, 0);
        
        await prisma.ikataArrears.update({
          where: { keluargaId },
          data: {
            tahunTertunggak: updatedTahunTertunggak,
            totalTunggakan
          }
        });
      }
    }
  } catch (error) {
    console.error("Error updating tunggakan:", error);
  }
}

// Helper untuk mendapatkan saldo saat ini
async function getCurrentBalance(): Promise<number> {
  try {
    const transactions = await prisma.kasIkata.findMany();
    const totalDebit = transactions.reduce((sum, tx) => sum + tx.debit, 0);
    const totalKredit = transactions.reduce((sum, tx) => sum + tx.kredit, 0);
    return totalDebit - totalKredit;
  } catch (error) {
    console.error("Error getting current balance:", error);
    return 0;
  }
}

// Fungsi untuk memperbarui transaksi Kas IKATA
export async function updateKasIkataTransaction(id: string, data: {
  tanggal: Date;
  jenisTranasksi: JenisTransaksi;
  tipeTransaksi: TipeTransaksiIkata;
  keterangan?: string;
  debit: number;
  kredit: number;
  keluargaId?: string;
  totalIuran?: number;
  statusPembayaran?: string;
  periodeBayar?: string[];
}) {
  try {
    // Pastikan tanggal valid
    const validDate = new Date(data.tanggal);
    
    const transaction = await prisma.kasIkata.update({
      where: { id },
      data: {
        tanggal: validDate,
        jenisTranasksi: data.jenisTranasksi,
        tipeTransaksi: data.tipeTransaksi,
        keterangan: data.keterangan,
        debit: data.debit,
        kredit: data.kredit
      }
    });
    
    // Jika transaksinya adalah iuran anggota, update record IuranIkata
    if (data.tipeTransaksi === TipeTransaksiIkata.IURAN_ANGGOTA && 
        data.jenisTranasksi === JenisTransaksi.UANG_MASUK && 
        data.keluargaId) {
      
      const tahun = validDate.getFullYear();
      const bulan = validDate.getMonth() + 1;
      
      // Tentukan status berdasarkan statusPembayaran yang dikirim
      let status = "LUNAS";
      let bulanAwal = bulan;
      let bulanAkhir = bulan;
      
      if (data.statusPembayaran) {
        switch (data.statusPembayaran) {
          case 'lunas':
            status = "LUNAS";
            bulanAwal = 1;
            bulanAkhir = 12;
            break;
          case 'sebagian_bulan':
            status = "SEBAGIAN_BULAN";
            // Jika ada periodeBayar, gunakan untuk menentukan bulan
            if (data.periodeBayar && data.periodeBayar.length > 0) {
              const bulanTerbayar = data.periodeBayar.map((periode: string) => {
                const [tahunPeriode, bulanPeriode] = periode.split('-');
                return parseInt(bulanPeriode);
              }).sort((a: number, b: number) => a - b);
              
              bulanAwal = bulanTerbayar[0];
              bulanAkhir = bulanTerbayar[bulanTerbayar.length - 1];
            }
            break;
          case 'belum_ada_pembayaran':
            status = "BELUM_BAYAR";
            bulanAwal = bulan;
            bulanAkhir = bulan;
            break;
          default:
            status = "LUNAS";
            bulanAwal = 1;
            bulanAkhir = 12;
        }
      }
      
      // Update record IuranIkata
      await prisma.iuranIkata.updateMany({
        where: {
          keluargaId: data.keluargaId,
          tahun: tahun
        },
        data: {
          status: status as any,
          jumlahDibayar: data.debit,
          totalIuran: data.totalIuran || 120000,
          bulanAwal: bulanAwal,
          bulanAkhir: bulanAkhir
        }
      });
    }
    
    // Revalidasi path agar UI diperbarui
    revalidatePath('/ikata/kas');
    revalidatePath('/ikata/monitoring');
    
    return transaction;
  } catch (error) {
    throw new Error("Gagal memperbarui transaksi kas IKATA");
  }
}

// Fungsi untuk menghapus transaksi Kas IKATA
export async function deleteKasIkataTransaction(id: string) {
  try {
    const transaction = await prisma.kasIkata.delete({
      where: { id }
    });
    
    // Revalidasi path agar UI diperbarui
    revalidatePath('/ikata/kas');
    
    return transaction;
  } catch (error) {
    throw new Error("Gagal menghapus transaksi kas IKATA");
  }
}

// Fungsi helper untuk mendapatkan id IuranIkata berdasarkan keluargaId dan tahun
async function getIuranIkataId(keluargaId: string, tahun: number): Promise<string> {
  const iuran = await prisma.iuranIkata.findFirst({
    where: {
      keluargaId,
      tahun
    },
    select: {
      id: true
    }
  });
  
  return iuran?.id || '';
}

// Fungsi untuk mengunci transaksi (set locked = true)
export async function lockKasIkataTransactions(transactionIds: string[]) {
  try {
    const result = await prisma.$transaction(
      transactionIds.map(id => 
        prisma.kasIkata.update({
          where: { id },
          data: { locked: true }
        })
      )
    );

    // Revalidasi path agar UI diperbarui
    revalidatePath('/ikata/kas');

    return { count: result.length };
  } catch (error) {
    throw new Error("Gagal mengunci transaksi");
  }
}

// Fungsi untuk mengambil saldo awal untuk periode tertentu
export async function getSaldoAwalIkata(bulan: number, tahun: number) {
  try {
    const saldoAwal = await prisma.saldoAwalIkata.findFirst({
      where: {
        tahun,
        bulan
      }
    });
    
    return saldoAwal;
  } catch (error) {
    console.error("Error fetching saldo awal IKATA:", error);
    throw new Error("Gagal mengambil data saldo awal IKATA");
  }
}

// Fungsi untuk menyimpan saldo awal IKATA
export async function setSaldoAwalIkata(saldoAwal: number, tanggal: Date) {
  try {
    // Cari konfigurasi saldo awal jika sudah ada
    const existingConfig = await prisma.kasIkata.findFirst({
      where: {
        tipeTransaksi: TipeTransaksiIkata.LAIN_LAIN,
        keterangan: "SALDO AWAL"
      }
    });

    // Jika sudah ada, tolak perubahan (saldo awal hanya bisa diset sekali)
    if (existingConfig) {
      return { 
        success: false, 
        error: 'Saldo awal sudah pernah diset dan tidak dapat diubah lagi. Saldo awal hanya dapat diinput satu kali saja.',
        message: "Saldo awal IKATA sudah diset sebelumnya"
      };
    }

    // Jika belum ada, buat baru
    const result = await prisma.kasIkata.create({
      data: {
        tanggal: tanggal,
        jenisTranasksi: JenisTransaksi.UANG_MASUK,
        tipeTransaksi: TipeTransaksiIkata.LAIN_LAIN,
        keterangan: "SALDO AWAL",
        debit: saldoAwal,
        kredit: 0,
        locked: true
      }
    });
    
    // Hapus data dari tabel saldoAwalIkata jika ada (untuk bersihkan data lama)
    try {
      await prisma.saldoAwalIkata.deleteMany({});
    } catch (cleanupError) {
      // Kegagalan pembersihan tidak kritis
    }
    
    // Revalidasi path agar data diperbarui
    revalidatePath('/ikata/kas');
    revalidatePath('/dashboard');
    
    return { 
      success: true, 
      message: "Saldo awal berhasil disimpan",
      data: {
        saldoAwal,
        id: result.id
      }
    };
  } catch (error) {
    return { 
      success: false, 
      error: "Gagal menyimpan saldo awal IKATA",
      message: "Terjadi kesalahan saat menyimpan saldo awal"
    };
  }
}

// Fungsi untuk mengecek keberadaan saldo awal IKATA
export async function checkInitialBalanceIkataExists(): Promise<{ exists: boolean; error?: string; date?: Date }> {
  try {
    const saldoAwal = await prisma.kasIkata.findFirst({
      where: {
        tipeTransaksi: TipeTransaksiIkata.LAIN_LAIN,
        keterangan: "SALDO AWAL"
      }
    });

    return {
      exists: !!saldoAwal,
      error: !saldoAwal ? "Saldo awal IKATA belum diset" : undefined,
      date: saldoAwal?.tanggal
    };
  } catch (error) {
    console.error("[checkInitialBalanceIkataExists] Error:", error);
    return {
      exists: false,
      error: "Gagal memeriksa saldo awal IKATA"
    };
  }
}

// Fungsi untuk validasi transaksi baru IKATA (memastikan saldo awal sudah diset)
export async function validateIkataTransactionPrerequisites(): Promise<{ valid: boolean; error?: string }> {
  try {
    const initialBalanceCheck = await checkInitialBalanceIkataExists();
    
    if (!initialBalanceCheck.exists) {
      return {
        valid: false,
        error: 'Saldo awal IKATA harus diset terlebih dahulu sebelum dapat melakukan transaksi baru.'
      };
    }

    return { valid: true };
  } catch (error) {
    console.error('Failed to validate IKATA transaction prerequisites:', error);
    return {
      valid: false,
      error: 'Terjadi kesalahan saat validasi prasyarat transaksi IKATA.'
    };
  }
}

// Fungsi untuk mendapatkan summary berdasarkan periode dengan saldo awal yang benar
export async function getKasIkataSummaryByPeriod(bulan: number, tahun: number) {
  try {
    // Jika bulan = 0, hitung untuk seluruh tahun
    if (bulan === 0) {
      return await getKasIkataSummaryForYear(tahun);
    }
    
    // Untuk bulan spesifik, gunakan fungsi yang sudah diperbaiki
    return await getKasIkataSummary(bulan, tahun);
  } catch (error) {
    console.error("Error getting summary by period:", error);
    throw new Error("Gagal menghitung ringkasan kas IKATA berdasarkan periode");
  }
}

// Fungsi untuk mendapatkan summary untuk seluruh tahun
async function getKasIkataSummaryForYear(tahun: number) {
  try {
    // Saldo awal tahun adalah saldo awal Januari
    const saldoAwalTahun = await calculateCorrectSaldoAwal(1, tahun);
    
    // Filter berdasarkan tahun
    const dateStart = new Date(tahun, 0, 1); // 1 Januari
    const dateEnd = new Date(tahun, 11, 31, 23, 59, 59); // 31 Desember

    // Query untuk transaksi pada tahun yang dipilih (kecuali saldo awal)
    const transactions = await prisma.kasIkata.findMany({
      where: {
        tanggal: {
          gte: dateStart,
          lte: dateEnd,
        },
        keterangan: {
          not: "SALDO AWAL"
        }
      },
      select: {
        jenisTranasksi: true,
        debit: true,
        kredit: true
      }
    });
    
    // Hitung pemasukan dan pengeluaran
    const pemasukanTxs = transactions.filter(tx => tx.jenisTranasksi === "UANG_MASUK");
    const pengeluaranTxs = transactions.filter(tx => tx.jenisTranasksi === "UANG_KELUAR");
    
    const pemasukan = pemasukanTxs.reduce((sum, tx) => sum + tx.debit, 0);
    const pengeluaran = pengeluaranTxs.reduce((sum, tx) => sum + tx.kredit, 0);
    
    // Hitung saldo akhir
    const saldoAkhir = saldoAwalTahun + pemasukan - pengeluaran;
    
    return {
      saldoAwal: saldoAwalTahun,
      pemasukan,
      pengeluaran,
      saldoAkhir
    };
  } catch (error) {
    console.error("Error calculating year summary:", error);
    throw new Error("Gagal menghitung ringkasan kas IKATA untuk tahun");
  }
} 