"use client"

import React from 'react';
import { PDFViewer, PDFDownloadLink } from '@react-pdf/renderer';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import SlipPenyetoranPDF from './slip-penyetoran-pdf';

interface SlipPenyetoranViewerProps {
  date?: Date;
  familyHeadName?: string;
  period?: string;
  amount?: number;
  showDownloadButton?: boolean;
}

const SlipPenyetoranViewer: React.FC<SlipPenyetoranViewerProps> = ({
  date = new Date(),
  familyHeadName = "",
  period = "",
  amount = 0,
  showDownloadButton = true
}) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="w-full h-[500px] border rounded-lg overflow-hidden">
        <PDFViewer width="100%" height="100%" style={{ border: 'none' }}>
          <SlipPenyetoranPDF 
            date={date}
            familyHeadName={familyHeadName}
            period={period}
            amount={amount}
          />
        </PDFViewer>
      </div>
      
      {showDownloadButton && (
        <div className="flex justify-end">
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
                variant="outline" 
                disabled={loading}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                {loading ? 'Mempersiapkan dokumen...' : 'Unduh PDF'}
              </Button>
            )}
          </PDFDownloadLink>
        </div>
      )}
    </div>
  );
};

export default SlipPenyetoranViewer; 