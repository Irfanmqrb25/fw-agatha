"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { sendNotificationToDelinquents } from "../utils/monitoring-service"
import { DelinquentPayment } from "../types"

interface SendNotificationDialogProps {
  delinquentPayments: DelinquentPayment[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SendNotificationDialog({ 
  delinquentPayments, 
  open, 
  onOpenChange 
}: SendNotificationDialogProps) {
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSend = async () => {
    if (!message.trim()) {
      toast.error("Pesan notifikasi tidak boleh kosong")
      return
    }

    if (delinquentPayments.length === 0) {
      toast.error("Tidak ada penerima notifikasi yang dipilih")
      return
    }

    setIsLoading(true)

    try {
      // Gunakan keluargaId dari delinquentPayments
      const keluargaIds = delinquentPayments.map(payment => payment.keluargaId)
      
      // Panggil server action untuk mengirim notifikasi
      const result = await sendNotificationToDelinquents(keluargaIds, message)
      
      if (result.success) {
        toast.success(result.message || "Notifikasi pengingat berhasil dikirim")
        setMessage("") // Reset pesan setelah berhasil
        onOpenChange(false)
      } else {
        toast.error("Gagal mengirim notifikasi")
      }
    } catch (error) {
      console.error("Error sending notifications:", error)
      toast.error("Gagal mengirim notifikasi. Silakan coba lagi.")
    } finally {
      setIsLoading(false)
    }
  }

  // Set pesan default saat dialog dibuka
  const handleOpenChange = (open: boolean) => {
    if (open && !message) {
      const currentYear = new Date().getFullYear()
      setMessage(`Pengingat: Mohon segera melunasi iuran IKATA tahun ${currentYear}. Terima kasih atas perhatiannya.`)
    }
    onOpenChange(open)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Kirim Notifikasi Pengingat</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-2">
              Jumlah penerima: {delinquentPayments.length} kepala keluarga
            </p>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tulis pesan notifikasi..."
              className="min-h-[100px]"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Batal
            </Button>
            <Button onClick={handleSend} disabled={isLoading}>
              {isLoading ? "Mengirim..." : "Kirim"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 