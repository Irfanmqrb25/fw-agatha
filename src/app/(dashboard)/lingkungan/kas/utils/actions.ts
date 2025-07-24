'use server'

import { revalidatePath } from 'next/cache';
import { 
  createKasTransaction, 
  updateKasTransaction, 
  deleteKasTransaction,
  updateApprovalStatus,
  getKeluargaList,
  getKasLingkungan
} from './kas-service';
import { JenisTransaksi, TipeTransaksiLingkungan, Role, StatusApproval } from '@prisma/client';
import { prisma } from '@/lib/db';
import { KeluargaOption, TransactionData } from '../types';

// Fungsi utilitas untuk membuat notifikasi
async function createNotification(pesan: string, targetRoles: Role[] = []) {
  try {
    // Jika tidak ada role target, buat notifikasi untuk semua user
    if (targetRoles.length === 0) {
      const users = await prisma.user.findMany();
      await prisma.notification.createMany({
        data: users.map(user => ({
          pesan,
          userId: user.id
        }))
      });
    } else {
      // Buat notifikasi hanya untuk user dengan role tertentu
      const users = await prisma.user.findMany({
        where: {
          role: {
            in: targetRoles
          }
        }
      });
      await prisma.notification.createMany({
        data: users.map(user => ({
          pesan,
          userId: user.id
        }))
      });
    }
  } catch (error) {
    console.error('Failed to create notification:', error);
  }
}

// Fungsi untuk mengambil data keluarga (sebagai server action)
export async function fetchKeluargaOptions(): Promise<{ success: boolean; data: KeluargaOption[]; error?: string }> {
  try {
    const keluargaData = await getKeluargaList();
    return {
      success: true,
      data: keluargaData
    };
  } catch (error) {
    console.error('Failed to fetch keluarga options:', error);
    return {
      success: false,
      data: [],
      error: 'Gagal mengambil data keluarga'
    };
  }
}

// Fungsi untuk mengecek apakah saldo awal sudah diset
export async function checkInitialBalanceExists(): Promise<{ exists: boolean; amount?: number; date?: Date }> {
  try {
    const existingConfig = await prisma.kasLingkungan.findFirst({
      where: {
        tipeTransaksi: TipeTransaksiLingkungan.LAIN_LAIN,
        keterangan: "SALDO AWAL"
      }
    });

    if (existingConfig) {
      return {
        exists: true,
        amount: existingConfig.debit,
        date: existingConfig.tanggal
      };
    }

    return { exists: false };
  } catch (error) {
    console.error('Failed to check initial balance:', error);
    return { exists: false };
  }
}

// Fungsi untuk validasi transaksi baru (memastikan saldo awal sudah diset)
export async function validateTransactionPrerequisites(): Promise<{ valid: boolean; error?: string }> {
  try {
    const initialBalanceCheck = await checkInitialBalanceExists();
    
    if (!initialBalanceCheck.exists) {
      return {
        valid: false,
        error: 'Saldo awal harus diset terlebih dahulu sebelum dapat melakukan transaksi baru.'
      };
    }

    return { valid: true };
  } catch (error) {
    console.error('Failed to validate transaction prerequisites:', error);
    return {
      valid: false,
      error: 'Terjadi kesalahan saat validasi prasyarat transaksi.'
    };
  }
}

// Create transaction
export async function createTransaction(data: {
  tanggal: Date;
  jenisTranasksi: JenisTransaksi;
  tipeTransaksi: TipeTransaksiLingkungan;
  keterangan?: string;
  jumlah: number;
  keluargaId?: string;
}) {
  try {
    // Validasi prasyarat: saldo awal harus sudah diset
    const prerequisiteCheck = await validateTransactionPrerequisites();
    if (!prerequisiteCheck.valid) {
      return {
        success: false,
        error: prerequisiteCheck.error
      };
    }

    // Tentukan debit dan kredit berdasarkan jenis transaksi
    const debit = data.jenisTranasksi === JenisTransaksi.UANG_MASUK ? data.jumlah : 0;
    const kredit = data.jenisTranasksi === JenisTransaksi.UANG_KELUAR ? data.jumlah : 0;
    
    // Buat transaksi baru
    const transaction = await createKasTransaction({
      tanggal: data.tanggal,
      jenisTranasksi: data.jenisTranasksi,
      tipeTransaksi: data.tipeTransaksi,
      keterangan: data.keterangan,
      debit,
      kredit,
      keluargaId: data.keluargaId
    });
    
    // Buat notifikasi untuk semua pengguna tentang transaksi baru
    let notificationMessage = `Transaksi ${data.jenisTranasksi === JenisTransaksi.UANG_MASUK ? 'pemasukan' : 'pengeluaran'} baru sebesar Rp ${data.jumlah.toLocaleString('id-ID')} telah dibuat.`;
    
    // Jika ini adalah transaksi sumbangan umat, tambahkan info tentang keluarga
    if (data.tipeTransaksi === TipeTransaksiLingkungan.SUMBANGAN_UMAT && data.keluargaId) {
      const keluarga = await prisma.keluargaUmat.findUnique({
        where: { id: data.keluargaId },
        select: { namaKepalaKeluarga: true }
      });
      
      if (keluarga) {
        notificationMessage = `Sumbangan dari keluarga ${keluarga.namaKepalaKeluarga} sebesar Rp ${data.jumlah.toLocaleString('id-ID')} telah diterima.`;
      }
    }
    
    // Buat notifikasi khusus untuk transaksi Transfer Dana ke IKATA
    if (data.tipeTransaksi === TipeTransaksiLingkungan.TRANSFER_DANA_KE_IKATA) {
      notificationMessage = `Dana sebesar Rp ${data.jumlah.toLocaleString('id-ID')} telah ditransfer dari Kas Lingkungan ke IKATA.`;
    }
    
    await createNotification(notificationMessage);
    
    // Revalidasi path agar data tersebut diperbarui
    revalidatePath('/lingkungan');
    revalidatePath('/lingkungan/kas');
    
    return { success: true };
  } catch (error) {
    console.error('Failed to create transaction:', error);
    return { success: false, error: 'Gagal membuat transaksi' };
  }
}

// Update transaction
export async function updateTransaction(id: string, data: {
  tanggal: Date;
  jenisTranasksi: JenisTransaksi;
  tipeTransaksi: TipeTransaksiLingkungan;
  keterangan?: string;
  jumlah: number;
  keluargaId?: string;
}) {
  try {
    // Tentukan debit dan kredit berdasarkan jenis transaksi
    const debit = data.jenisTranasksi === JenisTransaksi.UANG_MASUK ? data.jumlah : 0;
    const kredit = data.jenisTranasksi === JenisTransaksi.UANG_KELUAR ? data.jumlah : 0;
    
    // Update transaksi
    await updateKasTransaction(id, {
      tanggal: data.tanggal,
      jenisTranasksi: data.jenisTranasksi,
      tipeTransaksi: data.tipeTransaksi,
      keterangan: data.keterangan,
      debit,
      kredit,
      keluargaId: data.keluargaId
    });
    
    // Buat notifikasi untuk perubahan transaksi
    const notificationMessage = `Transaksi kas lingkungan ID: ${id} telah diperbarui.`;
    await createNotification(notificationMessage);
    
    // Revalidasi path agar data tersebut diperbarui
    revalidatePath('/lingkungan/kas');
    revalidatePath('/lingkungan');
    
    return { success: true };
  } catch (error) {
    console.error('Failed to update transaction:', error);
    return { success: false, error: 'Gagal memperbarui transaksi' };
  }
}

// Delete transaction
export async function deleteTransaction(id: string) {
  try {
    await deleteKasTransaction(id);
    
    // Buat notifikasi untuk penghapusan transaksi
    const notificationMessage = `Transaksi kas lingkungan ID: ${id} telah dihapus.`;
    await createNotification(notificationMessage, [Role.SUPER_USER, Role.KETUA, Role.WAKIL_KETUA, Role.BENDAHARA, Role.WAKIL_BENDAHARA]);
    
    // Revalidasi path agar data tersebut diperbarui
    revalidatePath('/lingkungan/kas');
    revalidatePath('/lingkungan');
    revalidatePath('/dashboard');
    
    return { success: true };
  } catch (error) {
    console.error('Failed to delete transaction:', error);
    return { success: false, error: 'Gagal menghapus transaksi' };
  }
}

// Update approval status
export async function approveTransaction(id: string, status: 'APPROVED' | 'REJECTED' | 'PENDING') {
  try {
    await updateApprovalStatus(id, status);
    
    // Ambil data transaksi untuk detail notifikasi
    const transaction = await prisma.kasLingkungan.findUnique({
      where: { id },
      include: { approval: true }
    });
    
    if (transaction) {
      // Buat notifikasi tentang perubahan status approval
      const amount = transaction.jenisTranasksi === JenisTransaksi.UANG_MASUK 
        ? transaction.debit 
        : transaction.kredit;
        
      let notificationMessage = "";
      
      if (status === 'APPROVED') {
        notificationMessage = `Transaksi ${transaction.jenisTranasksi === JenisTransaksi.UANG_MASUK ? 'pemasukan' : 'pengeluaran'} sebesar Rp ${amount.toLocaleString('id-ID')} telah disetujui.`;
      } else if (status === 'REJECTED') {
        notificationMessage = `Transaksi ${transaction.jenisTranasksi === JenisTransaksi.UANG_MASUK ? 'pemasukan' : 'pengeluaran'} sebesar Rp ${amount.toLocaleString('id-ID')} telah ditolak.`;
      } else if (status === 'PENDING') {
        notificationMessage = `Transaksi ${transaction.jenisTranasksi === JenisTransaksi.UANG_MASUK ? 'pemasukan' : 'pengeluaran'} sebesar Rp ${amount.toLocaleString('id-ID')} telah dibuka kembali dan menunggu persetujuan.`;
      }
      
      await createNotification(notificationMessage);
    }
    
    // Revalidasi path agar data tersebut diperbarui
    revalidatePath('/lingkungan/kas');
    revalidatePath('/lingkungan');
    revalidatePath('/dashboard');
    
    return { success: true };
  } catch (error) {
    console.error('Failed to update approval status:', error);
    return { success: false, error: 'Gagal memperbarui status approval' };
  }
}

// Menyimpan saldo awal
export async function saveInitialBalance(amount: number, tanggal: Date) {
  try {
    // Cari konfigurasi saldo awal jika sudah ada
    const existingConfig = await prisma.kasLingkungan.findFirst({
      where: {
        tipeTransaksi: TipeTransaksiLingkungan.LAIN_LAIN,
        keterangan: "SALDO AWAL"
      }
    });

    // Jika sudah ada, tolak perubahan (saldo awal hanya bisa diset sekali)
    if (existingConfig) {
      return { 
        success: false, 
        error: 'Saldo awal sudah pernah diset dan tidak dapat diubah lagi. Saldo awal hanya dapat diinput satu kali saja.' 
      };
    }

    // Jika belum ada, buat baru
    await prisma.kasLingkungan.create({
      data: {
        tanggal: tanggal,
        jenisTranasksi: JenisTransaksi.UANG_MASUK,
        tipeTransaksi: TipeTransaksiLingkungan.LAIN_LAIN,
        keterangan: "SALDO AWAL",
        debit: amount,
        kredit: 0,
        approval: {
          create: {
            status: 'APPROVED'
          }
        }
      }
    });

    // Buat notifikasi
    const notificationMessage = `Saldo awal kas lingkungan telah diset sebesar Rp ${amount.toLocaleString('id-ID')} pada tanggal ${tanggal.toLocaleDateString('id-ID')}.`;
    await createNotification(notificationMessage, [Role.SUPER_USER, Role.KETUA, Role.BENDAHARA, Role.WAKIL_BENDAHARA]);
    
    // Revalidasi path
    revalidatePath('/lingkungan/kas');
    revalidatePath('/lingkungan');
    revalidatePath('/dashboard');
    
    return { success: true };
  } catch (error) {
    console.error('Failed to save initial balance:', error);
    return { success: false, error: 'Gagal menyimpan saldo awal' };
  }
}

// Function to lock transaction when PDF is printed
export async function lockTransactions(transactionIds: string[]) {
  try {
    // Update all transactions to APPROVED status
    for (const id of transactionIds) {
      const transaction = await prisma.kasLingkungan.findUnique({
        where: { id },
        include: { approval: true }
      });

      if (transaction) {
        // If transaction already has approval record, update it
        if (transaction.approval) {
          await prisma.approval.update({
            where: { id: transaction.approval.id },
            data: { status: 'APPROVED' }
          });
        } else {
          // If not, create a new approval record
          await prisma.approval.create({
            data: {
              status: 'APPROVED',
              kasLingkungan: { connect: { id } }
            }
          });
        }
      }
    }

    // Create notification for locking transactions
    const notificationMessage = `${transactionIds.length} transaksi kas lingkungan telah dikunci setelah dicetak PDF.`;
    await createNotification(notificationMessage, [Role.SUPER_USER, Role.KETUA, Role.BENDAHARA, Role.WAKIL_BENDAHARA]);
    
    // Revalidate path
    revalidatePath('/lingkungan/kas');
    revalidatePath('/lingkungan');
    revalidatePath('/dashboard');
    
    return { success: true };
  } catch (error) {
    console.error('Failed to lock transactions:', error);
    return { success: false, error: 'Gagal mengunci transaksi' };
  }
}

// Fungsi untuk mengambil data transaksi terbaru
export async function getLatestTransactionData() {
  try {
    const transactions = await getKasLingkungan();
    
    if (!transactions) {
      return {
        success: false,
        error: "Data transaksi tidak ditemukan",
        data: [] as TransactionData[]
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
      status: tx.approval?.status || StatusApproval.PENDING,
      isApproved: tx.approval?.status === StatusApproval.APPROVED,
      isRejected: tx.approval?.status === StatusApproval.REJECTED,
      isPending: tx.approval?.status === StatusApproval.PENDING || !tx.approval,
      keluarga: tx.keluarga ? {
        id: tx.keluarga.id,
        namaKepalaKeluarga: tx.keluarga.namaKepalaKeluarga
      } : undefined
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
      data: [] as TransactionData[]
    };
  }
} 