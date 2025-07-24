"use client"

import { format } from "date-fns"
import { DanaMandiriTransaction } from "../types"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { InfoIcon } from "lucide-react"

interface TransactionDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  transaction: DanaMandiriTransaction | null
}

export function TransactionDetailDialog({
  open,
  onOpenChange,
  transaction
}: TransactionDetailDialogProps) {
  
  if (!transaction) {
    return null
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  // Get status badge
  const getStatusBadge = () => {
    if (transaction.statusSetor) {
      return (
        <Badge className="bg-green-500 hover:bg-green-600">
          Sudah Disetor
        </Badge>
      )
    } else {
      return (
        <Badge className="bg-yellow-500 hover:bg-yellow-600">
          Belum Disetor
        </Badge>
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] md:max-w-[550px] w-full mx-auto">
        <DialogHeader>
          <DialogTitle>Detail Transaksi</DialogTitle>
          <DialogDescription>
            Informasi lengkap transaksi Dana Mandiri
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">Kepala Keluarga</h4>
              <p className="text-base font-medium">
                {transaction.keluarga?.namaKepalaKeluarga || "Tidak tersedia"}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">Tahun</h4>
                <p className="text-base font-medium">{transaction.tahun}</p>
              </div>
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">Bulan</h4>
                <p className="text-base font-medium">
                  {new Intl.DateTimeFormat('id-ID', { month: 'long' }).format(new Date(2021, transaction.bulan - 1, 1))}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">Jumlah</h4>
              <p className="text-lg font-bold text-primary">
                {formatCurrency(transaction.jumlahDibayar)}
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">Tanggal Pembayaran</h4>
                <p className="text-base font-medium">
                  {format(new Date(transaction.tanggal), "dd MMMM yyyy")}
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">Status</h4>
                <div>{getStatusBadge()}</div>
              </div>
            </div>
            
            {transaction.statusSetor && transaction.tanggalSetor && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">Tanggal Setor ke Paroki</h4>
                <p className="text-base font-medium">
                  {format(new Date(transaction.tanggalSetor), "dd MMMM yyyy")}
                </p>
              </div>
            )}
            
            <div className="bg-muted p-3 rounded-md flex gap-2 items-start">
              <InfoIcon className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-sm font-medium">Informasi Kontak</h4>
                <p className="text-sm text-muted-foreground">
                  {transaction.keluarga?.alamat ? transaction.keluarga.alamat : "Alamat tidak tersedia"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {transaction.keluarga?.nomorTelepon ? 
                    `Telepon: ${transaction.keluarga.nomorTelepon}` : 
                    "Nomor telepon tidak tersedia"}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            Tutup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 