"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface PetugasMisaData {
  pemimpin: string;      // Pemimpin Misa
  bacaanPertama: string; // Bacaan I
  pemazmur: string;      // Pemazmur
  jumlahPeserta: number; // Jumlah Peserta
}

interface PetugasMisaSectionProps {
  petugasMisa: PetugasMisaData;
  onPetugasMisaChange: (field: 'pemimpin' | 'bacaanPertama' | 'pemazmur', value: string) => void;
  onJumlahPesertaChange: (value: number) => void;
}

export function PetugasMisaSection({
  petugasMisa,
  onPetugasMisaChange,
  onJumlahPesertaChange,
}: PetugasMisaSectionProps) {
  return (
    <div className="space-y-4 rounded-lg border p-4">
      <h3 className="text-md font-medium mb-2">Petugas Misa</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="pemimpinMisa">Pemimpin Misa</Label>
          <Input
            id="pemimpinMisa"
            name="pemimpinMisa"
            value={petugasMisa.pemimpin}
            onChange={(e) => onPetugasMisaChange("pemimpin", e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="bacaanPertama">Bacaan I</Label>
          <Input
            id="bacaanPertama"
            name="bacaanPertama"
            value={petugasMisa.bacaanPertama}
            onChange={(e) => onPetugasMisaChange("bacaanPertama", e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="pemazmur">Pemazmur</Label>
          <Input
            id="pemazmur"
            name="pemazmur"
            value={petugasMisa.pemazmur}
            onChange={(e) => onPetugasMisaChange("pemazmur", e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="jumlahPeserta">Jumlah Peserta</Label>
          <Input
            id="jumlahPeserta"
            name="jumlahPeserta"
            type="number"
            value={petugasMisa.jumlahPeserta}
            onChange={(e) => onJumlahPesertaChange(parseInt(e.target.value || "0"))}
          />
        </div>
      </div>
    </div>
  );
} 