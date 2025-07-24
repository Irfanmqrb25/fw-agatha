import { JenisTransaksi as DbJenisTransaksi, TipeTransaksiIkata } from "@prisma/client";

export type JenisTransaksi = 'uang_masuk' | 'uang_keluar';

export type TipeTransaksiMasuk = 'iuran_anggota' | 'transfer_dana_lingkungan' | 'sumbangan_anggota' | 'penerimaan_lain';
export type TipeTransaksiKeluar = 'uang_duka' | 'kunjungan_kasih' | 'cinderamata_kelahiran' | 'cinderamata_pernikahan' | 'uang_akomodasi' | 'pembelian' | 'lain_lain';
export type TipeTransaksi = TipeTransaksiMasuk | TipeTransaksiKeluar;

export type StatusPembayaran = 'lunas' | 'sebagian_bulan' | 'belum_ada_pembayaran';

export interface TransactionData {
  id: string;
  tanggal: Date;
  keterangan: string | null;
  jenisTransaksi: DbJenisTransaksi;
  tipeTransaksi: TipeTransaksiIkata;
  debit: number;
  kredit: number;
  locked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IKATATransaction {
  id: string;
  tanggal: string;
  keterangan: string;
  jumlah: number;
  jenis: JenisTransaksi;
  tipeTransaksi: TipeTransaksi;
  debit?: number;
  kredit?: number;
  statusPembayaran?: StatusPembayaran;
  periodeBayar?: string[];
  anggotaId?: string;
  totalIuran?: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  locked: boolean;
}

export interface IKATASummary {
  saldoAwal: number;
  pemasukan: number;
  pengeluaran: number;
  saldoAkhir: number;
}

export type PeriodFilter = {
  bulan: number; // 0 untuk semua data, 1-12 untuk bulan spesifik
  tahun: number;
};

export interface TransactionFormData {
  tanggal: string;
  keterangan: string;
  jenis: JenisTransaksi;
  tipeTransaksi: TipeTransaksi;
  jumlah: number;
  statusPembayaran?: StatusPembayaran;
  periodeBayar?: string[];
  anggotaId?: string;
  totalIuran?: number;
}

export interface SaldoAwalFormData {
  saldoAwal: number;
  tanggal: Date;
} 