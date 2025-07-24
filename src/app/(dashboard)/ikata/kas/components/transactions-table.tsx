'use client';

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
} from '@/components/ui/alert-dialog';
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
  SearchIcon,
  X
} from "lucide-react";
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { IKATATransaction, PeriodFilter as PeriodFilterType } from '../types';
import { formatCurrency, cn } from '@/lib/utils';

interface TransactionsTableProps {
  transactions: IKATATransaction[];
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onToggleLock?: (id: string) => void;
  canModifyData?: boolean;
  keluargaUmatList: { id: string; namaKepalaKeluarga: string }[];
}

export function TransactionsTable({ 
  transactions, 
  onEdit, 
  onDelete,
  onToggleLock,
  canModifyData = true,
  keluargaUmatList
}: TransactionsTableProps) {
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // Filter and search state
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [periodFilter, setPeriodFilter] = useState<PeriodFilterType>({
    bulan: 0, // 0 = semua data
    tahun: new Date().getFullYear()
  });
  
  // Type filter options
  const typeOptions = [
    { value: null, label: "Semua Jenis", key: "all" },
    { value: "uang_masuk", label: "Uang Masuk", key: "uang_masuk" },
    { value: "uang_keluar", label: "Uang Keluar", key: "uang_keluar" }
  ];

  // Month options
  const monthOptions = [
    { value: 0, label: "Semua Data" },
    { value: 1, label: "Januari" },
    { value: 2, label: "Februari" },
    { value: 3, label: "Maret" },
    { value: 4, label: "April" },
    { value: 5, label: "Mei" },
    { value: 6, label: "Juni" },
    { value: 7, label: "Juli" },
    { value: 8, label: "Agustus" },
    { value: 9, label: "September" },
    { value: 10, label: "Oktober" },
    { value: 11, label: "November" },
    { value: 12, label: "Desember" }
  ];

  // Year options (5 tahun ke belakang sampai 5 tahun ke depan)
  const currentYear = new Date().getFullYear();
  const startYear = currentYear - 5;
  const endYear = currentYear + 5;
  const yearOptions = Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);
  
  // Calculate pagination values for filtered data
  const filteredTransactions = transactions.filter(tx => {
    // Search term filter
    const matchesSearch = searchTerm === "" || 
      tx.keterangan.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Type filter
    const matchesType = typeFilter === null || 
      tx.jenis === typeFilter;
    
    // Period filter
    let matchesPeriod = true;
    if (periodFilter.bulan !== 0) {
      // Filter berdasarkan bulan dan tahun spesifik
      const txDate = new Date(tx.tanggal);
      const txMonth = txDate.getMonth() + 1; // 1-12
      const txYear = txDate.getFullYear();
      matchesPeriod = txMonth === periodFilter.bulan && txYear === periodFilter.tahun;
    }
    // Jika bulan = 0, tampilkan semua data (tidak ada filter periode)
    
    return matchesSearch && matchesType && matchesPeriod;
  });
  
  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, typeFilter, periodFilter]);
  
  const totalItems = filteredTransactions.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  
  // Get current page data
  const currentTransactions = filteredTransactions
    .sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime()) // Sort newest first
    .slice(startIndex, endIndex);

  // Pagination functions
  const goToPage = (page: number) => {
    setCurrentPage(page);
  };
  
  const goToFirstPage = () => {
    setCurrentPage(1);
  };
  
  const goToLastPage = () => {
    setCurrentPage(totalPages);
  };
  
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  // Handle page size change
  const handlePageSizeChange = (value: string) => {
    setPageSize(Number(value));
    setCurrentPage(1); // Reset to first page when changing page size
  };

  // Handle period filter change
  const handlePeriodChange = (field: 'bulan' | 'tahun', value: number) => {
    setPeriodFilter(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Format tipe transaksi untuk ditampilkan
  const formatTipeTransaksi = (tipe: string) => {
    const tipeMap: Record<string, string> = {
      // Tipe Uang Masuk
      'iuran_anggota': 'Iuran Anggota',
      'transfer_dana_lingkungan': 'Transfer Dana dari Lingkungan',
      'sumbangan_anggota': 'Sumbangan Anggota',
      'penerimaan_lain': 'Penerimaan Lain-Lain',
      
      // Tipe Uang Keluar
      'uang_duka': 'Uang Duka / Papan Bunga',
      'kunjungan_kasih': 'Kunjungan Kasih',
      'cinderamata_kelahiran': 'Cinderamata Kelahiran',
      'cinderamata_pernikahan': 'Cinderamata Pernikahan',
      'uang_akomodasi': 'Uang Akomodasi',
      'pembelian': 'Pembelian',
      'lain_lain': 'Lain-Lain',
    };
    
    return tipeMap[tipe] || tipe;
  };

  // Mendapatkan warna untuk badge jenis transaksi
  const getJenisTransaksiBadgeStyle = (jenis: string) => {
    if (jenis === 'uang_masuk') {
      return "bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200";
    } else {
      return "bg-rose-100 text-rose-800 border-rose-200 hover:bg-rose-200";
    }
  };

  // Mendapatkan warna untuk badge tipe transaksi
  const getTipeTransaksiBadgeStyle = (tipe: string) => {
    // Tipe Uang Masuk
    if (tipe === 'iuran_anggota') {
      return "bg-blue-100 text-blue-800 border-blue-200";
    } else if (tipe === 'transfer_dana_lingkungan') {
      return "bg-indigo-100 text-indigo-800 border-indigo-200";
    } else if (tipe === 'sumbangan_anggota') {
      return "bg-purple-100 text-purple-800 border-purple-200";
    } else if (tipe === 'penerimaan_lain') {
      return "bg-teal-100 text-teal-800 border-teal-200";
    }
    // Tipe Uang Keluar
    else if (tipe === 'uang_duka') {
      return "bg-red-100 text-red-800 border-red-200";
    } else if (tipe === 'kunjungan_kasih') {
      return "bg-orange-100 text-orange-800 border-orange-200";
    } else if (tipe === 'cinderamata_kelahiran' || tipe === 'cinderamata_pernikahan') {
      return "bg-amber-100 text-amber-800 border-amber-200";
    } else if (tipe === 'uang_akomodasi') {
      return "bg-pink-100 text-pink-800 border-pink-200";
    } else if (tipe === 'pembelian') {
      return "bg-slate-100 text-slate-800 border-slate-200";
    } else {
      return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Format status pembayaran iuran
  const formatStatusPembayaran = (status?: string) => {
    if (!status) return "";
    
    const statusMap: Record<string, string> = {
      'lunas': 'Lunas',
      'sebagian_bulan': 'Sebagian Bulan',
      'belum_ada_pembayaran': 'Belum Dibayar'
    };
    
    return statusMap[status] || status;
  };

  // Format periode bayar
  const formatPeriodeBayar = (periode?: string[]) => {
    if (!periode || periode.length === 0) return "";
    
    const months = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];
    
    return periode.map(p => {
      const [year, month] = p.split('-');
      const monthIndex = parseInt(month, 10) - 1;
      return `${months[monthIndex]} ${year}`;
    }).join(", ");
  };

  // Fungsi untuk mendapatkan keterangan yang sesuai
  const getKeterangan = (transaction: IKATATransaction) => {
    // Cari data anggota jika ada anggotaId
    const anggota = transaction.anggotaId 
      ? keluargaUmatList.find(k => k.id === transaction.anggotaId)
      : null;

    // Handle sumbangan anggota
    if (transaction.tipeTransaksi === 'sumbangan_anggota' && anggota) {
      return `Sumbangan dari ${anggota.namaKepalaKeluarga}`;
    }

    // Handle iuran anggota
    if (transaction.tipeTransaksi === 'iuran_anggota' && anggota) {
      let keterangan = `Iuran dari ${anggota.namaKepalaKeluarga}`;
      
      // Tambahkan informasi status pembayaran jika ada
      if (transaction.statusPembayaran) {
        keterangan += ` (${formatStatusPembayaran(transaction.statusPembayaran)})`;
        
        // Tambahkan informasi periode jika ada
        if (transaction.statusPembayaran === 'sebagian_bulan' && transaction.periodeBayar && transaction.periodeBayar.length > 0) {
          keterangan += ` - ${formatPeriodeBayar(transaction.periodeBayar)}`;
        }
      }
      
      return keterangan;
    }

    // Untuk tipe transaksi lainnya, gunakan keterangan yang ada
    return transaction.keterangan || '';
  };

  // Handler untuk mengelola callback secara aman
  const handleEdit = useCallback((id: string) => {
    if (onEdit) onEdit(id);
  }, [onEdit]);
  
  const handleDelete = useCallback((id: string) => {
    if (onDelete) onDelete(id);
  }, [onDelete]);
  
  const handleToggleLock = useCallback((id: string) => {
    if (onToggleLock) onToggleLock(id);
  }, [onToggleLock]);

  return (
    <div className="space-y-4">
      {/* Filters and Search */}
      <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Search input */}
        <div className="relative flex-1 max-w-sm">
          <SearchIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
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
              <span className="sr-only">Clear search</span>
            </Button>
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row flex-wrap gap-2">
          {/* Type Filter */}
          <Select
            value={typeFilter || "all"}
            onValueChange={(value) => setTypeFilter(value === "all" ? null : value)}
          >
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Tipe Transaksi" />
            </SelectTrigger>
            <SelectContent>
              {typeOptions.map((option) => (
                <SelectItem 
                  key={option.key} 
                  value={option.value === null ? "all" : option.value}
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {/* Period Filter - Bulan */}
          {/* <Select
            value={periodFilter.bulan.toString()}
            onValueChange={(value) => handlePeriodChange('bulan', parseInt(value))}
          >
            <SelectTrigger className="w-full sm:w-[120px]">
              <SelectValue placeholder="Pilih Bulan" />
            </SelectTrigger>
            <SelectContent>
              {monthOptions.map((month) => (
                <SelectItem key={month.value} value={month.value.toString()}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select> */}

          {/* Period Filter - Tahun */}
          {/* <Select
            value={periodFilter.tahun.toString()}
            onValueChange={(value) => handlePeriodChange('tahun', parseInt(value))}
            disabled={periodFilter.bulan === 0}
          >
            <SelectTrigger className="w-full sm:w-[100px]">
              <SelectValue placeholder="Tahun" />
            </SelectTrigger>
            <SelectContent>
              {yearOptions.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select> */}
        </div>
      </div>
      
      {/* Active Filters Summary */}
      {(searchTerm || typeFilter || periodFilter.bulan !== 0) && (
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <span>Filter aktif:</span>
          {searchTerm && (
            <Badge variant="outline" className="gap-1 px-2 py-1">
              <span>Pencarian: {searchTerm}</span>
              <Button
                variant="ghost"
                size="icon"
                className="ml-1 h-4 w-4 p-0"
                onClick={() => setSearchTerm("")}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Clear search</span>
              </Button>
            </Badge>
          )}
          
          {typeFilter && (
            <Badge variant="outline" className="gap-1 px-2 py-1">
              <span>Tipe: {typeOptions.find(t => t.value === typeFilter)?.label}</span>
              <Button
                variant="ghost"
                size="icon"
                className="ml-1 h-4 w-4 p-0"
                onClick={() => setTypeFilter(null)}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Clear type</span>
              </Button>
            </Badge>
          )}
          
          {periodFilter.bulan !== 0 && (
            <Badge variant="outline" className="gap-1 px-2 py-1">
              <span>
                Periode: {monthOptions.find(m => m.value === periodFilter.bulan)?.label} {periodFilter.tahun}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="ml-1 h-4 w-4 p-0"
                onClick={() => setPeriodFilter({ bulan: 0, tahun: currentYear })}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Clear period</span>
              </Button>
            </Badge>
          )}
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="ml-auto h-7 text-xs"
            onClick={() => {
              setSearchTerm("");
              setTypeFilter(null);
              setPeriodFilter({ bulan: 0, tahun: currentYear });
            }}
          >
            Reset Semua
          </Button>
        </div>
      )}
      
      <div className="rounded-md border overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="relative w-full">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Tanggal</TableHead>
                <TableHead className="w-[110px]">Jenis Transaksi</TableHead>
                <TableHead className="w-[150px]">Tipe Transaksi</TableHead>
                <TableHead className="min-w-[250px]">Keterangan</TableHead>
                <TableHead className="text-right w-[120px]">Debit</TableHead>
                <TableHead className="text-right w-[120px]">Kredit</TableHead>
                <TableHead className="text-center w-[90px]">Status</TableHead>
                {canModifyData && <TableHead className="sticky right-0 bg-white shadow-md w-[50px] text-center">Aksi</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      {filteredTransactions.length === 0 && transactions.length > 0 ? (
                        <>
                          <p className="text-muted-foreground">Tidak ada data transaksi yang sesuai dengan filter</p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSearchTerm("");
                              setTypeFilter(null);
                              setPeriodFilter({ bulan: 0, tahun: currentYear });
                            }}
                          >
                            Reset Filter
                          </Button>
                        </>
                      ) : (
                        <p className="text-muted-foreground">Belum ada data transaksi</p>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                currentTransactions.map((transaction) => (
                  <TableRow key={transaction.id} className="hover:bg-muted/50">
                    <TableCell className="font-mono text-sm">
                      {format(new Date(transaction.tanggal), 'dd/MM/yyyy')}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "text-xs font-medium border",
                          getJenisTransaksiBadgeStyle(transaction.jenis)
                        )}
                      >
                        {transaction.jenis === 'uang_masuk' ? 'Uang Masuk' : 'Uang Keluar'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "text-xs font-medium border", 
                          getTipeTransaksiBadgeStyle(transaction.tipeTransaksi)
                        )}
                      >
                        {formatTipeTransaksi(transaction.tipeTransaksi)}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="truncate" title={getKeterangan(transaction)}>
                        {getKeterangan(transaction)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {(transaction.debit || 0) > 0 ? (
                        <span className="text-emerald-600 font-semibold">
                          {formatCurrency(transaction.debit || 0)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {(transaction.kredit || 0) > 0 ? (
                        <span className="text-rose-600 font-semibold">
                          {formatCurrency(transaction.kredit || 0)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={() => handleToggleLock(transaction.id)}
                              disabled={!canModifyData}
                            >
                              {transaction.locked ? (
                                <LockIcon className="h-4 w-4 text-red-500" />
                              ) : (
                                <UnlockIcon className="h-4 w-4 text-green-500" />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{transaction.locked ? 'Terkunci' : 'Tidak Terkunci'}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    {canModifyData && (
                      <TableCell className="sticky right-0 bg-white shadow-md">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Buka menu</span>
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                              onClick={() => handleEdit(transaction.id)}
                              disabled={transaction.locked}
                              >
                                <PencilIcon className="mr-2 h-4 w-4" />
                              Edit
                                </DropdownMenuItem>
                              <DropdownMenuSeparator />
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem
                                  onSelect={(e) => e.preventDefault()}
                                  disabled={transaction.locked}
                                  className="text-red-600"
                                >
                                  <Trash2Icon className="mr-2 h-4 w-4" />
                                  Hapus
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Hapus Transaksi</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Apakah Anda yakin ingin menghapus transaksi ini? Tindakan ini tidak dapat dibatalkan.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Batal</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(transaction.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Hapus
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
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
      
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t px-4 py-3">
            <div className="flex items-center space-x-2">
              <p className="text-sm text-muted-foreground">
                Menampilkan {startIndex + 1} - {endIndex} dari {totalItems} data
              </p>
              <div className="flex items-center space-x-2">
                <label htmlFor="page-size" className="text-sm text-muted-foreground">
                  Data per halaman:
                </label>
                <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
                  <SelectTrigger className="h-8 w-16">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={goToFirstPage} 
                disabled={currentPage === 1}
                className="h-8 w-8"
              >
                <ChevronsLeftIcon className="h-4 w-4" />
                <span className="sr-only">Halaman pertama</span>
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={goToPreviousPage} 
                disabled={currentPage === 1}
                className="h-8 w-8"
              >
                <ChevronLeftIcon className="h-4 w-4" />
                <span className="sr-only">Halaman sebelumnya</span>
              </Button>
              
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const startPage = Math.max(1, currentPage - 2);
                  const pageNumber = startPage + i;
                  
                  if (pageNumber > totalPages) return null;
                  
                  return (
                    <Button
                      key={pageNumber}
                      variant={currentPage === pageNumber ? "default" : "outline"}
                      size="icon"
                      onClick={() => goToPage(pageNumber)}
                      className="h-8 w-8"
                    >
                      {pageNumber}
                    </Button>
                  );
                }).filter(Boolean)}
              </div>
              
              <Button 
                variant="outline" 
                size="icon" 
                onClick={goToNextPage} 
                disabled={currentPage === totalPages}
                className="h-8 w-8"
              >
                <ChevronRightIcon className="h-4 w-4" />
                <span className="sr-only">Halaman selanjutnya</span>
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={goToLastPage} 
                disabled={currentPage === totalPages}
                className="h-8 w-8"
              >
                <ChevronsRightIcon className="h-4 w-4" />
                <span className="sr-only">Halaman terakhir</span>
              </Button>
            </div>
          </div>
        )}
        </div>
    </div>
  );
} 