"use client";

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { JadwalDoling } from "../types"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { useEffect, useState } from "react"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { JenisIbadat, SubIbadat } from "@prisma/client"
import { KeluargaForSelect } from "../actions"
import { Checkbox } from "@/components/ui/checkbox"

// Fungsi untuk mendapatkan opsi sub ibadat yang sesuai berdasarkan jenis ibadat
const getSubIbadatOptions = (jenisIbadat: JenisIbadat): SubIbadat[] => {
  switch (jenisIbadat) {
    case JenisIbadat.DOA_LINGKUNGAN:
      return [
        SubIbadat.IBADAT_SABDA,
        SubIbadat.IBADAT_SABDA_TEMATIK,
        SubIbadat.PRAPASKAH,
        SubIbadat.BKSN,
        SubIbadat.BULAN_ROSARIO,
        SubIbadat.NOVENA_NATAL
      ];
    case JenisIbadat.MISA:
      return [
        SubIbadat.MISA_SYUKUR,
        SubIbadat.MISA_REQUEM,
        SubIbadat.MISA_ARWAH,
        SubIbadat.MISA_PELINDUNG
      ];
    default:
      return [];
  }
};

// Mapping untuk menampilkan sub ibadat dalam bahasa yang lebih mudah dibaca
const subIbadatMap: Record<SubIbadat, string> = {
  [SubIbadat.IBADAT_SABDA]: "Ibadat Sabda",
  [SubIbadat.IBADAT_SABDA_TEMATIK]: "Ibadat Sabda Tematik",
  [SubIbadat.PRAPASKAH]: "Prapaskah (APP)",
  [SubIbadat.BKSN]: "BKSN",
  [SubIbadat.BULAN_ROSARIO]: "Bulan Rosario",
  [SubIbadat.NOVENA_NATAL]: "Novena Natal",
  [SubIbadat.MISA_SYUKUR]: "Misa Syukur",
  [SubIbadat.MISA_REQUEM]: "Misa Requem",
  [SubIbadat.MISA_ARWAH]: "Misa Arwah",
  [SubIbadat.MISA_PELINDUNG]: "Misa Pelindung"
};

interface JadwalDolingFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jadwal?: JadwalDoling;
  kepalaKeluarga: KeluargaForSelect[];
  onSubmit: (values: {
    tanggal: Date;
    tuanRumahId: string;
    jenisIbadat: JenisIbadat;
    subIbadat?: SubIbadat | null;
    customSubIbadat?: string | null;
    temaIbadat?: string | null;
  }) => void;
}

export function JadwalDolingFormDialog({
  open,
  onOpenChange,
  jadwal,
  onSubmit,
  kepalaKeluarga
}: JadwalDolingFormDialogProps) {
  const [selectedFamilyHead, setSelectedFamilyHead] = useState<string>(jadwal?.tuanRumahId || "");
  const [alamat, setAlamat] = useState<string>(jadwal?.alamat || "");
  const [tuanRumah, setTuanRumah] = useState<string>(jadwal?.tuanRumah || "");
  const [manualInput, setManualInput] = useState<boolean>(false);
  const [jenisIbadat, setJenisIbadat] = useState<JenisIbadat>(jadwal?.jenisIbadat || JenisIbadat.DOA_LINGKUNGAN);
  const [subIbadat, setSubIbadat] = useState<SubIbadat | null>(jadwal?.subIbadat || null);
  const [temaIbadat, setTemaIbadat] = useState<string | null>(jadwal?.temaIbadat || null);
  const [openCombobox, setOpenCombobox] = useState(false);
  const [manualSubIbadat, setManualSubIbadat] = useState<boolean>(false);
  const [customSubIbadat, setCustomSubIbadat] = useState<string>("");
  const [tanggalValue, setTanggalValue] = useState<string>(
    jadwal ? format(new Date(jadwal.tanggal), 'yyyy-MM-dd\'T\'HH:mm') : ""
  );

  // Update state when jadwal prop changes
  useEffect(() => {
    if (jadwal) {
      setSelectedFamilyHead(jadwal.tuanRumahId);
      setAlamat(jadwal.alamat);
      setTuanRumah(jadwal.tuanRumah);
      setJenisIbadat(jadwal.jenisIbadat);
      
      const standardSubIbadats = getSubIbadatOptions(jadwal.jenisIbadat);
      
      // Periksa apakah subIbadat adalah standard atau custom
      if (jadwal.subIbadat && standardSubIbadats.includes(jadwal.subIbadat)) {
        // Standard subIbadat
        setSubIbadat(jadwal.subIbadat);
        setManualSubIbadat(false);
        setCustomSubIbadat("");
      } else if (jadwal.customSubIbadat) {
        // Gunakan customSubIbadat jika ada
        setSubIbadat(null);
        setManualSubIbadat(true);
        setCustomSubIbadat(jadwal.customSubIbadat);
      } else if (jadwal.subIbadat) {
        // Fallback untuk data lama
        setSubIbadat(null);
        setManualSubIbadat(true);
        setCustomSubIbadat(subIbadatMap[jadwal.subIbadat] || "");
      } else {
        // Tidak ada subIbadat
        setSubIbadat(null);
        setManualSubIbadat(false);
        setCustomSubIbadat("");
      }
      
      setTemaIbadat(jadwal.temaIbadat);
      setTanggalValue(format(new Date(jadwal.tanggal), 'yyyy-MM-dd\'T\'HH:mm'));
    } else {
      // Reset form untuk tambah baru
      setSelectedFamilyHead("");
      setAlamat("");
      setTuanRumah("");
      setJenisIbadat(JenisIbadat.DOA_LINGKUNGAN);
      setSubIbadat(null);
      setTemaIbadat(null);
      setTanggalValue("");
      setManualSubIbadat(false);
      setCustomSubIbadat("");
    }
  }, [jadwal, open]);
  
  // Memastikan daftar kepala keluarga selalu diperbarui saat dialog dibuka
  useEffect(() => {
    if (open) {
      
      // Verifikasi data kepala keluarga
      if (kepalaKeluarga.length === 0) {
        console.warn("Peringatan: Daftar kepala keluarga kosong saat dialog dibuka");
      } else {
        // Cek apakah ada data yang sudahTerpilih = true
        const anySelected = kepalaKeluarga.some(k => k.sudahTerpilih);
      }
    }
  }, [open, kepalaKeluarga]);
  
  // Update alamat when family head is selected
  useEffect(() => {
    if (selectedFamilyHead && !manualInput) {
      const family = kepalaKeluarga.find(f => f.id === selectedFamilyHead);
      if (family) {
        setAlamat(family.alamat);
        setTuanRumah(family.nama);
      }
    }
  }, [selectedFamilyHead, manualInput, kepalaKeluarga]);

  // Mengatur ulang sub ibadat saat jenis ibadat berubah
  useEffect(() => {
    if (!manualSubIbadat) {
      setSubIbadat(null);
    }
  }, [jenisIbadat, manualSubIbadat]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    // Siapkan nilai untuk dikirim
    const formData = {
      tanggal: new Date(e.currentTarget.tanggal.value),
      tuanRumahId: selectedFamilyHead,
      jenisIbadat,
      subIbadat: manualSubIbadat ? null : subIbadat,
      customSubIbadat: manualSubIbadat ? customSubIbadat : null,
      temaIbadat
    };
    
    onSubmit(formData);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] md:max-w-[550px] lg:max-w-[600px] w-full mx-auto">
        <DialogHeader>
          <DialogTitle>
            {jadwal ? 'Edit Jadwal Doling' : 'Tambah Jadwal Doling'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tanggal">Tanggal</Label>
            <Input
              id="tanggal"
              name="tanggal"
              type="datetime-local"
              value={tanggalValue}
              onChange={(e) => setTanggalValue(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="jenisIbadat">Jenis Ibadat</Label>
            <Select 
              value={jenisIbadat}
              onValueChange={(value) => setJenisIbadat(value as JenisIbadat)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih Jenis Ibadat" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={JenisIbadat.DOA_LINGKUNGAN}>Doa Lingkungan</SelectItem>
                <SelectItem value={JenisIbadat.MISA}>Misa</SelectItem>
                <SelectItem value={JenisIbadat.PERTEMUAN}>Pertemuan</SelectItem>
                <SelectItem value={JenisIbadat.BAKTI_SOSIAL}>Bakti Sosial</SelectItem>
                <SelectItem value={JenisIbadat.KEGIATAN_LAIN}>Kegiatan Lain</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2 mb-2">
              <Checkbox
                id="manualSubIbadat"
                checked={manualSubIbadat}
                onCheckedChange={(checked) => setManualSubIbadat(checked === true)}
              />
              <Label htmlFor="manualSubIbadat" className="text-sm cursor-pointer">
                Input Manual untuk Sub Ibadat
              </Label>
            </div>
            
            {manualSubIbadat ? (
              <div className="space-y-2">
                <Label htmlFor="customSubIbadat">Sub Ibadat (Manual)</Label>
                <Input
                  id="customSubIbadat"
                  value={customSubIbadat}
                  onChange={(e) => setCustomSubIbadat(e.target.value)}
                  placeholder="Masukkan sub ibadat"
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="subIbadat">Sub Ibadat (Opsional)</Label>
                <Select 
                  value={subIbadat ? subIbadat : "NONE"} 
                  onValueChange={(value) => setSubIbadat(value === "NONE" ? null : value as SubIbadat)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Sub Ibadat" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NONE">Tidak Ada</SelectItem>
                    {getSubIbadatOptions(jenisIbadat).map((subIbadat) => (
                      <SelectItem key={subIbadat} value={subIbadat}>
                        {subIbadatMap[subIbadat]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="temaIbadat">Tema Ibadat (Opsional)</Label>
            <Input
              id="temaIbadat"
              value={temaIbadat || ""}
              onChange={(e) => setTemaIbadat(e.target.value)}
              placeholder="Masukkan tema ibadat jika ada"
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="tuanRumahSelection">Tuan Rumah</Label>
            </div>
            
            <div className="relative">
              <input type="hidden" name="tuanRumahId" value={selectedFamilyHead} />
              <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openCombobox}
                    className="w-full justify-between"
                  >
                    {selectedFamilyHead
                      ? kepalaKeluarga.find((head) => head.id === selectedFamilyHead)?.nama || "Pilih Tuan Rumah..."
                      : "Pilih Tuan Rumah..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput 
                      placeholder="Cari Tuan Rumah..." 
                    />
                    <CommandEmpty>
                      <div className="p-2 text-center">
                        <p>Nama tidak ditemukan.</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Coba kata kunci lain atau gunakan tombol "Reset KK" di halaman utama.
                        </p>
                      </div>
                    </CommandEmpty>
                    <CommandGroup className="max-h-60 overflow-y-auto">
                      {kepalaKeluarga.map((head) => (
                        <CommandItem
                          key={head.id}
                          value={head.nama}
                          onSelect={() => {
                            setSelectedFamilyHead(head.id);
                            setOpenCombobox(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedFamilyHead === head.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {head.nama}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="alamat">Alamat</Label>
            <Input
              id="alamat"
              name="alamat"
              value={alamat}
              onChange={(e) => setAlamat(e.target.value)}
              readOnly={!manualInput && !!selectedFamilyHead}
              className={!manualInput && !!selectedFamilyHead ? "bg-muted" : ""}
            />
          </div>
          
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit">
              {jadwal ? 'Simpan Perubahan' : 'Tambah Jadwal'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 