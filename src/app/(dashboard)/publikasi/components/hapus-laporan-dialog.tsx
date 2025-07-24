"use client"

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Laporan } from "../types/publikasi"

interface HapusLaporanDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  laporan: Laporan;
  onDelete?: (id: string) => void;
}

export default function HapusLaporanDialog({
  open = false,
  onOpenChange,
  laporan,
  onDelete
}: HapusLaporanDialogProps) {
  const [dialogOpen, setDialogOpen] = useState(open);
  const [isDeleting, setIsDeleting] = useState(false);

  // Sync internal open state with props
  useEffect(() => {
    setDialogOpen(open);
  }, [open]);

  const handleOpenChange = (newOpen: boolean) => {
    setDialogOpen(newOpen);
    if (onOpenChange) {
      onOpenChange(newOpen);
    }
  };

  const handleDelete = async () => {
    if (!laporan?.id) {
      toast.error("ID laporan tidak valid");
      return;
    }

    setIsDeleting(true);

    try {
      // Call the external onDelete handler if provided
      if (onDelete) {
        await onDelete(laporan.id);
      } else {
        // Fallback behavior if no onDelete provided
        setTimeout(() => {
          toast.success("Laporan berhasil dihapus");
          setIsDeleting(false);
          handleOpenChange(false);
        }, 1000);
      }
    } catch (error) {
      toast.error("Gagal menghapus laporan", {
        description: "Terjadi kesalahan saat menghapus data"
      });
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
      {!onOpenChange && (
        <DialogTrigger asChild>
          <Button variant="outline" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50">
            <Trash2 className="h-4 w-4" />
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Hapus Laporan</DialogTitle>
          <DialogDescription>
            Anda yakin ingin menghapus laporan ini? Tindakan ini tidak dapat dibatalkan.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="bg-gray-50 p-4 rounded-md">
            <p className="font-medium mb-1">{laporan?.judul}</p>
            <p className="text-sm text-gray-500 mb-1">
              {laporan?.jenis && <span className="inline-block mr-2">Jenis: {laporan.jenis}</span>}
              {laporan?.tanggal && (
                <span>
                  Tanggal: {new Date(laporan.tanggal).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </span>
              )}
            </p>
            {laporan?.keterangan && (
              <p className="text-sm text-gray-600 line-clamp-2">{laporan.keterangan}</p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
            Batal
          </Button>
          <Button 
            type="button" 
            variant="destructive" 
            onClick={handleDelete} 
            disabled={isDeleting}
          >
            {isDeleting ? "Menghapus..." : "Hapus Laporan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 