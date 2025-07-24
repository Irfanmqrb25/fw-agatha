"use client";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { StatusKegiatan } from "@prisma/client";

interface KeteranganStatusSectionProps {
  keterangan: string;
  status: StatusKegiatan;
  onKeteranganChange: (value: string) => void;
  onStatusChange: (value: StatusKegiatan) => void;
  approved: boolean;
}

export function KeteranganStatusSection({
  keterangan,
  status = StatusKegiatan.BELUM_SELESAI,
  onKeteranganChange,
  onStatusChange,
  approved
}: KeteranganStatusSectionProps) {
  return (
    <div className="space-y-4 p-4 pt-2 border rounded-lg">
      <h3 className="text-lg font-semibold mb-2">Status Kegiatan</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Keterangan */}
        <div className="space-y-2">
          <Label htmlFor="keterangan">Keterangan (Opsional)</Label>
          <Textarea
            id="keterangan"
            placeholder="Masukkan keterangan tambahan..."
            value={keterangan}
            onChange={(e) => onKeteranganChange(e.target.value)}
            className="min-h-[100px]"
          />
        </div>
        
        {/* Status Kegiatan */}
        <div className="space-y-2">
          <Label>Status Kegiatan</Label>
          <RadioGroup
            value={status}
            onValueChange={onStatusChange}
            className="flex flex-col space-y-1"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value={StatusKegiatan.BELUM_SELESAI} id="menunggu" />
              <Label htmlFor="menunggu">Menunggu</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value={StatusKegiatan.DIBATALKAN} id="dibatalkan" />
              <Label htmlFor="dibatalkan">Dibatalkan</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem 
                value={StatusKegiatan.SELESAI}
                id="selesai" 
                disabled={!approved}
                className={!approved ? "opacity-50 cursor-not-allowed" : ""}
              />
              <Label 
                htmlFor="selesai" 
                className={!approved ? "opacity-50 cursor-not-allowed" : ""}
              >
                Selesai {!approved && "(Perlu approval)"}
              </Label>
            </div>
          </RadioGroup>
        </div>
      </div>
    </div>
  );
} 