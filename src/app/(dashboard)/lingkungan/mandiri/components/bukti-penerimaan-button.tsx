"use client"

import React from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { Button } from '@/components/ui/button';
import BuktiPenerimaanPDF from './bukti-penerimaan-pdf';
import { DanaMandiriTransaction } from '../types';

interface BuktiPenerimaanButtonProps {
  transaction: DanaMandiriTransaction;
  buttonLabel?: string;
}

const BuktiPenerimaanButton: React.FC<BuktiPenerimaanButtonProps> = ({
  transaction,
  buttonLabel = 'Unduh Bukti Penerimaan',
}) => {
  // Format nama file untuk download
  const fileName = `Bukti_Penerimaan_Dana_Mandiri_${transaction.id}_${transaction.tahun}.pdf`;

  return (
    <PDFDownloadLink
      document={<BuktiPenerimaanPDF transaction={transaction} />}
      fileName={fileName}
      className="inline-block"
    >
      {({ loading, error }) => (
        <Button variant="outline" disabled={loading}>
          {loading ? 'Mempersiapkan dokumen...' : buttonLabel}
        </Button>
      )}
    </PDFDownloadLink>
  );
};

export default BuktiPenerimaanButton; 