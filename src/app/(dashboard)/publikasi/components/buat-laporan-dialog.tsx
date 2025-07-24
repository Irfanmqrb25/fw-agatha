"use client"

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { 
  FileText,
  Plus
} from "lucide-react"
import { JENIS_LAPORAN } from "../utils/constants"
import { toast } from "sonner"
import { Publikasi } from "../types/publikasi"

interface FormValues {
  type: string;
  description: string;
  publikasiId?: string;
}

interface BuatLaporanDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  publikasi?: Publikasi;
  onSubmit?: (values: FormValues) => void;
}

export default function BuatLaporanDialog({
  open = false,
  onOpenChange,
  publikasi,
  onSubmit
}: BuatLaporanDialogProps) {
  const [dialogOpen, setDialogOpen] = useState(open);
  const [type, setType] = useState("")
  const [description, setDescription] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Sync internal open state with props
  useEffect(() => {
    setDialogOpen(open);
  }, [open]);

  const handleOpenChange = (newOpen: boolean) => {
    setDialogOpen(newOpen);
    if (onOpenChange) {
      onOpenChange(newOpen);
    }
    if (!newOpen) resetForm();
  };

  const handleSubmit = async () => {
    if (!type || !description) {
      toast.error("Silakan lengkapi semua kolom yang diperlukan")
      return
    }

    setIsSubmitting(true)

    // Prepare form values
    const formValues = {
      type,
      description,
      publikasiId: publikasi?.id
    };

    // Call the external onSubmit handler if provided
    if (onSubmit) {
      onSubmit(formValues);
    } else {
      // Fallback behavior if no onSubmit provided
      setTimeout(() => {
        toast.success("Laporan berhasil disimpan", {
          description: "Laporan telah berhasil ditambahkan ke sistem"
        });
        
        resetForm();
        setIsSubmitting(false);
        handleOpenChange(false);
      }, 1500);
    }
  }

  const resetForm = () => {
    setType("")
    setDescription("")
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
      {!onOpenChange && !publikasi && (
        <DialogTrigger asChild>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Buat Laporan
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[525px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Buat Laporan</DialogTitle>
          <DialogDescription>
            {publikasi ? `Buat laporan untuk publikasi "${publikasi.judul}"` : 'Input data laporan untuk disimpan dalam sistem'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="type" className="text-right">
              Jenis Laporan
            </Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger id="type" className="col-span-3">
                <SelectValue placeholder="Pilih jenis laporan" />
              </SelectTrigger>
              <SelectContent>
                {JENIS_LAPORAN.map((jenis) => (
                  <SelectItem key={jenis.id} value={jenis.id}>
                    {jenis.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="description" className="text-right">
              Isi Laporan
            </Label>
            <Textarea
              id="description"
              placeholder="Masukkan isi laporan"
              className="col-span-3"
              rows={6}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Batal
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <FileText className="h-4 w-4 mr-2" />
            {isSubmitting ? "Menyimpan..." : "Simpan Laporan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 