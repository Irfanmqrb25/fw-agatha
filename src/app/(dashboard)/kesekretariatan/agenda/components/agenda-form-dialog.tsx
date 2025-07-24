"use client";

import { useState, useCallback, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Agenda, AgendaFormValues, ProcessTarget } from "../types";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { DatePicker } from "./date-picker";
import { TimeInput } from "./time-input";
import { Loader2, Paperclip, X, FileIcon, Download } from "lucide-react";

interface AgendaFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agenda?: Agenda;
  onSubmit: (values: AgendaFormValues) => void;
  isSubmitting?: boolean;
}

export function AgendaFormDialog({
  open,
  onOpenChange,
  agenda,
  onSubmit,
  isSubmitting = false
}: AgendaFormDialogProps) {
  const [isSubmittingLocal, setIsSubmittingLocal] = useState(false);
  
  // Inisialisasi formValues di sini, tapi akan diupdate oleh useEffect saat agenda berubah
  const [formValues, setFormValues] = useState<AgendaFormValues>({
    title: "",
    description: "",
    date: new Date(),
    location: "",
    target: "lingkungan",
  });
  
  // State untuk file yang akan diupload
  const [attachment, setAttachment] = useState<File | null>(null);
  
  // State untuk menandai apakah lampiran harus dihapus
  const [removeAttachment, setRemoveAttachment] = useState(false);
  
  // State untuk preview file
  const [filePreview, setFilePreview] = useState<string | null>(null);
  
  // Separate state for time to use with TimeInput
  const [timeValue, setTimeValue] = useState("00:00");

  // Update form values when agenda changes or when dialog opens
  useEffect(() => {
    if (open && agenda) {
      // Konversi tanggal jika belum berupa Date
      const agendaDate = agenda.date instanceof Date ? agenda.date : new Date(agenda.date);
      
      // Update form values
      setFormValues({
        title: agenda.title,
        description: agenda.description,
        date: agendaDate,
        location: agenda.location,
        target: agenda.target,
      });
      
      // Reset attachment state
      setAttachment(null);
      setRemoveAttachment(false);
      setFilePreview(null);
      
      // Update time value
      const hours = agendaDate.getHours().toString().padStart(2, '0');
      const minutes = agendaDate.getMinutes().toString().padStart(2, '0');
      setTimeValue(`${hours}:${minutes}`);
    } else if (open) {
      // Reset form untuk pengajuan baru
      const now = new Date();
      setFormValues({
        title: "",
        description: "",
        date: now,
        location: "",
        target: "lingkungan",
      });
      
      // Reset attachment state
      setAttachment(null);
      setRemoveAttachment(false);
      setFilePreview(null);
      
      // Reset time juga
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setTimeValue(`${hours}:${minutes}`);
    }
  }, [open, agenda]);

  // Handle date selection from DatePicker
  const handleDateSelect = useCallback((date: Date | undefined) => {
    if (!date) return;
    
    // Preserve time from current date
    const currentDate = new Date(formValues.date);
    date.setHours(currentDate.getHours());
    date.setMinutes(currentDate.getMinutes());
    
    setFormValues(prev => ({
      ...prev,
      date: new Date(date)
    }));
  }, [formValues.date]);

  // Handle time change from TimeInput
  const handleTimeChange = useCallback((time: string) => {
    if (time === timeValue) return; // Prevent unnecessary updates
    
    setTimeValue(time);
    
    // Update the date with new time
    const [hours, minutes] = time.split(':').map(Number);
    if (!isNaN(hours) && !isNaN(minutes)) {
      setFormValues(prev => {
        const newDate = new Date(prev.date);
        newDate.setHours(hours);
        newDate.setMinutes(minutes);
        return {
          ...prev,
          date: newDate
        };
      });
    }
  }, [timeValue]);

  // Handle file attachment
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setAttachment(file);
      setRemoveAttachment(false);
      
      // Jika file adalah gambar, buat preview
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setFilePreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setFilePreview(null);
      }
    }
  };

  // Handle remove attachment
  const handleRemoveAttachment = () => {
    setAttachment(null);
    setRemoveAttachment(true);
    setFilePreview(null);
  };

  // Format file size untuk tampilan
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' bytes';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Handle download attachment
  const handleDownloadAttachment = () => {
    if (agenda?.attachment?.fileUrl) {
      window.open(agenda.attachment.fileUrl, '_blank');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmittingLocal(true);
      
      // Final validation of time
      const [hours, minutes] = timeValue.split(':').map(Number);
      if (isNaN(hours) || isNaN(minutes)) {
        alert('Silakan masukkan waktu yang valid');
        return;
      }
      
      // Ensure time is properly set
      const finalDate = new Date(formValues.date);
      finalDate.setHours(hours);
      finalDate.setMinutes(minutes);
      
      // Submit form data with attachment
      await onSubmit({
        ...formValues,
        date: finalDate,
        attachment: attachment || undefined,
        removeAttachment
      });
      
      // Only close the dialog if we successfully got here
    onOpenChange(false);
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Terjadi kesalahan saat menyimpan: " + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsSubmittingLocal(false);
    }
  };

  // Combined submitting state from parent and local
  const submitting = isSubmitting || isSubmittingLocal;

  // Check if the agenda has an attachment
  const hasExistingAttachment = agenda?.attachment && !removeAttachment;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{agenda ? "Edit Agenda" : "Pengajuan Agenda Baru"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto pr-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Judul Agenda
            </label>
            <Input
              id="title"
              value={formValues.title}
              onChange={(e) =>
                setFormValues({ ...formValues, title: e.target.value })
              }
              required
                disabled={submitting}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="location" className="text-sm font-medium">
              Lokasi
            </label>
            <Input
              id="location"
              value={formValues.location}
              onChange={(e) =>
                setFormValues({ ...formValues, location: e.target.value })
              }
              required
                disabled={submitting}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Tanggal
              </label>
              <DatePicker 
                date={formValues.date}
                onSelect={handleDateSelect}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Waktu
              </label>
              <TimeInput 
                time={timeValue}
                onChange={handleTimeChange}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label htmlFor="description" className="text-sm font-medium">
                Deskripsi
              </label>
              <Textarea
                id="description"
                value={formValues.description}
                onChange={(e) =>
                  setFormValues({ ...formValues, description: e.target.value })
                }
                required
                disabled={submitting}
                className="min-h-[120px]"
              />
            </div>
          </div>
          
          {/* File Attachment Section */}
          <div className="space-y-2">
            <label htmlFor="attachment" className="text-sm font-medium">
              Lampiran
            </label>
            
            {/* Existing attachment display */}
            {hasExistingAttachment && (
              <div className="flex items-center justify-between p-2 border rounded-md bg-muted/20">
                <div className="flex items-center space-x-2">
                  <FileIcon className="h-5 w-5 text-blue-500" />
                  <div className="text-sm">
                    <p className="font-medium truncate max-w-[200px]">
                      {agenda?.attachment?.originalName || "File Lampiran"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {agenda?.attachment?.fileType || "Dokumen"}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={handleDownloadAttachment}
                    disabled={submitting}
                  >
                    <Download className="h-4 w-4" />
                    <span className="sr-only">Download</span>
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={handleRemoveAttachment}
                    disabled={submitting}
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Remove</span>
                  </Button>
                </div>
              </div>
            )}
            
            {/* New attachment preview */}
            {attachment && (
              <div className="flex items-center justify-between p-2 border rounded-md bg-muted/20">
                <div className="flex items-center space-x-2">
                  {filePreview ? (
                    <img src={filePreview} alt="Preview" className="h-8 w-8 object-cover rounded" />
                  ) : (
                    <FileIcon className="h-5 w-5 text-blue-500" />
                  )}
                  <div className="text-sm">
                    <p className="font-medium truncate max-w-[200px]">{attachment.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {attachment.type} ({formatFileSize(attachment.size)})
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setAttachment(null);
                    setFilePreview(null);
                  }}
                  disabled={submitting}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Remove</span>
                </Button>
              </div>
            )}
            
            {/* File input */}
            {!hasExistingAttachment && !attachment && (
              <div className="flex items-center justify-center border-2 border-dashed rounded-md p-4 hover:bg-muted/50 transition-colors">
                <label
                  htmlFor="file-upload"
                  className="flex flex-col items-center cursor-pointer"
                >
                  <Paperclip className="h-6 w-6 text-muted-foreground mb-1" />
                  <span className="text-sm font-medium">Tambahkan lampiran</span>
                  <span className="text-xs text-muted-foreground mt-1">
                    PDF, Gambar, Dokumen (max 5MB)
                  </span>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    className="sr-only"
                    onChange={handleFileChange}
                    disabled={submitting}
                    accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv"
                  />
                </label>
              </div>
            )}
            
            {/* If there's existing or new attachment, show the "Ganti Lampiran" button */}
            {(hasExistingAttachment || attachment) && (
              <div className="mt-2">
                <label
                  htmlFor="file-upload"
                  className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer"
                >
                  Ganti lampiran
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    className="sr-only"
                    onChange={handleFileChange}
                    disabled={submitting}
                    accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv"
                  />
                </label>
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Tujuan Pengajuan
            </label>
            <RadioGroup
              value={formValues.target}
              onValueChange={(value: ProcessTarget) =>
                setFormValues({ ...formValues, target: value })
              }
              disabled={submitting}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="lingkungan" id="lingkungan" />
                <Label htmlFor="lingkungan">DPL (Lingkungan)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="stasi" id="stasi" />
                <Label htmlFor="stasi">DPS (Stasi)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="paroki" id="paroki" />
                <Label htmlFor="paroki">DPP (Paroki)</Label>
              </div>
            </RadioGroup>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Batal
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {agenda ? "Simpan" : "Ajukan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 