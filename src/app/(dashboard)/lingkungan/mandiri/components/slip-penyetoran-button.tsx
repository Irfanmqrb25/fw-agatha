"use client"

import React from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import SlipPenyetoranPDF from './slip-penyetoran-pdf';

interface SlipPenyetoranButtonProps {
  date?: Date;
  familyHeadName?: string;
  period?: string;
  amount?: number;
  buttonLabel?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
}

const SlipPenyetoranButton: React.FC<SlipPenyetoranButtonProps> = ({
  date = new Date(),
  familyHeadName = "",
  period = "",
  amount = 0,
  buttonLabel = "Unduh Slip Penyetoran",
  variant = "outline"
}) => {
  return (
    <PDFDownloadLink 
      document={
        <SlipPenyetoranPDF 
          date={date}
          familyHeadName={familyHeadName}
          period={period}
          amount={amount}
        />
      } 
      fileName="slip-penyetoran-dana-mandiri.pdf"
    >
      {({ loading }) => (
        <Button 
          variant={variant} 
          disabled={loading}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          {loading ? 'Mempersiapkan dokumen...' : buttonLabel}
        </Button>
      )}
    </PDFDownloadLink>
  );
};

export default SlipPenyetoranButton; 