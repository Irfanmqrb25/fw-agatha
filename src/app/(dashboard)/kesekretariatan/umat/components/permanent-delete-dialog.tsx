"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from "@/components/ui/dialog";
import { AlertTriangle } from "lucide-react";
import { FamilyHeadWithDetails } from "../types";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PermanentDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  familyHead: FamilyHeadWithDetails | null;
  onConfirm: (id: string) => Promise<void>;
}

export function PermanentDeleteDialog({
  open,
  onOpenChange,
  familyHead,
  onConfirm
}: PermanentDeleteDialogProps) {
  const [confirmationText, setConfirmationText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const expectedText = "HAPUS PERMANEN";
  const isConfirmationValid = confirmationText.trim().toUpperCase() === expectedText;

  const handleConfirm = async () => {
    if (!familyHead || !isConfirmationValid) return;
    
    setIsDeleting(true);
    try {
      await onConfirm(familyHead.id);
      setConfirmationText("");
      onOpenChange(false);
    } catch (error) {
      console.error("Error deleting family:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setConfirmationText("");
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px] w-[95vw] max-w-[95vw] sm:w-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Hapus Data Secara Permanen
          </DialogTitle>
          <DialogDescription>
            Anda akan menghapus data keluarga <strong>{familyHead?.nama}</strong> secara permanen dari sistem.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="space-y-2">
              <div className="font-semibold">PERINGATAN KERAS!</div>
              <div>Tindakan ini akan:</div>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Menghapus SEMUA data keluarga dari sistem</li>
                <li>Menghapus data pasangan dan tanggungan</li>
                <li>Menghapus riwayat kas lingkungan yang terkait</li>
                <li>Menghapus riwayat dana mandiri dan IKATA</li>
                <li>Menghapus riwayat doa lingkungan sebagai tuan rumah</li>
                <li>Menghapus akun user yang terkait</li>
              </ul>
              <div className="font-semibold text-destructive">
                Data yang dihapus TIDAK DAPAT DIKEMBALIKAN!
              </div>
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="confirmation-text">
              Untuk melanjutkan, ketik <strong className="text-destructive">{expectedText}</strong> di bawah ini:
            </Label>
            <Input
              id="confirmation-text"
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              placeholder={`Ketik "${expectedText}" untuk konfirmasi`}
              className="font-mono"
            />
          </div>
        </div>

        <DialogFooter className="flex sm:flex-row gap-2 mt-4">
          <Button 
            variant="outline" 
            onClick={() => handleOpenChange(false)}
            className="w-full sm:w-auto"
            disabled={isDeleting}
          >
            Batal
          </Button>
          <Button 
            variant="destructive"
            onClick={handleConfirm}
            disabled={!isConfirmationValid || isDeleting}
            className="w-full sm:w-auto"
          >
            {isDeleting ? "Menghapus..." : "Hapus Permanen"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 