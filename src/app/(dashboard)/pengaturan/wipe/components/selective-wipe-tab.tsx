"use client"

import { useState } from "react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { DataType } from "../types"
import { DATA_TYPE_OPTIONS } from "../utils"

interface SelectiveWipeTabProps {
  startDate: Date | undefined
  setStartDate: (date: Date | undefined) => void
  endDate: Date | undefined
  setEndDate: (date: Date | undefined) => void
  dataType: string
  setDataType: (type: string) => void
  confirmText: string
  setConfirmText: (text: string) => void
  backupConfirm: boolean
  setBackupConfirm: (confirm: boolean) => void
}

export default function SelectiveWipeTab({
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  dataType,
  setDataType,
  confirmText,
  setConfirmText,
  backupConfirm,
  setBackupConfirm
}: SelectiveWipeTabProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="start-date">Tanggal Mulai</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !startDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, "dd/MM/yyyy") : "Pilih tanggal"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={setStartDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="end-date">Tanggal Akhir</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !endDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, "dd/MM/yyyy") : "Pilih tanggal"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={setEndDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="data-type">Jenis Data</Label>
        <Select value={dataType} onValueChange={setDataType}>
          <SelectTrigger id="data-type">
            <SelectValue placeholder="Pilih jenis data" />
          </SelectTrigger>
          <SelectContent>
            {DATA_TYPE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex items-center space-x-2 mt-4">
        <Checkbox 
          id="backup-confirm"
          checked={backupConfirm}
          onCheckedChange={(checked) => setBackupConfirm(checked === true)}
        />
        <Label htmlFor="backup-confirm" className="text-xs sm:text-sm font-medium">
          Saya telah melakukan backup data sebelum penghapusan
        </Label>
      </div>
      
      <div className="space-y-2 mt-4">
        <Label htmlFor="confirm">Ketik "KONFIRMASI" untuk melanjutkan</Label>
        <Input 
          id="confirm" 
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          onPaste={(e) => e.preventDefault()}
          autoComplete="off"
          className="max-w-xs"
        />
      </div>
    </div>
  )
} 