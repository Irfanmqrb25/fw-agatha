"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { JadwalDoling } from "../types";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { toast } from "sonner";

interface PrintJadwalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jadwal: JadwalDoling[];
  onPrint: (startMonth: number, startYear: number, endMonth: number, endYear: number) => void;
}

export function PrintJadwalDialog({
  open,
  onOpenChange,
  jadwal,
  onPrint,
}: PrintJadwalDialogProps) {
  const currentYear = new Date().getFullYear();
  const [startMonth, setStartMonth] = useState<string>("1");
  const [startYear, setStartYear] = useState<string>(currentYear.toString());
  const [endMonth, setEndMonth] = useState<string>("12");
  const [endYear, setEndYear] = useState<string>(currentYear.toString());

  const yearRange = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  const months = [
    { value: "1", label: "Januari" },
    { value: "2", label: "Februari" },
    { value: "3", label: "Maret" },
    { value: "4", label: "April" },
    { value: "5", label: "Mei" },
    { value: "6", label: "Juni" },
    { value: "7", label: "Juli" },
    { value: "8", label: "Agustus" },
    { value: "9", label: "September" },
    { value: "10", label: "Oktober" },
    { value: "11", label: "November" },
    { value: "12", label: "Desember" },
  ];

  const handlePrint = () => {
    // Validate date range
    const startDate = new Date(parseInt(startYear), parseInt(startMonth) - 1, 1);
    const endDate = new Date(parseInt(endYear), parseInt(endMonth) - 1, 31);

    if (startDate > endDate) {
      toast.error("Rentang tanggal tidak valid. Tanggal awal harus sebelum tanggal akhir.");
      return;
    }

    onPrint(
      parseInt(startMonth), 
      parseInt(startYear), 
      parseInt(endMonth), 
      parseInt(endYear)
    );
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Cetak Jadwal Doa Lingkungan</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Periode Awal</Label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startMonth" className="text-xs">Bulan</Label>
                <Select value={startMonth} onValueChange={setStartMonth}>
                  <SelectTrigger id="startMonth">
                    <SelectValue placeholder="Pilih Bulan" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((month) => (
                      <SelectItem key={month.value} value={month.value}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="startYear" className="text-xs">Tahun</Label>
                <Select value={startYear} onValueChange={setStartYear}>
                  <SelectTrigger id="startYear">
                    <SelectValue placeholder="Pilih Tahun" />
                  </SelectTrigger>
                  <SelectContent>
                    {yearRange.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Periode Akhir</Label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="endMonth" className="text-xs">Bulan</Label>
                <Select value={endMonth} onValueChange={setEndMonth}>
                  <SelectTrigger id="endMonth">
                    <SelectValue placeholder="Pilih Bulan" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((month) => (
                      <SelectItem key={month.value} value={month.value}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="endYear" className="text-xs">Tahun</Label>
                <Select value={endYear} onValueChange={setEndYear}>
                  <SelectTrigger id="endYear">
                    <SelectValue placeholder="Pilih Tahun" />
                  </SelectTrigger>
                  <SelectContent>
                    {yearRange.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            PDF akan memuat jadwal doa lingkungan dari {months.find(m => m.value === startMonth)?.label} {startYear} hingga {months.find(m => m.value === endMonth)?.label} {endYear}.
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button onClick={handlePrint}>
            Cetak PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 