import { z } from "zod";
import { StatusIuran } from "@prisma/client";

// Status pembayaran untuk Dana Mandiri
export type DanaMandiriStatus = "LUNAS" | "BELUM_LUNAS";

// Interface untuk data histori pembayaran Dana Mandiri
export interface DanaMandiriHistory {
  id: string;
  keluargaId: string;
  namaKepalaKeluarga: string;
  tanggal: Date;
  jumlahDibayar: number;
  statusSetor: boolean;
  tanggalSetor: Date | null;
  tahun: number;
  bulan: number;
  createdAt: Date;
  updatedAt: Date;
}

// Interface untuk data histori pembayaran IKATA
export interface IkataHistory {
  id: string;
  keluargaId: string;
  namaKepalaKeluarga: string;
  status: StatusIuran;
  bulanAwal: number | null;
  bulanAkhir: number | null;
  tahun: number;
  jumlahDibayar: number;
  createdAt: Date;
  updatedAt: Date;
}

// Interface untuk data histori pembayaran yang digunakan dalam PDF
export interface PaymentHistory {
  id: string;
  familyHeadName: string;
  paymentDate: Date | null;
  year: number;
  amount: number;
}

// Filter form schema
export const filterFormSchema = z.object({
  year: z.number().min(2000).max(new Date().getFullYear() + 1),
});

export type FilterFormValues = z.infer<typeof filterFormSchema>;

// Schema untuk form pembayaran Dana Mandiri
export const danaMandiriFormSchema = z.object({
  keluargaId: z.string().min(1, "Kepala keluarga harus dipilih"),
  tanggal: z.date(),
  jumlahDibayar: z.number().min(1, "Jumlah pembayaran harus lebih dari 0"),
  tahun: z.number().min(2000, "Tahun harus minimal 2000"),
  bulan: z.number().min(1, "Bulan harus dipilih").max(12, "Bulan tidak valid"),
  statusSetor: z.boolean(),
  tanggalSetor: z.date().nullable().optional(),
});

export type DanaMandiriFormValues = z.infer<typeof danaMandiriFormSchema>;

// Schema untuk form pembayaran IKATA
export const ikataFormSchema = z.object({
  keluargaId: z.string().min(1, "Kepala keluarga harus dipilih"),
  status: z.enum(["LUNAS", "SEBAGIAN_BULAN", "BELUM_BAYAR"]),
  bulanAwal: z.number().min(1, "Bulan awal harus dipilih").max(12, "Bulan tidak valid").nullable().optional(),
  bulanAkhir: z.number().min(1, "Bulan akhir harus dipilih").max(12, "Bulan tidak valid").nullable().optional(),
  tahun: z.number().min(2000, "Tahun harus minimal 2000"),
  jumlahDibayar: z.number().min(1, "Jumlah pembayaran harus lebih dari 0"),
});

export type IkataFormValues = z.infer<typeof ikataFormSchema>; 