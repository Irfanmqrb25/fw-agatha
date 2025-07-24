import * as React from "react"
import { format } from "date-fns"
import { id as localeID } from "date-fns/locale"
import { DateRange } from "react-day-picker"
import { CalendarIcon, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

interface PeriodFilterProps {
  dateRange: DateRange | undefined
  setDateRange: (dateRange: DateRange | undefined) => void
}

export function PeriodFilter({ dateRange, setDateRange }: PeriodFilterProps) {
  return (
    <div className="flex flex-col space-y-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-[200px] justify-start text-left font-normal",
              !dateRange && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange?.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, "dd MMM", { locale: localeID })} - {format(dateRange.to, "dd MMM", { locale: localeID })}
                </>
              ) : (
                format(dateRange.from, "dd MMM yyyy", { locale: localeID })
              )
            ) : (
              <span>Pilih Tanggal</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={dateRange?.from}
            selected={dateRange}
            onSelect={setDateRange}
            numberOfMonths={2}
            locale={localeID}
          />
          <div className="flex items-center justify-between px-3 pb-2">
            <Button
              variant="ghost"
              onClick={() => setDateRange(undefined)}
              disabled={!dateRange}
              className="text-xs"
            >
              Reset
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      {/* Display active date filter */}
      {dateRange?.from && (
        <Badge variant="outline" className="gap-1 px-2 py-1 w-fit">
          <span>
            Tanggal: {format(dateRange.from, "dd MMM", { locale: localeID })}
            {dateRange.to && dateRange.to !== dateRange.from && 
              ` - ${format(dateRange.to, "dd MMM", { locale: localeID })}`}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="ml-1 h-4 w-4 p-0"
            onClick={() => setDateRange(undefined)}
          >
            <X className="h-3 w-3" />
            <span className="sr-only">Clear date range</span>
          </Button>
        </Badge>
      )}
    </div>
  )
} 