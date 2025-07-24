import React from 'react';
import { Button } from '@/components/ui/button';
import { TransactionData } from '../types';
import dynamic from 'next/dynamic';

// Import komponen client secara dinamis
const PDFButtonClient = dynamic(
  () => import('./pdf-button-client'),
  { ssr: false }
);

const PDFViewerClient = dynamic(
  () => import('./pdf-viewer-client'),
  { ssr: false }
);

interface PDFViewerComponentProps {
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
  onClose: () => void;
}

const PDFViewerComponent: React.FC<PDFViewerComponentProps> = ({
  dateRange,
  transactions,
  summary,
  onClose,
}) => {
  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-xl font-bold">Preview Laporan Kas</h2>
        <div className="flex gap-2">
          <PDFButtonClient
            dateRange={dateRange}
            transactions={transactions}
            summary={summary}
          />
          <Button variant="outline" onClick={onClose}>
            Tutup
          </Button>
        </div>
      </div>

      <div className="flex-grow overflow-hidden">
        <PDFViewerClient
          dateRange={dateRange}
          transactions={transactions}
          summary={summary}
        />
      </div>
    </div>
  );
};

export default PDFViewerComponent; 