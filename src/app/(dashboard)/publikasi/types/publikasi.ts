import { KlasifikasiPublikasi, Role, User, Publikasi as PrismaPublikasi } from "@prisma/client"

// Definisi tipe publikasi dengan relasi yang sudah diambil
export type PublikasiWithRelations = PrismaPublikasi & {
  pembuat: {
    username: string
    role: Role
  }
  locked?: boolean
}

// Type untuk form publikasi
export type PublikasiFormData = {
  judul: string
  isi: string
  klasifikasi: KlasifikasiPublikasi
  targetPenerima: Role[]
  deadline: Date | null
  lampiran: string[]
}

// Definisi interface untuk Laporan
export interface Laporan {
  id: string
  judul: string
  jenis: string
  tanggal: string | Date
  keterangan: string
  lampiran: string
  publikasiId: string
}

// Response dari server action
export type ActionResponse<T = any> = {
  success: boolean
  data?: T
  error?: string
}

export interface Publikasi {
  id: string
  judul: string
  tanggal: string
  waktu: string
  lokasi: string
  targetPenerima: TargetPenerimaType
  status: "aktif" | "kedaluwarsa"
  pembuat: string
  lampiran: boolean
  locked: boolean
  kategori: "Penting" | "Umum" | "Rahasia" | "Segera"
  laporan?: Laporan[]
}

export type KategoriPublikasi = "Penting" | "Umum" | "Rahasia" | "Segera"
export type StatusPublikasi = "aktif" | "kedaluwarsa"
export type TargetPenerimaType = 
  | "Semua Pengguna"
  | "Umat"
  | "Ketua Lingkungan"
  | "Sekretaris"
  | "Bendahara"
  | "Admin Lingkungan"
  | "Pengurus"
  | "SuperUser"
  | "Kepala Keluarga"
  | "Anggota IKATA"
  | "Peserta Doa Lingkungan" 