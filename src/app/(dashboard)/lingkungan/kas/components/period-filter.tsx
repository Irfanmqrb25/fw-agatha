"use client"

import { format } from "date-fns"
import { id } from "date-fns/locale"
import { DateRange } from "react-day-picker"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon, CalendarRange } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface PeriodFilterProps {
  dateRange: DateRange | undefined;
  onDateRangeChange: (dateRange: DateRange | undefined) => void;
}

export function PeriodFilter({ 
  dateRange, 
  onDateRangeChange 
}: PeriodFilterProps) {
  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center space-x-2">
        <CalendarRange className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Rentang Tanggal</span>
      </div>
      <div className="relative">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant={"outline"}
              className={cn(
                "w-full md:w-[300px] justify-start text-left font-normal",
                !dateRange && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange?.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "dd MMM yyyy", { locale: id })} -{" "}
                    {format(dateRange.to, "dd MMM yyyy", { locale: id })}
                  </>
                ) : (
                  format(dateRange.from, "dd MMMM yyyy", { locale: id })
                )
              ) : (
                <span>Pilih rentang tanggal</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange?.from}
              selected={dateRange}
              onSelect={onDateRangeChange}
              numberOfMonths={2}
              locale={id}
              className="rounded-md border"
            />
            <div className="flex items-center justify-between p-3 border-t">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDateRangeChange(undefined)}
              >
                Reset
              </Button>
              <Button
                size="sm"
                onClick={() => document.body.click()} // Close popover
              >
                Terapkan
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
} 