"use client";

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { AbsensiDoling, DetilDoling, JadwalDoling } from "../types"
import { toast } from "sonner"
import { useState, useEffect, useMemo, useCallback } from "react"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { Combobox, ComboboxOption } from "@/components/ui/combobox"
import { Check, ChevronsUpDown, SearchIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { KeluargaForSelect } from "../actions"

interface AbsensiDolingFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  absensi?: AbsensiDoling
  onSubmit: (values: { doaLingkunganId: string, absensiData: { keluargaId: string, hadir: boolean, statusKehadiran: string }[] }) => void
  detilDoling?: DetilDoling[]
  jadwalDoling?: JadwalDoling[]
  keluargaList?: KeluargaForSelect[]
}

export type StatusKehadiran = "TIDAK_HADIR" | "SUAMI_SAJA" | "ISTRI_SAJA" | "SUAMI_ISTRI_HADIR";

// Custom Combobox untuk pencarian Keluarga
function KeluargaSearchCombobox({
  options,
  value,
  onChange,
  placeholder = "Pilih keluarga...",
  emptyMessage = "Tidak ada keluarga ditemukan",
  disabled = false,
}: {
  options: ComboboxOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Cari opsi yang terpilih
  const selectedOption = useMemo(() => 
    options.find(option => option.value === value),
    [options, value]
  );
  
  // Filter opsi berdasarkan search term - tidak case sensitive
  const filteredOptions = useMemo(() => {
    if (!searchTerm) return options;
    
    return options.filter(option => 
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [options, searchTerm]);

  // Handler untuk memilih opsi
  const handleSelect = useCallback((selectedValue: string) => {
    const option = options.find(opt => opt.value === selectedValue);
    if (option) {
      onChange(option.value);
      setSearchTerm("");
      setOpen(false);
    }
  }, [onChange, options]);
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <div className="flex items-center border-b px-3">
          <SearchIcon className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <Input
            placeholder={`Cari ${placeholder.toLowerCase()}...`}
            className="flex h-9 w-full rounded-md border-0 bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Command>
          <CommandEmpty>{emptyMessage}</CommandEmpty>
          <CommandGroup className="max-h-[300px] overflow-auto overscroll-contain touch-pan-y">
            {filteredOptions.map((option) => (
              <CommandItem
                key={option.value}
                onSelect={() => handleSelect(option.value)}
                className="cursor-pointer"
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === option.value ? "opacity-100" : "opacity-0"
                  )}
                />
                {option.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export function AbsensiDolingFormDialog({
  open,
  onOpenChange,
  absensi,
  onSubmit,
  detilDoling = [],
  jadwalDoling = [],
  keluargaList = [],
}: AbsensiDolingFormDialogProps) {
  const [selectedDolingId, setSelectedDolingId] = useState<string>(absensi?.doaLingkunganId || "");
  const [keluargaId, setKeluargaId] = useState<string>(absensi?.keluargaId || "");
  const [statusKehadiran, setStatusKehadiran] = useState<StatusKehadiran>(absensi?.statusKehadiran as StatusKehadiran || "TIDAK_HADIR");

  // Konversi keluargaList ke ComboboxOption[]
  const keluargaOptions: ComboboxOption[] = useMemo(() => {
    const filteredList = keluargaList
      .filter(keluarga => !keluarga.sudahTerpilih || (absensi && keluarga.id === absensi.keluargaId));
  
    
    return filteredList.map(keluarga => ({
      label: keluarga.nama,
      value: keluarga.id
    }));
  }, [keluargaList, absensi]);

  // Filter jadwal yang sudah selesai atau terjadwal
  const availableJadwal = useMemo(() => {
    return jadwalDoling
      .filter(jadwal => {
        // Pastikan tanggal valid
        if (!jadwal.tanggal || !(jadwal.tanggal instanceof Date) || isNaN(new Date(jadwal.tanggal).getTime())) {
          return false;
        }
        
        // Hanya tampilkan jadwal yang:
        // 1. Status jadwal bukan selesai (jadwal yang sudah selesai tidak ditampilkan)
        // 2. Status terjadwal atau menunggu approval
        return jadwal.status === 'terjadwal' || jadwal.status === 'menunggu';
      })
      .sort((a, b) => {
        // Urutkan berdasarkan tanggal terbaru
        const dateA = new Date(a.tanggal);
        const dateB = new Date(b.tanggal);
        return dateB.getTime() - dateA.getTime();
      });
  }, [jadwalDoling]);

  // Handler untuk perubahan keluarga
  const handleKeluargaChange = useCallback((newValue: string) => {
    setKeluargaId(newValue);
  }, []);
  
  // Reset form ketika dialog dibuka/ditutup
  useEffect(() => {
    if (open) {
      // Jika mode edit, gunakan data dari absensi
      if (absensi) {
        setSelectedDolingId(absensi.doaLingkunganId);
        setKeluargaId(absensi.keluargaId);
        setStatusKehadiran(absensi.statusKehadiran as StatusKehadiran || "TIDAK_HADIR");
      } else {
        // Mode tambah, reset form
        setKeluargaId("");
        setStatusKehadiran("TIDAK_HADIR");
        
        // Pilih jadwal terdekat
        if (availableJadwal.length > 0) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          const sortedJadwal = [...availableJadwal].sort((a, b) => {
            const dateA = new Date(a.tanggal);
            const dateB = new Date(b.tanggal);
            const diffA = Math.abs(dateA.getTime() - today.getTime());
            const diffB = Math.abs(dateB.getTime() - today.getTime());
            return diffA - diffB;
          });
          
          setSelectedDolingId(sortedJadwal[0].id);
        } else {
          setSelectedDolingId("");
        }
      }
    } else {
      // Reset state saat dialog ditutup
      if (!absensi) {
        setSelectedDolingId("");
        setKeluargaId("");
        setStatusKehadiran("TIDAK_HADIR");
      }
    }
  }, [open, absensi, availableJadwal]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!selectedDolingId) {
      toast.error("Silakan pilih jadwal doa lingkungan terlebih dahulu.");
      return;
    }
    
    if (!keluargaId) {
      toast.error("Silakan pilih keluarga terlebih dahulu.");
      return;
    }
    
    const hadir = statusKehadiran !== "TIDAK_HADIR";
    
    onSubmit({
      doaLingkunganId: selectedDolingId,
      absensiData: [
        {
          keluargaId: keluargaId,
          hadir: hadir,
          statusKehadiran: statusKehadiran
        }
      ]
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] md:max-w-[550px] w-full mx-auto">
        <DialogHeader>
          <DialogTitle>
            {absensi ? 'Edit Absensi' : 'Tambah Absensi'}
          </DialogTitle>
          <DialogDescription>
            Silakan isi data kehadiran keluarga pada doa lingkungan.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Jadwal Doling */}
          <div className="space-y-2">
            <Label htmlFor="doaLingkunganId">Jadwal Doa Lingkungan</Label>
            <Select 
              name="doaLingkunganId" 
              value={selectedDolingId} 
              onValueChange={setSelectedDolingId}
              disabled={Boolean(absensi)} // Disable jika edit mode
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih jadwal doling" />
              </SelectTrigger>
              <SelectContent>
                {availableJadwal.length > 0 ? (
                  availableJadwal.map((jadwal) => (
                    <SelectItem key={jadwal.id} value={jadwal.id}>
                      {jadwal.tanggal && jadwal.tanggal instanceof Date && !isNaN(new Date(jadwal.tanggal).getTime())
                        ? format(new Date(jadwal.tanggal), "dd MMM yyyy", { locale: id })
                        : "Tanggal tidak valid"} - {jadwal.tuanRumah}
                    </SelectItem>
                  ))
                ) : (
                  <div className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none text-muted-foreground">
                    Tidak ada jadwal doling tersedia
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="keluargaId">Nama Kepala Keluarga</Label>
            <KeluargaSearchCombobox
              options={keluargaOptions}
              value={keluargaId}
              onChange={handleKeluargaChange}
              placeholder="Pilih keluarga..."
              emptyMessage="Tidak ada keluarga ditemukan"
              disabled={Boolean(absensi)} // Disable jika edit mode
            />
            {!absensi && (
              <p className="text-xs text-muted-foreground mt-1">
                {keluargaOptions.length} keluarga tersedia untuk dipilih
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label>Status Kehadiran</Label>
            <RadioGroup value={statusKehadiran} onValueChange={(value) => setStatusKehadiran(value as StatusKehadiran)}>
              <div className="flex items-center space-x-2 py-2">
                <RadioGroupItem value="TIDAK_HADIR" id="tidak-hadir" />
                <Label htmlFor="tidak-hadir" className="cursor-pointer">Tidak Hadir</Label>
              </div>
              <div className="flex items-center space-x-2 py-2">
                <RadioGroupItem value="SUAMI_SAJA" id="suami-saja" />
                <Label htmlFor="suami-saja" className="cursor-pointer">Suami Saja</Label>
              </div>
              <div className="flex items-center space-x-2 py-2">
                <RadioGroupItem value="ISTRI_SAJA" id="istri-saja" />
                <Label htmlFor="istri-saja" className="cursor-pointer">Istri Saja</Label>
              </div>
              <div className="flex items-center space-x-2 py-2">
                <RadioGroupItem value="SUAMI_ISTRI_HADIR" id="keduanya-hadir" />
                <Label htmlFor="keduanya-hadir" className="cursor-pointer">Suami dan Istri Hadir</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit">
              {absensi ? 'Simpan Perubahan' : 'Simpan'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 