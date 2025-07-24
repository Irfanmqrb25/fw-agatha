"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Bell } from "lucide-react";
import { NotificationList } from './notification-list';
import { getUnreadNotificationsCount } from '@/lib/notifications';
import Link from 'next/link';

export function NotificationIndicator() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  // Ambil jumlah notifikasi yang belum dibaca
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const count = await getUnreadNotificationsCount();
        setUnreadCount(count);
      } catch (error) {
        console.error("Error fetching unread notifications count:", error);
      }
    };

    // Fetch pada awal load
    fetchUnreadCount();

    // Set interval untuk polling
    const interval = setInterval(fetchUnreadCount, 60000); // Polling setiap 1 menit
    
    return () => clearInterval(interval);
  }, []);

  // Refresh jumlah notifikasi yang belum dibaca saat popover ditutup
  // karena user mungkin telah membaca notifikasi
  const handleOpenChange = async (open: boolean) => {
    setIsOpen(open);
    
    if (!open) {
      // Refresh unread count when popover is closed
      try {
        const count = await getUnreadNotificationsCount();
        setUnreadCount(count);
      } catch (error) {
        console.error("Error fetching unread notifications count:", error);
      }
    }
  };

  return (
    <div className="flex items-center">
      <Popover open={isOpen} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="icon" className="relative" aria-label="Notifikasi baru dalam 24 jam terakhir">
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-destructive text-destructive-foreground text-xs font-medium rounded-full flex items-center justify-center px-1 text-white">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="p-0 w-auto">
          <NotificationList />
        </PopoverContent>
      </Popover>
    </div>
  );
} 