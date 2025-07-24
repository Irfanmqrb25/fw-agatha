import { JenisIbadat, SubIbadat, StatusApproval, StatusKegiatan } from "@prisma/client";
import type { DolingData, AbsensiData, KeluargaForSelect } from "../actions";

// Re-export tipe dari actions untuk penggunaan di komponen lain
export type { DolingData, AbsensiData, KeluargaForSelect };

// Alias untuk kompatibilitas dengan kode lama
export type JadwalDoling = DolingData;
export type DetilDoling = DolingData;
export type AbsensiDoling = AbsensiData;

// Tipe data untuk riwayat kehadiran
export interface RiwayatDoling {
  nama: string;
  totalHadir: number;
  persentase: number;
}

// Tipe data untuk rekapitulasi kegiatan
export interface RekapitulasiKegiatan {
  bulan: string;
  jumlahKegiatan: number;
  rataRataHadir: number;
}

// Tipe data untuk kaleidoskop
export interface KaleidoskopData {
  totalKegiatan: number;
  rataRataKehadiran: number;
  totalKKAktif: number;
}

// Mapping untuk jenis ibadat yang dapat dibaca manusia
export const jenisIbadatOptions = [
  { value: JenisIbadat.DOA_LINGKUNGAN, label: "Doa Lingkungan" },
  { value: JenisIbadat.MISA, label: "Misa" },
  { value: JenisIbadat.PERTEMUAN, label: "Pertemuan" },
  { value: JenisIbadat.BAKTI_SOSIAL, label: "Bakti Sosial" },
  { value: JenisIbadat.KEGIATAN_LAIN, label: "Kegiatan Lain" },
];

// Mapping untuk sub ibadat yang dapat dibaca manusia
export const subIbadatOptions = [
  { value: SubIbadat.IBADAT_SABDA, label: "Ibadat Sabda" },
  { value: SubIbadat.IBADAT_SABDA_TEMATIK, label: "Ibadat Sabda Tematik" },
  { value: SubIbadat.PRAPASKAH, label: "Prapaskah" },
  { value: SubIbadat.BKSN, label: "BKSN" },
  { value: SubIbadat.BULAN_ROSARIO, label: "Bulan Rosario" },
  { value: SubIbadat.NOVENA_NATAL, label: "Novena Natal" },
  { value: SubIbadat.MISA_SYUKUR, label: "Misa Syukur" },
  { value: SubIbadat.MISA_REQUEM, label: "Misa Requem" },
  { value: SubIbadat.MISA_ARWAH, label: "Misa Arwah" },
  { value: SubIbadat.MISA_PELINDUNG, label: "Misa Pelindung" },
];

// Mapping untuk status yang dapat dibaca manusia
export const statusOptions = [
  { value: "terjadwal", label: "Terjadwal", color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  { value: "menunggu", label: "Menunggu Approval", color: "bg-blue-100 text-blue-800 border-blue-200" },
  { value: "selesai", label: "Selesai", color: "bg-green-100 text-green-800 border-green-200" },
  { value: "dibatalkan", label: "Dibatalkan", color: "bg-red-100 text-red-800 border-red-200" },
]; 