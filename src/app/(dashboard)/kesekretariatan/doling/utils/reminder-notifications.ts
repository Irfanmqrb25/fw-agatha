import { toast } from "sonner";
import { JadwalDoling } from "../types";

/**
 * Setup notification reminders based on scheduled events
 * @param jadwal - Array of jadwal doling data
 */
export const setupReminderNotifications = (jadwal: JadwalDoling[]) => {
  // Periksa jika ada jadwal dalam 1 minggu ke depan
  const today = new Date();
  const nextWeek = new Date();
  nextWeek.setDate(today.getDate() + 7);

  const jadwalNextWeek = jadwal.filter(
    item => item.tanggal >= today && item.tanggal <= nextWeek
  );

  // Periksa hari dan waktu untuk reminder otomatis
  const isSaturday = today.getDay() === 6; // Sabtu = 6
  const isSunday = today.getDay() === 0; // Minggu = 0
  const currentHour = today.getHours();

  // Simulasi reminder untuk Sabtu malam ke petugas
  if (isSaturday && currentHour >= 19 && jadwalNextWeek.length === 0) {
    // Dalam aplikasi nyata, ini akan mengirim notifikasi ke role tertentu
    // Dan akan menggunakan cron job atau task scheduler
    setTimeout(() => {
      toast.warning(
        "Reminder: Belum ada jadwal doling untuk minggu depan. Harap segera menyusun jadwal.",
        { duration: 10000 }
      );
    }, 2000);
  }

  // Simulasi notifikasi mingguan untuk Minggu siang
  if (isSunday && currentHour >= 12 && jadwalNextWeek.length > 0) {
    setTimeout(() => {
      toast.success(
        `Jadwal doling untuk minggu ini sudah tersedia. Total: ${jadwalNextWeek.length} jadwal.`,
        { duration: 10000 }
      );
    }, 3000);
  }
}; 