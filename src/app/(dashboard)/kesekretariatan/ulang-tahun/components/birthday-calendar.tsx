"use client";

import { useEffect, useState } from "react";

import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { Drawer, DrawerTrigger, DrawerContent } from "@/components/ui/drawer";

import {
  format,
  getDaysInMonth,
  startOfMonth,
  getDay,
  isToday,
} from "date-fns";
import { cn } from "@/lib/utils";
import { id } from "date-fns/locale";
import { Birthday } from "../types";
import { useIsMobile } from "@/hooks/use-mobile";

export function BirthdayCalendar({
  data,
  month,
}: {
  data: Birthday[];
  month: number;
}) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    const newDate = new Date(new Date().getFullYear(), month - 1, 1);
    setCurrentDate(newDate);
  }, [month]);

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const birthdaysByDate = data.reduce((acc, item) => {
    const birthDate = new Date(item.tanggalLahir);
    const adjustedDate = new Date(
      currentYear,
      currentMonth,
      birthDate.getDate()
    );
    const dateKey = format(adjustedDate, "yyyy-MM-dd");
    acc[dateKey] = acc[dateKey] ? [...acc[dateKey], item] : [item];
    return acc;
  }, {} as Record<string, Birthday[]>);

  const daysInMonth = getDaysInMonth(new Date(currentYear, currentMonth));
  const startDayOfWeek = getDay(startOfMonth(currentDate));

  const handleDateClick = (date: Date) => {
    const dateKey = format(date, "yyyy-MM-dd");
    if (birthdaysByDate[dateKey]) {
      setSelectedDate(date);
      setOpen(true);
    }
  };

  const renderCalendar = () => {
    const blankDays = Array.from({ length: startDayOfWeek });
    const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    return (
      <div className="rounded-xl border border-pink-300 bg-white/70 backdrop-blur-sm p-4 shadow-sm">
        <div className="text-center text-xl font-bold text-pink-700 mb-4">
          {format(currentDate, "MMMM yyyy", { locale: id })}
        </div>

        <div className="grid grid-cols-7 text-center text-xs font-medium text-muted-foreground mb-2">
          {["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"].map(
            (day) => (
              <div key={day} className="py-1">
                {day}
              </div>
            )
          )}
        </div>

        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {blankDays.map((_, idx) => (
            <div key={idx} className="aspect-square" />
          ))}
          {daysArray.map((day) => {
            const date = new Date(currentYear, currentMonth, day);
            const dateKey = format(date, "yyyy-MM-dd");
            const hasBirthday = !!birthdaysByDate[dateKey];

            return (
              <div
                key={day}
                className={cn(
                  "aspect-square rounded-md border border-pink-200 flex flex-col justify-between text-sm cursor-pointer transition-all overflow-hidden px-1 pt-1 pb-2",
                  isToday(date) && "border-pink-500 ring-2 ring-pink-400",
                  hasBirthday
                    ? "bg-pink-50 hover:bg-pink-100"
                    : "hover:bg-muted/50"
                )}
                onClick={() => handleDateClick(date)}
              >
                <div className="font-semibold text-sm sm:text-base text-center">
                  {day}
                </div>
                {hasBirthday && (
                  <div className="text-[10px] sm:text-xs text-pink-600 flex flex-col items-center gap-0.5">
                    <span>🎉</span>
                    <span>{birthdaysByDate[dateKey].length} orang</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const BirthdayList = () => {
    if (!selectedDate) return null;
    const key = format(selectedDate, "yyyy-MM-dd");
    const list = birthdaysByDate[key] || [];

    return (
      <div className="p-4">
        <h2 className="text-lg font-bold text-pink-600 mb-4">
          🎂 {format(selectedDate, "dd MMMM yyyy")}
        </h2>
        <div className="space-y-4">
          {list.map((item, i) => (
            <div
              key={i}
              className="rounded-lg border border-pink-300 p-4 shadow-md bg-white dark:bg-muted"
            >
              <div className="flex items-center justify-between">
                <div className="font-semibold text-pink-700 text-base">
                  {item.nama}
                </div>
                <span className="text-xs bg-pink-100 text-pink-600 rounded-full px-2 py-0.5">
                  {item.usia}
                </span>
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                👨‍👩‍👧 Kepala Keluarga:{" "}
                <span className="font-medium">{item.kepalaKeluarga}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                🎉 Tanggal Lahir: {format(item.tanggalLahir, "dd MMMM yyyy")}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div>
      {renderCalendar()}
      {isMobile ? (
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerTrigger asChild />
          <DrawerContent className="max-h-[95vh] overflow-y-auto pt-6 rounded-t-xl">
            <BirthdayList />
          </DrawerContent>
        </Drawer>
      ) : (
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild />
          <SheetContent side="right" className="w-[360px] sm:w-[400px]">
            <BirthdayList />
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}
