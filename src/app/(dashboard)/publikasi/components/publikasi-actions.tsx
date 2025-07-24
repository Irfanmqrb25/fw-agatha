"use client"

import { useState, useEffect } from "react"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { 
  Bell, 
  Download, 
  EyeIcon, 
  FileText,
  InfoIcon,
  LockIcon, 
  MoreHorizontal, 
  Pencil, 
  Trash, 
  UnlockIcon,
  CalendarIcon
} from "lucide-react"
import { PublikasiWithRelations } from "../types/publikasi"
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { id as localeID } from "date-fns/locale"
import { Users } from "lucide-react"
import { isPublikasiExpired, roleToLabel, KATEGORI_PUBLIKASI, TARGET_PENERIMA } from "../utils/constants"
import { deletePublikasi, sendPublikasiNotification, lockPublikasi, updatePublikasi,
         createLaporanPublikasi, getLaporanByPublikasiId } from "../utils/actions"
import { getFilePath } from "@/lib/uploads"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Calendar
} from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { PublikasiFormData } from "../types/publikasi"
import { KlasifikasiPublikasi, Role } from "@prisma/client"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Checkbox } from "@/components/ui/checkbox"
import { useAuth } from "@/contexts/auth-context"
import { Laporan } from "../types/publikasi"
import { JENIS_LAPORAN } from "../utils/constants"
import BuatLaporanDialog from "./buat-laporan-dialog"

interface PublikasiActionsProps {
  publikasi: PublikasiWithRelations
  onRefresh?: () => void
}

export function PublikasiActions({ publikasi, onRefresh }: PublikasiActionsProps) {
  const { userRole } = useAuth()
  const [viewDetailOpen, setViewDetailOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [notificationDialogOpen, setNotificationDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSendingNotification, setIsSendingNotification] = useState(false)
  const [isLocking, setIsLocking] = useState(false)
  const [reportDialogOpen, setReportDialogOpen] = useState(false)
  const [reportType, setReportType] = useState<string>("")
  const [reportContent, setReportContent] = useState<string>("")
  const [isCreatingReport, setIsCreatingReport] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editTitle, setEditTitle] = useState("")
  const [editContent, setEditContent] = useState("")
  const [editKategori, setEditKategori] = useState<KlasifikasiPublikasi | "">("")
  const [editDeadline, setEditDeadline] = useState<Date | undefined>(undefined)
  const [editTargetPenerima, setEditTargetPenerima] = useState<Role[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [laporan, setLaporan] = useState<Laporan[]>([])
  const [isLoadingLaporan, setIsLoadingLaporan] = useState(false)

  // Fungsi untuk mengambil laporan dari database saat dialog detail dibuka
  useEffect(() => {
    if (viewDetailOpen) {
      loadLaporan()
    }
  }, [viewDetailOpen, publikasi.id])

  // Fungsi untuk mengambil data laporan dari database
  const loadLaporan = async () => {
    setIsLoadingLaporan(true)
    try {
      const result = await getLaporanByPublikasiId(publikasi.id)
      if (result.success && result.data) {
        // Konversi hasil ke format Laporan
        const formattedLaporan = result.data.map(item => ({
          id: item.id,
          judul: `Laporan ${JENIS_LAPORAN.find(j => j.id === item.jenis)?.label || item.jenis}`,
          jenis: item.jenis,
          tanggal: item.createdAt,
          keterangan: item.keterangan,
          lampiran: "",
          publikasiId: item.publikasiId
        }))
        setLaporan(formattedLaporan)
      } else {
        console.error("Gagal mengambil laporan:", result.error)
      }
    } catch (error) {
      console.error("Error loading laporan:", error)
    } finally {
      setIsLoadingLaporan(false)
    }
  }

  const handleViewDetail = () => {
    setViewDetailOpen(true)
  }

  const handleEditOpen = () => {
    setEditTitle(publikasi.judul)
    setEditContent(publikasi.isi)
    setEditKategori(publikasi.klasifikasi)
    setEditDeadline(publikasi.deadline ? new Date(publikasi.deadline) : undefined)
    setEditTargetPenerima(publikasi.targetPenerima)
    setEditDialogOpen(true)
  }

  const handleEdit = async () => {
    if (!editTitle || !editContent || !editKategori) {
      toast.error("Silakan lengkapi semua kolom yang diperlukan")
      return
    }

    if (editTargetPenerima.length === 0) {
      toast.error("Pilih minimal satu target penerima")
      return
    }

    setIsEditing(true)

    try {
      const publikasiData: PublikasiFormData = {
        judul: editTitle,
        isi: editContent,
        klasifikasi: editKategori as KlasifikasiPublikasi,
        targetPenerima: editTargetPenerima,
        deadline: editDeadline || null,
        lampiran: publikasi.lampiran,
      }

      const result = await updatePublikasi(publikasi.id, publikasiData)
      
      if (result.success) {
        toast.success("Publikasi berhasil diperbarui")
        setEditDialogOpen(false)
        if (onRefresh) onRefresh()
      } else {
        toast.error("Gagal memperbarui publikasi", {
          description: result.error
        })
      }
    } catch (error) {
      console.error("Error updating publikasi:", error)
      toast.error("Terjadi kesalahan saat memperbarui publikasi")
    } finally {
      setIsEditing(false)
    }
  }

  const handleDownload = async () => {
    if (publikasi.lampiran && publikasi.lampiran.length > 0) {
      try {
        // Ambil file pertama dari array lampiran
        const fileName = publikasi.lampiran[0]
        
        // Dapatkan URL file berdasarkan nama file
        const result = await getFilePath(fileName, 'publikasi')
        
        // Buka URL file di tab baru untuk mengunduh
        window.open(result.fileUrl, '_blank')
        
        toast.success(`Mengunduh lampiran: ${fileName}`)
      } catch (error) {
        console.error("Error downloading attachment:", error)
        toast.error("Gagal mengunduh lampiran")
      }
    } else {
      toast.error("Tidak ada lampiran yang tersedia")
    }
  }

  const handleNotificationConfirm = () => {
    setNotificationDialogOpen(true)
  }

  const handleSendNotification = async () => {
    setIsSendingNotification(true)
    try {
      const result = await sendPublikasiNotification(publikasi.id)
      if (result.success) {
        toast.success("Notifikasi berhasil dikirim", {
          description: `Pengingat untuk "${publikasi.judul}" telah dikirim ke penerima`
        })
      } else {
        toast.error("Gagal mengirim notifikasi", {
          description: result.error
        })
      }
    } catch (error) {
      toast.error("Gagal mengirim notifikasi")
    } finally {
      setIsSendingNotification(false)
      setNotificationDialogOpen(false)
      if (onRefresh) onRefresh()
    }
  }

  const handleLockToggle = async () => {
    setIsLocking(true)
    try {
      const result = await lockPublikasi(publikasi.id, !publikasi.locked)
      if (result.success) {
        toast.success(
          publikasi.locked 
            ? "Publikasi berhasil dibuka kunci" 
            : "Publikasi berhasil dikunci"
        )
      } else {
        toast.error(
          publikasi.locked 
            ? "Gagal membuka kunci publikasi" 
            : "Gagal mengunci publikasi", 
          { description: result.error }
        )
      }
    } catch (error) {
      console.error("Error toggling lock:", error)
      toast.error(
        publikasi.locked 
          ? "Gagal membuka kunci publikasi" 
          : "Gagal mengunci publikasi"
      )
    } finally {
      setIsLocking(false)
      if (onRefresh) onRefresh()
    }
  }

  const handleCreateReportDialog = () => {
    setReportDialogOpen(true)
  }

  const handleSubmitLaporan = async (values: any) => {
    try {
      // Simpan data ke database
      const result = await createLaporanPublikasi({
        jenis: values.type,
        keterangan: values.description,
        publikasiId: publikasi.id
      })
      
      if (result.success) {
        // Refresh laporan setelah berhasil disimpan
        await loadLaporan()
        
        toast.success("Laporan berhasil dibuat", {
          description: `Laporan untuk publikasi "${publikasi.judul}" telah dibuat`
        })
      } else {
        toast.error("Gagal membuat laporan", {
          description: result.error
        })
      }
    } catch (error) {
      console.error("Error creating report:", error)
      toast.error("Gagal membuat laporan")
    }
  }

  const handleDeleteConfirm = () => {
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const result = await deletePublikasi(publikasi.id)
      if (result.success) {
        toast.success("Publikasi berhasil dihapus", {
          description: `Publikasi "${publikasi.judul}" telah dihapus dari sistem`
        })
      } else {
        toast.error("Gagal menghapus publikasi", {
          description: result.error
        })
      }
    } catch (error) {
      toast.error("Gagal menghapus publikasi")
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
      if (onRefresh) onRefresh()
    }
  }

  // Cek apakah pengguna memiliki akses untuk mengelola publikasi
  const canManagePublikasi = [
    'SUPER_USER', 
    'SEKRETARIS', 
    'WAKIL_SEKRETARIS'
  ].includes(userRole || '')

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0 flex items-center justify-center">
            <span className="sr-only">Buka menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[200px]">
          <DropdownMenuLabel className="flex items-center justify-between">
            <span>Aksi</span>
            {publikasi.locked && (
              <Badge variant="outline" className="bg-gray-100 text-gray-700 ml-2 text-xs gap-1 py-0 h-5 px-1.5 flex items-center">
                <LockIcon className="h-3 w-3" /> Terkunci
              </Badge>
            )}
          </DropdownMenuLabel>
          <DropdownMenuItem onClick={handleViewDetail} className="cursor-pointer">
            <EyeIcon className="h-4 w-4 mr-2" />
            Lihat Detail
          </DropdownMenuItem>
          
          {canManagePublikasi && (
            <>
              <DropdownMenuItem 
                onClick={handleEditOpen} 
                className={`cursor-pointer ${publikasi.locked ? "text-gray-400 pointer-events-none" : ""}`}
                disabled={publikasi.locked}
              >
                <Pencil className="h-4 w-4 mr-2" />
                Edit
                {publikasi.locked && (
                  <span className="ml-auto text-xs text-gray-400">Terkunci</span>
                )}
              </DropdownMenuItem>
              
              {publikasi.lampiran && publikasi.lampiran.length > 0 && (
                <DropdownMenuItem onClick={handleDownload} className="cursor-pointer">
                  <Download className="h-4 w-4 mr-2" />
                  Unduh Lampiran
                </DropdownMenuItem>
              )}
              
              <DropdownMenuItem onClick={handleNotificationConfirm} className="cursor-pointer">
                <Bell className="h-4 w-4 mr-2" />
                Kirim Notifikasi
              </DropdownMenuItem>
              
              <div className="flex items-center px-2 py-1.5 text-sm">
                <DropdownMenuItem 
                  onClick={handleLockToggle} 
                  className="cursor-pointer flex-1"
                  disabled={isLocking}
                >
                  {publikasi.locked ? (
                    <><UnlockIcon className="h-4 w-4 mr-2" />Buka Kunci</>
                  ) : (
                    <><LockIcon className="h-4 w-4 mr-2" />Kunci</>
                  )}
                  {isLocking && <span className="ml-2 animate-spin">...</span>}
                </DropdownMenuItem>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6 p-0 ml-1">
                        <InfoIcon className="h-3.5 w-3.5 text-muted-foreground" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top" align="end" className="max-w-[200px]">
                      <p className="text-xs">
                        Publikasi terkunci tidak dapat diedit atau dihapus. Status ini mencegah perubahan pada konten yang sudah final.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem 
                onClick={handleDeleteConfirm} 
                className={`cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 ${publikasi.locked ? "text-gray-400 pointer-events-none" : ""}`}
                disabled={publikasi.locked}
              >
                <Trash className="h-4 w-4 mr-2" />
                Hapus
                {publikasi.locked && (
                  <span className="ml-auto text-xs text-gray-400">Terkunci</span>
                )}
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Dialog Lihat Detail */}
      <Dialog open={viewDetailOpen} onOpenChange={setViewDetailOpen}>
        <DialogContent className="sm:max-w-[550px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detail Publikasi</DialogTitle>
            <DialogDescription>
              Informasi lengkap publikasi
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 gap-4">
              <Label className="text-right font-medium">Judul:</Label>
              <div className="col-span-3 font-semibold">{publikasi.judul}</div>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <Label className="text-right font-medium">Kategori:</Label>
              <div className="col-span-3">
                <Badge className={
                  publikasi.klasifikasi === "PENTING" ? "bg-red-50 text-red-700 border-red-200" :
                  publikasi.klasifikasi === "SEGERA" ? "bg-orange-50 text-orange-700 border-orange-200" :
                  publikasi.klasifikasi === "RAHASIA" ? "bg-purple-50 text-purple-700 border-purple-200" :
                  "bg-blue-50 text-blue-700 border-blue-200"
                }>
                  {publikasi.klasifikasi}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <Label className="text-right font-medium">Tanggal:</Label>
              <div className="col-span-3">
                {format(new Date(publikasi.createdAt), "dd MMMM yyyy", { locale: localeID })}
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <Label className="text-right font-medium">Status:</Label>
              <div className="col-span-3">
                <Badge variant={!publikasi.deadline || !isPublikasiExpired(publikasi.deadline) ? "success" : "destructive"}>
                  {!publikasi.deadline || !isPublikasiExpired(publikasi.deadline) ? "Aktif" : "Kedaluwarsa"}
                </Badge>
              </div>
            </div>

            {publikasi.deadline && (
              <div className="grid grid-cols-4 gap-4">
                <Label className="text-right font-medium">Deadline:</Label>
                <div className="col-span-3">
                  {format(new Date(publikasi.deadline), "dd MMMM yyyy", { locale: localeID })}
                </div>
              </div>
            )}

            <div className="grid grid-cols-4 gap-4">
              <Label className="text-right font-medium">Target Penerima:</Label>
              <div className="col-span-3 flex items-center">
                <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                {publikasi.targetPenerima.length > 1 
                  ? `${publikasi.targetPenerima.length} Grup` 
                  : roleToLabel(publikasi.targetPenerima[0])}
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <Label className="text-right font-medium align-top">Isi:</Label>
              <div className="col-span-3 whitespace-pre-wrap break-words">
                {publikasi.isi}
              </div>
            </div>

            {publikasi.lampiran && publikasi.lampiran.length > 0 && (
              <div className="grid grid-cols-4 gap-4">
                <Label className="text-right font-medium">Lampiran:</Label>
                <div className="col-span-3">
                  <div className="flex flex-col gap-2">
                    {publikasi.lampiran.map((file, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span className="text-sm">{file}</span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 ml-auto"
                          onClick={async () => {
                            try {
                              const result = await getFilePath(file, 'publikasi')
                              window.open(result.fileUrl, '_blank')
                              toast.success(`Mengunduh lampiran: ${file}`)
                            } catch (error) {
                              toast.error("Gagal mengunduh lampiran")
                            }
                          }}
                        >
                          <Download className="h-3.5 w-3.5 mr-1" />
                          <span>Unduh</span>
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-4 gap-4">
              <Label className="text-right font-medium">Pembuat:</Label>
              <div className="col-span-3">
                {publikasi.pembuat.username} ({roleToLabel(publikasi.pembuat.role)})
              </div>
            </div>

            {/* Tampilkan daftar laporan */}
            <div className="grid grid-cols-4 gap-4">
              <Label className="text-right font-medium align-top">Laporan:</Label>
              <div className="col-span-3">
                {isLoadingLaporan ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin h-5 w-5 border-2 border-gray-500 rounded-full border-t-transparent"></div>
                    <span className="ml-2 text-sm text-gray-500">Memuat laporan...</span>
                  </div>
                ) : laporan.length > 0 ? (
                  <div className="space-y-3">
                    {laporan.map((item) => (
                      <div key={item.id} className="border rounded-md p-3 bg-gray-50">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              {JENIS_LAPORAN.find(j => j.id === item.jenis)?.label || item.jenis}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {format(new Date(item.tanggal), "dd MMMM yyyy", { locale: localeID })}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{item.keterangan}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-500 text-sm italic">Belum ada laporan</div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setViewDetailOpen(false)}>
              Tutup
            </Button>
            <Button 
              onClick={handleCreateReportDialog}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <FileText className="h-4 w-4 mr-2" />
              Buat Laporan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Konfirmasi Hapus */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="max-h-[80vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Hapus Publikasi</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus publikasi "{publikasi.judul}"? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              className="bg-red-600 text-white hover:bg-red-700 focus:ring-red-600"
              disabled={isDeleting}
            >
              {isDeleting ? "Menghapus..." : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog Konfirmasi Kirim Notifikasi */}
      <AlertDialog open={notificationDialogOpen} onOpenChange={setNotificationDialogOpen}>
        <AlertDialogContent className="max-h-[80vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>Kirim Notifikasi Pengingat</AlertDialogTitle>
            <AlertDialogDescription>
              Kirim notifikasi pengingat tentang publikasi "{publikasi.judul}" ke semua target penerima?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleSendNotification}
              disabled={isSendingNotification}
            >
              {isSendingNotification ? "Mengirim..." : "Kirim Notifikasi"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog Buat Laporan */}
      <BuatLaporanDialog
        open={reportDialogOpen}
        onOpenChange={setReportDialogOpen}
        publikasi={{
          id: publikasi.id,
          judul: publikasi.judul,
          tanggal: format(new Date(publikasi.createdAt), "yyyy-MM-dd"),
          waktu: format(new Date(publikasi.createdAt), "HH:mm"),
          lokasi: "",
          targetPenerima: "Semua Pengguna",
          status: !publikasi.deadline || !isPublikasiExpired(publikasi.deadline) ? "aktif" : "kedaluwarsa",
          pembuat: publikasi.pembuat.username,
          lampiran: publikasi.lampiran.length > 0,
          locked: publikasi.locked || false,
          kategori: publikasi.klasifikasi === "PENTING" ? "Penting" : 
                    publikasi.klasifikasi === "SEGERA" ? "Segera" : 
                    publikasi.klasifikasi === "RAHASIA" ? "Rahasia" : "Umum",
        }}
        onSubmit={handleSubmitLaporan}
      />

      {/* Dialog Edit Publikasi */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Publikasi</DialogTitle>
            <DialogDescription>
              Ubah detail publikasi "{publikasi.judul}"
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 gap-4 items-center">
              <Label htmlFor="edit-title" className="text-right font-medium">
                Judul:
              </Label>
              <Input
                id="edit-title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 gap-4 items-center">
              <Label htmlFor="edit-kategori" className="text-right font-medium">
                Kategori:
              </Label>
              <Select
                value={editKategori}
                onValueChange={(value) => setEditKategori(value as KlasifikasiPublikasi)}
              >
                <SelectTrigger id="edit-kategori" className="col-span-3">
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  {KATEGORI_PUBLIKASI.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center">
                        <span className={`mr-2 ${
                          option.value === 'PENTING' ? 'text-red-500' : 
                          option.value === 'SEGERA' ? 'text-orange-500' : 
                          option.value === 'RAHASIA' ? 'text-purple-500' : 
                          'text-blue-500'
                        }`}>●</span>
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 gap-4 items-center">
              <Label htmlFor="edit-deadline" className="text-right font-medium">
                Deadline:
              </Label>
              <div className="col-span-3">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {editDeadline ? (
                        format(editDeadline, "PPP", { locale: localeID })
                      ) : (
                        <span>Pilih tanggal (opsional)</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={editDeadline}
                      onSelect={setEditDeadline}
                      initialFocus
                      locale={localeID}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            <div className="grid grid-cols-4 gap-4 items-start">
              <Label htmlFor="edit-target" className="text-right font-medium">
                Target Penerima:
              </Label>
              <div className="col-span-3 border rounded-md p-3 h-[120px] overflow-y-auto">
                {TARGET_PENERIMA.filter(group => group.id !== 'all').map((group) => (
                  <div key={group.id} className="flex items-center space-x-2 mb-2">
                    <Checkbox 
                      id={`edit-group-${group.id}`} 
                      checked={editTargetPenerima.includes(group.id as Role)}
                      onCheckedChange={(checked: boolean | 'indeterminate') => {
                        if (checked === true) {
                          setEditTargetPenerima(prev => [...prev, group.id as Role])
                        } else {
                          setEditTargetPenerima(prev => prev.filter(r => r !== group.id as Role))
                        }
                      }}
                    />
                    <label
                      htmlFor={`edit-group-${group.id}`}
                      className="text-sm font-medium"
                    >
                      {group.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-4 gap-4 items-start">
              <Label htmlFor="edit-content" className="text-right font-medium">
                Isi Publikasi:
              </Label>
              <Textarea
                id="edit-content"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="col-span-3"
                rows={5}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
              disabled={isEditing}
            >
              Batal
            </Button>
            <Button
              onClick={handleEdit}
              disabled={isEditing}
            >
              {isEditing ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
} 