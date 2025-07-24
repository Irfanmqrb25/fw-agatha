import { z } from "zod";
import { StatusKehidupan, StatusPernikahan } from "@prisma/client";

// Alias untuk FamilyHead (kompatibilitas dengan kode lama)
export type FamilyHead = FamilyHeadData;

export const familyHeadStatuses = [
  { value: StatusKehidupan.HIDUP, label: "Hidup" },
  { value: StatusKehidupan.PINDAH, label: "Pindah" },
  { value: StatusKehidupan.MENINGGAL, label: "Meninggal" }
] as const;

export const familyHeadFormSchema = z.object({
  namaKepalaKeluarga: z.string().min(3, {
    message: "Nama minimal 3 karakter",
  }),
  alamat: z.string().min(5, {
    message: "Alamat minimal 5 karakter",
  }),
  nomorTelepon: z.string().min(10, {
    message: "Nomor telepon minimal 10 digit",
  }).optional().nullable(),
  tanggalBergabung: z.date({
    required_error: "Tanggal bergabung wajib diisi",
  }),
  jumlahAnakTertanggung: z.number().int().min(0, {
    message: "Jumlah anak tertanggung tidak boleh negatif",
  }),
  jumlahKerabatTertanggung: z.number().int().min(0, {
    message: "Jumlah kerabat tertanggung tidak boleh negatif",
  }),
  jumlahAnggotaKeluarga: z.number().int().min(1, {
    message: "Jumlah anggota keluarga minimal 1",
  }),
  status: z.nativeEnum(StatusKehidupan, {
    required_error: "Status wajib dipilih",
  }),
  statusPernikahan: z.nativeEnum(StatusPernikahan, {
    required_error: "Status pernikahan wajib dipilih",
  }),
  tanggalKeluar: z.date().optional().nullable(),
  tanggalMeninggal: z.date().optional().nullable(),
}).refine((data) => {
  // Validasi: tanggalKeluar dan tanggalMeninggal tidak boleh diisi bersamaan
  if (data.tanggalKeluar && data.tanggalMeninggal) {
    return false;
  }
  return true;
}, {
  message: "Tanggal keluar dan tanggal meninggal tidak boleh diisi bersamaan",
  path: ["tanggalKeluar"],
}).refine((data) => {
  // Validasi: jika status PINDAH, tanggalKeluar harus diisi
  if (data.status === StatusKehidupan.PINDAH && !data.tanggalKeluar) {
    return false;
  }
  return true;
}, {
  message: "Tanggal keluar wajib diisi untuk status Pindah",
  path: ["tanggalKeluar"],
}).refine((data) => {
  // Validasi: jika status MENINGGAL, tanggalMeninggal harus diisi
  if (data.status === StatusKehidupan.MENINGGAL && !data.tanggalMeninggal) {
    return false;
  }
  return true;
}, {
  message: "Tanggal meninggal wajib diisi untuk status Meninggal",
  path: ["tanggalMeninggal"],
}).refine((data) => {
  // Validasi: jika status HIDUP, tanggalKeluar dan tanggalMeninggal harus kosong
  if (data.status === StatusKehidupan.HIDUP && (data.tanggalKeluar || data.tanggalMeninggal)) {
    return false;
  }
  return true;
}, {
  message: "Status Hidup tidak boleh memiliki tanggal keluar atau meninggal",
  path: ["status"],
});

export type FamilyHeadFormValues = z.infer<typeof familyHeadFormSchema>;


// Tipe untuk data yang ditampilkan di UI
export interface FamilyHeadData {
  id: string;
  nama: string;
  alamat: string;
  nomorTelepon: string | null;
  tanggalBergabung: Date;
  jumlahAnakTertanggung: number;
  jumlahKerabatTertanggung: number;
  jumlahAnggotaKeluarga: number;
  status: StatusKehidupan;
  statusPernikahan: StatusPernikahan;
  tanggalKeluar?: Date | null;
  tanggalMeninggal?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

// Tipe untuk form penambahan/edit data
export interface FamilyHeadFormData {
  namaKepalaKeluarga: string;
  alamat: string;
  nomorTelepon?: string;
  tanggalBergabung: Date;
  jumlahAnakTertanggung: number;
  jumlahKerabatTertanggung: number;
  jumlahAnggotaKeluarga: number;
  status: StatusKehidupan;
  statusPernikahan: StatusPernikahan;
  tanggalKeluar?: Date;
  tanggalMeninggal?: Date;
}

// Tipe untuk data yang ditampilkan di UI dengan detail tanggungan
export interface FamilyHeadWithDetails extends FamilyHeadData {
  pasangan?: {
    id: string;
    nama: string;
    status: StatusKehidupan;
  } | null;
  tanggungan: {
    id: string;
    nama: string;
    jenisTanggungan: 'ANAK' | 'KERABAT';
    status: StatusKehidupan;
    tanggalLahir: Date;
    pendidikanTerakhir: string;
    agama: 'KATOLIK' | 'ISLAM' | 'KRISTEN' | 'HINDU' | 'BUDHA';
    statusPernikahan: StatusPernikahan;
    tanggalBaptis?: Date | null;
    tanggalKrisma?: Date | null;
    tanggalMeninggal?: Date | null;
  }[];
  actualMemberCount: number;
  livingMemberCount: number;
  deceasedMemberCount: number;
  hasMissingDependents?: boolean;
  missingDependentsInfo?: {
    missingAnak: number;
    missingKerabat: number;
  } | null;
}