"use client"

import React from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { Button } from '@/components/ui/button';
import PDFDocument from './pdf-document';
import { TransactionData } from '../types';
import { lockTransactions } from '../utils/actions';
import { toast } from 'sonner';

interface PDFButtonClientProps {
  dateRange: {
    from: Date;
    to: Date;
  };
  transactions: TransactionData[];
  summary: {
    initialBalance: number;
    totalIncome: number;
    totalExpense: number;
    finalBalance: number;
  };
}

const PDFButtonClient: React.FC<PDFButtonClientProps> = ({
  dateRange,
  transactions,
  summary,
}) => {
  // Filter transaksi sesuai dengan rentang tanggal
  const filteredTransactions = transactions.filter(
    (tx) => tx.tanggal >= dateRange.from && tx.tanggal <= dateRange.to
  );

  // Format nama file untuk download
  const fileName = `Laporan_Kas_Lingkungan_${dateRange.from.toISOString().split('T')[0]}_${dateRange.to.toISOString().split('T')[0]}.pdf`;

  // Fungsi untuk mengunci transaksi saat PDF diunduh
  const handlePDFDownload = async () => {
    try {
      // Dapatkan ID transaksi yang belum dikunci/disetujui
      const transactionIdsToLock = filteredTransactions
        .filter(tx => !tx.isApproved)
        .map(tx => tx.id);

      if (transactionIdsToLock.length > 0) {
        // Panggil API untuk mengunci transaksi
        const result = await lockTransactions(transactionIdsToLock);
        if (result.success) {
          toast.success(`${transactionIdsToLock.length} transaksi telah dikunci`);
        }
      }
    } catch (error) {
      console.error("Error locking transactions:", error);
      toast.error("Gagal mengunci transaksi");
    }
  };

  return (
    <PDFDownloadLink
      document={
        <PDFDocument
          dateRange={dateRange}
          transactions={filteredTransactions}
          summary={summary}
        />
      }
      fileName={fileName}
      className="inline-block"
      onClick={handlePDFDownload}
    >
      {({ loading, error }) => (
        <Button disabled={loading}>
          {loading ? 'Mempersiapkan dokumen...' : 'Unduh PDF'}
        </Button>
      )}
    </PDFDownloadLink>
  );
};

export default PDFButtonClient; 