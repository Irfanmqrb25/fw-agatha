/**
 * Utility functions untuk menangani timezone Jakarta (UTC+7)
 * Memastikan konsistensi waktu antara development dan production
 */

// Timezone offset untuk Jakarta (UTC+7)
const JAKARTA_TIMEZONE_OFFSET = 7 * 60; // 7 jam dalam menit

/**
 * Membuat Date object yang disesuaikan dengan timezone Jakarta
 * @param year Tahun
 * @param month Bulan (0-11, dimana 0 = Januari)
 * @param day Hari
 * @param hours Jam (default: 0)
 * @param minutes Menit (default: 0)
 * @param seconds Detik (default: 0)
 * @returns Date object dalam UTC yang setara dengan waktu Jakarta
 */
export function createJakartaDate(year: number, month: number, day: number, hours = 0, minutes = 0, seconds = 0) {
  // Buat date dalam UTC dengan mengurangi 7 jam dari waktu Jakarta
  return new Date(Date.UTC(year, month, day, hours - 7, minutes, seconds));
}

/**
 * Membuat range tanggal untuk bulan tertentu dalam timezone Jakarta
 * @param year Tahun
 * @param month Bulan (1-12, dimana 1 = Januari)
 * @returns Object dengan startDate dan endDate
 */
export function createJakartaMonthRange(year: number, month: number) {
  // month: 0-11 (0=January, 11=December)
  const startDate = createJakartaDate(year, month, 1, 0, 0, 0);
  
  // Hitung hari terakhir bulan
  const lastDay = new Date(year, month + 1, 0).getDate();
  const endDate = createJakartaDate(year, month, lastDay, 23, 59, 59);
  
  return { startDate, endDate };
}

/**
 * Membuat range tanggal untuk tahun tertentu dalam timezone Jakarta
 * @param year Tahun
 * @returns Object dengan startDate dan endDate
 */
export function createJakartaYearRange(year: number) {
  const startDate = createJakartaDate(year, 0, 1, 0, 0, 0);
  const endDate = createJakartaDate(year, 11, 31, 23, 59, 59);
  
  return { startDate, endDate };
}

/**
 * Parse string tanggal dalam format "YYYY-MM-DD" ke Date object Jakarta
 * @param dateString String tanggal format "YYYY-MM-DD"
 * @returns Date object dalam UTC yang setara dengan tanggal Jakarta
 */
export function parseJakartaDateString(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  return createJakartaDate(year, month - 1, day); // month - 1 karena JavaScript month dimulai dari 0
}

/**
 * Format Date object ke string dalam format "DD/MM/YYYY" untuk Jakarta
 * @param date Date object
 * @returns String tanggal dalam format "DD/MM/YYYY"
 */
export function formatJakartaDate(date: Date): string {
  // Konversi ke waktu Jakarta
  const jakartaTime = new Date(date.getTime() + (7 * 60 * 60 * 1000));
  
  const day = jakartaTime.getUTCDate().toString().padStart(2, '0');
  const month = (jakartaTime.getUTCMonth() + 1).toString().padStart(2, '0');
  const year = jakartaTime.getUTCFullYear().toString();
  
  return `${day}/${month}/${year}`;
}

/**
 * Mendapatkan tanggal dan waktu saat ini dalam timezone Jakarta
 * @returns Date object yang mewakili waktu sekarang di Jakarta
 */
export function nowInJakarta(): Date {
  const now = new Date();
  // Buat Date object yang merepresentasikan waktu Jakarta sekarang
  const jakartaTime = new Date(now.getTime() + (7 * 60 * 60 * 1000));
  return jakartaTime;
}

/**
 * Mengecek apakah tanggal tertentu berada dalam bulan yang dispecifikasi di Jakarta
 * @param date Date object yang akan dicek
 * @param year Tahun
 * @param month Bulan (1-12)
 * @returns boolean
 */
export function isDateInJakartaMonth(date: Date, year: number, month: number): boolean {
  const { startDate, endDate } = createJakartaMonthRange(year, month);
  return date >= startDate && date <= endDate;
} 