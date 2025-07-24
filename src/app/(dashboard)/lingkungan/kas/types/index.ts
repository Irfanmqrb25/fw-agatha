import { z } from "zod";
import { JenisTransaksi, StatusApproval, TipeTransaksiLingkungan } from "@prisma/client";

// Schema untuk form transaksi
export const transactionFormSchema = z.object({
  tanggal: z.date({
    required_error: "Tanggal wajib diisi",
  }),
  keterangan: z.string().min(3, {
    message: "Keterangan minimal 3 karakter",
  }),
  jenisTransaksi: z.nativeEnum(JenisTransaksi, {
    required_error: "Jenis transaksi wajib dipilih",
  }),
  tipeTransaksi: z.nativeEnum(TipeTransaksiLingkungan, {
    required_error: "Tipe transaksi wajib dipilih",
  }),
  jumlah: z.coerce.number().positive({
    message: "Jumlah harus lebih dari 0",
  }),
  keluargaId: z.string().optional(),
});

// Schema untuk range tanggal cetak PDF
export const printPdfSchema = z.object({
  dateRange: z.object({
    from: z.date({
      required_error: "Tanggal mulai wajib diisi",
    }),
    to: z.date({
      required_error: "Tanggal akhir wajib diisi",
    }),
  }),
});

// Schema untuk form saldo awal
export const initialBalanceFormSchema = z.object({
  saldoAwal: z.coerce.number().min(0, "Saldo awal tidak boleh negatif"),
  tanggal: z.date({
    required_error: "Tanggal saldo awal wajib diisi",
  }),
});

// Tipe untuk form transaksi
export type TransactionFormValues = z.infer<typeof transactionFormSchema>;
export type PrintPdfFormValues = z.infer<typeof printPdfSchema>;
export type InitialBalanceFormValues = z.infer<typeof initialBalanceFormSchema>;

// UI options untuk jenisTransaksi
export const transactionTypeOptions = [
  { value: JenisTransaksi.UANG_MASUK, label: "Uang Masuk (Pemasukan)" },
  { value: JenisTransaksi.UANG_KELUAR, label: "Uang Keluar (Pengeluaran)" }
];

// UI options untuk tipeTransaksi
export const transactionSubtypeOptions = {
  [JenisTransaksi.UANG_MASUK]: [
    { value: TipeTransaksiLingkungan.KOLEKTE_I, label: "Kolekte I" },
    { value: TipeTransaksiLingkungan.KOLEKTE_II, label: "Kolekte II" },
    { value: TipeTransaksiLingkungan.SUMBANGAN_UMAT, label: "Sumbangan Umat" },
    { value: TipeTransaksiLingkungan.PENERIMAAN_LAIN, label: "Penerimaan Lain-Lain" }
  ],
  [JenisTransaksi.UANG_KELUAR]: [
    { value: TipeTransaksiLingkungan.BIAYA_OPERASIONAL, label: "Biaya Operasional" },
    { value: TipeTransaksiLingkungan.PENYELENGGARAAN_KEGIATAN, label: "Penyelenggaraan Kegiatan" },
    { value: TipeTransaksiLingkungan.PEMBELIAN, label: "Pembelian" },
    { value: TipeTransaksiLingkungan.SOSIAL_DUKA, label: "Sosial-Duka" },
    { value: TipeTransaksiLingkungan.TRANSFER_DANA_KE_IKATA, label: "Transfer Dana ke IKATA" },
    { value: TipeTransaksiLingkungan.LAIN_LAIN, label: "Lain-Lain" }
  ]
};

// Helper untuk menghasilkan opsi kategori untuk filter
export const getCategoryOptions = () => {
  return [
    { value: null, label: "Semua Kategori", key: "all" },
    ...Object.values(TipeTransaksiLingkungan).map(value => {
      // Cari label yang sesuai dari options
      let label = String(value);
      for (const typeOptions of Object.values(transactionSubtypeOptions)) {
        const option = typeOptions.find(opt => opt.value === value);
        if (option) {
          label = option.label;
          break;
        }
      }
      return { value, label, key: String(value) };
    })
  ];
};

// Tipe untuk keluarga
export type KeluargaOption = {
  id: string;
  namaKepalaKeluarga: string;
};

// Tipe untuk data transaksi UI
export type TransactionData = {
  id: string;
  tanggal: Date;
  keterangan: string | null;
  jenisTransaksi: JenisTransaksi;
  tipeTransaksi: TipeTransaksiLingkungan;
  debit: number;
  kredit: number;
  status: StatusApproval;
  isApproved: boolean;
  isRejected: boolean;
  isPending: boolean;
  keluarga?: {
    id: string;
    namaKepalaKeluarga: string;
  };
}; 