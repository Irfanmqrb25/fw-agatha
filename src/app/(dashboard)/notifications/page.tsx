"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { getUserNotifications, markNotificationAsRead, markAllNotificationsAsRead, getUnreadNotificationsCount } from "@/lib/notifications";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import Link from "next/link";
import { Check, BellRing, CheckCheck, ArrowRight, User, File, Clock, Filter } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";

interface NotificationItem {
  id: string;
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

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeTab, setActiveTab] = useState("recent");
  const isMobile = useIsMobile();

  // Fungsi untuk memuat notifikasi
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await getUserNotifications(100); // Ambil 100 notifikasi terbaru
      const count = await getUnreadNotificationsCount();
      
      // Transformasi data dengan validasi timestamp
      const transformedData = data.map(item => {
        try {
          // Gunakan createdAt sebagai timestamp
          const timestamp = new Date(item.createdAt);
          
          return {
            id: item.id,
            title: "Notifikasi Baru", // Default title
            message: item.pesan,
            type: "info", // Default type
            timestamp: timestamp,
            isRead: item.dibaca,
            recipientId: null,
            senderId: null,
            relatedItemId: null,
            relatedItemType: null
          };
        } catch (error) {
          console.error(`Error transforming notification ${item.id}:`, error);
          // Gunakan waktu saat ini sebagai fallback
          return {
            id: item.id,
            title: "Notifikasi Baru",
            message: item.pesan || "Tidak ada pesan",
            type: "info",
            timestamp: new Date(),
            isRead: item.dibaca || false,
            recipientId: null,
            senderId: null,
            relatedItemId: null,
            relatedItemType: null
          };
        }
      });
      
      // Urutkan notifikasi: prioritaskan yang belum dibaca, kemudian berdasarkan timestamp terbaru
      const sortedNotifications = [...transformedData].sort((a, b) => {
        // Jika salah satu belum dibaca dan yang lain sudah dibaca
        if (!a.isRead && b.isRead) return -1;
        if (a.isRead && !b.isRead) return 1;
        
        // Jika keduanya sama-sama sudah dibaca atau belum dibaca, sortir berdasarkan timestamp
        return b.timestamp.getTime() - a.timestamp.getTime();
      });
      
      setNotifications(sortedNotifications);
      setUnreadCount(count);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  // Ambil notifikasi saat komponen dimount
  useEffect(() => {
    fetchNotifications();
  }, []);

  // Menandai semua notifikasi sebagai sudah dibaca
  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      
      // Update local state, tetapi pertahankan urutan timestamp
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, isRead: true }))
           .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      );
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  // Menandai satu notifikasi sebagai dibaca
  const handleMarkAsRead = async (id: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    try {
      await markNotificationAsRead(id);
      
      // Update local state
      const updatedNotifications = notifications.map(notification => 
        notification.id === id 
          ? { ...notification, isRead: true } 
          : notification
      );
      
      // Urutkan ulang setelah perubahan status notifikasi
      const sortedNotifications = [...updatedNotifications].sort((a, b) => {
        if (!a.isRead && b.isRead) return -1;
        if (a.isRead && !b.isRead) return 1;
        return b.timestamp.getTime() - a.timestamp.getTime();
      });
      
      setNotifications(sortedNotifications);
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Format waktu notifikasi (contoh: 5 menit yang lalu)
  const formatNotificationTime = (date: Date) => {
    try {
      // Validasi timestamp
      if (!(date instanceof Date) || isNaN(date.getTime())) {
        console.error("Invalid date value:", date);
        return "Waktu tidak valid";
      }

      return formatDistanceToNow(date, { 
        addSuffix: true,
        locale: id // Menggunakan locale Bahasa Indonesia
      });
    } catch (error) {
      console.error("Error formatting notification time:", error);
      return "Waktu tidak valid";
    }
  };

  // Dapatkan warna badge berdasarkan tipe notifikasi
  const getNotificationBadge = (type: string) => {
    switch (type) {
      case "success":
        return <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">Sukses</Badge>;
      case "error":
        return <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">Error</Badge>;
      case "warning":
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Peringatan</Badge>;
      default:
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">Info</Badge>;
    }
  };

  // Filter notifikasi berdasarkan tab aktif
  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === "all") return true;
    if (activeTab === "unread") return !notification.isRead;
    if (activeTab === "recent") {
      // Filter notifikasi 24 jam terakhir
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);
      return notification.timestamp >= oneDayAgo && !notification.isRead;
    }
    return notification.type === activeTab;
  });

  // Menghitung jumlah notifikasi 24 jam terakhir yang belum dibaca
  const getRecentUnreadCount = () => {
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    return notifications.filter(n => !n.isRead && n.timestamp >= oneDayAgo).length;
  };

  // Komponen untuk loading skeleton
  const NotificationSkeleton = () => (
    <Card className="mb-2">
      <CardHeader className="py-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-5 w-20" />
        </div>
      </CardHeader>
      <CardContent className="py-2">
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-2/3" />
      </CardContent>
    </Card>
  );

  // Komponen untuk notifikasi kosong
  const EmptyNotifications = () => (
    <Card className="border-dashed border-2">
      <CardContent className="flex flex-col items-center justify-center py-12">
        <BellRing className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-lg font-medium mb-1">Tidak ada notifikasi</p>
        <p className="text-muted-foreground text-center max-w-sm">
          {activeTab === "all" 
            ? "Anda tidak memiliki notifikasi untuk saat ini" 
            : activeTab === "recent"
            ? "Tidak ada notifikasi baru dalam 24 jam terakhir"
            : activeTab === "unread"
            ? "Tidak ada notifikasi yang belum dibaca"
            : `Tidak ada notifikasi bertipe ${activeTab}`}
        </p>
      </CardContent>
    </Card>
  );

  // Komponen item notifikasi
  const NotificationItem = ({ notification }: { notification: NotificationItem }) => (
    <Link href={`/notifications/${notification.id}`} key={notification.id}>
      <Card 
        className={`mb-2 transition-all hover:bg-muted/50 ${
          !notification.isRead 
            ? 'border-l-4 border-l-primary bg-primary/5' 
            : 'border-l-4 border-l-transparent'
        }`}
      >
        <CardHeader className="py-3 px-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/10 text-primary">
                  {notification.type === "info" ? "I" : 
                   notification.type === "success" ? "S" : 
                   notification.type === "warning" ? "W" : "E"}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  {notification.title}
                  {!notification.isRead && (
                    <span className="h-2 w-2 rounded-full bg-primary"></span>
                  )}
                </CardTitle>
                <CardDescription className="mt-1 line-clamp-2">
                  {notification.message}
                </CardDescription>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              {getNotificationBadge(notification.type)}
              <span className="text-xs text-muted-foreground flex items-center">
                <Clock className="h-3 w-3 mr-1 text-muted-foreground/70" />
                {formatNotificationTime(notification.timestamp)}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardFooter className="py-2 px-4 flex justify-between items-center flex-wrap gap-2">
          <span className="text-xs text-muted-foreground">
            {notification.relatedItemType ? `Terkait: ${notification.relatedItemType}` : ''}
          </span>
          <div className="flex gap-2">
            {!notification.isRead && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={(e) => handleMarkAsRead(notification.id, e)}
              >
                <Check className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Tandai Dibaca</span>
              </Button>
            )}
            <Button variant="ghost" size="sm" className="text-primary">
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );

  return (
    <div className="container mx-auto py-6 px-4 max-w-5xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-2">Notifikasi</h1>
          <p className="text-muted-foreground">
            Lihat dan kelola semua notifikasi dan pemberitahuan
          </p>
        </div>
        <div className="flex gap-2 self-end md:self-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setActiveTab("all")}>
                Semua
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveTab("recent")}>
                24 Jam Terakhir
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveTab("unread")}>
                Belum Dibaca
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveTab("info")}>
                Info
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveTab("success")}>
                Sukses
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveTab("warning")}>
                Peringatan
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveTab("error")}>
                Error
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button 
            variant="outline" 
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0 || notifications.length === 0}
          >
            <CheckCheck className="mr-2 h-4 w-4" />
            {isMobile ? "" : "Tandai Semua Dibaca"}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="overflow-x-auto -mx-4 px-4">
          <TabsList className="mb-4 w-full min-w-max justify-start">
            <TabsTrigger value="all" className="flex gap-2">
              Semua
              <Badge variant="secondary">{notifications.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="recent" className="flex gap-2">
              {isMobile ? "Terbaru" : "24 Jam Terakhir"}
              <Badge variant="secondary">{getRecentUnreadCount()}</Badge>
            </TabsTrigger>
            <TabsTrigger value="unread" className="flex gap-2">
              {isMobile ? "Belum" : "Belum Dibaca"}
              <Badge variant="secondary">{unreadCount}</Badge>
            </TabsTrigger>
            <TabsTrigger value="info">Info</TabsTrigger>
            <TabsTrigger value="success">Sukses</TabsTrigger>
            <TabsTrigger value="warning">{isMobile ? "Warn" : "Peringatan"}</TabsTrigger>
            <TabsTrigger value="error">Error</TabsTrigger>
          </TabsList>
        </div>

        <Separator className="mb-4" />

        <TabsContent value={activeTab}>
          {loading ? (
            <div className="grid gap-4">
              {Array(5).fill(0).map((_, index) => (
                <NotificationSkeleton key={index} />
              ))}
            </div>
          ) : filteredNotifications.length > 0 ? (
            <div className="grid gap-2">
              {filteredNotifications.map((notification) => (
                <NotificationItem key={notification.id} notification={notification} />
              ))}
            </div>
          ) : (
            <EmptyNotifications />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
} 