"use client"

import { useState, useEffect } from "react"
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
  Users,
  Plus,
  Eye,
  XCircle
} from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { id as localeID } from "date-fns/locale"
import { KATEGORI_PUBLIKASI, TARGET_PENERIMA, getKategoriColor } from "../utils/constants"
import { toast } from "sonner"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { createPublikasi } from "../utils/actions"
import { PublikasiFormData } from "../types/publikasi"
import { Role, KlasifikasiPublikasi } from "@prisma/client"

// Komponen pilihan target penerima
const TargetRecipients = ({ 
  onSelected, 
  initialSelected = [] 
}: { 
  onSelected: (selected: Role[]) => void,
  initialSelected?: Role[]
}) => {
  const [selectedGroups, setSelectedGroups] = useState<Role[]>(initialSelected)

  // Update parent setiap kali selection berubah
  useEffect(() => {
    onSelected(selectedGroups)
  }, [selectedGroups, onSelected])

  const toggleGroup = (role: Role | 'all') => {
    setSelectedGroups(prev => {
      // Jika "Semua Pengguna" dipilih
      if (role === 'all') {
        // Jika semua sudah dipilih, kosongkan
        const allRoles = TARGET_PENERIMA.find(t => t.id === 'all')?.roles || []
        const allSelected = allRoles.every(r => prev.includes(r))
        
        if (allSelected) {
          return []
        } else {
          // Pilih semua
          return [...allRoles]
        }
      }
      
      // Untuk pilihan role spesifik
      if (prev.includes(role as Role)) {
        return prev.filter(r => r !== role)
      } else {
        return [...prev, role as Role]
      }
    })
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2 pb-1 border-b">
        <Checkbox 
          id="group-all" 
          checked={TARGET_PENERIMA.find(t => t.id === 'all')?.roles?.every(r => selectedGroups.includes(r)) ?? false}
          onCheckedChange={() => {
            toggleGroup('all')
          }}
        />
        <label
          htmlFor="group-all"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Semua Pengguna
        </label>
      </div>
      
      {TARGET_PENERIMA.filter(group => group.id !== 'all').map(group => (
        <div key={group.id} className="flex items-center space-x-2">
          <Checkbox 
            id={`group-${group.id}`} 
            checked={selectedGroups.includes(group.id as Role)}
            onCheckedChange={() => {
              toggleGroup(group.id as Role)
            }}
          />
          <label
            htmlFor={`group-${group.id}`}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {group.label}
          </label>
        </div>
      ))}
    </div>
  )
}

interface BuatPublikasiDialogProps {
  onSuccess?: () => void
}

export default function BuatPublikasiDialog({ onSuccess }: BuatPublikasiDialogProps) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState<KlasifikasiPublikasi | "">("")
  const [content, setContent] = useState("")
  const [deadline, setDeadline] = useState<Date | undefined>()
  const [attachments, setAttachments] = useState<string[]>([])
  const [files, setFiles] = useState<File[]>([])
  const [targetRecipients, setTargetRecipients] = useState<Role[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [previewDialog, setPreviewDialog] = useState(false)
  const [attachmentName, setAttachmentName] = useState("")

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files)
      setFiles(prev => [...prev, ...newFiles])
      
      // Update attachment names for display
      const newFileNames = newFiles.map(file => file.name)
      setAttachments(prev => [...prev, ...newFileNames])
    }
  }
  
  const handleRemoveAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (!title || !category || !content) {
      toast.error("Silakan lengkapi semua kolom yang diperlukan")
      return
    }

    if (targetRecipients.length === 0) {
      toast.error("Pilih minimal satu target penerima")
      return
    }

    setIsSubmitting(true)

    try {
      // Buat FormData object untuk publikasi + file uploads
      const publikasiData: PublikasiFormData = {
        judul: title,
        isi: content,
        klasifikasi: category as KlasifikasiPublikasi,
        targetPenerima: targetRecipients,
        deadline: deadline || null,
        lampiran: attachments,
      }

      const result = await createPublikasi(publikasiData)
      
      if (result.success) {
        // Upload files jika ada
        if (files.length > 0) {
          toast.info("Mengunggah file lampiran...")
          // Kode untuk upload file akan diimplementasikan nanti
        }
        
        toast.success("Publikasi berhasil dibuat", {
          description: "Publikasi akan ditampilkan kepada target penerima"
        })
        resetForm()
        setOpen(false)
        if (onSuccess) onSuccess()
      } else {
        toast.error("Gagal membuat publikasi", {
          description: result.error
        })
      }
    } catch (error) {
      console.error("Error creating publikasi:", error)
      toast.error("Terjadi kesalahan saat membuat publikasi")
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setTitle("")
    setCategory("")
    setDeadline(undefined)
    setContent("")
    setAttachments([])
    setFiles([])
    setTargetRecipients([])
  }

  const handlePreview = () => {
    if (!title || !category || !content) {
      toast.error("Silakan lengkapi semua kolom yang diperlukan")
      return
    }
    setPreviewDialog(true)
  }

  // Mendapatkan warna dan label kategori yang dipilih
  const selectedCategory = KATEGORI_PUBLIKASI.find(item => item.value === category)

  return (
    <>
      <Dialog open={open} onOpenChange={(newOpen) => {
        setOpen(newOpen)
        if (!newOpen) resetForm()
      }}>
        <DialogTrigger asChild>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Buat Publikasi
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Buat Publikasi</DialogTitle>
            <DialogDescription>
              Input informasi publikasi untuk disebarkan
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            {/* Kolom Kiri */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Judul</Label>
              <Input
                id="title"
                placeholder="Masukkan judul publikasi"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Kategori</Label>
                <Select value={category} onValueChange={(value) => setCategory(value as KlasifikasiPublikasi)}>
                  <SelectTrigger id="category">
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                    {KATEGORI_PUBLIKASI.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center">
                          <span className={`mr-2 ${option.value === 'PENTING' ? 'text-red-500' : option.value === 'SEGERA' ? 'text-orange-500' : option.value === 'RAHASIA' ? 'text-purple-500' : 'text-blue-500'}`}>●</span>
                      {option.label}
                        </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
              
              <div className="space-y-2">
                <Label htmlFor="deadline">Deadline</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                      className={`w-full justify-start text-left font-normal ${
                        !deadline && "text-muted-foreground"
                      }`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {deadline ? (
                        format(deadline, "PPP", { locale: localeID })
                    ) : (
                        <span>Pilih tanggal (opsional)</span>
                    )}
                  </Button>
                </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={deadline}
                    onSelect={setDeadline}
                      disabled={(date) =>
                        date < new Date(new Date().setHours(0, 0, 0, 0))
                      }
                    initialFocus
                    locale={localeID}
                  />
                </PopoverContent>
              </Popover>
            </div>
              
              <div className="space-y-2">
                <Label>Target Penerima</Label>
                <div className="border rounded-md p-3 h-[120px] overflow-y-auto">
                  <TargetRecipients 
                    onSelected={setTargetRecipients} 
                    initialSelected={targetRecipients}
                  />
                </div>
              </div>
            </div>
            
            {/* Kolom Kanan */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="content">Isi Publikasi</Label>
                <Textarea
                  id="content"
                  placeholder="Masukkan isi publikasi"
                  rows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Lampiran</Label>
                <div className="space-y-2">
                  <div className="border-2 border-dashed rounded-lg p-4">
                    <label className="flex flex-col items-center justify-center w-full cursor-pointer">
                      <div className="flex flex-col items-center justify-center">
                        <Upload className="h-8 w-8 mb-2 text-muted-foreground" />
                        <p className="text-sm text-center">
                          <span className="font-semibold">Klik untuk upload</span> atau drag and drop
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          PDF, DOC, XLS, JPG, PNG (Maks. 5MB)
                        </p>
                      </div>
                      <input 
                        type="file" 
                        className="hidden" 
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png" 
                        onChange={handleFileChange}
                        multiple
                      />
                    </label>
                  </div>
                  
                  {attachments.length > 0 && (
                    <div className="border rounded-md p-2 mt-2 max-h-[150px] overflow-y-auto">
                      <p className="text-sm text-muted-foreground mb-2">Daftar Lampiran:</p>
                      <div className="space-y-1">
                        {attachments.map((file, index) => (
                          <div 
                            key={index}
                            className="flex items-center justify-between p-2 bg-muted/50 rounded-md"
                          >
                            <div className="flex items-center">
                              <Upload className="h-4 w-4 mr-2 text-muted-foreground" />
                              <span className="text-sm">{file}</span>
                              {files[index] && (
                                <span className="text-xs text-muted-foreground ml-2">
                                  ({(files[index].size / 1024).toFixed(1)} KB)
                                </span>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 rounded-full"
                              onClick={() => handleRemoveAttachment(index)}
                            >
                              <XCircle className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter className="gap-2 sm:justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={handlePreview}
              disabled={isSubmitting}
            >
              <Eye className="mr-2 h-4 w-4" />
              Pratinjau
            </Button>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
              >
                Batal
              </Button>
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2"></div>
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Simpan Publikasi
                  </>
                )}
            </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={previewDialog} onOpenChange={setPreviewDialog}>
        <DialogContent className="sm:max-w-[550px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Pratinjau Publikasi</DialogTitle>
            <DialogDescription>
              Tampilan publikasi sebelum disimpan
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 my-2">
            <div className="space-y-1">
              <h3 className="text-xl font-semibold">{title}</h3>
                {selectedCategory && (
                  <Badge 
                  className={getKategoriColor(category as KlasifikasiPublikasi)}
                  >
                    {selectedCategory.label}
                  </Badge>
                )}
              </div>
            
            <div className="flex items-center text-sm text-muted-foreground">
              <span className="flex items-center">
                <Users className="h-4 w-4 mr-1.5" />
                Target: {targetRecipients.length} grup
              </span>
              {deadline && (
                <span className="ml-4 flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-1.5" />
                  Deadline: {format(deadline, "dd MMMM yyyy", { locale: localeID })}
                </span>
              )}
            </div>
            
            <div className="border-t pt-4">
              <div className="whitespace-pre-wrap">{content}</div>
            </div>
            
            {attachments.length > 0 && (
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium mb-2">Lampiran:</h4>
                <div className="space-y-1">
                  {attachments.map((file, index) => (
                    <div key={index} className="flex items-center text-sm">
                      <Upload className="h-4 w-4 mr-2 text-muted-foreground" />
                      {file}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewDialog(false)}>
              Tutup Pratinjau
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
} 