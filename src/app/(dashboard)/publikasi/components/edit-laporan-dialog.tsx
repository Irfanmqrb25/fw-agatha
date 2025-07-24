"use client"

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  CalendarIcon, 
  CheckCircle, 
  Upload,
  FileText,
  Pencil
} from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { id as localeID } from "date-fns/locale"
import { JENIS_LAPORAN } from "../utils/constants"
import { toast } from "sonner"
import { Laporan } from "../types/publikasi"

interface EditLaporanDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  laporan: Laporan;
  onSubmit?: (values: any) => void;
}

export default function EditLaporanDialog({
  open = false,
  onOpenChange,
  laporan,
  onSubmit
}: EditLaporanDialogProps) {
  const [dialogOpen, setDialogOpen] = useState(open);
  const [title, setTitle] = useState("")
  const [type, setType] = useState("")
  const [date, setDate] = useState<Date>()
  const [description, setDescription] = useState("")
  const [attachment, setAttachment] = useState<File | null>(null)
  const [currentAttachmentName, setCurrentAttachmentName] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Sync internal open state with props
  useEffect(() => {
    setDialogOpen(open);
  }, [open]);

  // Initialize form with laporan data
  useEffect(() => {
    if (laporan) {
      setTitle(laporan.judul || "");
      setType(laporan.jenis || "");
      setDate(laporan.tanggal ? new Date(laporan.tanggal) : undefined);
      setDescription(laporan.keterangan || "");
      setCurrentAttachmentName(laporan.lampiran || "");
    }
  }, [laporan]);

  const handleOpenChange = (newOpen: boolean) => {
    setDialogOpen(newOpen);
    if (onOpenChange) {
      onOpenChange(newOpen);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAttachment(e.target.files[0])
    }
  }

  const handleSubmit = async () => {
    if (!title || !type) {
      toast.error("Silakan lengkapi semua kolom yang diperlukan")
      return
    }

    setIsSubmitting(true)

    // Prepare form values
    const formValues = {
      id: laporan.id,
      judul: title,
      jenis: type,
      tanggal: date,
      keterangan: description,
      lampiran: attachment, // New file if uploaded
      currentLampiran: currentAttachmentName, // Existing file name
    };

    try {
      // Call the external onSubmit handler
      if (onSubmit) {
        await onSubmit(formValues);
      } else {
        // Fallback behavior if no onSubmit provided
        setTimeout(() => {
          toast.success("Laporan berhasil diperbarui", {
            description: "Perubahan pada laporan telah disimpan"
          });
          
          setIsSubmitting(false);
          handleOpenChange(false);
        }, 1500);
      }
    } catch (error) {
      toast.error("Gagal memperbarui laporan", {
        description: "Terjadi kesalahan saat memperbarui data"
      });
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
      {!onOpenChange && (
        <DialogTrigger asChild>
          <Button variant="outline" size="icon">
            <Pencil className="h-4 w-4" />
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Edit Laporan</DialogTitle>
          <DialogDescription>
            Perbarui data laporan yang sudah ada
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Judul
            </Label>
            <Input
              id="title"
              placeholder="Masukkan judul laporan"
              className="col-span-3"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
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
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="date" className="text-right">
              Tanggal
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant={"outline"}
                  className="col-span-3 justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? (
                    format(date, "dd MMMM yyyy", { locale: localeID })
                  ) : (
                    <span>Pilih tanggal</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                  locale={localeID}
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="attachment" className="text-right">
              Lampiran
            </Label>
            <div className="col-span-3">
              <div className="border rounded-md overflow-hidden">
                <label className="flex items-center justify-center w-full h-20 cursor-pointer hover:bg-gray-50">
                  <div className="flex flex-col items-center justify-center">
                    {attachment ? (
                      <>
                        <CheckCircle className="w-6 h-6 mb-1 text-green-500" />
                        <p className="text-sm text-gray-500 text-center truncate max-w-full px-4">
                          {attachment.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(attachment.size / 1024).toFixed(2)} KB
                        </p>
                      </>
                    ) : currentAttachmentName ? (
                      <>
                        <FileText className="w-6 h-6 mb-1 text-blue-500" />
                        <p className="text-sm text-gray-500 text-center truncate max-w-full px-4">
                          {currentAttachmentName}
                        </p>
                        <p className="text-xs text-blue-500">
                          Klik untuk mengganti file
                        </p>
                      </>
                    ) : (
                      <>
                        <Upload className="w-6 h-6 mb-1 text-gray-500" />
                        <p className="text-sm text-gray-500">
                          <span className="font-semibold">Upload file</span>
                        </p>
                      </>
                    )}
                  </div>
                  <input 
                    id="attachment"
                    type="file" 
                    className="hidden" 
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png" 
                    onChange={handleFileChange}
                  />
                </label>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="description" className="text-right pt-2">
              Keterangan
            </Label>
            <Textarea
              id="description"
              placeholder="Masukkan detail atau keterangan tambahan tentang laporan"
              className="col-span-3"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
            Batal
          </Button>
          <Button type="submit" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 