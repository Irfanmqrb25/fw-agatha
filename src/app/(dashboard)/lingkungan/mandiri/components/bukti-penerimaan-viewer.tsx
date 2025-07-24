"use client"

import React from 'react';
import { PDFViewer } from '@react-pdf/renderer';
import BuktiPenerimaanPDF from './bukti-penerimaan-pdf';
import { DanaMandiriTransaction } from '../types';

interface BuktiPenerimaanViewerProps {
  transaction: DanaMandiriTransaction;
}

const BuktiPenerimaanViewer: React.FC<BuktiPenerimaanViewerProps> = ({
  transaction,
}) => {
  return (
    <PDFViewer width="100%" height="100%" style={{ height: '70vh', border: 'none' }}>
      <BuktiPenerimaanPDF transaction={transaction} />
    </PDFViewer>
  );
};

export default BuktiPenerimaanViewer; 