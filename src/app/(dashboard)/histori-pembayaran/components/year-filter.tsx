"use client"

import { useState, useEffect } from "react"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { CalendarIcon } from "lucide-react"

interface YearFilterProps {
  availableYears: number[]
  selectedYear?: number
  onChange: (year?: number) => void
}

export function YearFilter({ 
  availableYears, 
  selectedYear, 
  onChange 
}: YearFilterProps) {
  // Jika tidak ada tahun yang tersedia
  if (availableYears.length === 0) {
    return (
      <div className="flex items-center">
        <Select disabled>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Tidak ada data" />
          </SelectTrigger>
        </Select>
      </div>
    )
  }
  
  // Nilai yang ditampilkan pada dropdown
  const displayValue = selectedYear ? selectedYear.toString() : "all"
  
  return (
    <div className="flex items-center">
      <Select value={displayValue} onValueChange={(value) => {
        if (value === "all") {
          onChange(undefined)
        } else {
          onChange(parseInt(value, 10))
        }
      }}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Pilih tahun">
            {selectedYear ? selectedYear : "Semua Tahun"}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Semua Tahun</SelectItem>
          {availableYears.map((year) => (
            <SelectItem key={year} value={year.toString()}>
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
} 