"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { StatusIuran } from "@prisma/client"
import { setIuranIkata, getIuranSetting } from "../utils/monitoring-service"
import { DelinquentPayment } from "../types"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useRouter } from "next/navigation"

interface SetIuranDialogProps {
  payment: DelinquentPayment
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SetIuranDialog({ payment, open, onOpenChange }: SetIuranDialogProps) {
  const router = useRouter()
  const [amount, setAmount] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [statusPembayaran, setStatusPembayaran] = useState<"lunas" | "sebagian_bulan">("lunas")
  const [bulanTerbayar, setBulanTerbayar] = useState<number>(parseInt(payment.periodeAwal.split('-')[1]))
  const [totalIuran, setTotalIuran] = useState("0")
  const [isLoadingSettings, setIsLoadingSettings] = useState(false)
  
  // Dapatkan tahun dari periode
  const tahun = parseInt(payment.periodeAwal.split('-')[0])
  
  // Ambil bulan dari periode awal
  const bulanAwal = parseInt(payment.periodeAwal.split('-')[1])
  
  // Generate opsi bulan
  const bulanOptions = Array.from({ length: 12 }, (_, i) => i + 1)
    .filter(bulan => bulan >= bulanAwal)
    .map(bulan => ({
      value: bulan,
      label: new Date(tahun, bulan - 1, 1).toLocaleString('id-ID', { month: 'long' })
    }))

  // Fetch pengaturan iuran saat dialog dibuka
  useEffect(() => {
    if (open) {
      // Reset semua state ke nilai default
      setAmount("")
      setStatusPembayaran("lunas")
      setBulanTerbayar(bulanAwal)
      setIsLoading(false)
      
      // Fetch pengaturan iuran
      fetchIuranSettings()
    }
  }, [open, bulanAwal])

  // Reset bulanTerbayar ke bulan awal ketika status pembayaran berubah ke sebagian_bulan
  useEffect(() => {
    if (statusPembayaran === "sebagian_bulan") {
      setBulanTerbayar(bulanAwal)
    }
  }, [statusPembayaran, bulanAwal])

  const fetchIuranSettings = async () => {
    setIsLoadingSettings(true)
    try {
      const settings = await getIuranSetting()
      setTotalIuran(settings.tahunan.toString())
    } catch (error) {
      console.error("Error fetching iuran settings:", error)
      // Fallback ke nilai default jika gagal
      setTotalIuran("120000")
      toast.error("Gagal mengambil pengaturan iuran, menggunakan nilai default")
    } finally {
      setIsLoadingSettings(false)
    }
  }

  const handleSubmit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Masukkan jumlah iuran yang valid")
      return
    }

    if (!totalIuran || parseFloat(totalIuran) <= 0) {
      toast.error("Masukkan total iuran yang valid")
      return
    }

    setIsLoading(true)
    
    try {
      // Konversi status aplikasi ke StatusIuran enum Prisma
      const statusIuran: StatusIuran = 
        statusPembayaran === 'lunas' 
          ? StatusIuran.LUNAS 
          : StatusIuran.SEBAGIAN_BULAN
      
      // Panggil server action
      await setIuranIkata(
        payment.keluargaId,
        tahun,
        parseFloat(amount),
        statusIuran,
        statusPembayaran === 'sebagian_bulan' ? bulanTerbayar : undefined,
        parseFloat(totalIuran)
      )
      
      toast.success(`Iuran untuk ${payment.kepalaKeluarga} berhasil diupdate`)
      onOpenChange(false)
      
      // Refresh halaman untuk memperbarui data
      router.refresh()
    } catch (error) {
      console.error("Error setting iuran:", error)
      toast.error("Gagal mengatur iuran. Silakan coba lagi.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Set Iuran IKATA</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Nama Kepala Keluarga</Label>
            <Input value={payment.kepalaKeluarga} disabled />
          </div>
          <div className="space-y-2">
            <Label>Periode</Label>
            <Input 
              value={`${payment.periodeAwal} - ${payment.periodeAkhir}`} 
              disabled 
            />
          </div>
          <div className="space-y-2">
            <Label>Total Iuran</Label>
            <Input
              type="number"
              value={totalIuran}
              onChange={(e) => setTotalIuran(e.target.value)}
              placeholder="Masukkan total iuran tahunan"
              disabled={isLoadingSettings}
            />
            <p className="text-sm text-muted-foreground">
              {isLoadingSettings ? "Mengambil pengaturan iuran..." : "Total iuran untuk satu tahun penuh"}
            </p>
          </div>
          <div className="space-y-2">
            <Label>Status Pembayaran</Label>
            <Select
              value={statusPembayaran}
              onValueChange={(value: "lunas" | "sebagian_bulan") => setStatusPembayaran(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih status pembayaran" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lunas">Lunas</SelectItem>
                <SelectItem value="sebagian_bulan">Sebagian Bulan</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {statusPembayaran === "sebagian_bulan" && (
            <div className="space-y-2">
              <Label>Bulan Terakhir Terbayar</Label>
              <Select 
                value={bulanTerbayar > 0 ? bulanTerbayar.toString() : bulanAwal.toString()}
                onValueChange={(value) => setBulanTerbayar(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih bulan terakhir terbayar" />
                </SelectTrigger>
                <SelectContent>
                  {bulanOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value.toString()}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Bulan {bulanAwal} sampai {bulanTerbayar > 0 ? bulanTerbayar : bulanAwal} akan ditandai lunas
              </p>
            </div>
          )}
          
          <div className="space-y-2">
            <Label>Jumlah Iuran</Label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Masukkan jumlah iuran"
            />
            <p className="text-sm text-muted-foreground">
              Jumlah yang dibayarkan saat ini
            </p>
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Batal
            </Button>
            <Button onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 