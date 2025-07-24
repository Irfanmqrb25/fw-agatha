"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

type FinalResultOption = 'completed' | 'rejected';

interface FinalResultDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (result: FinalResultOption) => void;
}

export function FinalResultDialog({
  open,
  onOpenChange,
  onSubmit,
}: FinalResultDialogProps) {
  const [selectedResult, setSelectedResult] = useState<FinalResultOption>('completed');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(selectedResult);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Hasil Akhir Agenda</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Hasil Akhir:
            </label>
            <RadioGroup
              value={selectedResult}
              onValueChange={(value: FinalResultOption) => setSelectedResult(value)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="completed" id="final-completed" />
                <Label htmlFor="final-completed">Selesai</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="rejected" id="final-rejected" />
                <Label htmlFor="final-rejected">Ditolak</Label>
              </div>
            </RadioGroup>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Batal
            </Button>
            <Button type="submit">Simpan</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 