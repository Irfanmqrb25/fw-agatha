"use client"

import * as React from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { CalendarIcon, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { formatMonthYear } from "../utils"

export function PeriodFilter() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i)
  const months = [
    { value: "1", label: "Januari" },
    { value: "2", label: "Februari" },
    { value: "3", label: "Maret" },
    { value: "4", label: "April" },
    { value: "5", label: "Mei" },
    { value: "6", label: "Juni" },
    { value: "7", label: "Juli" },
    { value: "8", label: "Agustus" },
    { value: "9", label: "September" },
    { value: "10", label: "Oktober" },
    { value: "11", label: "November" },
    { value: "12", label: "Desember" }
  ]

  // Mendapatkan bulan dan tahun dari search params
  const month = searchParams.get("month") 
  const year = searchParams.get("year") || currentYear.toString()
  
  // Cek apakah filter sedang aktif
  const isFilterActive = !!month || year !== currentYear.toString()

  // Fungsi untuk update search params
  const createQueryString = (params: Record<string, string | null>) => {
    const newSearchParams = new URLSearchParams(searchParams.toString())
    
    Object.entries(params).forEach(([key, value]) => {
      if (value === null) {
        newSearchParams.delete(key)
      } else {
        newSearchParams.set(key, value)
      }
    })
    
    return newSearchParams.toString()
  }
  
  // Handler untuk reset filter (show all data)
  const handleShowAllData = () => {
    router.push(pathname)
  }

  // Handler untuk perubahan bulan
  const handleMonthChange = (value: string) => {
    router.push(
      pathname + "?" + createQueryString({ month: value, year })
    )
  }

  // Handler untuk perubahan tahun
  const handleYearChange = (value: string) => {
    router.push(
      pathname + "?" + createQueryString({ year: value, month: month || null })
    )
  }

  return (
    <div className="space-y-4 w-full md:w-auto bg-gray-50 p-4 rounded-lg border">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-medium text-sm">Filter Periode</h3>
        </div>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className={`text-xs ${!isFilterActive ? 'opacity-50' : ''}`}
          onClick={handleShowAllData}
          disabled={!isFilterActive}
          title="Tampilkan semua data tanpa filter"
        >
          <RefreshCw className="h-3.5 w-3.5 mr-1" />
          Reset Filter
        </Button>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="month-select">Bulan</Label>
          <Select 
            value={month || ""} 
            onValueChange={handleMonthChange}
          >
            <SelectTrigger id="month-select" className="w-full sm:w-[140px]">
              <SelectValue placeholder="Pilih Bulan" />
            </SelectTrigger>
            <SelectContent>
              {months.map((month) => (
                <SelectItem key={month.value} value={month.value}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-1.5">
          <Label htmlFor="year-select">Tahun</Label>
          <Select 
            value={year} 
            onValueChange={handleYearChange}
          >
            <SelectTrigger id="year-select" className="w-full sm:w-[120px]">
              <SelectValue placeholder="Pilih Tahun" />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="text-xs text-muted-foreground mt-2">
        {!month ? (
          <p>Menampilkan semua data tahun {year}</p>
        ) : (
          <p>
            Menampilkan data untuk {formatMonthYear(parseInt(month), parseInt(year))}
          </p>
        )}
      </div>
    </div>
  )
} 