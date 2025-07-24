'use server'

import { getKasLingkungan } from "../utils/kas-service";
import { StatusApproval } from "@prisma/client";
import { TransactionData } from "../types";
import { calculatePeriodSummary } from "../utils/date-utils";

// Fungsi untuk mengambil data transaksi dan mengkonversi ke format UI
export async function getTransactionsData(): Promise<TransactionData[]> {
  try {
    const transactions = await getKasLingkungan();
    
    // Konversi data dari database ke format UI
    return transactions.map(tx => ({
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
  } catch (error) {
    console.error("Error fetching transactions data:", error);
    throw new Error("Gagal mengambil data transaksi");
  }
}

// Menghitung saldo awal, total pendapatan, pengeluaran, dan saldo akhir
export async function getTransactionSummary() {
  try {
    const transactions = await getTransactionsData();
    
    // Cek apakah ada transaksi saldo awal
    const initialBalanceTransaction = transactions.find(tx => 
      tx.tipeTransaksi === 'LAIN_LAIN' && 
      tx.keterangan === 'SALDO AWAL'
    );
    
    // Gunakan saldo awal dari database jika ada, atau default ke 0
    const globalInitialBalance = initialBalanceTransaction ? initialBalanceTransaction.debit : 0;
    
    // Gunakan calculatePeriodSummary untuk perhitungan yang konsisten
    // Tanpa dateRange berarti menghitung untuk semua periode
    return calculatePeriodSummary(transactions, undefined, globalInitialBalance);
  } catch (error) {
    console.error("Error calculating transaction summary:", error);
    throw new Error("Gagal menghitung ringkasan transaksi");
  }
} 