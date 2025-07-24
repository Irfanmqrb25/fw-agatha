"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { 
  SearchIcon, 
  X, 
  EditIcon, 
  TrashIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  ChevronsLeftIcon, 
  ChevronsRightIcon,
  CalendarIcon,
  UserIcon,
  PhoneIcon,
  PencilIcon
} from "lucide-react";
import { JadwalDoling } from "../types";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatTanggalWaktu } from "../utils/helpers";
import { JenisIbadat, SubIbadat } from "@prisma/client";
import { useAuth } from "@/contexts/auth-context"

interface JadwalDolingTableProps {
  jadwal: JadwalDoling[];
  onEdit: (jadwal: JadwalDoling) => void;
  onDelete: (id: string) => void;
  onSelectDoling?: (id: string) => void;
}

export function JadwalDolingTable({ jadwal, onEdit, onDelete, onSelectDoling }: JadwalDolingTableProps) {
  // state
  const { userRole } = useAuth()
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [jenisIbadatFilter, setJenisIbadatFilter] = useState<JenisIbadat | null>(null);
  
  // Dialog untuk melihat detail jadwal
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedJadwal, setSelectedJadwal] = useState<JadwalDoling | null>(null);
  
  // Reset to first page when filters change
  const resetPage = () => setCurrentPage(1);
  
  // Filter data berdasarkan pencarian dan status
  const filteredJadwal = jadwal.filter(item => {
    const matchesSearch = searchTerm === "" ||
      item.tuanRumah.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.alamat.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === null || item.status === statusFilter;
    
    const matchesJenisIbadat = jenisIbadatFilter === null || item.jenisIbadat === jenisIbadatFilter;
    
    return matchesSearch && matchesStatus && matchesJenisIbadat;
  });
  
  // Calculate pagination
  const totalItems = filteredJadwal.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  
  // Current page data
  const currentPageData = filteredJadwal.slice(startIndex, endIndex);
  
  // Helper untuk badge status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "terjadwal":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Terjadwal</Badge>;
      case "selesai":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Disetujui</Badge>;
      case "dibatalkan":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Dibatalkan</Badge>;
      case "menunggu":
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Belum Selesai</Badge>;
      default:
        return null;
    }
  };
  
  // Fungsi untuk menampilkan dialog detail
  const handleShowDetail = (jadwal: JadwalDoling) => {
    setSelectedJadwal(jadwal);
    setShowDetailDialog(true);
  };

  // Render nomor telepon
  const renderPhone = (item: JadwalDoling) => {
    if (!item.nomorTelepon) return "-";
    return item.nomorTelepon;
  };
  
  // Pembantu untuk badge jenis ibadat
  const getJenisIbadatBadge = (jenisIbadat: JenisIbadat | undefined) => {
    if (!jenisIbadat) return null;
    
    switch (jenisIbadat) {
      case JenisIbadat.DOA_LINGKUNGAN:
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Doa Lingkungan</Badge>;
      case JenisIbadat.MISA:
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Misa</Badge>;
      case JenisIbadat.PERTEMUAN:
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Pertemuan</Badge>;
      case JenisIbadat.BAKTI_SOSIAL:
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Bakti Sosial</Badge>;
      case JenisIbadat.KEGIATAN_LAIN:
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Kegiatan Lain</Badge>;
      default:
        return <Badge variant="outline">{jenisIbadat}</Badge>;
    }
  };

  // Pembantu untuk mendapatkan label sub ibadat yang lebih mudah dibaca
  const getSubIbadatLabel = (subIbadat: SubIbadat): string => {
    const subIbadatMap: Record<SubIbadat, string> = {
      [SubIbadat.IBADAT_SABDA]: "Ibadat Sabda",
      [SubIbadat.IBADAT_SABDA_TEMATIK]: "Ibadat Sabda Tematik",
      [SubIbadat.PRAPASKAH]: "Prapaskah (APP)",
      [SubIbadat.BKSN]: "BKSN",
      [SubIbadat.BULAN_ROSARIO]: "Bulan Rosario",
      [SubIbadat.NOVENA_NATAL]: "Novena Natal",
      [SubIbadat.MISA_SYUKUR]: "Misa Syukur",
      [SubIbadat.MISA_REQUEM]: "Misa Requem",
      [SubIbadat.MISA_ARWAH]: "Misa Arwah",
      [SubIbadat.MISA_PELINDUNG]: "Misa Pelindung"
    };
    
    return subIbadatMap[subIbadat] || subIbadat;
  };

  // Tambahkan fungsi untuk menangani klik pada baris tabel
  const handleRowClick = (jadwal: JadwalDoling) => {
    if (onSelectDoling) {
      onSelectDoling(jadwal.id);
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
            placeholder="Cari tuan rumah, alamat..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              resetPage();
            }}
          />
          {searchTerm && (
            <Button
              variant="ghost"
              className="absolute right-0 top-0 h-9 w-9 p-0"
              onClick={() => {
                setSearchTerm("");
                resetPage();
              }}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Clear search</span>
            </Button>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2">
          {/* Jenis Ibadat Filter */}
          <Select
            value={jenisIbadatFilter || "all"}
            onValueChange={(value) => {
              if (value === "all") {
                setJenisIbadatFilter(null);
              } else {
                setJenisIbadatFilter(value as JenisIbadat);
              }
              resetPage();
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Jenis Ibadat" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Jenis</SelectItem>
              <SelectItem value={JenisIbadat.DOA_LINGKUNGAN}>Doa Lingkungan</SelectItem>
              <SelectItem value={JenisIbadat.MISA}>Misa</SelectItem>
              <SelectItem value={JenisIbadat.PERTEMUAN}>Pertemuan</SelectItem>
              <SelectItem value={JenisIbadat.BAKTI_SOSIAL}>Bakti Sosial</SelectItem>
              <SelectItem value={JenisIbadat.KEGIATAN_LAIN}>Kegiatan Lain</SelectItem>
            </SelectContent>
          </Select>
          
          {/* Status Filter */}
          <Select
            value={statusFilter || "all"}
            onValueChange={(value) => {
              setStatusFilter(value === "all" ? null : value);
              resetPage();
            }}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="terjadwal">Terjadwal</SelectItem>
              <SelectItem value="selesai">Selesai</SelectItem>
              <SelectItem value="dibatalkan">Dibatalkan</SelectItem>
              <SelectItem value="menunggu">Belum Selesai</SelectItem>
            </SelectContent>
          </Select>
          
          {/* Reset button */}
          {(searchTerm || statusFilter || jenisIbadatFilter) && (
            <Button variant="outline" onClick={() => {
              setSearchTerm("");
              setStatusFilter(null);
              setJenisIbadatFilter(null);
              resetPage();
            }} size="sm">
              Reset
            </Button>
          )}
        </div>
      </div>
      
      {/* Dialog Detail Jadwal */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Detail Jadwal</DialogTitle>
          </DialogHeader>
          {selectedJadwal && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <p className="font-medium">Tanggal:</p>
                <p>{formatTanggalWaktu(selectedJadwal.tanggal, selectedJadwal.waktu)}</p>
                
                <p className="font-medium">Tuan Rumah:</p>
                <p>{selectedJadwal.tuanRumah}</p>
                
                <p className="font-medium">No. Telepon:</p>
                <p>{selectedJadwal.nomorTelepon || "-"}</p>
                
                <p className="font-medium">Alamat:</p>
                <p>{selectedJadwal.alamat}</p>
                
                <p className="font-medium">Jenis Ibadat:</p>
                <div className="text-sm">{getJenisIbadatBadge(selectedJadwal.jenisIbadat)}</div>
                
                <p className="font-medium">Sub Ibadat:</p>
                <p>{selectedJadwal.customSubIbadat || (selectedJadwal.subIbadat && getSubIbadatLabel(selectedJadwal.subIbadat)) || "-"}</p>
                
                <p className="font-medium">Tema:</p>
                <p>{selectedJadwal.temaIbadat || "-"}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Table */}
      <div className="border rounded-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Tanggal</TableHead>
              <TableHead className="min-w-[120px]">Tuan Rumah</TableHead>
              <TableHead className="hidden md:table-cell">Alamat</TableHead>
              <TableHead className="hidden md:table-cell">Telepon</TableHead>
              <TableHead className="w-[120px] whitespace-nowrap">Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentPageData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  Tidak ada jadwal ditemukan
                </TableCell>
              </TableRow>
            ) : (
              currentPageData.map((item) => (
                <TableRow 
                  key={item.id} 
                  className={onSelectDoling ? "cursor-pointer hover:bg-slate-50" : ""}
                  onClick={() => onSelectDoling && handleRowClick(item)}
                >
                  <TableCell className="font-medium">
                    {item.tanggal instanceof Date ? (
                      format(item.tanggal, "dd MMM yyyy", { locale: id })
                    ) : (
                      format(new Date(item.tanggal), "dd MMM yyyy", { locale: id })
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{item.tuanRumah}</span>
                      <span className="text-xs text-muted-foreground md:hidden">
                        {item.alamat}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{item.alamat}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {renderPhone(item)}
                  </TableCell>
                  <TableCell>{getStatusBadge(item.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation(); // Hindari trigger onClick pada TableRow
                          handleShowDetail(item);
                        }}
                      >
                        <CalendarIcon className="h-4 w-4" />
                        <span className="sr-only">View</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation(); // Hindari trigger onClick pada TableRow
                          onEdit(item);
                        }}
                        disabled={item.status === "selesai" && userRole !== "SUPER_USER"}
                      >
                        <PencilIcon className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation(); // Hindari trigger onClick pada TableRow
                            }}
                            disabled={item.status === "selesai" && userRole !== "SUPER_USER"}
                          >
                            <TrashIcon className="h-4 w-4" />
                            <span className="sr-only">Hapus</span>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
                            <AlertDialogDescription>
                              Apakah Anda yakin ingin menghapus jadwal ini? Tindakan ini tidak dapat dibatalkan.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel onClick={(e) => e.stopPropagation()}>Batal</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={(e) => {
                                e.stopPropagation(); // Hindari trigger onClick pada TableRow
                                onDelete(item.id);
                              }}
                            >
                              Hapus
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Pagination */}
      <div className="flex flex-col items-center justify-between gap-3 mt-2">
        {/* Tombol Navigasi */}
        <div className="flex items-center justify-center w-full gap-1 border rounded-md p-1.5 bg-gray-50">
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
          >
            <ChevronsLeftIcon className="h-3.5 w-3.5" />
            <span className="sr-only">Halaman pertama</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
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
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            <ChevronRightIcon className="h-3.5 w-3.5" />
            <span className="sr-only">Halaman berikutnya</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            onClick={() => setCurrentPage(totalPages)}
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
              {startIndex + 1}-{endIndex} dari {totalItems} jadwal
            </span>
            <span className="mx-1">•</span>
            <Select
              value={pageSize.toString()}
              onValueChange={(value) => {
                setPageSize(Number(value));
                setCurrentPage(1); // Reset to first page when changing page size
              }}
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
  );
} 