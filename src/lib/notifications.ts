"use server";

import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { unstable_noStore as noStore } from "next/cache";
import { revalidatePath } from "next/cache";

export type NotificationType = "info" | "success" | "warning" | "error";

// Sesuaikan dengan model Notification di Prisma schema
export interface NotificationData {
  title?: string; // Tidak ada di model, untuk UI saja
  message: string; // Ini akan disimpan ke field 'pesan'
  type: NotificationType; // Untuk UI, tidak disimpan di model
  recipientId?: string; // Akan disimpan sebagai userId
  senderId?: string; // Tidak disimpan, hanya untuk referensi
  relatedItemId?: number; // Tidak disimpan, hanya untuk referensi
  relatedItemType?: string; // Tidak disimpan, hanya untuk referensi
}

export interface NotificationResponse {
  success: boolean;
  message: string;
  data?: any;
}

/**
 * Membuat notifikasi baru di database
 */
export async function createNotification(data: NotificationData): Promise<NotificationResponse> {
  noStore();
  
  try {
    // Dapatkan data user dari session jika senderId tidak disediakan
    let senderId = data.senderId;
    
    if (!senderId) {
      const session = await getServerSession(authOptions);
      if (session?.user?.id) {
        senderId = session.user.id;
      }
    }
    
    // Buat notifikasi baru sesuai model Prisma
    const notification = await prisma.notification.create({
      data: {
        pesan: data.message,
        dibaca: false,
        userId: data.recipientId || "",
      }
    });
    
    // Revalidasi path jika diperlukan
    if (data.relatedItemType) {
      revalidatePath(`/${data.relatedItemType.toLowerCase()}`);
    }
    
    return {
      success: true,
      message: "Notifikasi berhasil dibuat",
      data: notification
    };
  } catch (error) {
    console.error("Error creating notification:", error);
    return {
      success: false,
      message: "Gagal membuat notifikasi"
    };
  }
}

/**
 * Mendapatkan notifikasi untuk user tertentu
 */
export async function getUserNotifications(limit = 10): Promise<any[]> {
  noStore();
  
  try {
    // Dapatkan session user
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return [];
    }
    
    const userId = session.user.id;
    
    // Hitung tanggal 1 hari yang lalu
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    
    // Ambil notifikasi untuk user tersebut
    // Filter: hanya yang belum dibaca dan kurang dari 1 hari
    const notifications = await prisma.notification.findMany({
      where: {
        userId: userId,
        dibaca: false,
        createdAt: {
          gte: oneDayAgo
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    });
    
    return notifications;
  } catch (error) {
    console.error("Error fetching user notifications:", error);
    return [];
  }
}

/**
 * Mendapatkan notifikasi berdasarkan ID
 */
export async function getNotificationById(notificationId: string): Promise<any | null> {
  noStore();
  
  try {
    // Validasi parameter terlebih dahulu
    if (!notificationId || typeof notificationId !== 'string') {
      console.error("Invalid notification ID:", notificationId);
      return null;
    }
    
    // Dapatkan session user
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      console.error("User not authenticated when fetching notification:", notificationId);
      return null;
    }
    
    const userId = session.user.id;
    
    // Ambil notifikasi berdasarkan ID
    const notification = await prisma.notification.findUnique({
      where: {
        id: notificationId
      },
    });
    
    // Pastikan user adalah penerima notifikasi tersebut
    if (!notification) {
      console.error("Notification not found:", notificationId);
      return null;
    }
    
    if (notification.userId !== userId) {
      console.error("User not authorized to view notification:", { 
        notificationId, 
        userId, 
        notificationUserId: notification.userId 
      });
      return null;
    }
    
    // Transformasi data untuk client dengan format yang konsisten
    const formattedNotification = {
      id: notification.id,
      pesan: notification.pesan,
      dibaca: notification.dibaca,
      userId: notification.userId,
      createdAt: notification.createdAt,
      updatedAt: notification.updatedAt,
      type: "info", // Default type untuk UI
    };
    
    return formattedNotification;
  } catch (error) {
    console.error("Error fetching notification by ID:", notificationId, error);
    return null;
  }
}

/**
 * Menandai notifikasi sebagai telah dibaca
 */
export async function markNotificationAsRead(notificationId: string): Promise<NotificationResponse> {
  noStore();
  
  try {
    // Validasi parameter terlebih dahulu
    if (!notificationId || typeof notificationId !== 'string') {
      return {
        success: false,
        message: "ID notifikasi tidak valid"
      };
    }
    
    // Dapatkan session user
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return {
        success: false,
        message: "User tidak terautentikasi"
      };
    }
    
    const userId = session.user.id;
    
    // Periksa apakah notifikasi ada
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId }
    });
    
    if (!notification) {
      return {
        success: false,
        message: "Notifikasi tidak ditemukan"
      };
    }
    
    // Periksa apakah notifikasi milik user
    if (notification.userId !== userId) {
      return {
        success: false,
        message: "Tidak berhak mengakses notifikasi ini"
      };
    }
    
    // Jika sudah dibaca, tidak perlu update lagi
    if (notification.dibaca) {
      return {
        success: true,
        message: "Notifikasi sudah dibaca sebelumnya"
      };
    }
    
    // Update notifikasi
    await prisma.notification.update({
      where: { id: notificationId },
      data: { dibaca: true }
    });
    
    return {
      success: true,
      message: "Notifikasi ditandai sebagai dibaca"
    };
  } catch (error) {
    console.error("Error marking notification as read:", notificationId, error);
    return {
      success: false,
      message: "Gagal menandai notifikasi sebagai dibaca"
    };
  }
}

/**
 * Menandai semua notifikasi pengguna sebagai telah dibaca
 */
export async function markAllNotificationsAsRead(): Promise<NotificationResponse> {
  noStore();
  
  try {
    // Dapatkan session user
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return {
        success: false,
        message: "User tidak terautentikasi"
      };
    }
    
    const userId = session.user.id;
    
    // Update semua notifikasi milik user yang belum dibaca
    await prisma.notification.updateMany({
      where: { 
        userId: userId,
        dibaca: false
      },
      data: { dibaca: true }
    });
    
    // Revalidasi path notifikasi
    revalidatePath('/notifications');
    
    return {
      success: true,
      message: "Semua notifikasi berhasil ditandai sebagai dibaca"
    };
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return {
      success: false,
      message: "Gagal menandai semua notifikasi sebagai dibaca"
    };
  }
}

/**
 * Menghitung jumlah notifikasi yang belum dibaca
 */
export async function getUnreadNotificationsCount(): Promise<number> {
  noStore();
  
  try {
    // Dapatkan session user
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return 0;
    }
    
    const userId = session.user.id;
    
    // Hitung tanggal 1 hari yang lalu
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    
    // Hitung jumlah notifikasi yang belum dibaca
    const count = await prisma.notification.count({
      where: {
        userId: userId,
        dibaca: false,
        createdAt: {
          gte: oneDayAgo
        }
      }
    });
    
    return count;
  } catch (error) {
    console.error("Error counting unread notifications:", error);
    return 0;
  }
}

/**
 * Menghapus notifikasi
 */
export async function deleteNotification(notificationId: string): Promise<NotificationResponse> {
  noStore();
  
  try {
    // Validasi parameter
    if (!notificationId || typeof notificationId !== 'string') {
      return {
        success: false,
        message: "ID notifikasi tidak valid"
      };
    }
    
    // Dapatkan session user
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return {
        success: false,
        message: "User tidak terautentikasi"
      };
    }
    
    const userId = session.user.id;
    
    // Periksa apakah notifikasi ada
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId }
    });
    
    if (!notification) {
      return {
        success: false,
        message: "Notifikasi tidak ditemukan"
      };
    }
    
    // Periksa apakah notifikasi milik user
    if (notification.userId !== userId) {
      return {
        success: false,
        message: "Tidak berhak menghapus notifikasi ini"
      };
    }
    
    // Hapus notifikasi
    await prisma.notification.delete({
      where: { id: notificationId }
    });
    
    // Revalidasi path
    revalidatePath('/notifications');
    
    return {
      success: true,
      message: "Notifikasi berhasil dihapus"
    };
  } catch (error) {
    console.error("Error deleting notification:", notificationId, error);
    return {
      success: false,
      message: "Gagal menghapus notifikasi"
    };
  }
} 