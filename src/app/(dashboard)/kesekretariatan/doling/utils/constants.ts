import { StatusApproval } from "@prisma/client";

// Constants untuk opsi filter
export const tahunOptions = [
  { value: "all", label: "Semua Tahun" },
  { value: "2023", label: "2023" },
  { value: "2024", label: "2024" },
  { value: "2025", label: "2025" },
];

export const bulanOptions = [
  { value: "all", label: "Semua Bulan" },
  { value: "1", label: "Januari" },
  { value: "2", label: "Februari" },
  { value: "3", label: "Maret" },
  { value: "4", label: "April" },
  { value: "5", label: "Mei" },
  { value: "6", label: "Juni" },
  { value: "7", label: "Juli" },
  { value: "8", label: "Agustus" },
  { value: "9", label: "September" },
  { value: "10", label: "Oktober" },
  { value: "11", label: "November" },
  { value: "12", label: "Desember" },
];

export const statusJadwalOptions = [
  { value: "all", label: "Semua Status" },
  { value: "terjadwal", label: "Terjadwal" },
  { value: "selesai", label: "Selesai" },
  { value: "dibatalkan", label: "Dibatalkan" },
];

export const statusDetilOptions = [
  { value: "all", label: "Semua Status" },
  { value: "selesai", label: "Selesai" },
  { value: "dibatalkan", label: "Dibatalkan" },
];

export const jenisIbadatOptions = [
  { value: "doa-lingkungan", label: "Doa Lingkungan" },
  { value: "misa", label: "Misa" },
  { value: "pertemuan", label: "Pertemuan" },
  { value: "bakti-sosial", label: "Bakti Sosial" },
  { value: "kegiatan-lainnya", label: "Kegiatan Lainnya" },
];

// Sub ibadat berdasarkan jenis ibadat
export const subIbadatOptions: Record<string, Array<{ value: string; label: string }>> = {
  "doa-lingkungan": [
    { value: "umum", label: "Umum" },
    { value: "app", label: "APP (Aksi Puasa Pembangunan)" },
    { value: "bksn", label: "BKSN (Bulan Kitab Suci Nasional)" },
    { value: "novena", label: "Novena" },
    { value: "rosario", label: "Doa Rosario" },
  ],
  "misa": [
    { value: "mingguan", label: "Misa Mingguan" },
    { value: "requiem", label: "Misa Requiem" },
    { value: "perkawinan", label: "Misa Perkawinan" },
    { value: "khusus", label: "Misa Khusus" },
  ],
  "pertemuan": [
    { value: "rapat", label: "Rapat Lingkungan" },
    { value: "evaluasi", label: "Evaluasi Kegiatan" },
    { value: "koordinasi", label: "Koordinasi" },
  ],
  "bakti-sosial": [
    { value: "sumbangan", label: "Pengumpulan Sumbangan" },
    { value: "kunjungan", label: "Kunjungan Kasih" },
    { value: "kerja-bakti", label: "Kerja Bakti" },
  ],
  "kegiatan-lainnya": [
    { value: "perayaan", label: "Perayaan" },
    { value: "seminar", label: "Seminar/Workshop" },
    { value: "lainnya", label: "Lainnya" },
  ],
};

export const statusOptions = [
  { value: "terjadwal", label: "Terjadwal", color: "bg-blue-100 text-blue-800 border-blue-200" },
  { value: "selesai", label: "Selesai", color: "bg-green-100 text-green-800 border-green-200" },
  { value: "dibatalkan", label: "Dibatalkan", color: "bg-red-100 text-red-800 border-red-200" },
  { value: "menunggu", label: "Menunggu Approval", color: "bg-blue-100 text-blue-800 border-blue-200" },
];

export const approvalOptions = [
  { value: StatusApproval.PENDING, label: "Menunggu Persetujuan", color: "bg-blue-100 text-blue-800 border-blue-200" },
  { value: StatusApproval.APPROVED, label: "Disetujui", color: "bg-green-100 text-green-800 border-green-200" },
  { value: StatusApproval.REJECTED, label: "Ditolak", color: "bg-red-100 text-red-800 border-red-200" },
];

export const approvalStatusColor = {
  [StatusApproval.PENDING]: "text-amber-700 bg-amber-100 border-amber-200",
  [StatusApproval.APPROVED]: "text-green-700 bg-green-100 border-green-200",
  [StatusApproval.REJECTED]: "text-red-700 bg-red-100 border-red-200"
}; 