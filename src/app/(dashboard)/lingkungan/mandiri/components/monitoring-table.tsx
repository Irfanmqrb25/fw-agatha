"use client"

import React, { useState } from "react"
import { format } from "date-fns"
import { DanaMandiriArrears } from "../types"
import { formatCurrency } from "../utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { 
  BellIcon, 
  SearchIcon, 
  X,
  ChevronLeftIcon, 
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  FilterIcon
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface MonitoringTableProps {
  arrears: DanaMandiriArrears[]
  selectedIds: string[]
  onSelect: (id: string, isChecked: boolean) => void
  onSelectAll: (ids: string[]) => void
  isLoading?: boolean
}

export function MonitoringTable({
  arrears,
  selectedIds,
  onSelect,
  onSelectAll,
  isLoading = false
}: MonitoringTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [yearFilter, setYearFilter] = useState<number | null>(null)
  
  // Filter arrears by search term and year
  const filteredArrears = arrears.filter(arrear => {
    const familyHeadName = arrear.namaKepalaKeluarga.toLowerCase()
    
    const matchesSearch = 
      searchTerm === "" || 
      familyHeadName.includes(searchTerm.toLowerCase())
    
    const matchesYear = 
      yearFilter === null ||
      arrear.tahunTertunggak.includes(yearFilter)
    
    return matchesSearch && matchesYear
  })
  
  // Calculate pagination values
  const totalItems = filteredArrears.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = Math.min(startIndex + pageSize, totalItems)
  
  // Get current page data
  const currentArrears = filteredArrears
    .sort((a, b) => b.totalTunggakan - a.totalTunggakan) // Sort by highest amount first
    .slice(startIndex, endIndex)
  
  // Check if all visible arrears are selected
  const allSelected = 
    currentArrears.length > 0 && 
    currentArrears.every(arrear => selectedIds.includes(arrear.keluargaId))
  
  // Handle select all for current page only
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const ids = currentArrears.map(arrear => arrear.keluargaId)
      onSelectAll(ids);
    } else {
      onSelectAll([]);
    }
  }
  
  // Format period text
  const formatPeriods = (periods: number[]): React.ReactNode => {
    // Sort periods in ascending order
    const sortedPeriods = [...periods].sort((a, b) => a - b);
    
    // If there are too many periods, show them as badges with a tooltip for all
    if (periods.length > 2) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex flex-wrap gap-1">
                {sortedPeriods.slice(0, 2).map(year => (
                  <Badge key={year} variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                    {year}
                  </Badge>
                ))}
                {periods.length > 2 && (
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                    +{periods.length - 2}
                  </Badge>
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="font-medium">Periode Tunggakan:</p>
              <p>{sortedPeriods.join(", ")}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }
    
    // For 1-2 periods, just show them directly
    return (
      <div className="flex flex-wrap gap-1">
        {sortedPeriods.map(year => (
          <Badge key={year} variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
            {year}
          </Badge>
        ))}
      </div>
    );
  };
  
  // Pagination functions
  const goToPage = (page: number) => {
    setCurrentPage(page)
  }
  
  const goToFirstPage = () => setCurrentPage(1)
  const goToLastPage = () => setCurrentPage(totalPages)
  const goToPreviousPage = () => setCurrentPage(prev => Math.max(1, prev - 1))
  const goToNextPage = () => setCurrentPage(prev => Math.min(totalPages, prev + 1))
  
  // Handle page size change
  const handlePageSizeChange = (value: string) => {
    setPageSize(Number(value))
    setCurrentPage(1) // Reset to first page when changing page size
  }
  
  // Generate years for the year filter dropdown (last 5 years to current year)
  const currentYear = new Date().getFullYear()
  const yearOptions = Array.from({ length: 6 }, (_, i) => currentYear - 5 + i)

  if (isLoading) {
    return (
      <div className="relative w-full overflow-auto">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-sm text-muted-foreground">Memuat data...</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row justify-between">
        <div className="flex gap-2 items-center">
          <div className="relative">
            <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Cari kepala keluarga..."
              className="pl-8 w-[200px] sm:w-[300px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-2 top-2.5"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
          </div>
          
          <Select
            value={yearFilter === null ? "all" : yearFilter.toString()}
            onValueChange={(value) => setYearFilter(value === "all" ? null : parseInt(value))}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Tahun" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Tahun</SelectItem>
              {yearOptions.map(year => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px]">
                <Checkbox 
                  checked={allSelected} 
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>Nama Kepala Keluarga</TableHead>
              <TableHead>Alamat</TableHead>
              <TableHead>Telepon</TableHead>
              <TableHead>Tahun Tertunggak</TableHead>
              <TableHead>Total Tunggakan</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentArrears.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                  Tidak ada data tunggakan
                </TableCell>
              </TableRow>
            ) : (
              currentArrears.map((arrear) => (
                <TableRow key={arrear.keluargaId}>
                  <TableCell>
                    <Checkbox 
                      checked={selectedIds.includes(arrear.keluargaId)} 
                      onCheckedChange={(checked) => onSelect(arrear.keluargaId, !!checked)} 
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    {arrear.namaKepalaKeluarga}
                  </TableCell>
                  <TableCell>
                    {arrear.alamat || "-"}
                  </TableCell>
                  <TableCell>
                    {arrear.nomorTelepon || "-"}
                  </TableCell>
                  <TableCell>
                    {formatPeriods(arrear.tahunTertunggak)}
                  </TableCell>
                  <TableCell>
                    {formatCurrency(arrear.totalTunggakan)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Pagination controls */}
      {totalItems > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-sm text-muted-foreground">
            Menampilkan {startIndex + 1}-{endIndex} dari {totalItems} tunggakan
          </div>
          <div className="flex items-center gap-2">
            <Select
              value={pageSize.toString()}
              onValueChange={handlePageSizeChange}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={pageSize.toString()} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={goToFirstPage}
                disabled={currentPage === 1}
              >
                <ChevronsLeftIcon className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
              >
                <ChevronLeftIcon className="h-4 w-4" />
              </Button>
              <span className="text-sm mx-2">
                {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
              >
                <ChevronRightIcon className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={goToLastPage}
                disabled={currentPage === totalPages}
              >
                <ChevronsRightIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 