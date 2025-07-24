"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Agenda } from "../types";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";

interface AgendaDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agenda: Agenda | undefined;
}

export function AgendaDetailDialog({
  open,
  onOpenChange,
  agenda,
}: AgendaDetailDialogProps) {
  if (!agenda) return null;

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

  // Helper untuk mendapatkan nama dari createdBy
  const getCreatedByName = (createdBy: string | { id: string; name: string }): string => {
    if (!createdBy) return "Unknown";
    return typeof createdBy === 'object' ? createdBy.name : `User ${createdBy}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl">{agenda.title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 mt-4 overflow-y-auto pr-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Tanggal</h3>
                <p className="text-base">{format(new Date(agenda.date), 'dd MMMM yyyy', { locale: id })}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Lokasi</h3>
                <p className="text-base">{agenda.location}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Nama Pengaju</h3>
                <p className="text-base">{getCreatedByName(agenda.createdBy)}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Target</h3>
                <p className="text-base">{getTargetText(agenda.target)}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                <div className="flex items-center space-x-2">
                  <Badge 
                    variant={getStatusVariant(agenda.status)} 
                    className={`mt-1 ${getStatusColor(agenda.status)}`}
                  >
                    {getStatusText(agenda.status)}
                  </Badge>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Tanggal Pengajuan</h3>
                <p className="text-base">{format(new Date(agenda.createdAt), 'dd MMMM yyyy', { locale: id })}</p>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Deskripsi</h3>
            <p className="text-base whitespace-pre-wrap">{agenda.description === '' ? "Tidak ada deskripsi" : agenda.description}</p>
          </div>
          
          {agenda.completedAt && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Tanggal Selesai</h3>
              <p className="text-base">{format(new Date(agenda.completedAt), 'dd MMMM yyyy', { locale: id })}</p>
            </div>
          )}
          
          {agenda.rejectionReason && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Alasan Penolakan</h3>
              <p className="text-base text-red-600">{agenda.rejectionReason}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 