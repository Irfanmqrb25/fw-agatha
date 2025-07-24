"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Agenda } from "../types";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, ClockIcon, MapPinIcon, FileIcon, Download, Paperclip } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { DialogFooter } from "@/components/ui/dialog";

interface AgendaViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agenda?: Agenda;
}

export function AgendaViewDialog({
  open,
  onOpenChange,
  agenda
}: AgendaViewDialogProps) {
  if (!agenda) return null;
  
  // Format tanggal dan waktu
  const formattedDate = format(new Date(agenda.date), "EEEE, dd MMMM yyyy", { locale: id });
  const formattedTime = format(new Date(agenda.date), "HH:mm", { locale: id });
  
  // Status badge variant
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'open': return "outline";
      case 'processing_lingkungan':
      case 'processing_stasi':
      case 'processing_paroki':
      case 'forwarded_to_paroki': return "secondary";
      case 'completed': return "default";
      case 'rejected': return "destructive";
      default: return "outline";
    }
  };
  
  // Status dan target text
  const getStatusText = (status: string) => {
    switch (status) {
      case 'open': return "Menunggu";
      case 'processing_lingkungan': return "Diproses Lingkungan";
      case 'processing_stasi': return "Diproses Stasi";
      case 'processing_paroki': return "Diproses Paroki";
      case 'forwarded_to_paroki': return "Diteruskan ke Paroki";
      case 'completed': return "Selesai";
      case 'rejected': return "Ditolak";
      default: return status;
    }
  };
  
  const getTargetText = (target: string) => {
    switch (target) {
      case 'lingkungan': return "DPL (Lingkungan)";
      case 'stasi': return "DPS (Stasi)";
      case 'paroki': return "DPP (Paroki)";
      default: return target;
    }
  };

  // Handle download attachment
  const handleDownloadAttachment = () => {
    if (agenda.attachment?.fileUrl) {
      window.open(agenda.attachment.fileUrl, '_blank');
    }
  };

  const displayCreator = (agenda: Agenda) => {
    const createdBy = agenda.createdBy;
    if (typeof createdBy === 'object' && createdBy !== null && 'name' in createdBy) {
      return createdBy.name;
    }
    return `User ${createdBy}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Detail Agenda</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 overflow-y-auto pr-2">
          {/* Judul dan status */}
          <div className="flex flex-col md:flex-row gap-2 md:items-center justify-between">
            <h2 className="text-xl font-bold">{agenda.title}</h2>
            <Badge variant={getStatusVariant(agenda.status)}>
              {getStatusText(agenda.status)}
            </Badge>
          </div>
          
          {/* Informasi agenda dalam layout grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Tanggal</h3>
                <p>{formattedDate}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Lokasi</h3>
                <p>{agenda.location}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Tujuan</h3>
                <p>{getTargetText(agenda.target)}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Pengaju</h3>
                <p>{displayCreator(agenda)}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Tanggal Pengajuan</h3>
                <p>{format(new Date(agenda.createdAt), 'dd MMM yyyy HH:mm', { locale: id })}</p>
              </div>
              {agenda.completedAt && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Tanggal Selesai</h3>
                  <p>{format(new Date(agenda.completedAt), 'dd MMM yyyy HH:mm', { locale: id })}</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Deskripsi */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Deskripsi</h3>
            <p className="whitespace-pre-wrap">{agenda.description === '' ? "Tidak ada deskripsi" : agenda.description}</p>
          </div>
          
          {/* Lampiran jika ada */}
          {agenda.attachment && (
            <>
              <Separator />
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Lampiran</h3>
                <div className="flex items-center justify-between p-3 border rounded-md bg-muted/20">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-md">
                      <Paperclip className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{agenda.attachment.originalName}</p>
                      <p className="text-xs text-muted-foreground">{agenda.attachment.fileType}</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1"
                    onClick={handleDownloadAttachment}
                  >
                    <Download className="h-4 w-4" />
                    <span>Download</span>
                  </Button>
                </div>
              </div>
            </>
          )}
          
          {/* Informasi pengajuan */}
          <div className="text-xs text-muted-foreground">
            {agenda.status === 'rejected' && agenda.rejectionReason && (
              <div className="mt-2 p-2 border border-destructive/30 rounded-md">
                <p className="font-medium text-destructive">Alasan Penolakan:</p>
                <p>{agenda.rejectionReason}</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 