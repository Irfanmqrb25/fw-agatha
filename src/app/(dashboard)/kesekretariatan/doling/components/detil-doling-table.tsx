"use client";

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DetilDoling } from "../types"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
import { 
  CheckIcon, 
  SearchIcon, 
  X, 
  EditIcon, 
  TrashIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  ChevronsLeftIcon, 
  ChevronsRightIcon,
  MoreVertical,
  PencilIcon,
  Trash2Icon,
  CalendarIcon,
  UserIcon,
  UsersIcon,
  CheckCircleIcon,
  XCircleIcon,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useAuth } from "@/contexts/auth-context"

interface DetilDolingTableProps {
  detil: DetilDoling[]
  onEdit: (detil: DetilDoling) => void
  onDelete: (id: string) => void
  onApprove?: (id: string) => void
  onSelectDoling?: (id: string) => void
}

export function DetilDolingTable({ 
  detil, 
  onEdit, 
  onDelete,
  onApprove,
  onSelectDoling
}: DetilDolingTableProps) {
  const { userRole } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [approveFilter, setApproveFilter] = useState<string | null>(null)
  
  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, statusFilter, approveFilter])
  
  // Format currency
  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(angka);
  };

  // Handle approve click
  const handleApproveClick = (id: string) => {
    if (onApprove) {
      onApprove(id);
    } else {
      toast.error("Tidak dapat mengubah status approval");
    }
  };

  // Filter data based on search and filters
  const filteredData = detil.filter((item) => {
    const matchesSearch =
      !searchTerm ||
      item.tuanRumah.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.temaIbadat && item.temaIbadat.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.jenisIbadat && item.jenisIbadat.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      !statusFilter ||
      (statusFilter === "selesai" && item.status === "selesai") ||
      (statusFilter === "menunggu" && item.status === "menunggu") ||
      (statusFilter === "dibatalkan" && item.status === "dibatalkan");

    return matchesSearch && matchesStatus;
  });
  
  // Calculate pagination
  const totalItems = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  
  // Current page data
  const currentData = filteredData
    .sort((a, b) => b.tanggal.getTime() - a.tanggal.getTime()) // Newest first
    .slice(startIndex, endIndex);
  
  // Page navigation
  const goToFirstPage = () => setCurrentPage(1);
  const goToLastPage = () => setCurrentPage(totalPages);
  const goToPreviousPage = () => setCurrentPage(prev => Math.max(1, prev - 1));
  const goToNextPage = () => setCurrentPage(prev => Math.min(totalPages, prev + 1));
  
  // Change items per page
  const handlePageSizeChange = (value: string) => {
    setPageSize(Number(value));
    setCurrentPage(1); // Reset to first page
  };
  
  // Clear all filters
  const clearAllFilters = () => {
    setSearchTerm("");
    setStatusFilter(null);
    setCurrentPage(1);
  };

  // Helper untuk status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "selesai":
        return (
          <Badge variant="success">
            <CheckCircle className="mr-1 h-4 w-4" />
            Selesai
          </Badge>
        );
      case "dibatalkan":
        return (
          <Badge variant="destructive">
            <XCircle className="mr-1 h-4 w-4" />
            Dibatalkan
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-amber-400 text-white">
            <Clock className="mr-1 h-4 w-4 " />
            Belum Selesai
          </Badge>
        );
    }
  };

  // Helper untuk jenis ibadat badge
  const getJenisIbadatBadge = (jenisIbadat?: string) => {
    if (!jenisIbadat) return null;

    const jenisMap: Record<string, { color: string, label: string }> = {
      'doa-lingkungan': { color: 'blue', label: 'Doa Lingkungan' },
      'misa': { color: 'purple', label: 'Misa' },
      'pertemuan': { color: 'orange', label: 'Pertemuan' },
      'bakti-sosial': { color: 'green', label: 'Bakti Sosial' },
      'kegiatan-lainnya': { color: 'gray', label: 'Lainnya' }
    };

    const { color, label } = jenisMap[jenisIbadat] || { color: 'gray', label: jenisIbadat };
    return (
      <Badge variant="outline" className={`bg-${color}-50 text-${color}-700 border-${color}-200`}>
        {label}
      </Badge>
    );
  };

  // Helper untuk approval status
  const getApprovalStatus = (approved?: boolean) => {
    if (approved) {
      return (
        <div className="flex items-center gap-1 text-green-600">
          <CheckCircleIcon className="h-4 w-4" />
          <span className="text-xs">Disetujui</span>
        </div>
      );
    }
    
    return (
      <div className="flex items-center gap-1 text-amber-600">
        <XCircleIcon className="h-4 w-4" />
        <span className="text-xs">Belum Disetujui</span>
      </div>
    );
  };

  // Fungsi untuk menangani klik pada baris tabel
  const handleRowClick = (detil: DetilDoling) => {
    if (onSelectDoling) {
      onSelectDoling(detil.id);
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        {/* Search */}
        <div className="relative w-full md:w-64">
          <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari data kegiatan..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <Button
              variant="ghost"
              className="absolute right-0 top-0 h-9 w-9 p-0"
              onClick={() => setSearchTerm("")}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Clear search</span>
            </Button>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2">
          {/* Status Filter */}
          <Select
            value={statusFilter === null ? "all" : statusFilter}
            onValueChange={(value) => {
              setStatusFilter(value === "all" ? null : value);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="menunggu">Menunggu</SelectItem>
              <SelectItem value="selesai">Selesai</SelectItem>
              <SelectItem value="dibatalkan">Dibatalkan</SelectItem>
            </SelectContent>
          </Select>
          
          {/* Approval Filter */}
          <Select
            value={approveFilter === null ? "all" : approveFilter}
            onValueChange={(value) => {
              setApproveFilter(value === "all" ? null : value);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Approval" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua</SelectItem>
              <SelectItem value="approved">Sudah Disetujui</SelectItem>
              <SelectItem value="notApproved">Belum Disetujui</SelectItem>
            </SelectContent>
          </Select>
          
          {/* Reset button */}
          {(searchTerm || statusFilter !== null) && (
            <Button variant="outline" onClick={clearAllFilters} size="sm">
              Reset
            </Button>
          )}
        </div>
      </div>
      
      {/* Table */}
      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Tanggal</TableHead>
              <TableHead className="w-[180px]">Tuan Rumah</TableHead>
              <TableHead className="w-[120px]">Jenis</TableHead>
              <TableHead className="min-w-[100px]">Tema</TableHead>
              <TableHead className="w-[120px]">Kolekte</TableHead>
              <TableHead className="w-[80px]">Hadir</TableHead>
              <TableHead className="w-[120px]">Status</TableHead>
              <TableHead className="w-[80px] sticky right-0 bg-white shadow-sm">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentData.length > 0 ? (
              currentData.map((item, index) => (
                <TableRow 
                  key={item.id}
                  className={onSelectDoling ? "cursor-pointer hover:bg-slate-50" : ""}
                  onClick={() => onSelectDoling && handleRowClick(item)}
                >
                  <TableCell className="whitespace-nowrap">
                    {format(item.tanggal, "dd MMM yyyy", { locale: id })}
                  </TableCell>
                  <TableCell className="font-medium">
                    {item.tuanRumah}
                  </TableCell>
                  <TableCell>
                    {getJenisIbadatBadge(item.jenisIbadat)}
                  </TableCell>
                  <TableCell>
                    {item.temaIbadat || "-"}
                  </TableCell>
                  <TableCell>
                    {formatRupiah(item.kolekteI + item.kolekteII)}
                  </TableCell>
                  <TableCell>
                    {item.jumlahKKHadir} KK
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(item.status)}
                  </TableCell>
                  <TableCell className="sticky right-0 bg-white shadow-sm">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={(e) => e.stopPropagation()} // Hindari trigger onClick pada TableRow
                        >
                          <MoreVertical className="h-4 w-4" />
                          <span className="sr-only">Menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          onClick={(e) => {
                            e.stopPropagation(); // Hindari trigger onClick pada TableRow
                            onEdit(item);
                          }}
                          disabled={item.status === "selesai" && userRole !== "SUPER_USER"}
                        >
                          <PencilIcon className="h-4 w-4 mr-2" />
                          <span>Edit</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem
                              className="text-red-600"
                              onSelect={(e) => {
                                e.preventDefault();
                                e.stopPropagation(); // Hindari trigger onClick pada TableRow
                              }}
                              disabled={item.status === "selesai" && userRole !== "SUPER_USER"}
                            >
                              <Trash2Icon className="h-4 w-4 mr-2" />
                              <span>Hapus</span>
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
                              <AlertDialogDescription>
                                Apakah Anda yakin ingin menghapus data detail doa lingkungan ini? Tindakan ini tidak dapat dibatalkan.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Batal</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => onDelete(item.id)}
                              >
                                Hapus
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  Tidak ada data yang ditemukan
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Pagination */}
      <div className="flex flex-col items-center justify-between gap-3 pt-2">
        {/* Tombol Navigasi */}
        <div className="flex items-center justify-center w-full gap-1 border rounded-md p-1.5 bg-gray-50">
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            onClick={goToFirstPage}
            disabled={currentPage === 1}
          >
            <ChevronsLeftIcon className="h-3.5 w-3.5" />
            <span className="sr-only">Halaman pertama</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            onClick={goToPreviousPage}
            disabled={currentPage === 1}
          >
            <ChevronLeftIcon className="h-3.5 w-3.5" />
            <span className="sr-only">Halaman sebelumnya</span>
          </Button>
          <div className="text-xs px-3 py-1 bg-white rounded border min-w-[60px] text-center">
            {currentPage}/{totalPages}
          </div>
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            onClick={goToNextPage}
            disabled={currentPage === totalPages}
          >
            <ChevronRightIcon className="h-3.5 w-3.5" />
            <span className="sr-only">Halaman berikutnya</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            onClick={goToLastPage}
            disabled={currentPage === totalPages}
          >
            <ChevronsRightIcon className="h-3.5 w-3.5" />
            <span className="sr-only">Halaman terakhir</span>
          </Button>
        </div>
        
        {/* Info Pages */}
        <div className="flex items-center justify-between text-xs text-muted-foreground w-full">
          <div></div> {/* Spacer untuk layout */}
          <div className="flex items-center gap-1.5">
            <span className="whitespace-nowrap">
              {filteredData.length === 0 ? 0 : startIndex + 1}-{endIndex} dari {totalItems} data
            </span>
            <span className="mx-1">•</span>
            <Select
              value={pageSize.toString()}
              onValueChange={handlePageSizeChange}
            >
              <SelectTrigger className="h-6 w-[54px] text-xs border-dashed">
                <SelectValue />
              </SelectTrigger>
              <SelectContent side="top">
                {[5, 10, 20, 50, 100].map((size) => (
                  <SelectItem key={size} value={size.toString()} className="text-xs">
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="whitespace-nowrap">per halaman</span>
          </div>
          <div></div> {/* Spacer untuk layout */}
        </div>
      </div>
    </div>
  )
} 