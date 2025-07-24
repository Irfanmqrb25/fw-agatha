import { z } from "zod";
import { DateRange } from "react-day-picker";

// Tipe data untuk Resume Keuangan Lingkungan
export interface KeuanganLingkunganSummary {
  saldoAwal: number;
  totalPemasukan: number;
  totalPengeluaran: number;
  saldoAkhir: number;
}

// Tipe data untuk Resume Keuangan IKATA
export interface KeuanganIkataSummary {
  saldoAwal: number;
  pemasukan: number;
  pengeluaran: number;
  saldoAkhir: number;
}

// Tipe data untuk Resume Kesekretariatan
export interface KesekretariatanSummary {
  totalKepalaKeluarga: number;
  jumlahJiwa: number;
  kkBergabung: number;
  kkPindah: number;
  umatMeninggalDunia: number;
  tingkatPartisipasiUmat: number;
  detailKKBergabung: {
    id: string;
    nama: string;
    tanggal: Date;
  }[];
  detailKKPindah: {
    id: string;
    nama: string;
    tanggal: Date;
  }[];
  detailUmatMeninggal: {
    id: string;
    nama: string;
    tanggal: Date;
    statusKeluarga: string;
  }[];
}

// Tipe data untuk Kepala Keluarga Penunggak
export interface PenunggakDanaMandiri {
  id: string;
  nama: string;
  periodeTunggakan: string;
  jumlahTunggakan: number;
}

// Tipe data untuk Kepala Keluarga Penunggak IKATA
export interface PenunggakIkata {
  id: string;
  nama: string;
  periodeTunggakan: string;
  jumlahTunggakan: number;
} 

// Tipe props untuk komponen
export interface DashboardContentProps {
  keuanganLingkunganData: KeuanganLingkunganSummary;
  keuanganIkataData: KeuanganIkataSummary;
  kesekretariatanData: KesekretariatanSummary;
  penunggakDanaMandiri: PenunggakDanaMandiri[];
  penunggakIkata: PenunggakIkata[];
  userRole: string;
}