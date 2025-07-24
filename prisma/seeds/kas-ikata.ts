import { PrismaClient, JenisTransaksi, TipeTransaksiIkata, StatusIuran } from '@prisma/client';
import { addDays, addMonths } from 'date-fns';

export async function seedKasIkata(prisma: PrismaClient) {
  // Get all keluarga umat for iuran records
  const keluargaUmatList = await prisma.keluargaUmat.findMany();
  const currentDate = new Date();
  
  // Create kas ikata records
  const kasIkataData = [
    // Month 1
    {
      tanggal: addMonths(currentDate, -3),
      jenisTranasksi: JenisTransaksi.UANG_MASUK,
      tipeTransaksi: TipeTransaksiIkata.IURAN_ANGGOTA,
      keterangan: 'Iuran Anggota Bulan Pertama',
      debit: 1000000,
      kredit: 0
    },
    {
      tanggal: addDays(addMonths(currentDate, -3), 10),
      jenisTranasksi: JenisTransaksi.UANG_MASUK,
      tipeTransaksi: TipeTransaksiIkata.TRANSFER_DANA_DARI_LINGKUNGAN,
      keterangan: 'Transfer dana rutin dari Lingkungan',
      debit: 1500000,
      kredit: 0
    },
    {
      tanggal: addDays(addMonths(currentDate, -3), 15),
      jenisTranasksi: JenisTransaksi.UANG_MASUK,
      tipeTransaksi: TipeTransaksiIkata.SUMBANGAN_ANGGOTA,
      keterangan: 'Sumbangan dari Keluarga Budi Santoso',
      debit: 500000,
      kredit: 0
    },
    {
      tanggal: addDays(addMonths(currentDate, -3), 20),
      jenisTranasksi: JenisTransaksi.UANG_KELUAR,
      tipeTransaksi: TipeTransaksiIkata.UANG_DUKA_PAPAN_BUNGA,
      keterangan: 'Papan bunga duka untuk keluarga Suryo',
      debit: 0,
      kredit: 750000
    },
    {
      tanggal: addDays(addMonths(currentDate, -3), 25),
      jenisTranasksi: JenisTransaksi.UANG_KELUAR,
      tipeTransaksi: TipeTransaksiIkata.PEMBELIAN,
      keterangan: 'Pembelian perlengkapan administrasi',
      debit: 0,
      kredit: 350000
    },
    
    // Month 2
    {
      tanggal: addMonths(currentDate, -2),
      jenisTranasksi: JenisTransaksi.UANG_MASUK,
      tipeTransaksi: TipeTransaksiIkata.IURAN_ANGGOTA,
      keterangan: 'Iuran Anggota Bulan Kedua',
      debit: 950000,
      kredit: 0
    },
    {
      tanggal: addDays(addMonths(currentDate, -2), 5),
      jenisTranasksi: JenisTransaksi.UANG_MASUK,
      tipeTransaksi: TipeTransaksiIkata.SUMBANGAN_ANGGOTA,
      keterangan: 'Sumbangan dari Keluarga Anton Wijaya',
      debit: 750000,
      kredit: 0
    },
    {
      tanggal: addDays(addMonths(currentDate, -2), 15),
      jenisTranasksi: JenisTransaksi.UANG_KELUAR,
      tipeTransaksi: TipeTransaksiIkata.KUNJUNGAN_KASIH,
      keterangan: 'Kunjungan kasih ke panti jompo',
      debit: 0,
      kredit: 1200000
    },
    {
      tanggal: addDays(addMonths(currentDate, -2), 25),
      jenisTranasksi: JenisTransaksi.UANG_MASUK,
      tipeTransaksi: TipeTransaksiIkata.TRANSFER_DANA_DARI_LINGKUNGAN,
      keterangan: 'Transfer dana dari kas lingkungan',
      debit: 1000000,
      kredit: 0
    },
    {
      tanggal: addDays(addMonths(currentDate, -2), 28),
      jenisTranasksi: JenisTransaksi.UANG_KELUAR,
      tipeTransaksi: TipeTransaksiIkata.UANG_AKOMODASI,
      keterangan: 'Biaya akomodasi kunjungan kasih',
      debit: 0,
      kredit: 650000
    },
    
    // Month 3 (Current month)
    {
      tanggal: addMonths(currentDate, -1),
      jenisTranasksi: JenisTransaksi.UANG_MASUK,
      tipeTransaksi: TipeTransaksiIkata.IURAN_ANGGOTA,
      keterangan: 'Iuran Anggota Bulan Ketiga',
      debit: 1100000,
      kredit: 0
    },
    {
      tanggal: addDays(addMonths(currentDate, -1), 7),
      jenisTranasksi: JenisTransaksi.UANG_MASUK,
      tipeTransaksi: TipeTransaksiIkata.PENERIMAAN_LAIN,
      keterangan: 'Hasil penjualan barang bekas',
      debit: 350000,
      kredit: 0
    },
    {
      tanggal: addDays(addMonths(currentDate, -1), 12),
      jenisTranasksi: JenisTransaksi.UANG_KELUAR,
      tipeTransaksi: TipeTransaksiIkata.CINDERAMATA_PERNIKAHAN,
      keterangan: 'Cinderamata pernikahan keluarga Hendro',
      debit: 0,
      kredit: 500000
    },
    {
      tanggal: addDays(addMonths(currentDate, -1), 18),
      jenisTranasksi: JenisTransaksi.UANG_KELUAR,
      tipeTransaksi: TipeTransaksiIkata.CINDERAMATA_KELAHIRAN,
      keterangan: 'Cinderamata kelahiran keluarga Leo',
      debit: 0,
      kredit: 350000
    },
    {
      tanggal: addDays(addMonths(currentDate, -1), 25),
      jenisTranasksi: JenisTransaksi.UANG_KELUAR,
      tipeTransaksi: TipeTransaksiIkata.LAIN_LAIN,
      keterangan: 'Pengeluaran tak terduga',
      debit: 0,
      kredit: 275000
    }
  ];

  // Create kas ikata records
  for (const kasData of kasIkataData) {
    await prisma.kasIkata.create({
      data: kasData,
    });
  }

  // Create iuran IKATA records
  const currentYear = new Date().getFullYear();

  // Some fully paid, some partially paid, some not paid for variety
  for (const [index, keluarga] of keluargaUmatList.entries()) {
    let status;
    let bulanAwal = null;
    let bulanAkhir = null;
    let jumlahDibayar = 120000; // Assume 10,000 per month for a year

    // Different statuses for different families
    if (index % 3 === 0) {
      status = StatusIuran.LUNAS; // Fully paid
    } else if (index % 3 === 1) {
      status = StatusIuran.SEBAGIAN_BULAN; // Partially paid
      bulanAwal = 1;
      bulanAkhir = 6;
      jumlahDibayar = 60000; // Half year payment
    } else {
      status = StatusIuran.BELUM_BAYAR; // Not paid
      jumlahDibayar = 0;
    }

    await prisma.iuranIkata.create({
      data: {
        keluargaId: keluarga.id,
        status,
        bulanAwal,
        bulanAkhir,
        tahun: currentYear,
        jumlahDibayar
      }
    });

    // Add previous year data (all paid)
    await prisma.iuranIkata.create({
      data: {
        keluargaId: keluarga.id,
        status: StatusIuran.LUNAS,
        tahun: currentYear - 1,
        jumlahDibayar: 120000
      }
    });
  }
} 