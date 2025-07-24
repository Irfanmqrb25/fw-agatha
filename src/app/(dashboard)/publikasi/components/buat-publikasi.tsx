"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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
  Bell,
  AlertTriangle,
  Info,
  Lock,
  Clock,
  Download,
  Save,
  Eye
} from "lucide-react"
import { useState, useEffect } from "react"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { toast } from "sonner"
import { ROLES, KATEGORI_PUBLIKASI, TARGET_PENERIMA } from "../utils/constants"

// Komponen pilihan target penerima
const TargetRecipients = ({ onSelected }: { onSelected: (selected: string[]) => void }) => {
  const [selectedGroups, setSelectedGroups] = useState<string[]>([])
  const groups = TARGET_PENERIMA

  const toggleGroup = (id: string) => {
    setSelectedGroups(prev => {
      // Jika "Semua Pengguna" dipilih, hilangkan semua pilihan lain
      if (id === "all") {
        return prev.includes("all") ? [] : ["all"]
      }
      
      // Jika salah satu grup selain "all" dipilih, hapus "all" dari pilihan
      const withoutAll = prev.filter(g => g !== "all")
      
      if (prev.includes(id)) {
        return withoutAll.filter(g => g !== id)
      } else {
        return [...withoutAll, id]
      }
    })
  }

  // Update parent component when selection changes
  useEffect(() => {
    onSelected(selectedGroups)
  }, [selectedGroups, onSelected])

  return (
    <div className="space-y-2">
      {groups.map(group => (
        <div key={group.id} className="flex items-center space-x-2">
          <Checkbox 
            id={`group-${group.id}`} 
            checked={selectedGroups.includes(group.id)}
            onCheckedChange={() => {
              toggleGroup(group.id)
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

export default function BuatPublikasi() {
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState("")
  const [content, setContent] = useState("")
  const [deadline, setDeadline] = useState<Date>()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [targetRecipients, setTargetRecipients] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleSubmit = async () => {
    if (!title || !category || !content) {
      toast.error("Silakan lengkapi semua kolom yang diperlukan")
      return
    }

    setIsSubmitting(true)

    // Simulasi pengiriman data
    setTimeout(() => {
      toast.success("Publikasi telah berhasil dikirim", {
        description: "Notifikasi akan dikirim ke penerima terpilih"
      })
      
      // Reset form
      setTitle("")
      setCategory("")
      setContent("")
      setDeadline(undefined)
      setSelectedFile(null)
      setTargetRecipients([])
      setIsSubmitting(false)
    }, 1500)
  }

  // Tampilkan preview publikasi
  const handlePreview = () => {
    if (!title || !category || !content) {
      toast.error("Silakan lengkapi semua kolom yang diperlukan", {
        description: "Judul, kategori, dan isi pengumuman harus diisi"
      })
      return
    }
    
    setShowPreview(true)
  }

  // Render icon berdasarkan kategori
  const renderCategoryIcon = (cat: string) => {
    switch (cat) {
      case "Penting":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case "Segera":
        return <Clock className="h-4 w-4 text-orange-500" />
      case "Rahasia":
        return <Lock className="h-4 w-4 text-purple-500" />
      case "Umum":
        return <Info className="h-4 w-4 text-blue-500" />
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex justify-end space-x-2 mb-4">
        <Button 
          variant="outline" 
          onClick={handlePreview}
          className="flex items-center"
        >
          <Eye className="h-4 w-4 mr-2" />
          Pratinjau
        </Button>
        <Button 
          onClick={handleSubmit} 
          disabled={isSubmitting}
          className="flex items-center"
        >
          <Save className="h-4 w-4 mr-2" />
          {isSubmitting ? "Mempublikasikan..." : "Publikasikan"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">Judul</Label>
            <Input 
              id="title"
              placeholder="Masukkan judul pengumuman" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-9"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category" className="text-sm font-medium">Kategori</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="category" className="h-9">
                <SelectValue placeholder="Pilih kategori" />
              </SelectTrigger>
              <SelectContent>
                {KATEGORI_PUBLIKASI.map((kategori) => (
                  <SelectItem key={kategori.value} value={kategori.label}>
                    <div className="flex items-center">
                      {renderCategoryIcon(kategori.label)}
                      {kategori.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Target Penerima</Label>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full justify-start h-9">
                  <Users className="h-4 w-4 mr-2" />
                  {targetRecipients.length === 0 
                    ? "Pilih target penerima" 
                    : targetRecipients.includes("all") 
                      ? "Semua Pengguna" 
                      : `${targetRecipients.length} grup dipilih`}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Pilih Target Penerima</DialogTitle>
                  <DialogDescription>
                    Pilih grup yang akan menerima notifikasi publikasi ini
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <TargetRecipients onSelected={setTargetRecipients} />
                </div>
                <DialogFooter>
                  <Button>Simpan</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Batas Waktu</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className="w-full justify-start text-left font-normal h-9"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {deadline ? (
                    format(deadline, "PPP", { locale: id })
                  ) : (
                    <span>Pilih tanggal</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={deadline}
                  onSelect={setDeadline}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Lampiran</Label>
            <div className="border-2 border-dashed rounded-lg overflow-hidden">
              <label className="flex flex-col items-center justify-center w-full h-28 cursor-pointer hover:bg-gray-50">
                <div className="flex flex-col items-center justify-center pt-4 pb-2">
                  {selectedFile ? (
                    <>
                      <CheckCircle className="w-7 h-7 mb-2 text-green-500" />
                      <p className="text-sm text-gray-500 text-center truncate max-w-full px-4">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(selectedFile.size / 1024).toFixed(2)} KB
                      </p>
                    </>
                  ) : (
                    <>
                      <Upload className="w-7 h-7 mb-2 text-gray-500" />
                      <p className="text-sm text-gray-500">
                        <span className="font-semibold">Klik untuk upload</span> atau drag and drop
                      </p>
                      <p className="text-xs text-gray-500">PDF, DOC, XLS, JPG, PNG</p>
                    </>
                  )}
                </div>
                <input 
                  type="file" 
                  className="hidden" 
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png" 
                  onChange={handleFileChange}
                />
              </label>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="flex items-center text-sm font-medium">
              <Bell className="h-4 w-4 mr-2" />
              <span>Notifikasi</span>
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="notification-email" />
                <label
                  htmlFor="notification-email"
                  className="text-sm font-medium leading-none"
                >
                  Kirim melalui email
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="notification-app" defaultChecked />
                <label
                  htmlFor="notification-app"
                  className="text-sm font-medium leading-none"
                >
                  Kirim di aplikasi
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Isi Pengumuman</Label>
        <Textarea 
          placeholder="Masukkan isi pengumuman" 
          className="min-h-[180px] resize-none" 
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </div>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {renderCategoryIcon(category)}
              {title}
            </DialogTitle>
            <DialogDescription className="flex justify-between">
              <span>Pratinjau Publikasi</span>
              <Badge>{category}</Badge>
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="prose prose-sm max-w-none">
              {content.split('\n').map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>
            
            {selectedFile && (
              <div className="flex items-center p-2 border rounded">
                <div className="flex-1">
                  <p className="text-sm font-medium">{selectedFile.name}</p>
                  <p className="text-xs text-gray-500">{(selectedFile.size / 1024).toFixed(2)} KB</p>
                </div>
                <Button size="sm" variant="ghost">
                  <Download className="h-4 w-4 mr-2" />
                  Unduh
                </Button>
              </div>
            )}
            
            {deadline && (
              <div className="flex items-center text-sm">
                <Clock className="h-4 w-4 mr-2 text-gray-500" />
                <span>Batas waktu: {format(deadline, "PPP", { locale: id })}</span>
              </div>
            )}
            
            <div className="flex items-center text-sm">
              <Users className="h-4 w-4 mr-2 text-gray-500" />
              <span>
                Target: {targetRecipients.includes("all") 
                  ? "Semua Pengguna" 
                  : targetRecipients.length > 0 
                    ? `${targetRecipients.length} grup` 
                    : "Belum dipilih"}
              </span>
            </div>
          </div>
          <DialogFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setShowPreview(false)}>
              Kembali Edit
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Mempublikasikan..." : "Publikasikan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 