// Jenis data yang dapat dihapus dalam sistem
export type DataType = 
  | "publikasi"
  | "kas_lingkungan"
  | "dana_mandiri"
  | "kas_ikata"
  | "doling"
  | "agenda"
  | "semua"

// Opsi jenis data yang tersedia
export interface DataTypeOption {
  value: DataType
  label: string
}

// Mode penghapusan data
export type WipeMode = 
  | "selective" // Penghapusan selektif berdasarkan jenis dan rentang waktu
  | "emergency" // Penghapusan darurat untuk semua data

// Status proses penghapusan data
export interface WipeStatus {
  isProcessing: boolean
  success?: boolean
  message?: string
} 