import { z } from "zod";

// Status pembayaran untuk dana mandiri
export type StatusPembayaran = 'lunas' | 'sebagian_bulan' | 'belum_ada_pembayaran';

// Dana Mandiri Transaction interface
export interface DanaMandiriTransaction {
  id: string;
  keluargaId: string;
  tahun: number;
  bulan: number;
  jumlahDibayar: number;
  statusSetor: boolean;
  tanggalSetor?: Date;
  tanggal: Date;
  statusPembayaran: StatusPembayaran;
  periodeBayar?: number;
  totalIuran?: number;
  keluarga?: {
    namaKepalaKeluarga: string;
    alamat?: string;
    nomorTelepon?: string;
  };
}

// Interface untuk data tunggakan
export interface DanaMandiriArrears {
  id?: string;
  keluargaId: string;
  namaKepalaKeluarga: string;
  alamat: string | null;
  nomorTelepon: string | null;
  tahunTertunggak: number[];
  totalTunggakan: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// Form schemas
export const transactionFormSchema = z.object({
  familyHeadId: z.string({
    required_error: "Kepala keluarga wajib dipilih",
  }),
  year: z.coerce.number({
    required_error: "Tahun wajib diisi",
  }).min(2000).max(2100),
  amount: z.coerce.number().positive({
    message: "Jumlah harus lebih dari 0",
  }),
  statusPembayaran: z.enum(['lunas', 'sebagian_bulan', 'belum_ada_pembayaran'], {
    required_error: "Status pembayaran wajib dipilih",
  }),
  periodeBayar: z.coerce.number().min(1).max(12).optional(),
});

export const printPdfSchema = z.object({
  documentType: z.enum(["payment_receipt", "yearly_report", "debt_report"]),
  documentCategory: z.enum(["bukti_terima_uang", "setor_ke_paroki"]),
  month: z.number().min(1).max(12).optional(),
  year: z.number(),
  fileFormat: z.literal("pdf")
});

export const setDuesSchema = z.object({
  year: z.number({
    required_error: "Tahun wajib diisi",
  }),
  amount: z.coerce.number().positive({
    message: "Jumlah iuran harus lebih dari 0",
  }),
});

export const submitToParokiSchema = z.object({
  transactionIds: z.array(z.string()),
  submissionDate: z.date({
    required_error: "Tanggal penyetoran wajib diisi",
  }),
  submissionNote: z.string().optional(),
});

export const sendReminderSchema = z.object({
  familyHeadIds: z.array(z.string()),
  message: z.string().min(10, {
    message: "Pesan minimal 10 karakter",
  }),
});

// Type exports based on the schemas
export type TransactionFormValues = z.infer<typeof transactionFormSchema>;
export type PrintPdfFormValues = z.infer<typeof printPdfSchema>;
export type SetDuesValues = z.infer<typeof setDuesSchema>;
export type SubmitToParokiValues = z.infer<typeof submitToParokiSchema>;
export type SendReminderValues = z.infer<typeof sendReminderSchema>; 