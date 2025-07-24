import { DataTypeOption, DataType } from "../types"

// Daftar opsi jenis data yang tersedia
export const DATA_TYPE_OPTIONS: DataTypeOption[] = [
  { value: "publikasi", label: "Publikasi" },
  { value: "kas_lingkungan", label: "Kas Lingkungan" },
  { value: "dana_mandiri", label: "Dana Mandiri" },
  { value: "kas_ikata", label: "Kas IKATA" },
  { value: "doling", label: "Doa Lingkungan" },
  { value: "agenda", label: "Agenda/Pengajuan" },
  { value: "semua", label: "Semua Data" }
]

/**
 * Fungsi untuk mendapatkan label dari jenis data
 * @param dataType Jenis data
 * @returns Label jenis data
 */
export const getDataTypeLabel = (dataType: DataType): string => {
  return dataType === "semua"
    ? "semua data"
    : DATA_TYPE_OPTIONS.find(item => item.value === dataType)?.label || dataType
} 