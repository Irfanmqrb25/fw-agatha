"use client"

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import SlipPenyetoranViewer from './slip-penyetoran-viewer';
import { DanaMandiriTransaction } from '../types';
import { format } from 'date-fns';

interface SlipPenyetoranDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  year: number;
  transaction?: DanaMandiriTransaction | null;
}

const SlipPenyetoranDialog: React.FC<SlipPenyetoranDialogProps> = ({
  open,
  onOpenChange,
  year,
  transaction
}) => {
  // Siapkan data untuk viewer jika ada transaksi
  const viewerData = transaction ? {
    date: transaction.tanggal,
    familyHeadName: transaction.keluarga?.namaKepalaKeluarga || "Nama Keluarga Tidak Tersedia",
    period: `Dana Mandiri Tahun ${transaction.tahun}`,
    amount: transaction.jumlahDibayar
  } : {
    date: new Date(),
    familyHeadName: "",
    period: `Dana Mandiri Tahun ${year}`,
    amount: 0
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>
            {transaction 
              ? `Bukti Pembayaran Dana Mandiri - ${format(transaction.tanggal, "dd MMMM yyyy")}`
              : "Template Slip Penyetoran Dana Mandiri"}
          </DialogTitle>
        </DialogHeader>
        <SlipPenyetoranViewer 
          date={viewerData.date}
          familyHeadName={viewerData.familyHeadName}
          period={viewerData.period}
          amount={viewerData.amount}
        />
      </DialogContent>
    </Dialog>
  );
};

export default SlipPenyetoranDialog; 