import * as XLSX from 'xlsx';
import { toast } from 'sonner';

export function exportFamilyHeadTemplate() {
  try {
    // Template data untuk diunduh
    const template = [
      {
        'Nama Kepala Keluarga': 'Contoh: Budi Santoso',
        'Tanggal Bergabung (DD/MM/YYYY)': '01/01/2023',
        'Alamat': 'Contoh: Jl. Merdeka No. 123',
        'No. Telepon': 'Contoh: 081234567890',
        'Status Pernikahan': 'MENIKAH atau TIDAK_MENIKAH',
        'Jumlah Anak Tertanggung': '2',
        'Jumlah Kerabat Tertanggung': '1',
        'Jumlah Anggota Keluarga': '4',
        'Tempat Lahir (opsional)': 'Contoh: Jakarta',
        'Tanggal Lahir (DD/MM/YYYY) (opsional)': '15/08/1980',
        'Kota Domisili (opsional)': 'Contoh: Jakarta Selatan',
        'Pendidikan Terakhir (opsional)': 'Contoh: S1'
      },
      {
        'Nama Kepala Keluarga': '',
        'Tanggal Bergabung (DD/MM/YYYY)': '',
        'Alamat': '',
        'No. Telepon': '',
        'Status Pernikahan': '',
        'Jumlah Anak Tertanggung': '',
        'Jumlah Kerabat Tertanggung': '',
        'Jumlah Anggota Keluarga': '',
        'Tempat Lahir (opsional)': '',
        'Tanggal Lahir (DD/MM/YYYY) (opsional)': '',
        'Kota Domisili (opsional)': '',
        'Pendidikan Terakhir (opsional)': ''
      }
    ];

    // Buat workbook baru
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(template);
    
    // Sesuaikan lebar kolom
    const wscols = [
      { wch: 25 }, // Nama Kepala Keluarga
      { wch: 25 }, // Tanggal Bergabung
      { wch: 40 }, // Alamat
      { wch: 20 }, // No. Telepon
      { wch: 25 }, // Status Pernikahan
      { wch: 20 }, // Jumlah Anak Tertanggung
      { wch: 20 }, // Jumlah Kerabat Tertanggung
      { wch: 20 }, // Jumlah Anggota Keluarga
      { wch: 25 }, // Tempat Lahir
      { wch: 30 }, // Tanggal Lahir
      { wch: 25 }, // Kota Domisili
      { wch: 25 }, // Pendidikan Terakhir
    ];
    ws['!cols'] = wscols;
    
    // Tambahkan worksheet ke workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Template Data Umat');
    
    // Ekspor ke file Excel
    XLSX.writeFile(wb, 'template_data_umat.xlsx');
    
    toast.success('Template berhasil diunduh');
    return true;
  } catch (error) {
    console.error('Error exporting template:', error);
    toast.error('Terjadi kesalahan saat mengunduh template');
    return false;
  }
} 