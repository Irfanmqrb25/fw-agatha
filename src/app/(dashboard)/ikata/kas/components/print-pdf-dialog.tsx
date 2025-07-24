'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PeriodFilter as PeriodFilterType } from '../types';
import { PDFViewer, PDFDownloadLink } from '@react-pdf/renderer';
import { KasIKATAPDF } from './kas-ikata-pdf';
import { IKATASummary, IKATATransaction } from '../types';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Download, X } from 'lucide-react';
import { Alert } from '@/components/ui/alert';

interface PrintPDFDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  period: PeriodFilterType;
  summary: IKATASummary;
  skipConfirmation?: boolean;
  transactions?: IKATATransaction[];
  onPrint: (data: { dateRange: { from: Date; to: Date }; lockTransactions: boolean }) => void;
}

export function PrintPDFDialog({ 
  open, 
  onOpenChange, 
  period, 
  summary, 
  skipConfirmation = false,
  transactions = [],
  onPrint 
}: PrintPDFDialogProps) {
  const [isPDFReady, setIsPDFReady] = useState(false);
  
  // Tampilkan PDF langsung saat dialog dibuka
  useEffect(() => {
    if (open && !isPDFReady) {
      setIsPDFReady(true);
    }
  }, [open]);
  
  const handleClose = () => {
    setIsPDFReady(false);
    onOpenChange(false);
  };
  
  // Function to handle PDF download and lock transactions
  const handleDownloadPDF = () => {
    // Tanggal awal dan akhir periode cetak
    let dateRange;
    
    if (period.bulan === 0) {
      // Untuk semua bulan dalam tahun tertentu
      const firstDay = new Date(period.tahun, 0, 1); // 1 Januari tahun dipilih
      const lastDay = new Date(period.tahun, 11, 31); // 31 Desember tahun dipilih
      dateRange = { from: firstDay, to: lastDay };
    } else {
      // Tanggal awal dan akhir bulan spesifik
      const firstDay = new Date(period.tahun, period.bulan - 1, 1);
      const lastDay = new Date(period.tahun, period.bulan, 0);
      dateRange = { from: firstDay, to: lastDay };
    }
    
    // Lock transactions when downloading
    onPrint({ 
      dateRange, 
      lockTransactions: true 
    });
  };
  
  // Format bulan dalam bahasa Indonesia
  const bulanText = period.bulan === 0 
    ? "Semua Bulan" 
    : format(new Date(period.tahun, period.bulan - 1, 1), 'MMMM', { locale: id });
    
  const tahunText = period.tahun.toString();
    
  const fileName = `Laporan_Kas_IKATA_${period.bulan === 0 ? `Semua_Bulan_${period.tahun}` : `${bulanText}_${period.tahun}`}.pdf`;
  
  return (
    <Dialog open={open} onOpenChange={(open) => {
      if (!open) handleClose();
      else onOpenChange(open);
    }}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] p-6">
        <DialogHeader className="flex flex-row items-center justify-between pb-2">
          <DialogTitle>
            Laporan Kas IKATA - {bulanText} {tahunText}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <PDFViewer width="100%" height="450px" className="border rounded-md shadow-sm">
            <KasIKATAPDF 
              period={period} 
              summary={summary} 
              transactions={transactions}
            />
          </PDFViewer>
          <DialogFooter className="flex flex-col md:flex-row gap-2">
            <Button variant="outline" onClick={handleClose}>
              Tutup
            </Button>
            <PDFDownloadLink
              document={
                <KasIKATAPDF 
                  period={period} 
                  summary={summary} 
                  transactions={transactions}
                />
              }
              fileName={fileName}
              className="flex"
              onClick={handleDownloadPDF}
            >
              {({ loading, url }) => (
                <Button disabled={loading}>
                  <Download className="h-4 w-4 mr-2" /> 
                  {loading ? 'Menyiapkan...' : 'Unduh PDF dan Kunci Data'}
                </Button>
              )}
            </PDFDownloadLink>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
} 