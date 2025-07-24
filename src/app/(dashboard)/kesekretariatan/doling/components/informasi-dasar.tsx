"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { JenisIbadat, jenisIbadatOptions, subIbadatOptions } from "../types/form-types";
import { JadwalDoling, KeluargaForSelect } from "../types";
import { Checkbox } from "@/components/ui/checkbox";
import { useState, useEffect } from "react";
import { CommandInput, CommandEmpty, CommandGroup, CommandItem, Command } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface InformasiDasarSectionProps {
  selectedJadwal: string;
  tanggalValue: string;
  tuanRumahValue: string;
  jenisIbadat: JenisIbadat;
  subIbadat: string;
  temaIbadat?: string;
  customSubIbadat?: string;
  jadwalDoling: JadwalDoling[];
  keluargaList: KeluargaForSelect[];
  onSelectedJadwalChange: (value: string) => void;
  onTanggalValueChange: (value: string) => void;
  onTuanRumahValueChange: (value: string) => void;
  onJenisIbadatChange: (value: JenisIbadat) => void;
  onSubIbadatChange: (value: string) => void;
  onCustomSubIbadatChange?: (value: string) => void;
  onTemaIbadatChange?: (value: string) => void;
  shouldShowSubIbadat?: boolean;
  shouldShowTemaIbadat?: boolean;
  shouldShowTuanRumah?: boolean;
  hideJadwalSelect?: boolean;
}

export function InformasiDasarSection({
  selectedJadwal,
  tanggalValue,
  tuanRumahValue,
  jenisIbadat,
  subIbadat,
  temaIbadat,
  customSubIbadat = "",
  jadwalDoling,
  keluargaList = [],
  onSelectedJadwalChange,
  onTanggalValueChange,
  onTuanRumahValueChange,
  onJenisIbadatChange,
  onSubIbadatChange,
  onCustomSubIbadatChange,
  onTemaIbadatChange,
  shouldShowSubIbadat = true,
  shouldShowTemaIbadat = true,
  shouldShowTuanRumah = true,
}: InformasiDasarSectionProps) {
  // Perbaikan: Tentukan mode berdasarkan data yang ada
  const [manualSubIbadat, setManualSubIbadat] = useState<boolean>(() => {
    // Jika ada customSubIbadat dan tidak ada subIbadat, maka mode manual
    if (customSubIbadat && !subIbadat) {
      return true;
    }
    // Jika ada customSubIbadat meskipun ada subIbadat, prioritaskan manual
    if (customSubIbadat) {
      return true;
    }
    return false;
  });
  
  const [open, setOpen] = useState(false);

  // Update manualSubIbadat berdasarkan perubahan props
  useEffect(() => {
    if (customSubIbadat && !subIbadat) {
      setManualSubIbadat(true);
    } else if (!customSubIbadat && subIbadat) {
      setManualSubIbadat(false);
    }
  }, [customSubIbadat, subIbadat]);

  // Handle perubahan checkbox manual
  const handleManualSubIbadatChange = (checked: boolean) => {
    setManualSubIbadat(checked);
    
    if (checked) {
      // Jika switch ke manual, kosongkan dropdown dan isi manual dengan nilai dropdown jika ada
      if (subIbadat && onCustomSubIbadatChange) {
        // Cari label dari value yang dipilih di dropdown
        const selectedOption = subIbadatOptions[jenisIbadat]?.find(option => option.value === subIbadat);
        onCustomSubIbadatChange(selectedOption?.label || "");
      }
      onSubIbadatChange("");
    } else {
      // Jika switch ke dropdown, kosongkan manual
      if (onCustomSubIbadatChange) {
        onCustomSubIbadatChange("");
      }
    }
  };

  return (
    <div className="space-y-2 rounded-lg border p-4">
      <h3 className="text-md font-medium mb-2">Informasi Dasar</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="tanggal">Tanggal</Label>
          <Input
            id="tanggal"
            name="tanggal"
            type="date"
            value={tanggalValue}
            onChange={(e) => onTanggalValueChange(e.target.value)}
            required
          />
        </div>

        {shouldShowTuanRumah && (
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="tuanRumah">Tuan Rumah</Label>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <div
                  className={cn(
                    "flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
                    !tuanRumahValue && "text-muted-foreground"
                  )}
                  role="combobox"
                  aria-expanded={open}
                >
                  {tuanRumahValue
                    ? keluargaList.find((keluarga) => keluarga.id === tuanRumahValue)?.nama || "Pilih Tuan Rumah"
                    : "Pilih Tuan Rumah"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Cari kepala keluarga..." />
                  <CommandEmpty>Tidak ada data yang cocok.</CommandEmpty>
                  <CommandGroup className="max-h-60 overflow-y-auto">
                    {keluargaList.map((keluarga) => (
                      <CommandItem
                        key={keluarga.id}
                        value={keluarga.id}
                        onSelect={() => {
                          onTuanRumahValueChange(keluarga.id);
                          setOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            tuanRumahValue === keluarga.id ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {keluarga.nama}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="jenisIbadat">Jenis Ibadat</Label>
          <Select
            name="jenisIbadat"
            value={jenisIbadat}
            onValueChange={(value: string) => onJenisIbadatChange(value as JenisIbadat)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Pilih jenis ibadat" />
            </SelectTrigger>
            <SelectContent>
              {jenisIbadatOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {shouldShowSubIbadat && (
          <>
            <div className="space-y-2 md:col-span-2">
              <div className="flex items-center space-x-2 mb-2">
                <Checkbox
                  id="manualSubIbadat"
                  checked={manualSubIbadat}
                  onCheckedChange={handleManualSubIbadatChange}
                />
                <Label htmlFor="manualSubIbadat" className="text-sm cursor-pointer">
                  Input Manual untuk Sub Ibadat
                </Label>
              </div>
            </div>

            {manualSubIbadat ? (
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="customSubIbadat">Sub Ibadat (Manual)</Label>
                <Input
                  id="customSubIbadat"
                  value={customSubIbadat}
                  onChange={(e) => onCustomSubIbadatChange?.(e.target.value)}
                  placeholder="Masukkan sub ibadat"
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="subIbadat">Sub Ibadat</Label>
                <Select
                  name="subIbadat"
                  value={subIbadat || "none"}
                  onValueChange={(value) => {
                    if (value === "none") {
                      onSubIbadatChange("");
                    } else {
                      onSubIbadatChange(value);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih sub ibadat" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Tidak Ada</SelectItem>
                    {subIbadatOptions[jenisIbadat]?.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </>
        )}

        {/* Tema ibadat (hanya untuk doa lingkungan) */}
        {shouldShowTemaIbadat && (
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="temaIbadat">Tema Ibadat</Label>
            <Input
              id="temaIbadat"
              name="temaIbadat"
              value={temaIbadat || ""}
              onChange={(e) => onTemaIbadatChange?.(e.target.value)}
            />
          </div>
        )}
      </div>
    </div>
  );
} 