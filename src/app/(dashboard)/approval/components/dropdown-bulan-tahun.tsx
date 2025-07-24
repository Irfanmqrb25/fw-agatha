import * as React from "react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

const bulanList = [
  "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"
];
const bulanLabel = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

export function DropdownBulanTahun({ value, onChange, className }: {
  value: string;
  onChange: (val: string) => void;
  className?: string;
}) {
  const currentYear = new Date().getFullYear();
  const tahunList = Array.from({ length: 11 }, (_, i) => (currentYear - 5 + i).toString());
  
  // Default 'all' untuk bulan dan tahun sekarang untuk value awal
  const [bulan, setBulan] = React.useState<string>(value === 'all' ? 'all' : value.split("-")[1] || "all");
  const [tahun, setTahun] = React.useState<string>(value === 'all' ? 'all' : value.split("-")[0] || currentYear.toString());

  React.useEffect(() => {
    if (value === 'all') {
      setBulan('all');
      setTahun('all');
    } else {
      const parts = value.split("-");
      if (parts.length === 2) {
        setTahun(parts[0]);
        setBulan(parts[1]);
      }
    }
  }, [value]);

  const handleBulanChange = (val: string) => {
    setBulan(val);
    if (val === 'all' && tahun === 'all') {
      onChange('all');
    } else if (val === 'all') {
      onChange(`${tahun}-all`);
    } else if (tahun === 'all') {
      onChange(`all-${val}`);
    } else {
      onChange(`${tahun}-${val}`);
    }
  };
  
  const handleTahunChange = (val: string) => {
    setTahun(val);
    if (val === 'all' && bulan === 'all') {
      onChange('all');
    } else if (val === 'all') {
      onChange(`all-${bulan}`);
    } else if (bulan === 'all') {
      onChange(`${val}-all`);
    } else {
      onChange(`${val}-${bulan}`);
    }
  };

  return (
    <div className={`flex flex-col sm:flex-row gap-2 w-full ${className || ""}`}>
      <div className="w-full">
        <Select value={bulan} onValueChange={handleBulanChange}>
          <SelectTrigger className="w-full">
            <SelectValue>{bulan === 'all' ? 'Semua Bulan' : bulanLabel[parseInt(bulan, 10) - 1]}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Bulan</SelectItem>
            {bulanList.map((b, i) => (
              <SelectItem key={b} value={b}>{bulanLabel[i]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="w-full">
        <Select value={tahun} onValueChange={handleTahunChange}>
          <SelectTrigger className="w-full">
            <SelectValue>{tahun === 'all' ? 'Semua Tahun' : tahun}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Tahun</SelectItem>
            {tahunList.map((t) => (
              <SelectItem key={t} value={t}>{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}