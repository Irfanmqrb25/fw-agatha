"use client"

import { useState, useEffect } from "react"
import { ExtendedApproval } from "../types"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface EditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedItem: ExtendedApproval | null
  onSave: (values: any) => void
  isLoading: boolean
  keluargaList: { id: string; namaKepalaKeluarga: string }[]
}

export function EditDialog({
  open,
  onOpenChange,
  selectedItem,
  onSave,
  isLoading,
  keluargaList,
}: EditDialogProps) {
  const [editValues, setEditValues] = useState({
    kolekteI: 0,
    kolekteII: 0,
    ucapanSyukur: 0,
    keterangan: "",
    namaPenyumbang: "",
  })

  // Reset form values when selected item changes
  useEffect(() => {
    if (selectedItem?.doaLingkungan) {
      setEditValues({
        kolekteI: selectedItem.doaLingkungan.kolekteI,
        kolekteII: selectedItem.doaLingkungan.kolekteII,
        ucapanSyukur: selectedItem.doaLingkungan.ucapanSyukur,
        keterangan: selectedItem.doaLingkungan.tuanRumah.namaKepalaKeluarga || "",
        namaPenyumbang: "", // Default empty, will be populated if needed
      });
    }
  }, [selectedItem, open])

  // Check if we should show the Nama Penyumbang field
  const showNamaPenyumbang = editValues.ucapanSyukur > 0

  const handleSave = () => {
    // Validasi input
    if (editValues.kolekteI < 0 || editValues.kolekteII < 0 || editValues.ucapanSyukur < 0) {
      return;
    }
    
    // Validasi: jika ada ucapan syukur tapi tidak ada nama penyumbang
    if (editValues.ucapanSyukur > 0 && !editValues.namaPenyumbang) {
      // Set nama penyumbang ke tuan rumah sebagai default
      const updatedValues = {
        ...editValues,
        namaPenyumbang: selectedItem?.doaLingkungan?.tuanRumah.namaKepalaKeluarga || ""
      };
      onSave(updatedValues);
    } else {
      onSave(editValues);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Data Doa Lingkungan</DialogTitle>
          <DialogDescription>
            Perbarui nilai kolekte dan ucapan syukur. 
            {showNamaPenyumbang && " Nama penyumbang diperlukan untuk ucapan syukur."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="kolekte1" className="text-sm font-medium">
                Kolekte I
              </label>
              <Input
                id="kolekte1"
                type="number"
                min="0"
                step="1000"
                value={editValues.kolekteI}
                onChange={(e) => {
                  const value = e.target.value === '' ? 0 : Number(e.target.value);
                  setEditValues({ ...editValues, kolekteI: isNaN(value) ? 0 : value });
                }}
                className="col-span-3"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="kolekte2" className="text-sm font-medium">
                Kolekte II
              </label>
              <Input
                id="kolekte2"
                type="number"
                min="0"
                step="1000"
                value={editValues.kolekteII}
                onChange={(e) => {
                  const value = e.target.value === '' ? 0 : Number(e.target.value);
                  setEditValues({ ...editValues, kolekteII: isNaN(value) ? 0 : value });
                }}
                className="col-span-3"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="ucapanSyukur" className="text-sm font-medium">
              Ucapan Syukur
            </label>
            <Input
              id="ucapanSyukur"
              type="number"
              min="0"
              step="1000"
              value={editValues.ucapanSyukur}
              onChange={(e) => {
                const value = e.target.value === '' ? 0 : Number(e.target.value);
                setEditValues({ ...editValues, ucapanSyukur: isNaN(value) ? 0 : value });
              }}
            />
            {editValues.ucapanSyukur > 0 && (
              <p className="text-xs text-muted-foreground">
                Nama penyumbang akan diatur otomatis jika tidak dipilih
              </p>
            )}
          </div>
          
          {/* Tambahkan field Nama Penyumbang jika ucapan syukur > 0 */}
          {showNamaPenyumbang && (
            <div className="space-y-2">
              <label htmlFor="namaPenyumbang" className="text-sm font-medium">
                Nama Penyumbang <span className="text-red-500">*</span>
              </label>
              <Select
                value={editValues.namaPenyumbang}
                onValueChange={(value) =>
                  setEditValues({ ...editValues, namaPenyumbang: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih nama penyumbang" />
                </SelectTrigger>
                <SelectContent>
                  {keluargaList.map((keluarga) => (
                    <SelectItem key={keluarga.id} value={keluarga.namaKepalaKeluarga}>
                      {keluarga.namaKepalaKeluarga}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          <div className="space-y-2">
            <label htmlFor="keterangan" className="text-sm font-medium">
              Tuan Rumah
            </label>
            <Input
              id="keterangan"
              value={editValues.keterangan}
              onChange={(e) =>
                setEditValues({ ...editValues, keterangan: e.target.value })
              }
              disabled
            />
          </div>
        </div>
        <DialogFooter>
          <Button 
            type="button"
            variant="outline" 
            onClick={() => {
              onOpenChange(false);
            }}
          >
            Batal
          </Button>
          <Button 
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleSave();
            }} 
            disabled={isLoading}
          >
            {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 