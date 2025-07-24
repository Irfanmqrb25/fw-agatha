import { PrismaClient, TujuanPengajuan, StatusPengajuan, TindakLanjut, UpdateStatus, HasilAkhir } from '@prisma/client';
import { addDays, subDays, subMonths } from 'date-fns';

export async function seedPengajuan(prisma: PrismaClient) {
  // Get all users with UMAT role to use as pengaju
  const umatUsers = await prisma.user.findMany({
    where: {
      role: 'UMAT'
    }
  });
  
  if (umatUsers.length === 0) {
    return;
  }

  const now = new Date();
  
  // Create various pengajuan records with different statuses
  const pengajuanData = [
    // Open requests (still being processed)
    {
      tanggal: subDays(now, 2),
      perihal: 'Pengajuan Dana untuk Kegiatan Natal',
      tujuan: TujuanPengajuan.DPL,
      status: StatusPengajuan.OPEN,
      pengajuId: umatUsers[0].id
    },
    {
      tanggal: subDays(now, 5),
      perihal: 'Permohonan Bantuan Perlengkapan Ibadah',
      tujuan: TujuanPengajuan.STASI,
      status: StatusPengajuan.OPEN,
      pengajuId: umatUsers[1].id
    },
    {
      tanggal: subDays(now, 7),
      perihal: 'Pengajuan Renovasi Ruang Pertemuan',
      tujuan: TujuanPengajuan.PAROKI,
      status: StatusPengajuan.OPEN,
      pengajuId: umatUsers[2].id
    },
    
    // Processed at Lingkungan level
    {
      tanggal: subDays(now, 15),
      perihal: 'Pengajuan Kegiatan Bakti Sosial',
      tujuan: TujuanPengajuan.DPL,
      status: StatusPengajuan.CLOSED,
      tindakLanjut: TindakLanjut.DIPROSES_DI_LINGKUNGAN,
      updateStatus: UpdateStatus.SELESAI,
      pengajuId: umatUsers[3].id
    },
    
    // Processed at Stasi level
    {
      tanggal: subDays(now, 20),
      perihal: 'Pengajuan Pembentukan Kelompok OMK',
      tujuan: TujuanPengajuan.STASI,
      status: StatusPengajuan.CLOSED,
      tindakLanjut: TindakLanjut.DIPROSES_DI_STASI,
      updateStatus: UpdateStatus.SELESAI,
      pengajuId: umatUsers[4].id
    },
    
    // Rejected at Lingkungan level
    {
      tanggal: subMonths(now, 1),
      perihal: 'Pengajuan Pembelian Peralatan Musik',
      tujuan: TujuanPengajuan.DPL,
      status: StatusPengajuan.CLOSED,
      tindakLanjut: TindakLanjut.DITOLAK,
      alasanPenolakan: 'Dana tidak mencukupi untuk tahun anggaran ini',
      pengajuId: umatUsers[5].id
    },
    
    // Forwarded to Paroki and approved
    {
      tanggal: subMonths(now, 1),
      perihal: 'Pengajuan Pembangunan Gapura',
      tujuan: TujuanPengajuan.PAROKI,
      status: StatusPengajuan.CLOSED,
      tindakLanjut: TindakLanjut.DIPROSES_DI_STASI,
      updateStatus: UpdateStatus.DITERUSKAN_KE_PAROKI,
      hasilAkhir: HasilAkhir.SELESAI,
      pengajuId: umatUsers[6].id
    },
    
    // Forwarded to Paroki but rejected
    {
      tanggal: subMonths(now, 2),
      perihal: 'Pengajuan Dana Perluasan Area Parkir',
      tujuan: TujuanPengajuan.PAROKI,
      status: StatusPengajuan.CLOSED,
      tindakLanjut: TindakLanjut.DIPROSES_DI_PAROKI,
      updateStatus: UpdateStatus.DITERUSKAN_KE_PAROKI,
      hasilAkhir: HasilAkhir.DITOLAK,
      alasanPenolakan: 'Tidak sesuai dengan rencana pengembangan Paroki',
      pengajuId: umatUsers[7].id
    },
    
    // Rejected at Stasi level
    {
      tanggal: subMonths(now, 2),
      perihal: 'Permohonan Pembentukan Lingkungan Baru',
      tujuan: TujuanPengajuan.STASI,
      status: StatusPengajuan.CLOSED,
      tindakLanjut: TindakLanjut.DIPROSES_DI_STASI,
      updateStatus: UpdateStatus.DITOLAK,
      alasanPenolakan: 'Jumlah keluarga belum mencukupi untuk pemecahan lingkungan',
      pengajuId: umatUsers[8].id
    },
    
    // Archive: Completed request from a few months ago
    {
      tanggal: subMonths(now, 3),
      perihal: 'Pengadaan Kitab Suci untuk Keluarga Baru',
      tujuan: TujuanPengajuan.DPL,
      status: StatusPengajuan.CLOSED,
      tindakLanjut: TindakLanjut.DIPROSES_DI_LINGKUNGAN,
      updateStatus: UpdateStatus.SELESAI,
      pengajuId: umatUsers[0].id
    }
  ];

  // Create pengajuan records
  for (const pengajuanItem of pengajuanData) {
    await prisma.pengajuan.create({
      data: pengajuanItem,
    });
  }
} 