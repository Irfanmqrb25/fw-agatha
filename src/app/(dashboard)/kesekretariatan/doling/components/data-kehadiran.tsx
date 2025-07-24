"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface KehadiranData {
  totalHadir: number;
  jumlahKKHadir?: number;
  bapak: number;
  ibu: number;
  omk: number;
  biaKecil: number; // BIA (0-6 tahun)
  biaBesar: number; // BIA (7-13 tahun)
  bir: number;
}

interface DataKehadiranSectionProps {
  jumlahKehadiran: KehadiranData;
  onKehadiranChange: (e: React.ChangeEvent<HTMLInputElement>, field: keyof KehadiranData) => void;
}

export function DataKehadiranSection({
  jumlahKehadiran,
  onKehadiranChange,
}: DataKehadiranSectionProps) {
  return (
    <div className="space-y-4 rounded-lg border p-4">
      <h3 className="text-md font-medium mb-2">Data Kehadiran</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="totalHadir">Jumlah Total Hadir</Label>
          <Input
            id="totalHadir"
            name="totalHadir"
            type="number"
            value={jumlahKehadiran.totalHadir}
            onChange={(e) => onKehadiranChange(e, "totalHadir")}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="jumlahKKHadir">Jumlah KK Hadir</Label>
          <Input
            id="jumlahKKHadir"
            name="jumlahKKHadir"
            type="number"
            value={jumlahKehadiran.jumlahKKHadir || 0}
            onChange={(e) => onKehadiranChange(e, "jumlahKKHadir")}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="jumlahBapak">Jumlah Bapak</Label>
          <Input
            id="jumlahBapak"
            name="jumlahBapak"
            type="number"
            value={jumlahKehadiran.bapak}
            onChange={(e) => onKehadiranChange(e, "bapak")}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="jumlahIbu">Jumlah Ibu</Label>
          <Input
            id="jumlahIbu"
            name="jumlahIbu"
            type="number"
            value={jumlahKehadiran.ibu}
            onChange={(e) => onKehadiranChange(e, "ibu")}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="jumlahOMK">Jumlah OMK</Label>
          <Input
            id="jumlahOMK"
            name="jumlahOMK"
            type="number"
            value={jumlahKehadiran.omk}
            onChange={(e) => onKehadiranChange(e, "omk")}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="jumlahBIAKecil">Jumlah BIA (0-6 tahun)</Label>
          <Input
            id="jumlahBIAKecil"
            name="jumlahBIAKecil"
            type="number"
            value={jumlahKehadiran.biaKecil}
            onChange={(e) => onKehadiranChange(e, "biaKecil")}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="jumlahBIABesar">Jumlah BIA (7-13 tahun)</Label>
          <Input
            id="jumlahBIABesar"
            name="jumlahBIABesar"
            type="number"
            value={jumlahKehadiran.biaBesar}
            onChange={(e) => onKehadiranChange(e, "biaBesar")}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="jumlahBIR">Jumlah BIR</Label>
          <Input
            id="jumlahBIR"
            name="jumlahBIR"
            type="number"
            value={jumlahKehadiran.bir}
            onChange={(e) => onKehadiranChange(e, "bir")}
          />
        </div>
      </div>
    </div>
  );
} 