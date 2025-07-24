"use client";

import { DetilDoling, JadwalDoling } from ".";

export interface DetilDolingFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  detil?: DetilDoling;
  onSubmit: (values: Omit<DetilDoling, 'id' | 'createdAt' | 'updatedAt'>) => void;
  jadwalDoling: JadwalDoling[];
}

// Tipe untuk jenis ibadat
export type JenisIbadat = "doa-lingkungan" | "misa" | "pertemuan" | "bakti-sosial" | "kegiatan-lainnya";

// Enum untuk jenis ibadat
export const jenisIbadatOptions = [
  { value: "doa-lingkungan", label: "Doa Lingkungan" },
  { value: "misa", label: "Misa" },
  { value: "pertemuan", label: "Pertemuan" },
  { value: "bakti-sosial", label: "Bakti Sosial" },
  { value: "kegiatan-lainnya", label: "Kegiatan Lainnya" },
] as const;

// Sub ibadat berdasarkan jenis ibadat sesuai brief
export const subIbadatOptions: Record<JenisIbadat, Array<{ value: string; label: string }>> = {
  "doa-lingkungan": [
    { value: "ibadat-sabda", label: "Ibadat Sabda" },
    { value: "ibadat-sabda-tematik", label: "Ibadat Sabda Tematik (KAM/Paroki)" },
    { value: "prapaskah-app", label: "Prapaskah (APP)" },
    { value: "bksn", label: "BKSN" },
    { value: "bulan-rosario", label: "Bulan Rosario" },
    { value: "novena-natal", label: "Novena Natal" },
  ],
  "misa": [
    { value: "misa-syukur", label: "Misa Syukur" },
    { value: "misa-requem", label: "Misa Requem" },
    { value: "misa-arwah", label: "Misa Arwah" },
    { value: "misa-pelindung", label: "Misa Pelindung" },
  ],
  "pertemuan": [
    { value: "rapat", label: "Rapat" },
    { value: "evaluasi", label: "Evaluasi" },
    { value: "koordinasi", label: "Koordinasi" },
  ],
  "bakti-sosial": [
    { value: "sumbangan", label: "Sumbangan" },
    { value: "kunjungan", label: "Kunjungan" },
    { value: "kerja-bakti", label: "Kerja Bakti" },
  ],
  "kegiatan-lainnya": [
    { value: "perayaan", label: "Perayaan" },
    { value: "seminar", label: "Seminar" },
    { value: "lainnya", label: "Lainnya" },
  ],
}; 