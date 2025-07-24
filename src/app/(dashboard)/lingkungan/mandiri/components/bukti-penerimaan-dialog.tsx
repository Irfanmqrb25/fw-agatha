"use client"

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { DanaMandiriTransaction } from '../types';
import dynamic from 'next/dynamic';
import BuktiPenerimaanButton from './bukti-penerimaan-button';

// Gunakan dynamic import untuk menghindari SSR error dengan react-pdf
const BuktiPenerimaanViewer = dynamic(
  () => import('./bukti-penerimaan-viewer'),
  { ssr: false }
);

interface BuktiPenerimaanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: DanaMandiriTransaction;
}

const BuktiPenerimaanDialog: React.FC<BuktiPenerimaanDialogProps> = ({
  open,
  onOpenChange,
  transaction,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Bukti Penerimaan Dana Mandiri</DialogTitle>
        </DialogHeader>

        <div className="flex-grow overflow-auto">
          {open && <BuktiPenerimaanViewer transaction={transaction} />}
        </div>

        <DialogFooter>
          <BuktiPenerimaanButton 
            transaction={transaction} 
            buttonLabel="Unduh PDF"
          />
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Tutup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BuktiPenerimaanDialog;
