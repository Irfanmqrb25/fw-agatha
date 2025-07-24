import { Role, KlasifikasiPublikasi } from "@prisma/client"
import { format } from "date-fns"

// Konstanta role yang ada pada aplikasi
export const ROLES = [
  { id: "all", label: "Semua Pengguna" },
  { id: "umat", label: "Umat" },
  { id: "ketuaLingkungan", label: "Ketua Lingkungan" },
  { id: "sekretaris", label: "Sekretaris" },
  { id: "wakilSekretaris", label: "Wakil Sekretaris" },
  { id: "bendahara", label: "Bendahara" },
  { id: "wakilBendahara", label: "Wakil Bendahara" },
  { id: "wakilKetua", label: "Wakil Ketua" },
  { id: "superUser", label: "SuperUser" }
];

// Konstanta target penerima untuk publikasi - disesuaikan dengan persyaratan
export const TARGET_PENERIMA = [
  {
    id: 'all',
    label: 'Semua Pengguna',
    roles: [
      Role.SUPER_USER,
      Role.KETUA,
      Role.WAKIL_KETUA,
      Role.SEKRETARIS,
      Role.WAKIL_SEKRETARIS,
      Role.BENDAHARA,
      Role.WAKIL_BENDAHARA,
      Role.UMAT
    ]
  },
  { id: Role.UMAT, label: 'Umat' },
  { id: Role.KETUA, label: 'Ketua Lingkungan' },
  { id: Role.WAKIL_KETUA, label: 'Wakil Ketua Lingkungan' },
  { id: Role.SEKRETARIS, label: 'Sekretaris' },
  { id: Role.WAKIL_SEKRETARIS, label: 'Wakil Sekretaris' },
  { id: Role.BENDAHARA, label: 'Bendahara' },
  { id: Role.WAKIL_BENDAHARA, label: 'Wakil Bendahara' },
  { id: Role.SUPER_USER, label: 'Super User' }
];

// Konstanta kategori publikasi
export const KATEGORI_PUBLIKASI = [
  { value: KlasifikasiPublikasi.PENTING, label: "Penting" },
  { value: KlasifikasiPublikasi.SEGERA, label: "Segera" },
  { value: KlasifikasiPublikasi.RAHASIA, label: "Rahasia" },
  { value: KlasifikasiPublikasi.UMUM, label: "Umum" },
];

// Konstanta status publikasi
export const STATUS_PUBLIKASI = [
  { id: "aktif", label: "Aktif" },
  { id: "kedaluwarsa", label: "Kedaluwarsa" }
];

// Helper untuk mendapatkan label yang user-friendly dari role enum
export function roleToLabel(role: Role): string {
  switch (role) {
    case Role.SUPER_USER:
      return "Super User"
    case Role.KETUA:
      return "Ketua Lingkungan"
    case Role.WAKIL_KETUA:
      return "Wakil Ketua Lingkungan"
    case Role.SEKRETARIS:
      return "Sekretaris"
    case Role.WAKIL_SEKRETARIS:
      return "Wakil Sekretaris"
    case Role.BENDAHARA:
      return "Bendahara"
    case Role.WAKIL_BENDAHARA:
      return "Wakil Bendahara"
    case Role.UMAT:
      return "Umat"
    default:
      return role || "Tidak Diketahui"
  }
}

// Mendapatkan warna kategori berdasarkan klasifikasi
export function getKategoriColor(kategori: KlasifikasiPublikasi | null) {
  switch (kategori) {
    case KlasifikasiPublikasi.PENTING:
      return "bg-red-50 text-red-700 border-red-200 hover:bg-red-50"
    case KlasifikasiPublikasi.SEGERA:
      return "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-50"
    case KlasifikasiPublikasi.RAHASIA:
      return "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-50"
    case KlasifikasiPublikasi.UMUM:
      return "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-50"
    default:
      return "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-50"
  }
}

// Fungsi untuk cek apakah publikasi sudah expired
export function isPublikasiExpired(deadline: Date): boolean {
  const now = new Date()
  const deadlineDate = new Date(deadline)
  
  return now > deadlineDate
}

// Jenis laporan untuk publikasi
export const JENIS_LAPORAN = [
  { id: 'evaluasi', label: 'Evaluasi' },
  { id: 'keuangan', label: 'Keuangan' },
  { id: 'partisipasi', label: 'Partisipasi' },
  { id: 'kehadiran', label: 'Kehadiran' },
  { id: 'lainnya', label: 'Lainnya' },
]; 