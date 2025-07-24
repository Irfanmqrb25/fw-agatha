import { PrismaClient, JenisTransaksi, TipeTransaksiLingkungan, StatusApproval } from '@prisma/client';
import { addDays, addMonths } from 'date-fns';

export async function seedKasLingkungan(prisma: PrismaClient) {
  // Seed transaction data for the last 3 months
  const currentDate = new Date();
  const threMonthsAgo = addMonths(currentDate, -3);
  
  // Generate transactions with various types
  const kasLingkunganData = [
    // Month 1
    {
      tanggal: addMonths(currentDate, -3),
      jenisTranasksi: JenisTransaksi.UANG_MASUK,
      tipeTransaksi: TipeTransaksiLingkungan.KOLEKTE_I,
      keterangan: 'Kolekte Minggu Pertama',
      debit: 1250000,
      kredit: 0
    },
    {
      tanggal: addMonths(currentDate, -3),
      jenisTranasksi: JenisTransaksi.UANG_MASUK,
      tipeTransaksi: TipeTransaksiLingkungan.KOLEKTE_II,
      keterangan: 'Kolekte Minggu Pertama',
      debit: 750000,
      kredit: 0
    },
    {
      tanggal: addDays(addMonths(currentDate, -3), 7),
      jenisTranasksi: JenisTransaksi.UANG_MASUK,
      tipeTransaksi: TipeTransaksiLingkungan.KOLEKTE_I,
      keterangan: 'Kolekte Minggu Kedua',
      debit: 1350000,
      kredit: 0
    },
    {
      tanggal: addDays(addMonths(currentDate, -3), 7),
      jenisTranasksi: JenisTransaksi.UANG_MASUK,
      tipeTransaksi: TipeTransaksiLingkungan.KOLEKTE_II,
      keterangan: 'Kolekte Minggu Kedua',
      debit: 825000,
      kredit: 0
    },
    {
      tanggal: addDays(addMonths(currentDate, -3), 12),
      jenisTranasksi: JenisTransaksi.UANG_MASUK,
      tipeTransaksi: TipeTransaksiLingkungan.SUMBANGAN_UMAT,
      keterangan: 'Budi Santoso',
      debit: 500000,
      kredit: 0
    },
    {
      tanggal: addDays(addMonths(currentDate, -3), 15),
      jenisTranasksi: JenisTransaksi.UANG_KELUAR,
      tipeTransaksi: TipeTransaksiLingkungan.BIAYA_OPERASIONAL,
      keterangan: 'Pembayaran listrik dan air',
      debit: 0,
      kredit: 350000
    },
    {
      tanggal: addDays(addMonths(currentDate, -3), 20),
      jenisTranasksi: JenisTransaksi.UANG_KELUAR,
      tipeTransaksi: TipeTransaksiLingkungan.PEMBELIAN,
      keterangan: 'Pembelian perlengkapan ibadah',
      debit: 0,
      kredit: 750000
    },
    
    // Month 2
    {
      tanggal: addMonths(currentDate, -2),
      jenisTranasksi: JenisTransaksi.UANG_MASUK,
      tipeTransaksi: TipeTransaksiLingkungan.KOLEKTE_I,
      keterangan: 'Kolekte Minggu Pertama',
      debit: 1300000,
      kredit: 0
    },
    {
      tanggal: addMonths(currentDate, -2),
      jenisTranasksi: JenisTransaksi.UANG_MASUK,
      tipeTransaksi: TipeTransaksiLingkungan.KOLEKTE_II,
      keterangan: 'Kolekte Minggu Pertama',
      debit: 780000,
      kredit: 0
    },
    {
      tanggal: addDays(addMonths(currentDate, -2), 8),
      jenisTranasksi: JenisTransaksi.UANG_MASUK,
      tipeTransaksi: TipeTransaksiLingkungan.KOLEKTE_I,
      keterangan: 'Kolekte Minggu Kedua',
      debit: 1280000,
      kredit: 0
    },
    {
      tanggal: addDays(addMonths(currentDate, -2), 8),
      jenisTranasksi: JenisTransaksi.UANG_MASUK,
      tipeTransaksi: TipeTransaksiLingkungan.SUMBANGAN_UMAT,
      keterangan: 'Anton Wijaya',
      debit: 1000000,
      kredit: 0
    },
    {
      tanggal: addDays(addMonths(currentDate, -2), 15),
      jenisTranasksi: JenisTransaksi.UANG_KELUAR,
      tipeTransaksi: TipeTransaksiLingkungan.SOSIAL_DUKA,
      keterangan: 'Bantuan untuk keluarga duka',
      debit: 0,
      kredit: 1500000
    },
    {
      tanggal: addDays(addMonths(currentDate, -2), 20),
      jenisTranasksi: JenisTransaksi.UANG_KELUAR,
      tipeTransaksi: TipeTransaksiLingkungan.PENYELENGGARAAN_KEGIATAN,
      keterangan: 'Biaya penyelenggaraan retret',
      debit: 0,
      kredit: 2500000
    },
    {
      tanggal: addDays(addMonths(currentDate, -2), 25),
      jenisTranasksi: JenisTransaksi.UANG_KELUAR,
      tipeTransaksi: TipeTransaksiLingkungan.TRANSFER_DANA_KE_IKATA,
      keterangan: 'Transfer dana rutin ke IKATA',
      debit: 0,
      kredit: 1000000
    },
    
    // Month 3 (Current month)
    {
      tanggal: addMonths(currentDate, -1),
      jenisTranasksi: JenisTransaksi.UANG_MASUK,
      tipeTransaksi: TipeTransaksiLingkungan.KOLEKTE_I,
      keterangan: 'Kolekte Minggu Pertama',
      debit: 1350000,
      kredit: 0
    },
    {
      tanggal: addMonths(currentDate, -1),
      jenisTranasksi: JenisTransaksi.UANG_MASUK,
      tipeTransaksi: TipeTransaksiLingkungan.KOLEKTE_II,
      keterangan: 'Kolekte Minggu Pertama',
      debit: 800000,
      kredit: 0
    },
    {
      tanggal: addDays(addMonths(currentDate, -1), 8),
      jenisTranasksi: JenisTransaksi.UANG_MASUK,
      tipeTransaksi: TipeTransaksiLingkungan.PENERIMAAN_LAIN,
      keterangan: 'Hibah dari Paroki',
      debit: 5000000,
      kredit: 0
    },
    {
      tanggal: addDays(addMonths(currentDate, -1), 15),
      jenisTranasksi: JenisTransaksi.UANG_MASUK,
      tipeTransaksi: TipeTransaksiLingkungan.SUMBANGAN_UMAT,
      keterangan: 'Hendro Susanto',
      debit: 750000,
      kredit: 0
    },
    {
      tanggal: addDays(addMonths(currentDate, -1), 18),
      jenisTranasksi: JenisTransaksi.UANG_KELUAR,
      tipeTransaksi: TipeTransaksiLingkungan.BIAYA_OPERASIONAL,
      keterangan: 'Biaya operasional kegiatan mingguan',
      debit: 0,
      kredit: 450000
    },
    {
      tanggal: addDays(addMonths(currentDate, -1), 22),
      jenisTranasksi: JenisTransaksi.UANG_KELUAR,
      tipeTransaksi: TipeTransaksiLingkungan.PEMBELIAN,
      keterangan: 'Pembelian alat musik untuk ibadah',
      debit: 0,
      kredit: 3500000
    },
    {
      tanggal: addDays(addMonths(currentDate, -1), 28),
      jenisTranasksi: JenisTransaksi.UANG_KELUAR,
      tipeTransaksi: TipeTransaksiLingkungan.LAIN_LAIN,
      keterangan: 'Biaya tak terduga untuk renovasi kecil',
      debit: 0,
      kredit: 1250000
    }
  ];

  // Create kas lingkungan records and add approval for some of them
  for (const [index, kasData] of kasLingkunganData.entries()) {
    const createdKas = await prisma.kasLingkungan.create({
      data: kasData,
    });

    // Add approval for some transactions
    if (index % 3 === 0) {
      await prisma.approval.create({
        data: {
          kasLingkunganId: createdKas.id,
          status: StatusApproval.APPROVED
        }
      });
    } else if (index % 3 === 1) {
      await prisma.approval.create({
        data: {
          kasLingkunganId: createdKas.id,
          status: StatusApproval.PENDING
        }
      });
    }
    // Leave some without approval
  }

} 