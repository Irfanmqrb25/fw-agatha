"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

type UpdateStatusOption = 'forwarded_to_paroki' | 'completed' | 'rejected';

interface UpdateStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (status: UpdateStatusOption) => void;
}

export function UpdateStatusDialog({
  open,
  onOpenChange,
  onSubmit,
}: UpdateStatusDialogProps) {
  const [selectedStatus, setSelectedStatus] = useState<UpdateStatusOption>('completed');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(selectedStatus);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Status Agenda</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Update Status:
            </label>
            <RadioGroup
              value={selectedStatus}
              onValueChange={(value: UpdateStatusOption) => setSelectedStatus(value)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="forwarded_to_paroki" id="forwarded_to_paroki" />
                <Label htmlFor="forwarded_to_paroki">Diteruskan ke Paroki</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="completed" id="completed" />
                <Label htmlFor="completed">Selesai</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="rejected" id="rejected" />
                <Label htmlFor="rejected">Ditolak</Label>
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
            <Button type="submit">Update</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 