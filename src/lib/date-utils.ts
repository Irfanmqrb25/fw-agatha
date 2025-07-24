import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';

// Fungsi untuk memformat tanggal dengan timezone Asia/Jakarta
export function formatIndonesianDateTime(date: Date | string) {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  
  // Format: "Senin, 1 Januari 2024 09:00 WIB"
  return format(dateObj, "EEEE, d MMMM yyyy HH:mm 'WIB'", {
    locale: id
  });
}

// Fungsi untuk mendapatkan tanggal sekarang dengan timezone Asia/Jakarta
export function getCurrentJakartaTime() {
  return new Date().toLocaleString('en-US', {
    timeZone: 'Asia/Jakarta'
  });
}

// Fungsi untuk mengkonversi tanggal ke timezone Asia/Jakarta
export function convertToJakartaTime(date: Date) {
  return new Date(date.toLocaleString('en-US', {
    timeZone: 'Asia/Jakarta'
  }));
} 