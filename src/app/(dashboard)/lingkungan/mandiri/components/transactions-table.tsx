"use client"

import { useState, useEffect } from "react"
import { format, isWithinInterval } from "date-fns"
import { DateRange } from "react-day-picker"
import { DanaMandiriTransaction } from "../types"
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  PencilIcon, 
  Trash2Icon, 
  MoreVertical,
  SearchIcon,
  EyeIcon,
  X,
  ChevronLeftIcon, 
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  CalendarIcon,
  FilterIcon
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { ColumnDef } from "@tanstack/react-table"

// Simple DataTableColumnHeader component implementation
interface DataTableColumnHeaderProps<TData, TValue> {
  column: any;
  title: string;
}

function DataTableColumnHeader<TData, TValue>({
  column,
  title,
}: DataTableColumnHeaderProps<TData, TValue>) {
  return (
    <div className="flex items-center space-x-2">
      <span>{title}</span>
    </div>
  )
}

interface TransactionsTableProps {
  transactions: DanaMandiriTransaction[]
  keluargaList: {id: string, namaKepalaKeluarga: string, alamat: string | null, nomorTelepon: string | null}[]
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  selectedIds: string[]
  onSelect: (id: string, isChecked: boolean) => void
  onSelectAll: (ids: string[]) => void
  isLoading?: boolean
  canModifyData?: boolean
  onViewDetail?: (transaction: DanaMandiriTransaction) => void
}

export function TransactionsTable({
  transactions,
  keluargaList,
  onEdit,
  onDelete,
  selectedIds,
  onSelect,
  onSelectAll,
  isLoading = false,
  canModifyData = false,
  onViewDetail
}: TransactionsTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [yearFilter, setYearFilter] = useState<number | null>(null)
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  
  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, statusFilter, yearFilter, dateRange])
  
  // Generate years for the year filter dropdown (last 10 years to next 5 years)
  const currentYear = new Date().getFullYear()
  const yearOptions = Array.from({ length: 16 }, (_, i) => currentYear - 10 + i)
  
  // Filter transactions by search term, status, year, and date range
  const filteredTransactions = transactions.filter(tx => {
    const familyHeadName = tx.keluarga?.namaKepalaKeluarga?.toLowerCase() || ""
    const matchesSearch = 
      searchTerm === "" || 
      familyHeadName.includes(searchTerm.toLowerCase()) ||
      tx.tahun.toString().includes(searchTerm)
    
    const matchesStatus = 
      statusFilter === null || 
      (statusFilter === "submitted" && tx.statusSetor) ||
      (statusFilter === "paid" && !tx.statusSetor) ||
      (statusFilter === "pending" && !tx.statusSetor)
      
    const matchesYear = 
      yearFilter === null ||
      tx.tahun === yearFilter
      
    const matchesDateRange = !dateRange?.from || !dateRange?.to || 
      isWithinInterval(tx.tanggal, {
        start: dateRange.from,
        end: dateRange.to || dateRange.from
      })
      
    return matchesSearch && matchesStatus && matchesYear && matchesDateRange
  })
  
  // Calculate pagination values
  const totalItems = filteredTransactions.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = Math.min(startIndex + pageSize, totalItems)
  
  // Get current page data
  const currentTransactions = filteredTransactions
    .sort((a, b) => b.tanggal.getTime() - a.tanggal.getTime()) // Sort newest first
    .slice(startIndex, endIndex)
  
  // Check if all visible transactions are selected
  const allSelected = 
    currentTransactions.length > 0 && 
    currentTransactions.every(tx => 
      selectedIds.includes(tx.id) || tx.statusSetor
    )
  
  // Handle select all for current page only
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      // Filter transaksi yang belum disetor ke Paroki
      const selectableIds = currentTransactions
        .filter(tx => !tx.statusSetor)
        .map(tx => tx.id);
      
      // Update selection dengan ID yang bisa dipilih
      onSelectAll(selectableIds);
    } else {
      // Kosongkan semua pilihan saat uncheck
      onSelectAll([]);
    }
  }
  
  // Clear all filters
  const clearAllFilters = () => {
    setSearchTerm("")
    setStatusFilter(null)
    setYearFilter(null)
    setDateRange(undefined)
  }
  
  // Get status badge color and text
  const getStatusBadge = (transaction: DanaMandiriTransaction) => {
    if (transaction.statusSetor) {
      return <Badge className="bg-blue-100 text-blue-700 border-blue-300">Disetor</Badge>
    } else {
      return <Badge className="bg-green-100 text-green-700 border-green-300">Belum Disetor</Badge>
    }
  }
  
  // Get payment status badge
  const getPaymentStatusBadge = (statusPembayaran?: string) => {
    switch (statusPembayaran) {
      case "lunas":
        return <Badge className="bg-green-100 text-green-700 border-green-300">Lunas</Badge>
      case "sebagian_bulan":
        return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-300">Sebagian Bulan</Badge>
      case "belum_ada_pembayaran":
        return <Badge className="bg-red-100 text-red-700 border-red-300">Belum Bayar</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-700 border-gray-300">-</Badge>
    }
  }
  
  // Format payment period
  const formatPaymentPeriod = (periodeBayar?: number) => {
    if (!periodeBayar) return "-"
    
    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
      "Jul", "Agu", "Sep", "Okt", "Nov", "Des"
    ]
    
    return monthNames[periodeBayar - 1] || "-"
  }
  
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
  
  // Status filter options
  const statusOptions = [
    { value: null, label: "Semua Status" },
    { value: "paid", label: "Belum Disetor" },
    { value: "submitted", label: "Disetor" }
  ]
  
  // Format date for display
  const formatDateDisplay = (date: Date | null): string => {
    return date ? format(date, "dd MMM yyyy") : ""
  }

  // Fungsi untuk mendapatkan nama kepala keluarga berdasarkan ID
  const getKeluargaName = (id: string): string => {
    const keluarga = keluargaList.find(k => k.id === id)
    return keluarga?.namaKepalaKeluarga || "Unknown"
  }

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
      {/* Search and filter controls */}
      <div className="flex flex-col gap-4 sm:flex-row justify-between">
        <div className="flex gap-2 items-center">
          <div className="relative">
            <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Cari transaksi..."
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
          
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-9 min-w-[7rem] justify-start"
              >
                <FilterIcon className="mr-2 h-4 w-4" />
                Filter
                {(statusFilter !== null || yearFilter !== null || dateRange) && (
                  <Badge className="ml-2 rounded-sm px-1" variant="secondary">
                    {(statusFilter ? 1 : 0) + (yearFilter ? 1 : 0) + (dateRange ? 1 : 0)}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[240px] p-4" align="start">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="font-medium">Status</div>
                  <Select
                    value={statusFilter === null ? "all" : statusFilter}
                    onValueChange={(value) => setStatusFilter(value === "all" ? null : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Status</SelectItem>
                      <SelectItem value="paid">Belum Disetor</SelectItem>
                      <SelectItem value="submitted">Disetor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <div className="font-medium">Tahun</div>
                  <Select
                    value={yearFilter === null ? "all" : yearFilter.toString()}
                    onValueChange={(value) => setYearFilter(value === "all" ? null : parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Tahun" />
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
                
                <div className="space-y-2">
                  <div className="font-medium">Rentang Tanggal</div>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="justify-start w-full text-left"
                        size="sm"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange?.from ? (
                          dateRange.to ? (
                            <>
                              {format(dateRange.from, "dd LLL")} -{" "}
                              {format(dateRange.to, "dd LLL, yyyy")}
                            </>
                          ) : (
                            format(dateRange.from, "dd LLL, yyyy")
                          )
                        ) : (
                          "Pilih tanggal"
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
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full"
                  onClick={clearAllFilters}
                >
                  Reset Filter
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      
      {/* Data table */}
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
              <TableHead>Tahun</TableHead>
              <TableHead>Jumlah Dibayar</TableHead>
              <TableHead>Status Pembayaran</TableHead>
              <TableHead>Periode Bayar</TableHead>
              <TableHead>Total Iuran</TableHead>
              <TableHead>Status Setor</TableHead>
              <TableHead>Tanggal Setor</TableHead>
              <TableHead className="w-[100px] text-right sticky right-0 bg-white z-10 shadow-[-4px_0_10px_rgba(0,0,0,0.1)]">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-10 text-muted-foreground">
                  Tidak ada data transaksi
                </TableCell>
              </TableRow>
            ) : (
              currentTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    <Checkbox 
                      checked={selectedIds.includes(transaction.id)} 
                      onCheckedChange={(checked) => onSelect(transaction.id, !!checked)}
                      disabled={transaction.statusSetor}
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    {transaction.keluarga?.namaKepalaKeluarga || getKeluargaName(transaction.keluargaId)}
                  </TableCell>
                  <TableCell>{transaction.tahun}</TableCell>
                  <TableCell>
                    {formatCurrency(transaction.jumlahDibayar)}
                  </TableCell>
                  <TableCell>
                    {getPaymentStatusBadge(transaction.statusPembayaran)}
                  </TableCell>
                  <TableCell>
                    {formatPaymentPeriod(transaction.periodeBayar)}
                  </TableCell>
                  <TableCell>
                    {transaction.totalIuran ? formatCurrency(transaction.totalIuran) : "-"}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(transaction)}
                  </TableCell>
                  <TableCell>
                    {transaction.tanggalSetor ? format(new Date(transaction.tanggalSetor), "dd MMM yyyy") : "-"}
                  </TableCell>
                  <TableCell className="text-right sticky right-0 bg-white z-10 shadow-[-4px_0_10px_rgba(0,0,0,0.1)]">
                    <div className="flex justify-end items-center space-x-1">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Buka menu</span>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {canModifyData && (
                            <>
                              <DropdownMenuItem
                                onClick={() => onEdit(transaction.id)}
                              >
                                <PencilIcon className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem
                                    onSelect={(e) => e.preventDefault()}
                                    className="text-destructive"
                                  >
                                    <Trash2Icon className="mr-2 h-4 w-4" />
                                    Hapus
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Konfirmasi Penghapusan
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Apakah Anda yakin ingin menghapus transaksi ini? Tindakan ini tidak dapat dibatalkan.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Batal</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => onDelete(transaction.id)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Hapus
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </>
                          )}
                          
                          <DropdownMenuItem
                            onClick={() => {
                              if (onViewDetail) {
                                onViewDetail(transaction);
                              }
                            }}
                          >
                            <EyeIcon className="mr-2 h-4 w-4" />
                            Lihat Detail
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
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
            Menampilkan {startIndex + 1}-{endIndex} dari {totalItems} transaksi
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