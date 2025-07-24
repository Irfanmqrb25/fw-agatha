"use client"

import * as React from "react"
import { Check, CircleSlash, CalendarClock } from "lucide-react"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuGroup, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Table } from "@tanstack/react-table"

interface StatusFilterProps {
  table: Table<any>
  statusFilter: string | null
  setStatusFilter: (status: string | null) => void
}

export function StatusFilter({ 
  table, 
  statusFilter, 
  setStatusFilter 
}: StatusFilterProps) {
  const statusOptions = [
    { value: null, label: "Semua Status" },
    { value: "aktif", label: "Aktif", description: "Belum melewati deadline" },
    { value: "kedaluwarsa", label: "Kedaluwarsa", description: "Sudah melewati deadline" },
  ]

  // Dapatkan label untuk status yang dipilih
  const getStatusLabel = (statusValue: string | null) => {
    const status = statusOptions.find(s => s.value === statusValue)
    return status ? status.label : 'Semua Status'
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="flex items-center gap-1 h-8 data-[state=open]:bg-accent"
        >
          <CalendarClock className="h-3.5 w-3.5" />
          <span>{getStatusLabel(statusFilter)}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Filter Berdasarkan Status</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem 
            onClick={() => {
              setStatusFilter(null)
              table.getColumn('status')?.setFilterValue('')
            }}
          >
            <div className="flex items-center gap-2">
              <CircleSlash className="h-4 w-4" />
              <span>Semua Status</span>
              {statusFilter === null && <Check className="h-4 w-4 ml-auto" />}
            </div>
          </DropdownMenuItem>

          {statusOptions.filter(option => option.value !== null).map((status) => (
            <DropdownMenuItem
              key={status.value}
              onClick={() => {
                setStatusFilter(status.value)
                table.getColumn('status')?.setFilterValue(status.value)
              }}
            >
              <div className="flex items-center gap-2">
                <div className={status.value === 'aktif' ? 'text-green-500' : 'text-red-500'}>
                  <span className="text-lg">●</span>
                </div>
                <div className="flex flex-col">
                  <span>{status.label}</span>
                  <span className="text-xs text-muted-foreground">{status.description}</span>
                </div>
                {statusFilter === status.value && <Check className="h-4 w-4 ml-auto" />}
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 