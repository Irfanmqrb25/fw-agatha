"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { Eye, ChevronLeftIcon, ChevronRightIcon, ChevronsLeftIcon, ChevronsRightIcon, Edit, Trash2, FileText, MoreVertical, CalendarIcon, MoreHorizontal, X, Check, ReceiptIcon } from "lucide-react"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"


import { DanaMandiriHistory, IkataHistory } from "../types"
import { formatRupiah, getDanaMandiriStatusColor, getIkataStatusColor, formatStatusIkata, getMonthName, getMonthRange } from "../utils"

interface PaymentHistoryTableProps {
  data: DanaMandiriHistory[] | IkataHistory[];
  type: "Dana Mandiri" | "IKATA";
  showUserColumn: boolean;
  showActions: boolean;
  onStatusChange: ((payment: DanaMandiriHistory, status: boolean) => void) | 
                 ((payment: IkataHistory, status: "LUNAS" | "SEBAGIAN_BULAN" | "BELUM_BAYAR") => void);
  onDelete: ((payment: DanaMandiriHistory) => void) | 
           ((payment: IkataHistory) => void);
}

export function PaymentHistoryTable({ 
  data, 
  type,
  showUserColumn, 
  showActions,
  onStatusChange, 
  onDelete
}: PaymentHistoryTableProps) {
  const [selectedItem, setSelectedItem] = useState<DanaMandiriHistory | IkataHistory | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  
  // Fungsi untuk mendapatkan data untuk halaman saat ini
  const getPaginatedData = (data: any[]) => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return data.slice(startIndex, endIndex)
  }
  
  // Mengatur ulang halaman ke 1 saat data berubah
  useEffect(() => {
    setCurrentPage(1)
  }, [data])
  
  // Komponen pagination
  const Pagination = ({ totalItems }: { totalItems: number }) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage)
    
    if (totalPages <= 1) return null
    
    return (
      <div className="flex items-center justify-center space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(1)}
          disabled={currentPage === 1}
        >
          <ChevronsLeftIcon className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </Button>
        
        <span className="text-sm">
          Halaman {currentPage} dari {totalPages}
        </span>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          <ChevronRightIcon className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(totalPages)}
          disabled={currentPage === totalPages}
        >
          <ChevronsRightIcon className="h-4 w-4" />
        </Button>
      </div>
    )
  }
  
  // Render tabel Dana Mandiri
  if (type === "Dana Mandiri") {
    const danaMandiriData = data as DanaMandiriHistory[]
    const danaMandiriStatusChange = onStatusChange as (payment: DanaMandiriHistory, status: boolean) => void
    const danaMandiriDelete = onDelete as (payment: DanaMandiriHistory) => void
    
    // Handler untuk mengubah status
    const handleStatusChange = (payment: DanaMandiriHistory) => {
      danaMandiriStatusChange(payment, !payment.statusSetor)
    }
    
    // Handler untuk hapus pembayaran
    const handleDelete = (payment: DanaMandiriHistory) => {
      setSelectedItem(payment)
      setDeleteDialogOpen(true)
    }
    
    // Konfirmasi hapus
    const confirmDelete = () => {
      if (selectedItem) {
        danaMandiriDelete(selectedItem as DanaMandiriHistory)
      }
      setDeleteDialogOpen(false)
      setSelectedItem(null)
    }
    
    return (
      <>
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">No</TableHead>
                {showUserColumn && <TableHead>Nama Kepala Keluarga</TableHead>}
                <TableHead>Tanggal</TableHead>
                <TableHead>Tahun/Bulan</TableHead>
                <TableHead>Jumlah</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tanggal Setor</TableHead>
                {showActions && <TableHead className="text-right sticky right-0 bg-background">Aksi</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {danaMandiriData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={showUserColumn ? (showActions ? 8 : 7) : (showActions ? 7 : 6)} className="h-24 text-center">
                    Tidak ada data pembayaran
                  </TableCell>
                </TableRow>
              ) : (
                getPaginatedData(danaMandiriData).map((payment, index) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">{(currentPage - 1) * itemsPerPage + index + 1}</TableCell>
                    {showUserColumn && <TableCell>{payment.namaKepalaKeluarga}</TableCell>}
                    <TableCell>
                      {payment.tanggal ? format(new Date(payment.tanggal), "dd MMMM yyyy", { locale: id }) : "-"}
                    </TableCell>
                    <TableCell>
                      {payment.tahun}/{getMonthName(payment.bulan)}
                    </TableCell>
                    <TableCell>{formatRupiah(payment.jumlahDibayar)}</TableCell>
                    <TableCell>
                      <Badge className={getDanaMandiriStatusColor(payment.statusSetor)}>
                        {payment.statusSetor ? "Sudah Disetor" : "Belum Disetor"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {payment.tanggalSetor 
                        ? format(new Date(payment.tanggalSetor), "dd MMMM yyyy", { locale: id })
                        : "-"
                      }
                    </TableCell>
                    {showActions && (
                      <TableCell className="text-right sticky right-0 bg-background">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Buka menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(payment)}
                              className="flex items-center"
                            >
                              {payment.statusSetor ? (
                                <>
                                  <X className="mr-2 h-4 w-4" />
                                  <span>Tandai Belum Disetor</span>
                                </>
                              ) : (
                                <>
                                  <Check className="mr-2 h-4 w-4" />
                                  <span>Tandai Sudah Disetor</span>
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(payment)}
                              className="flex items-center text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              <span>Hapus</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        
        <Pagination totalItems={danaMandiriData.length} />
        
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
              <AlertDialogDescription>
                Apakah Anda yakin ingin menghapus data pembayaran ini? 
                Tindakan ini tidak dapat dibatalkan.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Batal</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
                Hapus
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    )
  }
  
  // Render tabel IKATA
  else {
    const ikataData = data as IkataHistory[]
    const ikataStatusChange = onStatusChange as (payment: IkataHistory, status: "LUNAS" | "SEBAGIAN_BULAN" | "BELUM_BAYAR") => void
    const ikataDelete = onDelete as (payment: IkataHistory) => void
    
    // Handler untuk mengubah status menjadi lunas
    const handleStatusLunas = (payment: IkataHistory) => {
      ikataStatusChange(payment, "LUNAS")
    }
    
    // Handler untuk mengubah status menjadi sebagian bulan
    const handleStatusSebagian = (payment: IkataHistory) => {
      ikataStatusChange(payment, "SEBAGIAN_BULAN")
    }
    
    // Handler untuk mengubah status menjadi belum bayar
    const handleStatusBelumBayar = (payment: IkataHistory) => {
      ikataStatusChange(payment, "BELUM_BAYAR")
    }
    
    // Handler untuk hapus pembayaran
    const handleDelete = (payment: IkataHistory) => {
      setSelectedItem(payment)
      setDeleteDialogOpen(true)
    }
    
    // Konfirmasi hapus
    const confirmDelete = () => {
      if (selectedItem) {
        ikataDelete(selectedItem as IkataHistory)
      }
      setDeleteDialogOpen(false)
      setSelectedItem(null)
    }
    
    return (
      <>
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">No</TableHead>
                {showUserColumn && <TableHead>Nama Kepala Keluarga</TableHead>}
                <TableHead>Tahun</TableHead>
                <TableHead>Bulan</TableHead>
                <TableHead>Jumlah</TableHead>
                <TableHead>Status</TableHead>
                {showActions && <TableHead className="text-right sticky right-0 bg-background">Aksi</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {ikataData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={showUserColumn ? (showActions ? 7 : 6) : (showActions ? 6 : 5)} className="h-24 text-center">
                    Tidak ada data pembayaran
                  </TableCell>
                </TableRow>
              ) : (
                getPaginatedData(ikataData).map((payment, index) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">{(currentPage - 1) * itemsPerPage + index + 1}</TableCell>
                    {showUserColumn && <TableCell>{payment.namaKepalaKeluarga}</TableCell>}
                    <TableCell>{payment.tahun}</TableCell>
                    <TableCell>
                      {getMonthRange(payment.bulanAwal, payment.bulanAkhir)}
                    </TableCell>
                    <TableCell>{formatRupiah(payment.jumlahDibayar)}</TableCell>
                    <TableCell>
                      <Badge className={getIkataStatusColor(payment.status)}>
                        {formatStatusIkata(payment.status)}
                      </Badge>
                    </TableCell>
                    {showActions && (
                      <TableCell className="text-right sticky right-0 bg-background">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Buka menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleStatusLunas(payment)}
                              className="flex items-center"
                              disabled={payment.status === "LUNAS"}
                            >
                              <Check className="mr-2 h-4 w-4" />
                              <span>Tandai Lunas</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleStatusSebagian(payment)}
                              className="flex items-center"
                              disabled={payment.status === "SEBAGIAN_BULAN"}
                            >
                              <ReceiptIcon className="mr-2 h-4 w-4" />
                              <span>Tandai Sebagian Bulan</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleStatusBelumBayar(payment)}
                              className="flex items-center"
                              disabled={payment.status === "BELUM_BAYAR"}
                            >
                              <X className="mr-2 h-4 w-4" />
                              <span>Tandai Belum Bayar</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDelete(payment)}
                              className="flex items-center text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              <span>Hapus</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        
        <Pagination totalItems={ikataData.length} />
        
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
              <AlertDialogDescription>
                Apakah Anda yakin ingin menghapus data pembayaran ini? 
                Tindakan ini tidak dapat dibatalkan.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Batal</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
                Hapus
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    )
  }
} 