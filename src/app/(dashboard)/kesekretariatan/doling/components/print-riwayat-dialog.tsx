"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RiwayatDolingPDF } from "./riwayat-doling-pdf";
import { DetilDoling, AbsensiDoling } from "../types";
import { format } from "date-fns";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface KepalaKeluarga {
  nama: string;
  status: 'hadir' | 'hanya_suami' | 'hanya_istri' | 'tidak_hadir';
}

interface PrintRiwayatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  detilDolingData: DetilDoling[];
  absensiDolingData: AbsensiDoling[];
}

interface RiwayatDolingPDFProps {
  data: {
    tanggal: Date;
    jenisIbadat: string;
    subIbadat: string;
    temaIbadat: string;
    tuanRumah: string;
    // Statistik kehadiran
    jumlahKK: number;
    jumlahBapak: number;
    jumlahIbu: number;
    jumlahOMK: number;
    jumlahBIR: number;
    jumlahBIA: number;
    jumlahBIA713: number;
    // Penerimaan
    kolekte1: number;
    kolekte2: number;
    ucapanSyukur: number;
    // Kehadiran KK
    kepalaKeluarga: KepalaKeluarga[];
    // Petugas Keibadatan
    pemimpinIbadat?: string;
    pemimpinRosario?: string;
    pembawaRenungan?: string;
    pembawaLagu?: string;
    doaUmat?: string;
    bacaan?: string;
    pemimpinMisa?: string;
    pemazmur?: string;
  };
}

export function PrintRiwayatDialog({
  open,
  onOpenChange,
  detilDolingData,
  absensiDolingData
}: PrintRiwayatDialogProps) {
  const [selectedDetilId, setSelectedDetilId] = useState<string>("");
  const [showPDF, setShowPDF] = useState(false);
  const [openCombobox, setOpenCombobox] = useState(false);

  // Reset state when dialog opens/closes
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setShowPDF(false);
      setSelectedDetilId("");
    }
    onOpenChange(open);
  };

  // Handle generation of PDF
  const handleShowPDF = () => {
    if (selectedDetilId) {
      setShowPDF(true);
    }
  };

  // Pilih detil doling yang tersedia untuk dicetak (yang berstatus 'selesai')
  const availableDetilDoling = detilDolingData.filter(item => item.status === 'selesai');

  // Ambil data detil yang dipilih
  const selectedDetil = selectedDetilId 
    ? detilDolingData.find(item => item.id === selectedDetilId) 
    : null;

  // Buat data untuk PDF berdasarkan detil yang dipilih
  const getPDFData = () => {
    if (!selectedDetil) return null;

    // Filter absensi yang terkait dengan jadwal yang dipilih berdasarkan ID
    const relevantAbsensi = absensiDolingData.filter(
      (absensi) => absensi.doaLingkunganId === selectedDetilId
    );

    // Transformasi data absensi ke format yang dibutuhkan untuk PDF
    const kepalaKeluarga = relevantAbsensi.map((absensi) => {
      let status: 'hadir' | 'tidak_hadir' | 'hanya_suami' | 'hanya_istri' = 'tidak_hadir';
      
      // Gunakan statusKehadiran yang sebenarnya dari data absensi
      if (absensi.statusKehadiran) {
        switch (absensi.statusKehadiran) {
          case 'SUAMI_ISTRI_HADIR':
            status = 'hadir';
            break;
          case 'SUAMI_SAJA':
            status = 'hanya_suami';
            break;
          case 'ISTRI_SAJA':
            status = 'hanya_istri';
            break;
          case 'TIDAK_HADIR':
          default:
            status = 'tidak_hadir';
            break;
        }
      } else {
        // Fallback ke field hadir jika statusKehadiran tidak ada
        status = absensi.hadir ? 'hadir' : 'tidak_hadir';
      }
      
      return {
        nama: absensi.namaKeluarga,
        status: status,
      };
    });

    return {
      tanggal: selectedDetil.tanggal,
      jenisIbadat: selectedDetil.jenisIbadat,
      subIbadat: selectedDetil.subIbadat || "Umum",
      temaIbadat: selectedDetil.temaIbadat || "Doa Lingkungan",
      tuanRumah: selectedDetil.tuanRumah,
      // Statistik kehadiran
      jumlahKK: selectedDetil.jumlahKKHadir,
      jumlahBapak: selectedDetil.bapak,
      jumlahIbu: selectedDetil.ibu,
      jumlahOMK: selectedDetil.omk,
      jumlahBIR: selectedDetil.bir,
      jumlahBIA: selectedDetil.biaBawah,
      jumlahBIA713: selectedDetil.biaAtas,
      // Penerimaan
      kolekte1: selectedDetil.kolekteI,
      kolekte2: selectedDetil.kolekteII,
      ucapanSyukur: selectedDetil.ucapanSyukur,
      // Kehadiran KK
      kepalaKeluarga: kepalaKeluarga,
      // Petugas Keibadatan
      pemimpinIbadat: selectedDetil.pemimpinIbadat || undefined,
      pemimpinRosario: selectedDetil.pemimpinRosario || undefined,
      pembawaRenungan: selectedDetil.pembawaRenungan || undefined,
      pembawaLagu: selectedDetil.pembawaLagu || undefined,
      doaUmat: selectedDetil.doaUmat || undefined,
      bacaan: selectedDetil.bacaan || undefined,
      pemimpinMisa: selectedDetil.pemimpinMisa || undefined,
      pemazmur: selectedDetil.pemazmur || undefined
    };
  };

  const pdfData = getPDFData();

  // Format jadwal untuk display pada combobox
  const formatJadwalDisplay = (item: DetilDoling) => {
    return `${format(new Date(item.tanggal), 'dd MMMM yyyy')} - ${item.tuanRumah}`;
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden pb-5">
        <DialogHeader>
          <DialogTitle>Cetak Riwayat Doa Lingkungan</DialogTitle>
        </DialogHeader>

        {!showPDF ? (
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="detail-doling">Pilih Jadwal Doa Lingkungan</Label>
              
              <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openCombobox}
                    className="w-full justify-between"
                  >
                    {selectedDetilId
                      ? availableDetilDoling.find((item) => item.id === selectedDetilId)
                        ? formatJadwalDisplay(availableDetilDoling.find((item) => item.id === selectedDetilId)!)
                        : "Pilih jadwal..."
                      : "Pilih jadwal..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[calc(100%-2rem)] p-0" align="start" side="bottom" alignOffset={0} sideOffset={5}>
                  <Command>
                    <CommandInput placeholder="Cari jadwal..." className="h-9" />
                    <CommandEmpty>Tidak ada jadwal yang ditemukan</CommandEmpty>
                    <CommandGroup className="max-h-[200px] overflow-auto">
                      {availableDetilDoling.length > 0 ? (
                        availableDetilDoling.map((item) => (
                          <CommandItem
                            key={item.id}
                            value={formatJadwalDisplay(item)}
                            onSelect={() => {
                              setSelectedDetilId(item.id === selectedDetilId ? "" : item.id);
                              setOpenCombobox(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedDetilId === item.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {formatJadwalDisplay(item)}
                          </CommandItem>
                        ))
                      ) : (
                        <CommandItem disabled>Tidak ada data yang tersedia</CommandItem>
                      )}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <DialogFooter>
              <Button
                type="button"
                onClick={handleShowPDF}
                disabled={!selectedDetilId}
              >
                Tampilkan PDF
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="h-[600px] overflow-auto">
            {pdfData && <RiwayatDolingPDF data={pdfData} />}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
} 