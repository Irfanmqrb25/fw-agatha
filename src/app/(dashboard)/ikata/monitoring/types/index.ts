export interface DelinquentPayment {
  id: string;
  kepalaKeluarga: string;
  keluargaId: string;
  periodeAwal: string;
  periodeAkhir: string;
  jumlahTunggakan: number;
  status: 'belum_lunas' | 'sebagian_bulan';
  totalIuran?: number; // Total iuran tahunan
  createdAt: string;
  updatedAt: string;
  periodeTunggakan?: string; // Periode tunggakan yang sudah diformat
}

export interface NotificationData {
  kepalaKeluarga: string;
  periode: string;
  jumlahTunggakan: number;
  message: string;
} 