"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { format } from "date-fns"
import { id as localeID } from "date-fns/locale"
import { 
  ColumnDef, 
  ColumnFiltersState,
  flexRender, 
  getCoreRowModel, 
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable 
} from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  Download, 
  EyeIcon, 
  FileText,
  InfoIcon,
  MoreHorizontal, 
  Pencil, 
  Users,
  CalendarIcon,
  Archive,
  LockIcon
} from "lucide-react"
import { PublikasiWithRelations } from "../types/publikasi"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { KATEGORI_PUBLIKASI, TARGET_PENERIMA, roleToLabel, isPublikasiExpired } from "../utils/constants"
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Checkbox } from "@/components/ui/checkbox"
import { KlasifikasiPublikasi, Role } from "@prisma/client"
import { PublikasiActions } from "./publikasi-actions"

// Definisi kolom tabel dengan urutan yang sudah ditukar
export const columns = (onRefresh?: () => void): ColumnDef<PublikasiWithRelations>[] => [
  {
    accessorKey: "judul",
    header: () => <div className="text-left">Judul Publikasi</div>,
    cell: ({ row }) => {
      const klasifikasi = row.original.klasifikasi;
      const getKategoriIcon = () => {
        switch (klasifikasi) {
          case "PENTING":
            return <span className="text-red-500">●</span>
          case "SEGERA":
            return <span className="text-orange-500">●</span>
          case "RAHASIA":
            return <span className="text-purple-500">●</span>
          case "UMUM":
            return <span className="text-blue-500">●</span>
          default:
            return null
        }
      }
      
      return (
        <div className="max-w-[250px] break-words">
          <div className="font-medium line-clamp-2 flex items-center gap-1">
            {getKategoriIcon()} {row.getValue("judul")}
            {row.original.locked && (
              <span className="ml-2 text-gray-500">
                <LockIcon className="h-3.5 w-3.5" />
              </span>
            )}
          </div>
        </div>
      )
    }
  },
  {
    accessorKey: "createdAt",
    header: () => <div className="text-left">Tanggal</div>,
    cell: ({ row }) => (
      <div className="text-left font-medium">
        {format(new Date(row.getValue("createdAt")), "dd MMMM yyyy", { locale: localeID })}
      </div>
    )
  },
  {
    accessorKey: "targetPenerima",
    header: () => <div className="text-left">Target Penerima</div>,
    cell: ({ row }) => {
      const targets = row.original.targetPenerima;
      return (
        <div className="flex items-center">
          <Users className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
          <span>{targets.length > 1 ? `${targets.length} Grup` : roleToLabel(targets[0])}</span>
        </div>
      )
    }
  },
  {
    accessorKey: "klasifikasi",
    header: () => <div className="text-left">Kategori</div>,
    cell: ({ row }) => {
      const kategori = row.getValue("klasifikasi") as KlasifikasiPublikasi;
      let badgeClass;
      
      switch (kategori) {
        case "PENTING":
          badgeClass = "bg-red-50 text-red-700 border-red-200";
          break;
        case "SEGERA":
          badgeClass = "bg-orange-50 text-orange-700 border-orange-200";
          break;
        case "RAHASIA":
          badgeClass = "bg-purple-50 text-purple-700 border-purple-200";
          break;
        case "UMUM":
          badgeClass = "bg-blue-50 text-blue-700 border-blue-200";
          break;
        default:
          badgeClass = "bg-gray-50 text-gray-700 border-gray-200";
      }

      const kategoriLabel = KATEGORI_PUBLIKASI.find(k => k.value === kategori)?.label || kategori;
      
      return (
        <Badge className={`${badgeClass} font-medium`} variant="outline">
          {kategoriLabel}
        </Badge>
      )
    }
  },
  {
    accessorKey: "deadline",
    header: () => <div className="text-left">Status</div>,
    cell: ({ row }) => {
      const deadline = row.original.deadline;
      const expired = deadline ? isPublikasiExpired(deadline) : false;
      
      return (
        <Badge 
          variant={!expired ? "success" : "destructive"}
          className={!expired ? "bg-green-50 text-green-700 hover:bg-green-50 border-green-200" : "bg-red-50 text-red-700 hover:bg-red-50 border-red-200"}
        >
          {!expired ? "Aktif" : "Kedaluwarsa"}
        </Badge>
      )
    }
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <div className="flex justify-end">
          <PublikasiActions publikasi={row.original} onRefresh={onRefresh} />
        </div>
      )
    }
  }
]

interface PublikasiTableProps {
  data: PublikasiWithRelations[]
  isLoading?: boolean
  onRefresh?: () => void
}

export function PublikasiTable({ data, isLoading = false, onRefresh }: PublikasiTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "createdAt", desc: true }
  ])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  
  // Dialog state
  const [viewDetailOpen, setViewDetailOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [toggleLockDialogOpen, setToggleLockDialogOpen] = useState(false)
  const [notificationDialogOpen, setNotificationDialogOpen] = useState(false)
  const [selectedPublication, setSelectedPublication] = useState<PublikasiWithRelations | null>(null)
  
  const table = useReactTable({
    data,
    columns: columns(onRefresh),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters
    }
  })

  // Implementasi fungsi-fungsi untuk aksi pada tabel
  const handleViewDetail = (publikasi: PublikasiWithRelations) => {
    setSelectedPublication(publikasi)
    setViewDetailOpen(true)
  };

  const handleDownload = (id: string, filename: string) => {
    toast.success("Mengunduh lampiran", {
      description: `Mengunduh lampiran: ${filename}`,
    });
  };

  const handleToggleLock = (id: string, judul: string, currentStatus: boolean) => {
      toast.success("Publikasi dikunci", {
        description: `Publikasi "${judul}" berhasil dikunci`,
      });
    setToggleLockDialogOpen(false);
  };

  // Tambahkan tampilan loading jika data sedang dimuat:
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          <p className="text-sm text-muted-foreground">Memuat data...</p>
        </div>
      </div>
    )
  }
  
  // dan tambahkan pesan jika tidak ada data:
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center py-10">
        <div className="flex flex-col items-center gap-2">
          <div className="p-3 rounded-full bg-muted">
            <Archive className="h-6 w-6 text-muted-foreground" />
            </div>
          <p className="text-muted-foreground">Tidak ada publikasi yang ditemukan</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    const isActions = header.id === "actions";
                    return (
                      <TableHead 
                        key={header.id}
                        className={isActions ? "sticky right-0 bg-white shadow-md w-[50px] text-center" : ""}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className={row.original.locked ? "bg-gray-50 relative" : ""}
                  >
                    {row.getVisibleCells().map((cell, cellIndex) => {
                      const isActions = cell.column.id === "actions";
                      return (
                        <TableCell 
                          key={cell.id}
                          className={`${isActions ? "sticky right-0 bg-white shadow-md" : ""} ${cellIndex === 0 && row.original.locked ? "border-l-2 border-l-gray-400" : ""}`}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns(onRefresh).length} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <p className="text-muted-foreground">Tidak ada data publikasi yang sesuai dengan filter</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          table.resetColumnFilters()
                        }}
                      >
                        Reset Filter
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      
      {/* Footer pagination - diperbaiki untuk lebih sejajar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} dari{" "}
          {table.getFilteredRowModel().rows.length} publikasi
        </div>
        <div className="flex flex-col md:flex-row items-center md:space-x-6 lg:space-x-8">
          <div className="flex items-center justify-end space-x-2 mb-4 md:mb-0">
            <p className="text-sm font-medium whitespace-nowrap">Baris per halaman</p>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value))
              }}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={table.getState().pagination.pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {[5, 10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-full justify-between items-center">
            <div className="flex w-[140px] items-center justify-center text-sm font-medium">
              Halaman {table.getState().pagination.pageIndex + 1} dari{" "}
              {table.getPageCount()}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 md:flex"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Ke halaman pertama</span>
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Ke halaman sebelumnya</span>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Ke halaman berikutnya</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 md:flex"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Ke halaman terakhir</span>
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Lihat Detail */}
      <Dialog open={viewDetailOpen} onOpenChange={setViewDetailOpen}>
        <DialogContent className="sm:max-w-[700px] md:max-w-[800px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <InfoIcon className="h-5 w-5" />
              Detail Publikasi
            </DialogTitle>
            <DialogDescription>
              Informasi lengkap tentang publikasi
            </DialogDescription>
          </DialogHeader>
          
          {selectedPublication && (
            <div className="space-y-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right font-medium">Judul:</Label>
                <div className="col-span-3 font-medium">{selectedPublication.judul}</div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right font-medium">Kategori:</Label>
                <div className="col-span-3">
                  <Badge className={
                    selectedPublication.klasifikasi === "PENTING" ? "bg-red-50 text-red-700 border-red-200" :
                    selectedPublication.klasifikasi === "SEGERA" ? "bg-orange-50 text-orange-700 border-orange-200" :
                    selectedPublication.klasifikasi === "RAHASIA" ? "bg-purple-50 text-purple-700 border-purple-200" :
                    "bg-blue-50 text-blue-700 border-blue-200"
                  }>
                    {selectedPublication.klasifikasi}
                  </Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right font-medium">Tanggal:</Label>
                <div className="col-span-3">
                  {format(new Date(selectedPublication.createdAt), "dd MMMM yyyy", { locale: localeID })}
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right font-medium">Status:</Label>
                <div className="col-span-3">
                  <Badge variant={!selectedPublication.deadline || !isPublikasiExpired(selectedPublication.deadline) ? "success" : "destructive"}>
                    {!selectedPublication.deadline || !isPublikasiExpired(selectedPublication.deadline) ? "Aktif" : "Kedaluwarsa"}
                  </Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right font-medium">Target:</Label>
                <div className="col-span-3 flex items-center">
                  <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                  {selectedPublication.targetPenerima.length > 1 ? `${selectedPublication.targetPenerima.length} Grup` : roleToLabel(selectedPublication.targetPenerima[0])}
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right font-medium">Pembuat:</Label>
                <div className="col-span-3">{selectedPublication.pembuat.username} ({roleToLabel(selectedPublication.pembuat.role)})</div>
              </div>
              
              <div className="grid grid-cols-4 items-start gap-4">
                <Label className="text-right font-medium pt-2">Isi:</Label>
                <div className="col-span-3 rounded-md border p-3 min-h-[100px]">
                  <p className="text-sm">{selectedPublication.isi}</p>
                </div>
              </div>
              
              {selectedPublication.lampiran && selectedPublication.lampiran.length > 0 && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right font-medium">Lampiran:</Label>
                  <div className="col-span-3">
                    <Button variant="outline" size="sm" onClick={() => handleDownload(selectedPublication.id, selectedPublication.lampiran[0])}>
                      <FileText className="h-4 w-4 mr-2" />
                      {selectedPublication.lampiran[0]}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button onClick={() => setViewDetailOpen(false)}>Tutup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialog Konfirmasi Toggle Lock */}
      <AlertDialog open={toggleLockDialogOpen} onOpenChange={setToggleLockDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Kunci Publikasi
            </AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin mengunci publikasi &quot;{selectedPublication?.judul}&quot;? Publikasi tidak akan dapat diedit atau dihapus sampai dibuka kuncinya.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => selectedPublication && handleToggleLock(selectedPublication.id, selectedPublication.judul, false)}
            >
              Kunci
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
} 