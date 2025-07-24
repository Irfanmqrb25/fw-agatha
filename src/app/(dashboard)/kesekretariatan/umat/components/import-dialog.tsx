"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { toast } from "sonner";
import * as XLSX from 'xlsx';
import { FamilyHead } from "../types";
import { StatusKehidupan, StatusPernikahan } from "@prisma/client";

interface ImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportComplete: (newData: FamilyHead[]) => void;
  existingDataCount: number;
}

export function ImportDialog({
  open,
  onOpenChange,
  onImportComplete,
  existingDataCount
}: ImportDialogProps) {
  const [importFile, setImportFile] = useState<File | null>(null);

  const processImportFile = async () => {
    if (!importFile) {
      toast.error('Silakan pilih file terlebih dahulu');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Ambil worksheet pertama
        const worksheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[worksheetName];
        
        // Konversi ke JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        if (jsonData.length === 0) {
          toast.error('File tidak berisi data');
          return;
        }
        
        // Memproses data dari Excel dan menyiapkannya untuk dikirim ke server
        try {
          const familyHeadDataArray = jsonData.map((row: any) => {
            // Parse tanggal
            let tanggalBergabung = new Date();
            try {
              const dateStr = row['Tanggal Bergabung (DD/MM/YYYY)'];
              if (dateStr && typeof dateStr === 'string') {
                const dateParts = dateStr.split('/');
                if (dateParts.length === 3) {
                  const day = parseInt(dateParts[0]);
                  const month = parseInt(dateParts[1]) - 1; // Bulan di JavaScript dimulai dari 0
                  const year = parseInt(dateParts[2]);
                  
                  // Validasi nilai tanggal
                  if (!isNaN(day) && !isNaN(month) && !isNaN(year) && 
                    day > 0 && day <= 31 && month >= 0 && month <= 11 && year > 1900) {
                    const tempDate = new Date(year, month, day);
                    // Pastikan tanggal valid (mis. 31 Feb tidak valid)
                    if (tempDate.getDate() === day) {
                      tanggalBergabung = tempDate;
                    }
                  }
                }
              } else if (dateStr instanceof Date) {
                // Jika dateStr sudah berupa objek Date
                tanggalBergabung = dateStr;
              }
            } catch (error) {
              console.error('Format tanggal tidak valid:', error);
              // Gunakan tanggal hari ini jika format tidak valid
            }
            
            // Konversi nilai numerik dengan validasi
            const parseIntSafe = (value: any): number => {
              if (value === undefined || value === null || value === '') return 0;
              const parsed = parseInt(value);
              return isNaN(parsed) ? 0 : parsed;
            };

            // Parse status pernikahan dari Excel
            const parseStatusPernikahan = (value: any): StatusPernikahan => {
              if (typeof value === 'string') {
                const upperValue = value.toUpperCase().trim();
                if (upperValue === 'MENIKAH' || upperValue === 'MARRIED') {
                  return StatusPernikahan.MENIKAH;
                }
              }
              return StatusPernikahan.TIDAK_MENIKAH; // Default
            };
            
            return {
              namaKepalaKeluarga: row['Nama Kepala Keluarga'] || 'Tidak Ada Nama',
              alamat: row['Alamat'] || '',
              nomorTelepon: row['No. Telepon'] || undefined,
              tanggalBergabung: tanggalBergabung,
              jumlahAnakTertanggung: parseIntSafe(row['Jumlah Anak Tertanggung']),
              jumlahKerabatTertanggung: parseIntSafe(row['Jumlah Kerabat Tertanggung']),
              jumlahAnggotaKeluarga: Math.max(1, parseIntSafe(row['Jumlah Anggota Keluarga'])),
              status: StatusKehidupan.HIDUP,
              statusPernikahan: parseStatusPernikahan(row['Status Pernikahan']),
              tanggalKeluar: undefined,
              tanggalMeninggal: undefined,
            };
          });
          
          // Lakukan import satu per satu menggunakan server action
          let importedCount = 0;
          const importedHeads: FamilyHead[] = [];
          
          for (const familyHeadData of familyHeadDataArray) {
            try {
              const result = await import('../actions').then(module => 
                module.addFamilyHead(familyHeadData)
              );
              
              if (result) {
                importedCount++;
                importedHeads.push(result);
              }
            } catch (error) {
              console.error(`Error importing family head ${familyHeadData.namaKepalaKeluarga}:`, error);
            }
          }
          
          onImportComplete(importedHeads);
          toast.success(`${importedCount} data berhasil diimpor`);
          onOpenChange(false);
          setImportFile(null);
        } catch (error) {
          console.error('Error processing data:', error);
          toast.error('Terjadi kesalahan saat memproses data');
        }
      } catch (error) {
        console.error('Error processing file:', error);
        let errorMessage = 'Terjadi kesalahan saat memproses file';
        
        // Menampilkan pesan error yang lebih spesifik
        if (error instanceof Error) {
          if (error.message.includes('Invalid time value')) {
            errorMessage = 'File berisi format tanggal yang tidak valid. Pastikan format tanggal adalah DD/MM/YYYY.';
          } else {
            errorMessage = `Error: ${error.message}`;
          }
        }
        
        toast.error(errorMessage);
      }
    };
    
    reader.readAsArrayBuffer(importFile);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] w-[95vw] max-w-[95vw] sm:w-auto">
        <DialogHeader>
          <DialogTitle>Impor Data Kepala Keluarga</DialogTitle>
          <DialogDescription>
            Unggah file Excel yang berisi data kepala keluarga. Pastikan format sesuai dengan template.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="file-upload">Pilih File Excel</Label>
            <Input
              id="file-upload"
              type="file"
              accept=".xlsx, .xls"
              onChange={(e) => setImportFile(e.target.files?.[0] || null)}
            />
            <p className="text-sm text-muted-foreground">
              Format file: .xlsx atau .xls
            </p>
          </div>
        </div>
        
        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
          <Button 
            variant="outline" 
            onClick={() => {
              onOpenChange(false)
              setImportFile(null)
            }}
            className="w-full sm:w-auto"
          >
            Batal
          </Button>
          <Button 
            onClick={processImportFile} 
            disabled={!importFile}
            className="w-full sm:w-auto"
          >
            <Upload className="mr-2 h-4 w-4" />
            Impor
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 