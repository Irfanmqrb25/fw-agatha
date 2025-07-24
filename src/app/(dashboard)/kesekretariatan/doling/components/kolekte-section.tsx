"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface KolekteData {
  kolekte1: number;
  kolekte2: number;
  ucapanSyukur: number;
}

interface KolekteSectionProps {
  kolekteData: KolekteData;
  onKolekteChange: (e: React.ChangeEvent<HTMLInputElement>, field: keyof KolekteData) => void;
}

export function KolekteSection({
  kolekteData,
  onKolekteChange,
}: KolekteSectionProps) {
  // Format rupiah
  const formatRupiah = (value: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };
  
  const totalKolekte = kolekteData.kolekte1 + kolekteData.kolekte2 + kolekteData.ucapanSyukur;

  return (
    <div className="space-y-4 rounded-lg border p-4">
      <h3 className="text-md font-medium mb-2">Persembahan/Kolekte</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="kolekte1">Kolekte I</Label>
          <Input
            id="kolekte1"
            name="kolekte1"
            type="number"
            value={kolekteData.kolekte1}
            onChange={(e) => onKolekteChange(e, "kolekte1")}
          />
          <p className="text-xs text-muted-foreground">
            {formatRupiah(kolekteData.kolekte1)}
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="kolekte2">Kolekte II</Label>
          <Input
            id="kolekte2"
            name="kolekte2"
            type="number"
            value={kolekteData.kolekte2}
            onChange={(e) => onKolekteChange(e, "kolekte2")}
          />
          <p className="text-xs text-muted-foreground">
            {formatRupiah(kolekteData.kolekte2)}
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="ucapanSyukur">Ucapan Syukur</Label>
          <Input
            id="ucapanSyukur"
            name="ucapanSyukur"
            type="number"
            value={kolekteData.ucapanSyukur}
            onChange={(e) => onKolekteChange(e, "ucapanSyukur")}
          />
          <p className="text-xs text-muted-foreground">
            {formatRupiah(kolekteData.ucapanSyukur)}
          </p>
        </div>
      </div>
      
      {/* Total */}
      <div className="mt-2 text-right">
        <p className="text-sm font-medium">
          Total: {formatRupiah(totalKolekte)}
        </p>
      </div>
    </div>
  );
} 