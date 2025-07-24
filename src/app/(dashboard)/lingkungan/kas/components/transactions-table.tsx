"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { format } from "date-fns"
import { JenisTransaksi, TipeTransaksiLingkungan } from "@prisma/client"
import { TransactionData, transactionSubtypeOptions, getCategoryOptions } from "../types"
import { useAuth } from "@/contexts/auth-context"

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
import { 
  PencilIcon, 
  Trash2Icon, 
  LockIcon, 
  UnlockIcon,
  MoreVertical,
  ChevronLeftIcon, 
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  CheckCircle,
  XCircle,
  Clock,
  SearchIcon,
  X
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
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
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface TransactionsTableProps {
  transactions: TransactionData[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onUnlock: (id: string) => void;
  canModifyData?: boolean;
  canApprove?: boolean;
  showPagination?: boolean;
}

export function TransactionsTable({ 
  transactions, 
  onEdit, 
  onDelete,
  onApprove,
  onReject,
  onUnlock,
  canModifyData = true,
  canApprove = false,
  showPagination = false
}: TransactionsTableProps) {
  // Get user role to check if it's a super user
  const { userRole } = useAuth();
  const isSuperUser = userRole === 'SUPER_USER';
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // Filter and search state
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<TipeTransaksiLingkungan | null>(null);
  const [typeFilter, setTypeFilter] = useState<JenisTransaksi | null>(null);
  
  // Create arrays for filter options - move to useMemo to prevent recreation on each render
  const categoryOptions = useMemo(() => getCategoryOptions(), []);
  
  const typeOptions = useMemo(() => [
    { value: null, label: "Semua Tipe", key: "all" },
    { value: JenisTransaksi.UANG_MASUK, label: "Pemasukan", key: "uang_masuk" },
    { value: JenisTransaksi.UANG_KELUAR, label: "Pengeluaran", key: "uang_keluar" }
  ], []);
  
  // Helper function to get transaction subtype label
  const getSubtypeLabel = useCallback((tx: TransactionData) => {
    const options = transactionSubtypeOptions[tx.jenisTransaksi];
    if (!options) return String(tx.tipeTransaksi);
    
    const match = options.find(opt => opt.value === tx.tipeTransaksi);
    return match ? match.label : String(tx.tipeTransaksi);
  }, []);
  
  // Calculate pagination values for filtered data
  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      // Search term filter
      const matchesSearch = searchTerm === "" || 
        (tx.keterangan && tx.keterangan.toLowerCase().includes(searchTerm.toLowerCase())) ||
        getSubtypeLabel(tx).toLowerCase().includes(searchTerm.toLowerCase());
      
      // Category filter
      const matchesCategory = categoryFilter === null || 
        tx.tipeTransaksi === categoryFilter;
      
      // Type filter
      const matchesType = typeFilter === null || 
        tx.jenisTransaksi === typeFilter;
      
      return matchesSearch && matchesCategory && matchesType;
    });
  }, [transactions, searchTerm, categoryFilter, typeFilter, getSubtypeLabel]);
  
  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoryFilter, typeFilter]);
  
  const totalItems = filteredTransactions.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  
  // Get current page data
  const currentTransactions = useMemo(() => {
    return filteredTransactions
      .sort((a, b) => b.tanggal.getTime() - a.tanggal.getTime()) // Sort newest first
      .slice(startIndex, endIndex);
  }, [filteredTransactions, startIndex, endIndex]);

  // Pagination functions
  const goToPage = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);
  
  const goToFirstPage = useCallback(() => {
    setCurrentPage(1);
  }, []);
  
  const goToLastPage = useCallback(() => {
    setCurrentPage(totalPages);
  }, [totalPages]);
  
  const goToPreviousPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  }, [currentPage]);
  
  const goToNextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  }, [currentPage, totalPages]);
  
  // Handle page size change
  const handlePageSizeChange = useCallback((value: string) => {
    const newSize = Number(value);
    if (newSize > 0) {
      setPageSize(newSize);
      setCurrentPage(1); // Reset to first page when changing page size
    }
  }, []);
  
  // Handle filter changes
  const handleTypeFilterChange = useCallback((value: string) => {
    if (value === "all") {
      setTypeFilter(null);
    } else if (value === JenisTransaksi.UANG_MASUK.toString()) {
      setTypeFilter(JenisTransaksi.UANG_MASUK);
    } else if (value === JenisTransaksi.UANG_KELUAR.toString()) {
      setTypeFilter(JenisTransaksi.UANG_KELUAR);
    }
  }, []);
  
  const handleCategoryFilterChange = useCallback((value: string) => {
    if (value === "all") {
      setCategoryFilter(null);
    } else {
      // Convert string value back to enum safely
      const enumValue = Object.values(TipeTransaksiLingkungan).find(
        (enumVal) => enumVal.toString() === value
      );
      if (enumValue !== undefined) {
        setCategoryFilter(enumValue);
      }
    }
  }, []);
  
  const clearAllFilters = useCallback(() => {
    setSearchTerm("");
    setTypeFilter(null);
    setCategoryFilter(null);
  }, []);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col md:flex-row gap-2 md:gap-4 flex-1">
          {/* Search */}
          <div className="relative flex-1">
            <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Cari transaksi..."
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
                <span className="sr-only">Clear</span>
              </Button>
            )}
          </div>
          
          {/* Type Filter */}
          <div className="flex-1 md:max-w-[180px]">
            <Select
              onOpenChange={() => {}} 
              onValueChange={handleTypeFilterChange}
              value={typeFilter === null ? "all" : typeFilter.toString()}
            >
              <SelectTrigger>
                <SelectValue>
                  {typeFilter === null 
                    ? "Semua Tipe" 
                    : typeOptions.find(o => o.value === typeFilter)?.label || "Pilih Tipe"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Tipe</SelectItem>
                <SelectItem value={JenisTransaksi.UANG_MASUK.toString()}>Pemasukan</SelectItem>
                <SelectItem value={JenisTransaksi.UANG_KELUAR.toString()}>Pengeluaran</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Category Filter */}
          <div className="flex-1 md:max-w-[220px]">
            <Select
              onOpenChange={() => {}}
              onValueChange={handleCategoryFilterChange}
              value={categoryFilter === null ? "all" : categoryFilter.toString()}
            >
              <SelectTrigger>
                <SelectValue>
                  {categoryFilter === null 
                    ? "Semua Kategori" 
                    : categoryOptions.find(o => o.value === categoryFilter)?.label || "Pilih Kategori"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kategori</SelectItem>
                {Object.values(TipeTransaksiLingkungan).map((enumValue) => {
                  const option = categoryOptions.find(opt => opt.value === enumValue);
                  if (!option) return null;
                  return (
                    <SelectItem key={String(enumValue)} value={String(enumValue)}>
                    {option.label}
                  </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        </div>
      
        {/* Clear Filters Button */}
        {(searchTerm || typeFilter || categoryFilter) && (
          <div className="flex justify-start">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs"
              onClick={clearAllFilters}
            >
              <X className="mr-1 h-3 w-3" />
              Hapus Filter
            </Button>
          </div>
        )}
      </div>
      
      {/* Transactions Table */}
      <div className="rounded-md border overflow-auto">
        <Table className="min-w-full">
          <TableHeader className="bg-background sticky top-0">
            <TableRow>
              <TableHead className="w-[50px]">No</TableHead>
              <TableHead className="w-[120px]">Tanggal</TableHead>
              <TableHead className="min-w-[300px]">Keterangan</TableHead>
              <TableHead className="min-w-[150px]">Jenis</TableHead>
              <TableHead className="text-right min-w-[120px]">Debit</TableHead>
              <TableHead className="text-right min-w-[120px]">Kredit</TableHead>
              <TableHead className="text-center min-w-[100px]">Status</TableHead>
              <TableHead className="text-right w-[100px] sticky right-0 bg-background shadow-[-8px_0_10px_-6px_rgba(0,0,0,0.1)]">
                Aksi
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  Tidak ada data transaksi
                </TableCell>
              </TableRow>
            ) : (
              currentTransactions.map((transaction, index) => (
                <TableRow key={transaction.id}>
                  <TableCell>{startIndex + index + 1}</TableCell>
                  <TableCell>
                    {format(transaction.tanggal, "dd/MM/yyyy")}
                  </TableCell>
                  <TableCell className="max-w-[300px] text-wrap">
                    {transaction.tipeTransaksi === TipeTransaksiLingkungan.SUMBANGAN_UMAT && transaction.keluarga ? (
                      <div>
                        <div className="font-semibold">{transaction.keluarga.namaKepalaKeluarga}</div>
                        <div className="text-muted-foreground text-sm">{transaction.keterangan || "-"}</div>
                      </div>
                    ) : (
                      transaction.keterangan || "-"
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={transaction.jenisTransaksi === JenisTransaksi.UANG_MASUK ? "default" : "destructive"}
                      className={`whitespace-nowrap ${transaction.jenisTransaksi === JenisTransaksi.UANG_MASUK ? "" : "bg-red-500 text-white"}`}
                    >
                      {getSubtypeLabel(transaction)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {transaction.debit > 0 
                      ? new Intl.NumberFormat('id-ID', {
                          style: 'currency',
                          currency: 'IDR',
                          minimumFractionDigits: 0,
                        }).format(transaction.debit)
                      : "-"
                    }
                  </TableCell>
                  <TableCell className="text-right">
                    {transaction.kredit > 0 
                      ? new Intl.NumberFormat('id-ID', {
                          style: 'currency',
                          currency: 'IDR',
                          minimumFractionDigits: 0,
                        }).format(transaction.kredit)
                      : "-"
                    }
                  </TableCell>
                  <TableCell className="text-center">
                    {transaction.isApproved && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <LockIcon className="h-5 w-5 text-muted-foreground inline-block" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Terkunci</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                    {transaction.isRejected && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <XCircle className="h-5 w-5 text-red-500" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Ditolak</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                    {transaction.isPending && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <UnlockIcon className="h-5 w-5 text-green-500" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Tidak Terkunci</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </TableCell>
                  <TableCell className="text-right sticky right-0 bg-background shadow-[-8px_0_10px_-6px_rgba(0,0,0,0.1)]">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Buka menu</span>
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {(canModifyData && (!transaction.isApproved || isSuperUser)) && (
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
                            <DropdownMenuSeparator />
                          </>
                        )}
                        
                        {/* Approval Options */}
                        {!isSuperUser && canApprove && transaction.isPending && (
                          <>
                            <DropdownMenuItem
                              onClick={() => onApprove(transaction.id)}
                              className="text-green-600"
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Setujui
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => onReject(transaction.id)}
                              className="text-red-600"
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              Tolak
                            </DropdownMenuItem>
                          </>
                        )}
                        
                        {/* Unlock Option for Super User */}
                        {isSuperUser && transaction.isApproved && (
                          <DropdownMenuItem
                            onClick={() => onUnlock(transaction.id)}
                            className="text-blue-600"
                          >
                            <UnlockIcon className="mr-2 h-4 w-4" />
                            Buka Kunci
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Pagination Controls */}
      {(totalPages > 1 || showPagination) && (
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 order-2 md:order-1">
            <span className="text-sm text-muted-foreground mr-2">
            Menampilkan {startIndex + 1} sampai {endIndex} dari {totalItems} transaksi
            </span>
            <Select
              onOpenChange={() => {}}
              onValueChange={handlePageSizeChange}
              value={pageSize.toString()}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue>{pageSize}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">per halaman</span>
          </div>
          
          <div className="flex items-center space-x-2 order-1 md:order-2">
            <Button
              variant="outline"
              size="icon"
              onClick={goToFirstPage}
              disabled={currentPage === 1}
              className="h-8 w-8"
            >
              <ChevronsLeftIcon className="h-4 w-4" />
              <span className="sr-only">Halaman Pertama</span>
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
              className="h-8 w-8"
            >
              <ChevronLeftIcon className="h-4 w-4" />
              <span className="sr-only">Halaman Sebelumnya</span>
            </Button>
            <div className="flex items-center gap-1 mx-2">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNumber;
                if (totalPages <= 5) {
                  pageNumber = i + 1;
                } else if (currentPage <= 3) {
                  pageNumber = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNumber = totalPages - 4 + i;
                } else {
                  pageNumber = currentPage - 2 + i;
                }
                
                return (
                  <Button
                    key={pageNumber}
                    variant={currentPage === pageNumber ? "default" : "outline"}
                    size="icon"
                    onClick={() => goToPage(pageNumber)}
                    className="w-8 h-8"
                  >
                    {pageNumber}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className="h-8 w-8"
            >
              <ChevronRightIcon className="h-4 w-4" />
              <span className="sr-only">Halaman Berikutnya</span>
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={goToLastPage}
              disabled={currentPage === totalPages}
              className="h-8 w-8"
            >
              <ChevronsRightIcon className="h-4 w-4" />
              <span className="sr-only">Halaman Terakhir</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
} 