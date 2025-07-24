import React from 'react';
import { PDFViewer, PDFDownloadLink } from '@react-pdf/renderer';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Download, FileSearch, AlertTriangle } from 'lucide-react';
import { DanaMandiriTransaction } from '../types';
import BuktiTerimaUangPDF from './bukti-terima-uang-pdf';
import SetorKeParokiPDF from './setor-ke-paroki-pdf';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PDFViewerComponentProps {
  documentType: string;
  documentCategory: "bukti_terima_uang" | "setor_ke_paroki";
  transactions: DanaMandiriTransaction[];
  month?: number;
  year: number;
}

export default function PDFViewerComponent({
  documentType,
  documentCategory,
  transactions,
  month,
  year
}: PDFViewerComponentProps) {
  // Filter transactions by month and year
  let filteredTransactions = transactions;
  
  // Filter by year first
  filteredTransactions = transactions.filter(tx => tx.tahun === year);
  
  // Then by month if specified
  if (month) {
    filteredTransactions = filteredTransactions.filter(tx => {
      // Get month of the transaction payment date (1-12)
      const txMonth = tx.tanggal.getMonth() + 1;
      return txMonth === month;
    });
  }
  
  // Sort transactions by payment date
  filteredTransactions = filteredTransactions.sort((a, b) => {
    return a.tanggal.getTime() - b.tanggal.getTime();
  });

  // Handle document download success
  const handleDownloadSuccess = () => {
    let categoryName = "";
    switch (documentCategory) {
      case "bukti_terima_uang":
        categoryName = "Bukti Terima Uang";
        break;
      case "setor_ke_paroki":
        categoryName = "Setor ke Paroki";
        break;
      default:
        categoryName = "";
    }
    
    const formattedMonth = month 
      ? ` bulan ${new Intl.DateTimeFormat('id-ID', { month: 'long' }).format(new Date(year, month - 1, 1))}` 
      : "";
    
    // Tampilkan notifikasi berhasil unduh
    toast.success(`Bukti Pembayaran ${categoryName}${formattedMonth} tahun ${year} berhasil diunduh`);
  };
  
  const getPdfDocument = () => {
    if (documentCategory === "bukti_terima_uang") {
      return (
        <BuktiTerimaUangPDF 
          transactions={filteredTransactions} 
          month={month} 
          year={year} 
        />
      );
    } else {
      return (
        <SetorKeParokiPDF 
          transactions={filteredTransactions} 
          month={month} 
          year={year} 
        />
      );
    }
  };
  
  const getFileName = () => {
    const categoryPrefix = documentCategory === "bukti_terima_uang" ? "BTU" : "SKP";
    const monthStr = month ? `_Bulan_${month}` : "";
    return `Bukti_Pembayaran_${categoryPrefix}${monthStr}_Tahun_${year}.pdf`;
  };
  
  // Check if document has transactions
  const hasTransactions = filteredTransactions.length > 0;

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2 mb-3">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <FileSearch className="h-4 w-4" />
          {hasTransactions ? 
            `${filteredTransactions.length} transaksi ditemukan untuk periode yang dipilih` : 
            'Tidak ada transaksi dalam periode yang dipilih'}
        </div>
        {hasTransactions ? (
          <PDFDownloadLink 
            document={getPdfDocument()} 
            fileName={getFileName()}
            className="no-underline"
          >
            {({ loading, error }) => (
              <Button 
                variant="outline" 
                disabled={loading || !!error}
                onClick={loading ? undefined : handleDownloadSuccess}
              >
                <Download className="mr-2 h-4 w-4" />
                {loading ? "Mempersiapkan Dokumen..." : 
                 error ? "Error" : "Unduh PDF"}
              </Button>
            )}
          </PDFDownloadLink>
        ) : (
          <Button variant="outline" disabled>
            <Download className="mr-2 h-4 w-4" />
            Tidak Ada Data
          </Button>
        )}
      </div>
      
      {!hasTransactions && (
        <Alert variant="default" className="bg-muted mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Tidak ditemukan transaksi untuk periode yang dipilih. Silakan pilih periode lain atau tambahkan transaksi terlebih dahulu.
          </AlertDescription>
        </Alert>
      )}
      
      <div className="overflow-auto flex-1" style={{ height: "calc(100% - 70px)" }}>
        {hasTransactions ? (
          <PDFViewer style={{ width: '100%', height: '100%' }}>
            {getPdfDocument()}
          </PDFViewer>
        ) : (
          <div className="w-full h-full flex items-center justify-center border rounded-lg bg-muted/20">
            <div className="text-center text-muted-foreground">
              <FileSearch className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p>Tidak ada data untuk ditampilkan</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 