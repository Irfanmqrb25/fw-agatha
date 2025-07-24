"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { NotificationData, NotificationType } from "@/lib/notifications";
import { toast } from "sonner";

// Tipe notifikasi yang digunakan dalam context
export interface Notification {
  id: number;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  timestamp: Date;
  recipientId?: number;
  senderId?: number;
  relatedItemId?: number;
  relatedItemType?: string;
}

// Tipe context untuk notifikasi
interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, "id" | "timestamp" | "isRead">) => void;
  markAsRead: (id: number) => void;
  markAllAsRead: () => void;
  removeNotification: (id: number) => void;
  clearNotifications: () => void;
}

// Context default dengan fungsi kosong
const defaultContext: NotificationContextType = {
  notifications: [],
  unreadCount: 0,
  addNotification: () => {},
  markAsRead: () => {},
  markAllAsRead: () => {},
  removeNotification: () => {},
  clearNotifications: () => {},
};

// Buat context
const NotificationContext = createContext<NotificationContextType>(defaultContext);

// Hook untuk menggunakan notification context
export const useNotification = () => useContext(NotificationContext);

// Provider component
export function NotificationProvider({ children }: { children: React.ReactNode }) {
  // State untuk menyimpan notifikasi
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  // Menghitung jumlah notifikasi yang belum dibaca
  const unreadCount = notifications.filter(n => !n.isRead).length;
  
  // Fungsi untuk menambah notifikasi baru
  const addNotification = (notification: Omit<Notification, "id" | "timestamp" | "isRead">) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now(), // ID unik menggunakan timestamp
      timestamp: new Date(),
      isRead: false,
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    
    // Tampilkan toast notification
    switch (notification.type) {
      case "success":
        toast.success(notification.message);
        break;
      case "error":
        toast.error(notification.message);
        break;
      case "warning":
        toast.warning(notification.message);
        break;
      default:
        toast.info(notification.message);
    }
  };
  
  // Fungsi untuk menandai notifikasi sebagai sudah dibaca
  const markAsRead = (id: number) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };
  
  // Fungsi untuk menandai semua notifikasi sebagai sudah dibaca
  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  };
  
  // Fungsi untuk menghapus notifikasi
  const removeNotification = (id: number) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };
  
  // Fungsi untuk menghapus semua notifikasi
  const clearNotifications = () => {
    setNotifications([]);
  };
  
  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        removeNotification,
        clearNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
} 