"use client";

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useState, useEffect } from "react"
import { format } from "date-fns"
import { InformasiDasarSection } from "./informasi-dasar"
import { DataKehadiranSection } from "./data-kehadiran"
import { KolekteSection } from "./kolekte-section"
import { PetugasLiturgiSection } from "./petugas-liturgi"
import { PetugasMisaSection } from "./petugas-misa"
import { KeteranganStatusSection } from "./keterangan-status"
import { DolingData } from "../actions"
import { toast } from "sonner"
import { JenisIbadat, SubIbadat, StatusKegiatan } from "@prisma/client"
import { JenisIbadat as FormJenisIbadat } from "../types/form-types"
import { KeluargaForSelect } from "../actions"

// Fungsi konversi dari JenisIbadat Prisma ke JenisIbadat form
const mapPrismaJenisIbadatToForm = (jenisIbadat: JenisIbadat): FormJenisIbadat => {
  const mapping: Record<JenisIbadat, FormJenisIbadat> = {
    [JenisIbadat.DOA_LINGKUNGAN]: "doa-lingkungan",
    [JenisIbadat.MISA]: "misa",
    [JenisIbadat.PERTEMUAN]: "pertemuan",
    [JenisIbadat.BAKTI_SOSIAL]: "bakti-sosial",
    [JenisIbadat.KEGIATAN_LAIN]: "kegiatan-lainnya"
  };
  return mapping[jenisIbadat];
};

// Fungsi mapping dari enum SubIbadat backend ke string frontend
const mapSubIbadatEnumToString = (subIbadat: SubIbadat): string => {
  const mapping: Record<SubIbadat, string> = {
    [SubIbadat.IBADAT_SABDA]: "ibadat-sabda",
    [SubIbadat.IBADAT_SABDA_TEMATIK]: "ibadat-sabda-tematik",
    [SubIbadat.PRAPASKAH]: "prapaskah-app",
    [SubIbadat.BKSN]: "bksn",
    [SubIbadat.BULAN_ROSARIO]: "bulan-rosario",
    [SubIbadat.NOVENA_NATAL]: "novena-natal",
    [SubIbadat.MISA_SYUKUR]: "misa-syukur",
    [SubIbadat.MISA_REQUEM]: "misa-requem",
    [SubIbadat.MISA_ARWAH]: "misa-arwah",
    [SubIbadat.MISA_PELINDUNG]: "misa-pelindung"
  };
  return mapping[subIbadat];
};

// Fungsi mapping dari string frontend ke enum SubIbadat backend
const mapStringToSubIbadatEnum = (value: string): SubIbadat | null => {
  const mapping: Record<string, SubIbadat> = {
    "ibadat-sabda": SubIbadat.IBADAT_SABDA,
    "ibadat-sabda-tematik": SubIbadat.IBADAT_SABDA_TEMATIK,
    "prapaskah-app": SubIbadat.PRAPASKAH,
    "bksn": SubIbadat.BKSN,
    "bulan-rosario": SubIbadat.BULAN_ROSARIO,
    "novena-natal": SubIbadat.NOVENA_NATAL,
    "misa-syukur": SubIbadat.MISA_SYUKUR,
    "misa-requem": SubIbadat.MISA_REQUEM,
    "misa-arwah": SubIbadat.MISA_ARWAH,
    "misa-pelindung": SubIbadat.MISA_PELINDUNG
  };
  return mapping[value] || null;
};

interface DetilDolingFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  detil?: DolingData;
  onSubmit: (values: any) => void;
  jadwalDoling: DolingData[];
  keluargaList: KeluargaForSelect[];
}

// Interface untuk KehadiranData yang telah disinkronkan dengan komponen DataKehadiranSection
interface KehadiranData {
  totalHadir: number;
  jumlahKKHadir: number;
  bapak: number;
  ibu: number;
  omk: number;
  biaKecil: number; // BIA (0-6 tahun)
  biaBesar: number; // BIA (7-13 tahun)
  bir: number;
}

// Interface untuk KolekteData yang telah disinkronkan dengan komponen KolekteSection
interface KolekteData {
  kolekte1: number;
  kolekte2: number;
  ucapanSyukur: number;
}

// Interface untuk PetugasLiturgiData yang telah disinkronkan dengan komponen PetugasLiturgiSection
interface PetugasLiturgiData {
  pemimpin: string;
  rosario: string;
  renungan: string;
  lagu: string;
  doaUmat: string;
  bacaan: string;
  // Legacy fields for compatibility
  pemimpinIbadat: string;
  pemimpinRosario: string;
  pembawaRenungan: string; 
  pembawaLagu: string;
}

// Interface untuk PetugasMisaData yang telah disinkronkan dengan komponen PetugasMisaSection
interface PetugasMisaData {
  pemimpin: string;
  bacaanPertama: string;
  pemazmur: string;
  jumlahPeserta: number;
  // Legacy fields for compatibility
  pemimpinMisa: string;
  bacaanI: string;
}

interface SubmitDataType {
  id?: string;
  jumlahKKHadir: number;
  bapak: number;
  ibu: number;
  omk: number;
  bir: number;
  biaBawah: number;
  biaAtas: number;
  kolekteI: number;
  kolekteII: number;
  ucapanSyukur: number;
  pemimpinIbadat: string;
  pemimpinRosario: string;
  pembawaRenungan: string;
  pembawaLagu: string;
  doaUmat: string;
  bacaan: string;
  pemimpinMisa: string;
  bacaanI: string;
  pemazmur: string;
  jumlahPeserta: number;
  status: StatusKegiatan;
  customSubIbadat?: string | null;
  subIbadat?: SubIbadat | null;
  statusKegiatan: StatusKegiatan;
}

export function DetilDolingFormDialog({
  open,
  onOpenChange,
  detil,
  onSubmit,
  jadwalDoling,
  keluargaList = [],
}: DetilDolingFormDialogProps) {
  const [selectedJadwal, setSelectedJadwal] = useState<string>(detil?.id || "")
  const [tanggalValue, setTanggalValue] = useState<string>(detil ? format(new Date(detil.tanggal), 'yyyy-MM-dd') : "")
  const [tuanRumahValue, setTuanRumahValue] = useState<string>(detil?.tuanRumahId || "")
  const [jenisIbadat, setJenisIbadat] = useState<JenisIbadat>(detil?.jenisIbadat || JenisIbadat.DOA_LINGKUNGAN)
  const [formJenisIbadat, setFormJenisIbadat] = useState<FormJenisIbadat>(
    mapPrismaJenisIbadatToForm(detil?.jenisIbadat || JenisIbadat.DOA_LINGKUNGAN)
  )
  
  // Perbaikan: Inisialisasi subIbadat dengan mapping yang benar
  const [subIbadat, setSubIbadat] = useState<string>(() => {
    if (detil?.subIbadat) {
      return mapSubIbadatEnumToString(detil.subIbadat);
    }
    return "";
  })
  
  const [customSubIbadat, setCustomSubIbadat] = useState<string>(detil?.customSubIbadat || "")
  const [temaIbadat, setTemaIbadat] = useState<string | null>(detil?.temaIbadat || null)
  const [keterangan, setKeterangan] = useState<string>("")
  const [status, setStatus] = useState<StatusKegiatan>(
    detil?.statusKegiatan || StatusKegiatan.BELUM_SELESAI
  )
  
  const [jumlahKehadiran, setJumlahKehadiran] = useState<KehadiranData>({
    jumlahKKHadir: detil?.jumlahKKHadir || 0,
    bapak: detil?.bapak || 0,
    ibu: detil?.ibu || 0,
    omk: detil?.omk || 0,
    bir: detil?.bir || 0,
    biaBesar: detil?.biaAtas || 0,
    biaKecil: detil?.biaBawah || 0,
    totalHadir: 0
  })
  
  const [kolekteData, setKolekteData] = useState<KolekteData>({
    kolekte1: detil?.kolekteI || 0,
    kolekte2: detil?.kolekteII || 0,
    ucapanSyukur: detil?.ucapanSyukur || 0
  })
  
  const [petugasLiturgi, setPetugasLiturgi] = useState<PetugasLiturgiData>({
    pemimpin: detil?.pemimpinIbadat || "",
    rosario: detil?.pemimpinRosario || "",
    renungan: detil?.pembawaRenungan || "",
    lagu: detil?.pembawaLagu || "",
    doaUmat: detil?.doaUmat || "",
    bacaan: detil?.bacaan || "",
    // Legacy fields
    pemimpinIbadat: detil?.pemimpinIbadat || "",
    pemimpinRosario: detil?.pemimpinRosario || "",
    pembawaRenungan: detil?.pembawaRenungan || "",
    pembawaLagu: detil?.pembawaLagu || ""
  })
  
  const [petugasMisa, setPetugasMisa] = useState<PetugasMisaData>({
    pemimpin: detil?.pemimpinMisa || "",
    bacaanPertama: detil?.bacaanI || "",
    pemazmur: detil?.pemazmur || "",
    jumlahPeserta: detil?.jumlahPeserta || 0,
    // Legacy fields
    pemimpinMisa: detil?.pemimpinMisa || "",
    bacaanI: detil?.bacaanI || ""
  })
  
  // Reset state dan set default values setiap kali dialog dibuka
  useEffect(() => {
    if (open && detil) {
      setSelectedJadwal(detil.id);
    }
  }, [open, detil]);
  
  // Update JenisIbadat form saat JenisIbadat Prisma berubah
  useEffect(() => {
    setFormJenisIbadat(mapPrismaJenisIbadatToForm(jenisIbadat));
  }, [jenisIbadat]);
  
  // Update all values when detil changes
  useEffect(() => {
    if (detil) {
      setSelectedJadwal(detil.id);
      setTanggalValue(format(new Date(detil.tanggal), 'yyyy-MM-dd'));
      setTuanRumahValue(detil.tuanRumahId);
      setJenisIbadat(detil.jenisIbadat);
      setFormJenisIbadat(mapPrismaJenisIbadatToForm(detil.jenisIbadat));
      setSubIbadat(detil.subIbadat ? mapSubIbadatEnumToString(detil.subIbadat) : "");
      setCustomSubIbadat(detil.customSubIbadat || "");
      setTemaIbadat(detil.temaIbadat || null);
      setStatus(detil.statusKegiatan || StatusKegiatan.BELUM_SELESAI);
      
      setJumlahKehadiran({
        jumlahKKHadir: detil.jumlahKKHadir || 0,
        bapak: detil.bapak || 0,
        ibu: detil.ibu || 0,
        omk: detil.omk || 0,
        bir: detil.bir || 0,
        biaBesar: detil.biaAtas || 0,
        biaKecil: detil.biaBawah || 0,
        totalHadir: (detil.bapak || 0) + (detil.ibu || 0) + (detil.omk || 0) + (detil.bir || 0) + 
                    (detil.biaAtas || 0) + (detil.biaBawah || 0)
      });
      
      setKolekteData({
        kolekte1: detil.kolekteI || 0,
        kolekte2: detil.kolekteII || 0,
        ucapanSyukur: detil.ucapanSyukur || 0
      });
      
      setPetugasLiturgi({
        pemimpin: detil.pemimpinIbadat || "", 
        rosario: detil.pemimpinRosario || "",
        renungan: detil.pembawaRenungan || "",
        lagu: detil.pembawaLagu || "",
        doaUmat: detil.doaUmat || "",
        bacaan: detil.bacaan || "",
        // Legacy fields
        pemimpinIbadat: detil.pemimpinIbadat || "",
        pemimpinRosario: detil.pemimpinRosario || "",
        pembawaRenungan: detil.pembawaRenungan || "",
        pembawaLagu: detil.pembawaLagu || ""
      });
      
      setPetugasMisa({
        pemimpin: detil.pemimpinMisa || "",
        bacaanPertama: detil.bacaanI || "",
        pemazmur: detil.pemazmur || "",
        jumlahPeserta: detil.jumlahPeserta || 0,
        // Legacy fields
        pemimpinMisa: detil.pemimpinMisa || "",
        bacaanI: detil.bacaanI || ""
      });
    }
  }, [detil]);
  
  useEffect(() => {
    if (selectedJadwal && jadwalDoling.length > 0) {
      const jadwal = jadwalDoling.find(j => j.id === selectedJadwal);
      if (jadwal) {
        setTanggalValue(format(new Date(jadwal.tanggal), 'yyyy-MM-dd'));
        setTuanRumahValue(jadwal.tuanRumahId);
        setJenisIbadat(jadwal.jenisIbadat);
        setFormJenisIbadat(mapPrismaJenisIbadatToForm(jadwal.jenisIbadat));
        setSubIbadat(jadwal.subIbadat ? mapSubIbadatEnumToString(jadwal.subIbadat) : "");
        setCustomSubIbadat(jadwal.customSubIbadat || "");
        setTemaIbadat(jadwal.temaIbadat || null);
        setStatus(jadwal.statusKegiatan || StatusKegiatan.BELUM_SELESAI);
        
        // Jika jadwal telah memiliki data kehadiran dan kolekte, gunakan data tersebut
        if (jadwal.jumlahKKHadir > 0) {
          setJumlahKehadiran({
            jumlahKKHadir: jadwal.jumlahKKHadir || 0,
            bapak: jadwal.bapak || 0,
            ibu: jadwal.ibu || 0,
            omk: jadwal.omk || 0,
            bir: jadwal.bir || 0,
            biaBesar: jadwal.biaAtas || 0,
            biaKecil: jadwal.biaBawah || 0,
            totalHadir: 0
          });
        }
        
        if (jadwal.kolekteI > 0 || jadwal.kolekteII > 0 || jadwal.ucapanSyukur > 0) {
          setKolekteData({
            kolekte1: jadwal.kolekteI || 0,
            kolekte2: jadwal.kolekteII || 0,
            ucapanSyukur: jadwal.ucapanSyukur || 0
          });
        }
        
        // Jika jadwal telah memiliki data petugas, gunakan data tersebut
        if (jadwal.pemimpinIbadat || jadwal.pemimpinRosario || jadwal.pembawaRenungan || jadwal.pembawaLagu || jadwal.doaUmat) {
          setPetugasLiturgi({
            pemimpin: jadwal.pemimpinIbadat || "", 
            rosario: jadwal.pemimpinRosario || "",
            renungan: jadwal.pembawaRenungan || "",
            lagu: jadwal.pembawaLagu || "",
            doaUmat: jadwal.doaUmat || "",
            bacaan: jadwal.bacaan || "",
            // Legacy fields
            pemimpinIbadat: jadwal.pemimpinIbadat || "",
            pemimpinRosario: jadwal.pemimpinRosario || "",
            pembawaRenungan: jadwal.pembawaRenungan || "",
            pembawaLagu: jadwal.pembawaLagu || ""
          });
        }
        
        if (jadwal.pemimpinMisa || jadwal.bacaanI || jadwal.pemazmur || jadwal.jumlahPeserta > 0) {
          setPetugasMisa({
            pemimpin: jadwal.pemimpinMisa || "",
            bacaanPertama: jadwal.bacaanI || "",
            pemazmur: jadwal.pemazmur || "",
            jumlahPeserta: jadwal.jumlahPeserta || 0,
            // Legacy fields
            pemimpinMisa: jadwal.pemimpinMisa || "",
            bacaanI: jadwal.bacaanI || ""
          });
        }
      }
    }
  }, [selectedJadwal, jadwalDoling]);

  // Update totalHadir saat nilai kehadiran berubah
  useEffect(() => {
    const total = jumlahKehadiran.bapak + jumlahKehadiran.ibu + jumlahKehadiran.omk + 
                 jumlahKehadiran.bir + jumlahKehadiran.biaBesar + jumlahKehadiran.biaKecil;
    
    setJumlahKehadiran(prev => ({
      ...prev,
      totalHadir: total
    }));
  }, [
    jumlahKehadiran.bapak, 
    jumlahKehadiran.ibu, 
    jumlahKehadiran.omk, 
    jumlahKehadiran.bir, 
    jumlahKehadiran.biaBesar, 
    jumlahKehadiran.biaKecil
  ]);

  // Handler untuk perubahan JenisIbadat dari form
  const handleJenisIbadatChange = (value: FormJenisIbadat) => {
    setFormJenisIbadat(value);
    
    // Mapping balik ke JenisIbadat Prisma
    const reverseMappingJenisIbadat: Record<FormJenisIbadat, JenisIbadat> = {
      "doa-lingkungan": JenisIbadat.DOA_LINGKUNGAN,
      "misa": JenisIbadat.MISA,
      "pertemuan": JenisIbadat.PERTEMUAN,
      "bakti-sosial": JenisIbadat.BAKTI_SOSIAL,
      "kegiatan-lainnya": JenisIbadat.KEGIATAN_LAIN
    };
    
    setJenisIbadat(reverseMappingJenisIbadat[value]);
  };
  
  // Handle status
  const handleStatusChange = (value: StatusKegiatan): void => {
    setStatus(value);
  };
  
  // Handle keterangan
  const handleKeteranganChange = (value: string): void => {
    setKeterangan(value);
  };
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validasi form sederhana
    if (!selectedJadwal) {
      toast.error("Pilih jadwal doling terlebih dahulu");
      return;
    }
    
    // Prepare data untuk dikirim ke server
    const submitData: SubmitDataType = {
      id: selectedJadwal,
      jumlahKKHadir: jumlahKehadiran.jumlahKKHadir,
      bapak: jumlahKehadiran.bapak,
      ibu: jumlahKehadiran.ibu,
      omk: jumlahKehadiran.omk,
      bir: jumlahKehadiran.bir,
      biaBawah: jumlahKehadiran.biaKecil,
      biaAtas: jumlahKehadiran.biaBesar,
      kolekteI: kolekteData.kolekte1,
      kolekteII: kolekteData.kolekte2,
      ucapanSyukur: kolekteData.ucapanSyukur,
      pemimpinIbadat: petugasLiturgi.pemimpin,
      pemimpinRosario: petugasLiturgi.rosario,
      pembawaRenungan: petugasLiturgi.renungan,
      pembawaLagu: petugasLiturgi.lagu,
      doaUmat: petugasLiturgi.doaUmat,
      bacaan: petugasLiturgi.bacaan,
      pemimpinMisa: petugasMisa.pemimpin,
      bacaanI: petugasMisa.bacaanPertama,
      pemazmur: petugasMisa.pemazmur,
      jumlahPeserta: petugasMisa.jumlahPeserta,
      status: status,
      customSubIbadat: customSubIbadat || null,
      subIbadat: subIbadat ? mapStringToSubIbadatEnum(subIbadat) : null,
      statusKegiatan: status,
    };
    
    onSubmit(submitData);
  };
  
  // Handle input number untuk kolekte
  const handleKolekteChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof KolekteData): void => {
    const value = parseInt(e.target.value) || 0;
    setKolekteData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Handle input number untuk kehadiran
  const handleKehadiranChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof KehadiranData): void => {
    const value = parseInt(e.target.value) || 0;
    
    // Sync totalHadir jika komponen input lain yang berubah
    setJumlahKehadiran(prev => {
      const newState = { ...prev, [field]: value };
      
      if (field !== "totalHadir") {
        newState.totalHadir = 
          newState.bapak + 
          newState.ibu + 
          newState.omk + 
          newState.bir + 
          newState.biaKecil + 
          newState.biaBesar;
      }
      
      return newState;
    });
  };
  
  // Handle petugas liturgi
  const handlePetugasLiturgiChange = (field: keyof PetugasLiturgiData, value: string): void => {
    setPetugasLiturgi(prev => {
      const newState = { ...prev, [field]: value };
      
      // Sync legacy fields
      if (field === "pemimpin") {
        newState.pemimpinIbadat = value;
      } else if (field === "rosario") {
        newState.pemimpinRosario = value;
      } else if (field === "renungan") {
        newState.pembawaRenungan = value;
      } else if (field === "lagu") {
        newState.pembawaLagu = value;
      }
      
      return newState;
    });
  };
  
  // Handler untuk jumlah peserta misa
  const handleJumlahPesertaChange = (value: number): void => {
    setPetugasMisa(prev => ({
      ...prev,
      jumlahPeserta: value
    }));
  }
  
  // Handle petugas misa
  const handlePetugasMisaChange = (field: 'pemimpin' | 'bacaanPertama' | 'pemazmur', value: string): void => {
    setPetugasMisa(prev => {
      const newState = { ...prev, [field]: value };
      
      // Sync legacy fields
      if (field === "pemimpin") {
        newState.pemimpinMisa = value;
      } else if (field === "bacaanPertama") {
        newState.bacaanI = value;
      }
      
      return newState;
    });
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[95vh] overflow-y-auto pb-10">
        <DialogHeader>
          <DialogTitle>
            {detil ? 'Edit Detail Doling' : 'Tambah Detail Doling'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <InformasiDasarSection 
            selectedJadwal={selectedJadwal}
            tanggalValue={tanggalValue}
            tuanRumahValue={tuanRumahValue}
            jenisIbadat={formJenisIbadat}
            subIbadat={subIbadat}
            customSubIbadat={customSubIbadat}
            temaIbadat={temaIbadat || ""}
            jadwalDoling={jadwalDoling}
            keluargaList={keluargaList}
            onSelectedJadwalChange={setSelectedJadwal}
            onTanggalValueChange={setTanggalValue}
            onTuanRumahValueChange={setTuanRumahValue}
            onJenisIbadatChange={handleJenisIbadatChange}
            onSubIbadatChange={(value: string) => setSubIbadat(value)}
            onCustomSubIbadatChange={(value: string) => setCustomSubIbadat(value)}
            onTemaIbadatChange={(value: string) => setTemaIbadat(value || null)}
          />
          
          {jenisIbadat === JenisIbadat.DOA_LINGKUNGAN && (
            <>
              <DataKehadiranSection 
                jumlahKehadiran={jumlahKehadiran}
                onKehadiranChange={handleKehadiranChange}
              />
              
              <PetugasLiturgiSection
                petugasLiturgi={petugasLiturgi}
                onPetugasLiturgiChange={handlePetugasLiturgiChange}
              />
              
              <KolekteSection 
                kolekteData={kolekteData}
                onKolekteChange={handleKolekteChange}
              />
            </>
          )}
          
          {jenisIbadat === JenisIbadat.MISA && (
            <>
              <DataKehadiranSection 
                jumlahKehadiran={jumlahKehadiran}
                onKehadiranChange={handleKehadiranChange}
              />
              
              <PetugasMisaSection 
                petugasMisa={petugasMisa}
                onPetugasMisaChange={handlePetugasMisaChange}
                onJumlahPesertaChange={handleJumlahPesertaChange}
              />
              
              <KolekteSection 
                kolekteData={kolekteData}
                onKolekteChange={handleKolekteChange}
              />
            </>
          )}
          
          {(jenisIbadat === JenisIbadat.PERTEMUAN || jenisIbadat === JenisIbadat.BAKTI_SOSIAL || jenisIbadat === JenisIbadat.KEGIATAN_LAIN) && (
            <DataKehadiranSection 
              jumlahKehadiran={jumlahKehadiran}
              onKehadiranChange={handleKehadiranChange}
            />
          )}
          
          <KeteranganStatusSection
            keterangan={keterangan}
            status={status}
            onKeteranganChange={handleKeteranganChange}
            onStatusChange={handleStatusChange}
            approved={detil?.approved || false}
          />
          
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit">
              {detil ? 'Simpan Perubahan' : 'Tambah'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 