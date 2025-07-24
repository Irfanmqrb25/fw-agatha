"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ProcessTarget } from "../types";

interface ProcessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (processTarget: ProcessTarget) => void;
}

export function ProcessDialog({
  open,
  onOpenChange,
  onSubmit,
}: ProcessDialogProps) {
  const [processTarget, setProcessTarget] = useState<ProcessTarget>("lingkungan");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(processTarget);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tindak Lanjut Agenda</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Proses di:
            </label>
            <RadioGroup
              value={processTarget}
              onValueChange={(value: ProcessTarget) => setProcessTarget(value)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="lingkungan" id="process-lingkungan" />
                <Label htmlFor="process-lingkungan">Diproses di Lingkungan</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="stasi" id="process-stasi" />
                <Label htmlFor="process-stasi">Diproses di Stasi</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="paroki" id="process-paroki" />
                <Label htmlFor="process-paroki">Diproses di Paroki</Label>
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
            <Button type="submit">Proses</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 