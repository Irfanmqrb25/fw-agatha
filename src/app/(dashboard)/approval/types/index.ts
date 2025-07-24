import { Approval } from "@prisma/client"

// Enum untuk jenis transaksi
export enum JenisTransaksi {
  UANG_MASUK = "UANG_MASUK",
  UANG_KELUAR = "UANG_KELUAR"
}

// Enum untuk tipe transaksi lingkungan
export enum TipeTransaksiLingkungan {
  KOLEKTE_I = "KOLEKTE_I",
  KOLEKTE_II = "KOLEKTE_II",
  SUMBANGAN_UMAT = "SUMBANGAN_UMAT",
  PENERIMAAN_LAIN = "PENERIMAAN_LAIN",
  BIAYA_OPERASIONAL = "BIAYA_OPERASIONAL",
  PENYELENGGARAAN_KEGIATAN = "PENYELENGGARAAN_KEGIATAN",
  PEMBELIAN = "PEMBELIAN",
  SOSIAL_DUKA = "SOSIAL_DUKA",
  TRANSFER_DANA_KE_IKATA = "TRANSFER_DANA_KE_IKATA",
  LAIN_LAIN = "LAIN_LAIN"
}

// Tipe data yang diperluas untuk approval yang mencakup relasi
export type ExtendedApproval = Approval & {
  doaLingkungan?: {
    id: string
    tanggal: Date
    kolekteI: number
    kolekteII: number
    ucapanSyukur: number
    jumlahKKHadir: number
    tuanRumah: {
      id: string
      namaKepalaKeluarga: string
    }
  } | null
  kasLingkungan?: {
    id: string
    tanggal: Date
    jenisTranasksi: JenisTransaksi
    tipeTransaksi: TipeTransaksiLingkungan
    keterangan?: string | null
    debit: number
    kredit: number
  } | null
}

// Tipe data untuk statistik approval
export interface ApprovalStats {
  total: number
  pending: number
  approved: number
  rejected: number
  totalAmount: number
  thisMonthApproved: number
  thisMonthAmount: number
} 