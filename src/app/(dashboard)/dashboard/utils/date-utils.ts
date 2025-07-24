import { startOfMonth, endOfMonth } from "date-fns";
import { type DateRange } from "react-day-picker";
import { nowInJakarta } from "@/lib/timezone";

// Mendapatkan rentang tanggal untuk bulan tertentu
export function getMonthDateRange(date: Date): DateRange {
  return {
    from: startOfMonth(date),
    to: endOfMonth(date),
  };
}

// Fungsi untuk mendapatkan bulan dari query params
export function getMonthFromQuery(month?: string): number | undefined {
  if (!month || month === "all") return undefined;
  
  const parsedMonth = parseInt(month);
  if (isNaN(parsedMonth) || parsedMonth < 1 || parsedMonth > 12) {
    return undefined;
  }
  
  return parsedMonth;
}

// Fungsi untuk mendapatkan tahun dari query params
export function getYearFromQuery(year?: string): number | undefined {
  if (!year) return undefined;
  
  const parsedYear = parseInt(year);
  const currentYear = nowInJakarta().getFullYear();
  
  // Batasi tahun yang valid dalam rentang 5 tahun ke belakang dan 3 tahun ke depan
  if (isNaN(parsedYear) || parsedYear < (currentYear - 5) || parsedYear > (currentYear + 3)) {
    return undefined;
  }
  
  return parsedYear;
}

export function getCurrentFinancialYear(): number {
  const currentYear = nowInJakarta().getFullYear();
  return currentYear;
} 