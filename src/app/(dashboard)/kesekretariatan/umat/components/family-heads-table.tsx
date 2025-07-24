"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2, Download, User, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, X, Search, AlertCircle, Trash } from "lucide-react";
import { FamilyHeadWithDetails } from "../types";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { DeleteConfirmationDialog } from "./delete-confirmation-dialog";
import { PermanentDeleteDialog } from "./permanent-delete-dialog";
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
import { StatusKehidupan } from "@prisma/client";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/auth-context";

interface FamilyHeadsTableProps {
  familyHeads: FamilyHeadWithDetails[];
  isLoading?: boolean;
  onEdit: (familyHead: FamilyHeadWithDetails) => void;
  onDelete: (id: string, reason: "moved" | "deceased" | "member_deceased", memberName?: string) => Promise<void>;
  onPermanentDelete: (id: string) => Promise<void>;
  onExportTemplate: () => void;
  onImportData: () => void;
  canModifyData?: boolean;
}

export function FamilyHeadsTable({
  familyHeads,
  isLoading = false,
  onEdit,
  onDelete,
  onPermanentDelete,
  onExportTemplate,
  onImportData,
  canModifyData = true,
}: FamilyHeadsTableProps) {
  const { userRole } = useAuth();
  
  // Dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [permanentDeleteDialogOpen, setPermanentDeleteDialogOpen] = useState(false);
  const [selectedFamilyHead, setSelectedFamilyHead] = useState<FamilyHeadWithDetails | null>(null);
  
  // Check if user is SUPER_USER
  const isSuperUser = userRole === 'SUPER_USER';
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusKehidupan | null>(null);
  
  const statusOptions = [
    { value: null, label: "Semua Status", key: "all" },
    { value: StatusKehidupan.HIDUP, label: "Hidup", key: "active" },
    { value: StatusKehidupan.PINDAH, label: "Pindah", key: "moved" },
    { value: StatusKehidupan.MENINGGAL, label: "Meninggal", key: "deceased" },
  ];

  const handleDelete = async (id: string, reason: "moved" | "deceased" | "member_deceased", memberName?: string) => {
    try {
      await onDelete(id, reason, memberName);
      
      let successMessage = "";
      if (reason === "moved") {
        successMessage = "Status kepala keluarga berhasil diubah menjadi Pindah.";
      } else if (reason === "deceased") {
        successMessage = "Status seluruh keluarga berhasil diubah menjadi Meninggal.";
      } else if (reason === "member_deceased") {
        successMessage = `Status ${memberName} berhasil diubah menjadi Meninggal.`;
      }
      
      toast.success(successMessage);
    } catch (error) {
      toast.error("Terjadi kesalahan saat memperbarui status");
    } finally {
      setDeleteDialogOpen(false);
      setSelectedFamilyHead(null);
    }
  };

  const handlePermanentDelete = async (id: string) => {
    try {
      await onPermanentDelete(id);
    } catch (error) {
      toast.error("Terjadi kesalahan saat menghapus data secara permanen");
    } finally {
      setPermanentDeleteDialogOpen(false);
      setSelectedFamilyHead(null);
    }
  };

  const getStatusBadge = (status: StatusKehidupan) => {
    switch (status) {
      case StatusKehidupan.HIDUP:
        return <Badge variant="outline" className="bg-green-100 hover:bg-green-100">Hidup</Badge>;
      case StatusKehidupan.PINDAH:
        return <Badge variant="outline" className="bg-blue-100 hover:bg-blue-100">Pindah</Badge>;
      case StatusKehidupan.MENINGGAL:
        return <Badge variant="outline" className="bg-gray-100 hover:bg-gray-100">Meninggal</Badge>;
      default:
        return <Badge variant="outline">Hidup</Badge>;
    }
  };
  
  // Filter data
  const filteredFamilyHeads = familyHeads.filter(familyHead => {
    // Search term filter
    const matchesSearch = searchTerm === "" || 
      familyHead.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (familyHead.nomorTelepon && familyHead.nomorTelepon.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Status filter
    const matchesStatus = statusFilter === null || familyHead.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);
  
  // Pagination calculations
  const totalItems = filteredFamilyHeads.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  
  // Get current page data
  const currentData = filteredFamilyHeads
    .sort((a, b) => a.nama.localeCompare(b.nama)) // Sort by name
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

  return (
    <div className="space-y-4">
      {/* Filters and Actions */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        {/* Search */}
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari kepala keluarga..."
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
        
        {/* Filter Status */}
        <div className="flex items-center gap-2">
          <div className="w-40">
            <Select
              value={statusFilter || "all"}
              onValueChange={(value) => setStatusFilter(value === "all" ? null : value as StatusKehidupan)}
            >
              <SelectTrigger id="status-filter" className="w-full">
                <SelectValue placeholder="Filter Status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map(option => (
                  <SelectItem key={option.key} value={option.value || "all"}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="w-full sm:w-auto"
                disabled={!canModifyData}
              >
                <Download className="mr-2 h-4 w-4" />
                Template Excel
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Unduh Template Excel</AlertDialogTitle>
                <AlertDialogDescription>
                  Template ini dapat Anda gunakan untuk mempersiapkan data yang akan diimpor.
                  Harap perhatikan format dan kolom yang dibutuhkan.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Batal</AlertDialogCancel>
                <AlertDialogAction onClick={onExportTemplate}>Unduh</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          
          <Button
            variant="outline"
            size="sm"
            className="w-full sm:w-auto"
            onClick={onImportData}
            disabled={!canModifyData}
          >
            <User className="mr-2 h-4 w-4" />
            Import Data
          </Button>
        </div>
      </div>
      
      {/* Table */}
      <div className="border rounded-lg">
        <div className="overflow-x-auto relative">
          <Table className="table-auto min-w-[800px] lg:w-full">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px] whitespace-nowrap">No</TableHead>
                <TableHead className="whitespace-nowrap min-w-[120px]">Nama KK</TableHead>
                <TableHead className="whitespace-nowrap min-w-[110px]">No. Telepon</TableHead>
                <TableHead className="whitespace-nowrap min-w-[120px]">Tanggal Bergabung</TableHead>
                <TableHead className="whitespace-nowrap min-w-[120px]">Jumlah Jiwa</TableHead>
                <TableHead className="whitespace-nowrap min-w-[80px]">Status</TableHead>
                <TableHead className="whitespace-nowrap min-w-[120px]">Tgl Pindah/Meninggal</TableHead>
                {canModifyData && <TableHead className="sticky right-0 bg-white shadow-[-4px_0_4px_rgba(0,0,0,0.05)] w-[70px]">Aksi</TableHead>}
              </TableRow>
            </TableHeader>
            
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={`skeleton-${index}`}>
                    <TableCell><Skeleton className="h-4 w-6" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    {canModifyData && <TableCell><Skeleton className="h-8 w-8" /></TableCell>}
                  </TableRow>
                ))
              ) : currentData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={canModifyData ? 8 : 7} className="h-24 text-center">
                    Tidak ada data yang sesuai dengan filter
                  </TableCell>
                </TableRow>
              ) : (
                currentData.map((familyHead, index) => (
                  <TableRow key={familyHead.id}>
                    <TableCell>{startIndex + index + 1}</TableCell>
                    <TableCell className="font-medium min-w-[120px]">
                      {familyHead.nama}
                    </TableCell>
                    <TableCell className="min-w-[110px]">{familyHead.nomorTelepon || "-"}</TableCell>
                    <TableCell className="min-w-[120px]">
                      {familyHead.tanggalBergabung && !isNaN(familyHead.tanggalBergabung.getTime()) 
                        ? format(familyHead.tanggalBergabung, "dd MMM yyyy", {
                            locale: id,
                          })
                        : "Tanggal tidak valid"}
                    </TableCell>
                    <TableCell className="min-w-[120px]">
                      <div>
                        <span className="font-medium">{familyHead.livingMemberCount} jiwa</span>
                        {familyHead.deceasedMemberCount > 0 && (
                          <span className="text-red-500 text-sm ml-1">
                            (+{familyHead.deceasedMemberCount} meninggal)
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        <ul className="list-disc pl-4">
                          {familyHead.status === StatusKehidupan.HIDUP ? (
                            <li>1 Kepala Keluarga</li>
                          ) : familyHead.status === StatusKehidupan.MENINGGAL ? (
                            <li className="text-red-500">1 Kepala Keluarga (Meninggal)</li>
                          ) : familyHead.status === StatusKehidupan.PINDAH ? (
                            <li className="text-blue-500">1 Kepala Keluarga (Pindah)</li>
                          ) : (
                            <li>1 Kepala Keluarga</li>
                          )}
                          
                          {familyHead.pasangan && (
                            familyHead.pasangan.status === 'HIDUP' ? (
                              <li>1 Pasangan/Istri</li>
                            ) : (
                              <li className="text-red-500">1 Pasangan/Istri (Meninggal)</li>
                            )
                          )}
                          
                          {familyHead.tanggungan.filter(t => t.jenisTanggungan === 'ANAK' && t.status === 'HIDUP').length > 0 && (
                            <li>{familyHead.tanggungan.filter(t => t.jenisTanggungan === 'ANAK' && t.status === 'HIDUP').length} Anak</li>
                          )}
                          {familyHead.tanggungan.filter(t => t.jenisTanggungan === 'ANAK' && t.status === 'MENINGGAL').length > 0 && (
                            <li className="text-red-500">{familyHead.tanggungan.filter(t => t.jenisTanggungan === 'ANAK' && t.status === 'MENINGGAL').length} Anak (Meninggal)</li>
                          )}
                          
                          {familyHead.tanggungan.filter(t => t.jenisTanggungan === 'KERABAT' && t.status === 'HIDUP').length > 0 && (
                            <li>{familyHead.tanggungan.filter(t => t.jenisTanggungan === 'KERABAT' && t.status === 'HIDUP').length} Kerabat</li>
                          )}
                          {familyHead.tanggungan.filter(t => t.jenisTanggungan === 'KERABAT' && t.status === 'MENINGGAL').length > 0 && (
                            <li className="text-red-500">{familyHead.tanggungan.filter(t => t.jenisTanggungan === 'KERABAT' && t.status === 'MENINGGAL').length} Kerabat (Meninggal)</li>
                          )}
                          
                          {familyHead.tanggalKeluar && (
                            <li className="text-orange-500">Keluarga Pindah Domisili</li>
                          )}
                        </ul>
                      </div>
                    </TableCell>
                    <TableCell className="min-w-[80px]">{getStatusBadge(familyHead.status)}</TableCell>
                    <TableCell className="min-w-[120px]">
                      {familyHead.status === StatusKehidupan.PINDAH && familyHead.tanggalKeluar && !isNaN(familyHead.tanggalKeluar.getTime()) ? (
                        <div>
                          <span className="text-blue-600">{format(familyHead.tanggalKeluar, "dd MMM yyyy", { locale: id })}</span>
                          <div className="text-xs text-blue-500">Pindah</div>
                        </div>
                      ) : familyHead.status === StatusKehidupan.MENINGGAL && familyHead.tanggalMeninggal && !isNaN(familyHead.tanggalMeninggal.getTime()) ? (
                        <div>
                          <span className="text-red-600">{format(familyHead.tanggalMeninggal, "dd MMM yyyy", { locale: id })}</span>
                          <div className="text-xs text-red-500">Meninggal</div>
                        </div>
                      ) : "-"}
                    </TableCell>
                    {canModifyData && (
                      <TableCell className="sticky right-0 bg-white shadow-[-4px_0_4px_rgba(0,0,0,0.05)]">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Buka menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => onEdit(familyHead)}
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedFamilyHead(familyHead);
                                setDeleteDialogOpen(true);
                              }}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Ubah Status
                            </DropdownMenuItem>
                            {isSuperUser && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedFamilyHead(familyHead);
                                    setPermanentDeleteDialogOpen(true);
                                  }}
                                  className="text-destructive focus:text-destructive"
                                >
                                  <Trash className="mr-2 h-4 w-4" />
                                  Hapus Permanen
                                </DropdownMenuItem>
                              </>
                            )}
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
        <div className="flex items-center justify-between p-4 border-t">
          <div className="text-sm text-muted-foreground">
            Menampilkan {totalItems === 0 ? 0 : startIndex + 1} hingga {endIndex} dari {totalItems} data
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="flex items-center mr-4">
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
              <span className="ml-2 text-sm text-muted-foreground">per halaman</span>
            </div>
            
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={goToFirstPage}
              disabled={currentPage === 1 || totalPages === 0}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={goToPreviousPage}
              disabled={currentPage === 1 || totalPages === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <span className="text-sm">
              Halaman {totalPages === 0 ? 0 : currentPage} dari {totalPages}
            </span>
            
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={goToNextPage}
              disabled={currentPage === totalPages || totalPages === 0}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={goToLastPage}
              disabled={currentPage === totalPages || totalPages === 0}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        familyHead={selectedFamilyHead}
        onConfirm={handleDelete}
      />
      
      {/* Permanent Delete Confirmation Dialog - Only for SUPER_USER */}
      {isSuperUser && (
        <PermanentDeleteDialog
          open={permanentDeleteDialogOpen}
          onOpenChange={setPermanentDeleteDialogOpen}
          familyHead={selectedFamilyHead}
          onConfirm={handlePermanentDelete}
        />
      )}
    </div>
  );
} 