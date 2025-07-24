"use client";

import { NotificationType } from "./notifications";
import { toast } from "sonner";

/**
 * Meminta izin notifikasi browser
 */
export function requestNotificationPermission() {
  if ('Notification' in window) {
    if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
  }
}

/**
 * Menampilkan notifikasi browser (web notification API)
 */
export async function showBrowserNotification(title: string, body: string) {
  try {
    // Request permission if not granted
    if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        return;
      }
    }

    // Show notification if permission is granted
    if (Notification.permission === 'granted') {
      new Notification(title, { body });
    }
  } catch (error) {
    console.error('Error showing browser notification:', error);
  }
}

/**
 * Menampilkan notifikasi toast dan browser
 * Fungsi ini menampilkan toast dan browser notification sekaligus
 */
export function showNotification(
  title: string, 
  message: string, 
  type: NotificationType = "info",
  options?: { duration?: number }
) {
  // Tampilkan toast notification
  switch (type) {
    case "success":
      toast.success(message, { duration: options?.duration || 5000 });
      break;
    case "error":
      toast.error(message, { duration: options?.duration || 5000 });
      break;
    case "warning":
      toast.warning(message, { duration: options?.duration || 5000 });
      break;
    default:
      toast.info(message, { duration: options?.duration || 5000 });
  }
  
  // Tampilkan browser notification
  showBrowserNotification(title, message);
}

/**
 * Memeriksa apakah browser mendukung notifikasi dan meminta izin jika belum
 */
export function setupNotifications() {
  if ('Notification' in window) {
    if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
  }
} 