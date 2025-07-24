"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { StatusApproval } from "@prisma/client"
import { ExtendedApproval } from "../types"
import { 
  MessageCircleIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  MoreVertical,
  CheckIcon,
  XIcon,
  RotateCcwIcon,
  AlertCircleIcon,
  PencilIcon
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { EditDialog } from "./edit-dialog"
import { editApprovalNominal } from "../actions/edit-approval"
import { toast } from "sonner"

interface ApprovalTableProps {
  items: ExtendedApproval[]
  onApprove: (item: ExtendedApproval) => void
  onReject: (item: ExtendedApproval) => void
  onReset: (item: ExtendedApproval) => void
  userRole: string
  keluargaList: { id: string; namaKepalaKeluarga: string }[]
  onRefreshData?: () => Promise<void>
}

export function ApprovalTable({ items, onApprove, onReject, onReset, userRole, keluargaList, onRefreshData }: ApprovalTableProps) {
  const [selectedItem, setSelectedItem] = useState<ExtendedApproval | null>(null);
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'reset' | 'approve' | 'reject' | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [editValues, setEditValues] = useState({
    kolekteI: 0,
    kolekteII: 0,
    ucapanSyukur: 0,
    keterangan: "",
    namaPenyumbang: ""
  });
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // Calculate pagination values
  const totalItems = items.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  
  // Get current page data
  const currentItems = items.slice(startIndex, endIndex);
  
  // Reset to first page when items change
  useEffect(() => {
    setCurrentPage(1);
  }, [items.length]);
  
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

  const viewMessage = (item: ExtendedApproval) => {
    setSelectedItem(item);
    setMessageDialogOpen(true);
  };

  const handleResetStatus = (item: ExtendedApproval) => {
    setSelectedItem(item);
    setActionType('reset');
    setConfirmationDialogOpen(true);
  };

  const handleChangeStatus = (item: ExtendedApproval, newStatus: 'approve' | 'reject') => {
    setSelectedItem(item);
    setActionType(newStatus);
    setConfirmationDialogOpen(true);
  };

  const confirmAction = () => {
    if (!selectedItem || !actionType) return;
    
    if (actionType === 'reset') {
      onReset(selectedItem);
    } else if (actionType === 'approve') {
      onApprove(selectedItem);
    } else if (actionType === 'reject') {
      onReject(selectedItem);
    }
    
    setConfirmationDialogOpen(false);
  };

  // Fungsi untuk membuka dialog edit
  const handleEditNominal = (item: ExtendedApproval) => {
    if (!item.doaLingkungan) {
      toast.error("Data doa lingkungan tidak ditemukan");
      return;
    }
    
    setSelectedItem(item);
    setEditDialogOpen(true);
  };

  // Fungsi untuk menyimpan hasil edit
  const handleSaveEdit = async (values: any) => {
    if (!selectedItem || !selectedItem.doaLingkungan) {
      toast.error("Item tidak ditemukan");
      return;
    }
    
    setIsEditLoading(true);
    
    try {
      const response = await editApprovalNominal(selectedItem.id, {
        kolekteI: values.kolekteI,
        kolekteII: values.kolekteII,
        ucapanSyukur: values.ucapanSyukur,
        namaPenyumbang: values.namaPenyumbang
      });

      if (response.success) {
        toast.success(response.message || "Data berhasil diperbarui");
        setEditDialogOpen(false);
        
        // Gunakan callback refresh data jika tersedia
        if (onRefreshData) {
          await onRefreshData();
        }
      } else {
        toast.error(response.error || "Gagal memperbarui data");
      }
    } catch (error) {
      console.error("Error saving edit:", error);
      toast.error("Terjadi kesalahan saat menyimpan data");
    } finally {
      setIsEditLoading(false);
    }
  };

  // Fungsi untuk mendapatkan tanggal
  const getItemDate = (item: ExtendedApproval): Date => {
    if (item.doaLingkungan) {
      return new Date(item.doaLingkungan.tanggal);
    } else if (item.kasLingkungan) {
      return new Date(item.kasLingkungan.tanggal);
    }
    return new Date(item.createdAt);
  };

  // Fungsi untuk mendapatkan nilai kolekte I
  const getKolekteI = (item: ExtendedApproval): number => {
    return item.doaLingkungan?.kolekteI || 0;
  };

  // Fungsi untuk mendapatkan nilai kolekte II
  const getKolekteII = (item: ExtendedApproval): number => {
    return item.doaLingkungan?.kolekteII || 0;
  };

  // Fungsi untuk mendapatkan nilai ucapan syukur
  const getUcapanSyukur = (item: ExtendedApproval): number => {
    return item.doaLingkungan?.ucapanSyukur || 0;
  };

  // Fungsi untuk mengecek apakah ada ucapan syukur dalam data
  const hasUcapanSyukur = (items: ExtendedApproval[]): boolean => {
    return items.some(item => getUcapanSyukur(item) > 0);
  };

  // Fungsi untuk mendapatkan keterangan
  const getKeterangan = (item: ExtendedApproval): string => {
    if (item.doaLingkungan) {
      return item.doaLingkungan.tuanRumah.namaKepalaKeluarga;
    } else if (item.kasLingkungan?.keterangan) {
      return item.kasLingkungan.keterangan;
    }
    return '-';
  };

  // Fungsi untuk mendapatkan jumlah hadir
  const getJumlahHadir = (item: ExtendedApproval): number => {
    return item.doaLingkungan?.jumlahKKHadir || 0;
  };

  // Fungsi untuk mendapatkan total
  const getTotal = (item: ExtendedApproval): number => {
    if (item.doaLingkungan) {
      return item.doaLingkungan.kolekteI + item.doaLingkungan.kolekteII + item.doaLingkungan.ucapanSyukur;
    } else if (item.kasLingkungan) {
      return item.kasLingkungan.debit;
    }
    return 0;
  };

  // Cek apakah perlu menampilkan kolom ucapan syukur
  const showUcapanSyukurColumn = hasUcapanSyukur(currentItems);

  return (
    <div className="space-y-4">
      <div className="rounded-md border shadow-sm overflow-hidden">
        <div className="overflow-x-auto max-w-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[110px]">Tanggal</TableHead>
                <TableHead className="w-[100px]">Kolekte I</TableHead>
                <TableHead className="w-[100px]">Kolekte II</TableHead>
                {showUcapanSyukurColumn && (
                  <TableHead className="w-[120px]">Ucapan Syukur</TableHead>
                )}
                <TableHead className="min-w-[150px]">Tuan Rumah</TableHead>
                <TableHead className="w-[100px]">Jumlah Hadir</TableHead>
                <TableHead className="w-[100px]">Total</TableHead>
                <TableHead className="w-[100px]">Status</TableHead>
                <TableHead className="sticky right-0 bg-white shadow-md text-right w-[70px]">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentItems.length > 0 ? (
                currentItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{format(getItemDate(item), "dd/MM/yyyy", { locale: id })}</TableCell>
                    <TableCell>Rp {getKolekteI(item).toLocaleString('id-ID')}</TableCell>
                    <TableCell>Rp {getKolekteII(item).toLocaleString('id-ID')}</TableCell>
                    {showUcapanSyukurColumn && (
                      <TableCell>
                        {getUcapanSyukur(item) > 0 
                          ? `Rp ${getUcapanSyukur(item).toLocaleString('id-ID')}`
                          : '-'
                        }
                      </TableCell>
                    )}
                    <TableCell className="max-w-[200px] truncate" title={getKeterangan(item)}>{getKeterangan(item)}</TableCell>
                    <TableCell>{getJumlahHadir(item)} KK</TableCell>
                    <TableCell>Rp {getTotal(item).toLocaleString('id-ID')}</TableCell>
                    <TableCell>
                      <Badge
                        variant={item.status === StatusApproval.APPROVED ? 'success' : item.status === StatusApproval.REJECTED ? 'destructive' : 'outline'}
                        className={
                          item.status === StatusApproval.PENDING
                            ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
                            : item.status === StatusApproval.APPROVED
                            ? 'bg-green-100 text-green-800 hover:bg-green-100'
                            : 'bg-red-100 text-red-800 hover:bg-red-100'
                        }
                      >
                        {item.status === StatusApproval.PENDING
                          ? 'Menunggu'
                          : item.status === StatusApproval.APPROVED
                          ? 'Disetujui'
                          : 'Ditolak'}
                      </Badge>
                    </TableCell>
                    <TableCell className="sticky right-0 bg-white shadow-md text-right p-0 pr-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">Menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[200px]">
                          {item.status === StatusApproval.PENDING && (
                            <>
                              <DropdownMenuItem onClick={() => handleChangeStatus(item, 'approve')}>
                                <CheckIcon className="mr-2 h-4 w-4 text-green-600" />
                                <span>
                                  {getUcapanSyukur(item) > 0 ? 'Setujui' : 'Setujui (Tanpa Ucapan Syukur)'}
                                </span>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                            </>
                          )}
                          {item.doaLingkungan && (
                            <DropdownMenuItem onClick={() => handleEditNominal(item)}>
                              <PencilIcon className="mr-2 h-4 w-4 text-blue-600" />
                              <span>Edit Nominal</span>
                            </DropdownMenuItem>
                          )}
                          {(item.status === StatusApproval.APPROVED || item.status === StatusApproval.REJECTED) && 
                           userRole === 'SUPER_USER' && (
                            <DropdownMenuItem onClick={() => handleResetStatus(item)}>
                              <RotateCcwIcon className="mr-2 h-4 w-4 text-amber-600" />
                              <span>Reset Status</span>
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={showUcapanSyukurColumn ? 9 : 8} className="text-center py-10">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <AlertCircleIcon className="h-8 w-8 text-muted-foreground" />
                      <div className="text-muted-foreground">
                        <p className="text-sm">Tidak ada data yang ditemukan</p>
                        <p className="text-xs">Coba ubah filter atau kunjungi lain waktu</p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      {totalItems > 0 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <div>Baris per halaman:</div>
            <Select
              value={pageSize.toString()}
              onValueChange={handlePageSizeChange}
            >
              <SelectTrigger className="h-8 w-16">
                <SelectValue placeholder={pageSize.toString()} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
            <div className="text-xs">
              {startIndex + 1}-{endIndex} dari {totalItems}
            </div>
          </div>

          <div className="flex items-center gap-1 w-full sm:w-auto justify-center sm:justify-end">
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

            {/* Simplified pagination display for all screen sizes */}
            {totalPages <= 3 ? (
              // Show all pages if 3 or fewer
              <div className="flex items-center gap-1 mx-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => goToPage(page)}
                  >
                    {page}
                  </Button>
                ))}
              </div>
            ) : (
              // Show simplified pagination for more pages
              <div className="flex items-center gap-1 mx-1">
                {/* Current page always visible */}
                <Button
                  variant="default"
                  size="icon"
                  className="h-8 w-8"
                >
                  {currentPage}
                </Button>
                
                {/* Show total pages counter instead of too many buttons */}
                <span className="text-xs text-muted-foreground mx-1 whitespace-nowrap">
                  dari {totalPages}
                </span>
              </div>
            )}

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
      )}

      {/* Message Dialog */}
      <Dialog open={messageDialogOpen} onOpenChange={setMessageDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Detail Pesan</DialogTitle>
            <DialogDescription>
              {selectedItem?.status === StatusApproval.APPROVED
                ? "Informasi persetujuan"
                : "Alasan pengeditan/penolakan"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="rounded-lg bg-muted p-4">
              <p className="text-sm">
                {selectedItem?.status === StatusApproval.REJECTED
                  ? "Alasan: " + (selectedItem as any)?.reason || "Tidak ada alasan yang diberikan."
                  : (selectedItem as any)?.message || "Tidak ada pesan."}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMessageDialogOpen(false)}>
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={confirmationDialogOpen} onOpenChange={setConfirmationDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve'
                ? 'Konfirmasi Persetujuan'
                : actionType === 'reject'
                ? 'Konfirmasi Penolakan'
                : 'Reset Status'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'approve'
                ? 'Apakah Anda yakin ingin menyetujui item ini? Data akan diintegrasikan ke Kas Lingkungan.'
                : actionType === 'reject'
                ? 'Apakah Anda yakin ingin menolak item ini?'
                : 'Apakah Anda yakin ingin mereset status item ini ke Menunggu Persetujuan?'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmationDialogOpen(false)}>
              Batal
            </Button>
            <Button
              variant={actionType === 'approve' ? 'default' : actionType === 'reject' ? 'destructive' : 'secondary'}
              onClick={confirmAction}
            >
              {actionType === 'approve'
                ? 'Setujui'
                : actionType === 'reject'
                ? 'Tolak'
                : 'Reset'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <EditDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        selectedItem={selectedItem}
        onSave={handleSaveEdit}
        isLoading={isEditLoading}
        keluargaList={keluargaList}
      />
    </div>
  );
} 