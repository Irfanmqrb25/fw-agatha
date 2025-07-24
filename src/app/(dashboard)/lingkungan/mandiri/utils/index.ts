import { format } from "date-fns";

// Format currency
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Format date to Indonesian format
export function formatDate(date: Date): string {
  return format(date, "dd MMMM yyyy", { locale: require("date-fns/locale/id") });
}

// Format month name in Indonesian
export function formatMonthName(monthNumber: number): string {
  const date = new Date(2000, monthNumber - 1, 1);
  return format(date, "MMMM", { locale: require("date-fns/locale/id") });
}

// Get family head name from transaction
export function getKeluargaName(transaction: any): string {
  if (transaction.keluarga?.namaKepalaKeluarga) {
    return transaction.keluarga.namaKepalaKeluarga;
  }
  return `Keluarga ID: ${transaction.keluargaId || "Unknown"}`;
} 