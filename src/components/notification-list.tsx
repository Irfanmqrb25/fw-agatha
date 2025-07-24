"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { getUserNotifications, markNotificationAsRead } from "@/lib/notifications";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import Link from "next/link";

interface NotificationItem {
  id: number;
  title: string;
  message: string;
  type: string;
  timestamp: Date;
  isRead: boolean;
  recipientId: number | null;
  senderId: number | null;
  relatedItemId: number | null;
  relatedItemType: string | null;
}

export function NotificationList() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Ambil notifikasi saat komponen dimount
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await getUserNotifications(10);
        // Transformasi data dengan penanganan error
        setNotifications(data.map(item => {
          try {
            // Pastikan timestamp adalah objek Date yang valid
            const timestamp = item.createdAt ? new Date(item.createdAt) : new Date();
            // Validasi apakah timestamp valid
            if (isNaN(timestamp.getTime())) {
              console.error("Invalid timestamp for notification:", item);
              return {
                ...item,
                title: "Notifikasi", // Default title
                message: item.pesan || "Tidak ada pesan", // Menggunakan field pesan dari database
                type: "info", // Default type
                timestamp: new Date(), // Gunakan waktu saat ini sebagai fallback
                isRead: item.dibaca
              };
            }
            
            return {
              ...item,
              title: "Notifikasi", // Default title 
              message: item.pesan || "Tidak ada pesan", // Menggunakan field pesan dari database
              type: "info", // Default type
              timestamp: timestamp,
              isRead: item.dibaca
            };
          } catch (error) {
            console.error("Error processing notification:", error, item);
            return {
              ...item,
              title: "Notifikasi", // Default title
              message: "Tidak ada pesan", // Default message 
              type: "info", // Default type
              timestamp: new Date(), // Gunakan waktu saat ini sebagai fallback
              isRead: item.dibaca
            };
          }
        }));
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  // Menandai semua notifikasi sebagai sudah dibaca
  const handleMarkAllAsRead = async () => {
    const unreadNotifications = notifications.filter(n => !n.isRead);
    
    if (unreadNotifications.length === 0) return;
    
    try {
      // Perbarui state UI untuk responsivitas
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, isRead: true }))
      );
      
      // Panggil fungsi server untuk setiap notifikasi yang belum dibaca
      const promises = unreadNotifications.map(notification => 
        markNotificationAsRead(notification.id.toString())
      );
      
      await Promise.all(promises);
    } catch (error) {
      console.error("Error marking notifications as read:", error);
      // Rollback jika terjadi error
      const fetchNotifications = async () => {
        try {
          const data = await getUserNotifications(10);
          setNotifications(data.map(item => {
            try {
              const timestamp = item.createdAt ? new Date(item.createdAt) : new Date();
              if (isNaN(timestamp.getTime())) {
                return {
                  ...item,
                  title: "Notifikasi", // Default title
                  message: item.pesan || "Tidak ada pesan", // Menggunakan field pesan dari database
                  type: "info", // Default type
                  timestamp: new Date(),
                  isRead: item.dibaca
                };
              }
              
              return {
                ...item,
                title: "Notifikasi", // Default title
                message: item.pesan || "Tidak ada pesan", // Menggunakan field pesan dari database
                type: "info", // Default type
                timestamp: timestamp,
                isRead: item.dibaca
              };
            } catch (error) {
              console.error("Error processing notification during rollback:", error, item);
              return {
                ...item,
                timestamp: new Date(),
                isRead: item.dibaca
              };
            }
          }));
        } catch (rollbackError) {
          console.error("Error during rollback:", rollbackError);
        }
      };
      fetchNotifications();
    }
  };

  // Menandai satu notifikasi sebagai sudah dibaca
  const handleMarkAsRead = async (id: number) => {
    try {
      // Perbarui state UI untuk responsivitas
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === id 
            ? { ...notification, isRead: true } 
            : notification
        )
      );
      
      // Panggil fungsi server
      await markNotificationAsRead(id.toString());
    } catch (error) {
      console.error(`Error marking notification ${id} as read:`, error);
      // Rollback jika terjadi error
      const fetchNotifications = async () => {
        try {
          const data = await getUserNotifications(10);
          setNotifications(data.map(item => {
            try {
              const timestamp = item.createdAt ? new Date(item.createdAt) : new Date();
              if (isNaN(timestamp.getTime())) {
                return {
                  ...item,
                  timestamp: new Date(),
                  isRead: item.dibaca
                };
              }
              
              return {
                ...item,
                timestamp: timestamp,
                isRead: item.dibaca
              };
            } catch (error) {
              console.error("Error processing notification during rollback:", error, item);
              return {
                ...item,
                timestamp: new Date(),
                isRead: item.dibaca
              };
            }
          }));
        } catch (rollbackError) {
          console.error("Error during rollback:", rollbackError);
        }
      };
      fetchNotifications();
    }
  };

  // Mendapatkan warna berdasarkan tipe notifikasi
  const getNotificationColorClass = (type: string) => {
    switch (type) {
      case "success":
        return "bg-green-50 text-green-800";
      case "error":
        return "bg-red-50 text-red-800";
      case "warning":
        return "bg-yellow-50 text-yellow-800";
      default:
        return "bg-blue-50 text-blue-800";
    }
  };

  // Format waktu notifikasi (contoh: 5 menit yang lalu)
  const formatNotificationTime = (date: Date) => {
    try {
      // Pastikan date adalah objek Date yang valid
      if (!(date instanceof Date) || isNaN(date.getTime())) {
        return "Baru saja";
      }
      
      return formatDistanceToNow(date, { 
        addSuffix: true,
        locale: id // Menggunakan locale Bahasa Indonesia
      });
    } catch (error) {
      console.error("Error formatting date:", error, date);
      return "Baru saja";
    }
  };

  return (
    <div className="w-[320px]">
      <div className="flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h4 className="font-semibold">Notifikasi</h4>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs hover:bg-muted"
            onClick={handleMarkAllAsRead}
            disabled={notifications.every(n => n.isRead)}
          >
            Tandai sudah dibaca
          </Button>
        </div>
        
        <div className="py-2 max-h-[400px] overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : notifications.length > 0 ? (
            notifications.map((notification) => (
              <Link href={`/notifications/${notification.id}`} key={notification.id}>
                <div
                  className={`px-4 py-2.5 hover:bg-muted/50 cursor-pointer transition-colors ${!notification.isRead ? 'bg-muted/30' : ''}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm leading-none">{notification.title}</p>
                        {!notification.isRead && (
                          <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{notification.message}</p>
                    </div>
                    <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                      {formatNotificationTime(notification.timestamp)}
                    </span>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="px-4 py-8 text-center text-muted-foreground text-sm">
              Tidak ada notifikasi baru
            </div>
          )}
        </div>

        <div className="border-t px-4 py-2">
          <Button variant="ghost" className="w-full justify-center text-sm hover:bg-muted" asChild>
            <Link href="/notifications">Lihat semua notifikasi</Link>
          </Button>
        </div>
      </div>
    </div>
  );
} 