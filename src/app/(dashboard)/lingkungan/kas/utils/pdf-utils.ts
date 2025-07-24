import { TransactionData } from "../types";
import { JenisTransaksi } from "@prisma/client";

/**
 * Mengkonversi tanggal ke dalam format yang terbaca
 * @param date Tanggal yang akan dikonversi
 * @returns String format tanggal yang mudah dibaca
 */
export function formatTanggal(date: Date): string {
  return new Date(date).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Mengkonversi angka ke dalam format mata uang Rupiah
 * @param amount Jumlah uang
 * @returns String format mata uang Rupiah
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}

/**
 * Mengelompokkan transaksi berdasarkan jenis dan tipe
 * @param transactions Array transaksi yang akan dikelompokkan
 * @returns Objek berisi pengelompokan transaksi
 */
export function groupTransactionsByType(transactions: TransactionData[]) {
  const pemasukan: Record<string, number> = {};
  const pengeluaran: Record<string, number> = {};
  
  transactions.forEach(tx => {
    const tipe = tx.tipeTransaksi;
    if (tx.jenisTransaksi === JenisTransaksi.UANG_MASUK) {
      pemasukan[tipe] = (pemasukan[tipe] || 0) + tx.debit;
    } else {
      pengeluaran[tipe] = (pengeluaran[tipe] || 0) + tx.kredit;
    }
  });
  
  return { pemasukan, pengeluaran };
}

/**
 * Menghitung total transaksi
 * @param transactions Array transaksi yang akan dihitung
 * @returns Objek berisi total pemasukan dan pengeluaran
 */
export function calculateTransactionTotals(transactions: TransactionData[]) {
  let totalPemasukan = 0;
  let totalPengeluaran = 0;
  
  transactions.forEach(tx => {
    if (tx.jenisTransaksi === JenisTransaksi.UANG_MASUK) {
      totalPemasukan += tx.debit;
    } else {
      totalPengeluaran += tx.kredit;
    }
  });
  
  return { totalPemasukan, totalPengeluaran };
} 