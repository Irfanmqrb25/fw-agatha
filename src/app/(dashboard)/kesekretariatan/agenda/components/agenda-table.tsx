"use client";

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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Agenda } from "../types";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { ChevronDown, Edit, Eye, MoreVertical, Trash, Play, CheckCircle, X, AlertCircle, ArrowRight, Paperclip, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/auth-context";
import { useState } from "react";
import { AgendaDetailDialog } from "./agenda-detail-dialog";
import { useSession } from "next-auth/react";
import { AgendaViewDialog } from "./agenda-view-dialog";

interface AgendaTableProps {
  agendas: Agenda[];
  onProcess: (id: string) => void;
  onUpdateStatus: (id: string) => void;
  onFinalResult: (id: string) => void;
  onDelete: (id: string) => void;
  onReject: (id: string) => void;
  onEdit: (id: string) => void;
  userRole?: string;
}

export function AgendaTable({ 
  agendas, 
  onProcess, 
  onUpdateStatus, 
  onFinalResult, 
  onDelete, 
  onReject,
  onEdit,
  userRole 
}: AgendaTableProps) {
  const { data: session } = useSession();
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedAgenda, setSelectedAgenda] = useState<Agenda | undefined>(undefined);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  
  // Definisikan daftar peran yang diizinkan untuk melakukan aksi administratif
  const AUTHORIZED_ROLES = [
    'SUPER_USER', 
    'KETUA', 
    'WAKIL_KETUA',
    'BENDAHARA', 
    'WAKIL_BENDAHARA',
    'SEKRETARIS',
    'WAKIL_SEKRETARIS'
  ];
  
  // Helper untuk mendapatkan ID dari createdBy (yang bisa string atau object)
  const getCreatedById = (createdBy: string | { id: string; name: string }): string => {
    return typeof createdBy === 'string' ? createdBy : createdBy.id;
  };
  
  // Helper untuk mendapatkan nama dari createdBy
  const getCreatedByName = (createdBy: string | { id: string; name: string }): string => {
    return typeof createdBy === 'string' ? `User ${createdBy}` : createdBy.name;
  };
  
  const handleViewDetail = (agenda: Agenda) => {
    setSelectedAgenda(agenda);
    setDetailDialogOpen(true);
  };
  
  const getStatusColor = (status: Agenda['status']) => {
    switch (status) {
      case 'open':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'processing_lingkungan':
      case 'processing_stasi':
      case 'processing_paroki':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'forwarded_to_paroki':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'rejected':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'completed':
        return 'bg-green-50 text-green-700 border-green-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusVariant = (status: Agenda['status']) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'rejected':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getStatusText = (status: Agenda['status']) => {
    switch (status) {
      case 'open':
        return 'Menunggu';
      case 'processing_lingkungan':
        return 'Diproses di Lingkungan';
      case 'processing_stasi':
        return 'Diproses di Stasi';
      case 'processing_paroki':
        return 'Diproses di Paroki';
      case 'forwarded_to_paroki':
        return 'Diteruskan ke Paroki';
      case 'rejected':
        return 'Ditolak';
      case 'completed':
        return 'Selesai';
      default:
        return status;
    }
  };

  const getTargetText = (target: Agenda['target']) => {
    switch (target) {
      case 'lingkungan':
        return 'DPL (Lingkungan)';
      case 'stasi':
        return 'DPS (Stasi)';
      case 'paroki':
        return 'DPP (Paroki)';
      default:
        return target;
    }
  };

  const canProcess = (agenda: Agenda, role: string | undefined) => {
    // Periksa apakah role ada dalam daftar yang diizinkan untuk memproses agenda
    return AUTHORIZED_ROLES.includes(role || '') && agenda.status === 'open';
  };

  const canUpdateStatus = (agenda: Agenda, role: string | undefined) => {
    // Periksa apakah role ada dalam daftar yang diizinkan untuk mengupdate status agenda
    return AUTHORIZED_ROLES.includes(role || '') && ['processing_lingkungan', 'processing_stasi', 'processing_paroki'].includes(agenda.status);
  };

  const canFinalResult = (agenda: Agenda, role: string | undefined) => {
    // Periksa apakah role ada dalam daftar yang diizinkan untuk memberikan hasil akhir
    return AUTHORIZED_ROLES.includes(role || '') && agenda.status === 'forwarded_to_paroki';
  };

  const isCreator = (agenda: Agenda) => {
    // Dapatkan user ID langsung dari session di setiap pemanggilan fungsi
    const userId = session?.user?.id;
    
    if (!userId) {
      return false;
    }
    
    const creatorId = getCreatedById(agenda.createdBy);
    return creatorId === userId;
  };

  const canDelete = (agenda: Agenda, role: string | undefined) => {
    // SuperUser dan pembuat agenda yang open dapat menghapus
    if (role === 'SUPER_USER') return true;
    if (role === 'UMAT' && isCreator(agenda) && agenda.status === 'open') return true;
    // Peran dengan wewenang dapat menghapus agenda yang masih open
    return AUTHORIZED_ROLES.includes(role || '') && agenda.status === 'open';
  };

  const canEdit = (agenda: Agenda) => {
    // Hanya creator yang dapat mengedit agenda dengan status open
    const isCreatorResult = isCreator(agenda);
    const statusOk = agenda.status === 'open';
    return isCreatorResult && statusOk;
  };

  const canReject = (agenda: Agenda, role: string | undefined) => {
    // Periksa apakah role ada dalam daftar yang diizinkan untuk menolak agenda
    return AUTHORIZED_ROLES.includes(role || '') && agenda.status === 'open';
  };

  // Menambahkan fungsi untuk download lampiran
  const handleDownloadAttachment = (agenda: Agenda) => {
    if (agenda.attachment?.fileUrl) {
      window.open(agenda.attachment.fileUrl, '_blank');
    }
  };

  // Fungsi untuk membuka dialog view
  const handleViewAgenda = (agenda: Agenda) => {
    setSelectedAgenda(agenda);
    setIsViewDialogOpen(true);
  };

  return (
    <>
      <div className="rounded-md border">
        <div className="w-full overflow-auto">
          <Table className="w-full min-w-[650px]">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[180px]">Judul</TableHead>
                <TableHead className="w-[90px]">Tanggal</TableHead>
                <TableHead className="w-[110px]">Tujuan</TableHead>
                <TableHead className="w-[130px] hidden md:table-cell">Status</TableHead>
                <TableHead className="w-[120px] hidden md:table-cell">Pengaju</TableHead>
                <TableHead className="w-[60px] text-center sticky right-0 bg-background shadow-sm">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {agendas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                    Tidak ada agenda yang sesuai dengan pencarian
                  </TableCell>
                </TableRow>
              ) : (
                agendas.map((agenda) => (
                  <TableRow key={agenda.id}>
                    <TableCell className="font-medium">
                      <div className="max-w-[180px] truncate">
                        <div className="text-sm font-medium text-left truncate">
                          {agenda.title}
                          {agenda.attachment && (
                            <Paperclip className="inline-block ml-1 h-3 w-3 text-muted-foreground" />
                          )}
                        </div>
                        <div className="md:hidden flex items-center gap-1 mt-1">
                          <Badge 
                            variant={getStatusVariant(agenda.status)} 
                            className={`${getStatusColor(agenda.status)} w-max text-xs px-1 py-0`}
                          >
                            {getStatusText(agenda.status)}
                          </Badge>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {format(new Date(agenda.date), 'dd/MM/yyyy', { locale: id })}
                    </TableCell>
                    <TableCell>
                      <div className="truncate max-w-[110px]">{getTargetText(agenda.target)}</div>
                      <div className="md:hidden text-xs text-muted-foreground mt-1 truncate max-w-[110px]">
                        {getCreatedByName(agenda.createdBy)}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge 
                        variant={getStatusVariant(agenda.status)} 
                        className={`${getStatusColor(agenda.status)} w-max`}
                      >
                        {getStatusText(agenda.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="truncate max-w-[120px]">
                        {getCreatedByName(agenda.createdBy)}
                      </div>
                    </TableCell>
                    <TableCell className="sticky right-0 bg-background shadow-sm p-0 text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <span className="sr-only">Buka menu</span>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          
                          <DropdownMenuItem onClick={() => handleViewAgenda(agenda)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Lihat Detail
                          </DropdownMenuItem>

                          {canEdit(agenda) && (
                            <DropdownMenuItem onClick={() => onEdit(agenda.id)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                          )}

                          {canProcess(agenda, userRole) && (
                            <DropdownMenuItem onClick={() => onProcess(agenda.id)}>
                              Proses
                            </DropdownMenuItem>
                          )}

                          {canUpdateStatus(agenda, userRole) && (
                            <DropdownMenuItem onClick={() => onUpdateStatus(agenda.id)}>
                              Update Status
                            </DropdownMenuItem>
                          )}

                          {canFinalResult(agenda, userRole) && (
                            <DropdownMenuItem onClick={() => onFinalResult(agenda.id)}>
                              Hasil Akhir
                            </DropdownMenuItem>
                          )}

                          {canReject(agenda, userRole) && (
                            <DropdownMenuItem onClick={() => onReject(agenda.id)}>
                              Tolak
                            </DropdownMenuItem>
                          )}

                          {canDelete(agenda, userRole) && isCreator(agenda) && (
                            <DropdownMenuItem 
                              onClick={() => onDelete(agenda.id)}
                              className="text-red-600 focus:text-red-600"
                            >
                              Hapus
                            </DropdownMenuItem>
                          )}

                          {agenda.attachment && (
                            <DropdownMenuItem onClick={() => handleDownloadAttachment(agenda)}>
                              <Download className="mr-2 h-4 w-4" />
                              Download Lampiran
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
      </div>
      
      <AgendaDetailDialog 
        open={detailDialogOpen} 
        onOpenChange={setDetailDialogOpen} 
        agenda={selectedAgenda} 
      />

      <AgendaViewDialog 
        open={isViewDialogOpen} 
        onOpenChange={setIsViewDialogOpen} 
        agenda={selectedAgenda} 
      />
    </>
  );
} 