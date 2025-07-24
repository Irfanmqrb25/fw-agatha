import { JenisIbadat, SubIbadat } from "@prisma/client";
import { KaleidoskopActivityData, StatistikPerJenisIbadat, RingkasanKegiatan } from "../actions";

// Re-export types dari actions
export type { KaleidoskopActivityData, StatistikPerJenisIbadat, RingkasanKegiatan } from "../actions";

// Alias untuk DolingData (kompatibilitas dengan kode lama)
export type DolingData = KaleidoskopActivityData;

// Mapping untuk jenis ibadat yang dapat dibaca manusia
export const jenisIbadatLabels: Record<JenisIbadat, string> = {
  DOA_LINGKUNGAN: "Doa Lingkungan",
  MISA: "Misa",
  PERTEMUAN: "Pertemuan",
  BAKTI_SOSIAL: "Bakti Sosial",
  KEGIATAN_LAIN: "Kegiatan Lain",
};

// Mapping untuk sub ibadat yang dapat dibaca manusia
export const subIbadatLabels: Record<SubIbadat, string> = {
  IBADAT_SABDA: "Ibadat Sabda",
  IBADAT_SABDA_TEMATIK: "Ibadat Sabda Tematik",
  PRAPASKAH: "Prapaskah",
  BKSN: "BKSN",
  BULAN_ROSARIO: "Bulan Rosario",
  NOVENA_NATAL: "Novena Natal",
  MISA_SYUKUR: "Misa Syukur",
  MISA_REQUEM: "Misa Requem",
  MISA_ARWAH: "Misa Arwah",
  MISA_PELINDUNG: "Misa Pelindung",
};

// Mapping untuk warna berdasarkan jenis ibadat
export const jenisIbadatColors: Record<JenisIbadat, string> = {
  DOA_LINGKUNGAN: "bg-blue-100 text-blue-700 border-blue-200",
  MISA: "bg-purple-100 text-purple-700 border-purple-200",
  PERTEMUAN: "bg-amber-100 text-amber-700 border-amber-200",
  BAKTI_SOSIAL: "bg-green-100 text-green-700 border-green-200",
  KEGIATAN_LAIN: "bg-gray-100 text-gray-700 border-gray-200",
}; 