"use client"

import React from 'react';
import { PDFViewer } from '@react-pdf/renderer';
import PDFDocument from './pdf-document';
import { TransactionData } from '../types';

interface PDFViewerClientProps {
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

const PDFViewerClient: React.FC<PDFViewerClientProps> = ({
  dateRange,
  transactions,
  summary,
}) => {
  // Filter transaksi sesuai dengan rentang tanggal
  const filteredTransactions = transactions.filter(
    (tx) => tx.tanggal >= dateRange.from && tx.tanggal <= dateRange.to
  );

  return (
    <PDFViewer width="100%" height="100%" style={{ height: '100%', minHeight: '75vh', border: 'none' }}>
      <PDFDocument
        dateRange={dateRange}
        transactions={filteredTransactions}
        summary={summary}
      />
    </PDFViewer>
  );
};

export default PDFViewerClient; 