"use client"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DropdownBulanTahun } from "@/app/(dashboard)/approval/components/dropdown-bulan-tahun"

interface ApprovalFilterProps {
  selectedMonth: string
  onMonthChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onStatusFilterChange: (value: string) => void
  statusFilter: string
}

export function ApprovalFilter({
  selectedMonth,
  onMonthChange,
  onStatusFilterChange,
  statusFilter,
}: ApprovalFilterProps) {
  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Pilih Periode</label>
          <DropdownBulanTahun
            value={selectedMonth}
            onChange={val => onMonthChange({ target: { value: val } } as React.ChangeEvent<HTMLInputElement>)}
            className="w-full"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Status</label>
          <Select onValueChange={onStatusFilterChange} value={statusFilter} defaultValue="all">
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Filter Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="pending">Menunggu Persetujuan</SelectItem>
              <SelectItem value="approved">Disetujui</SelectItem>
              <SelectItem value="rejected">Ditolak</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
} 