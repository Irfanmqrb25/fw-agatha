import { PrismaClient, KlasifikasiPublikasi, Role } from '@prisma/client';
import { addDays, subDays, subWeeks } from 'date-fns';

export async function seedPublikasi(prisma: PrismaClient) {
  // Get secretary user for creating publikasi
  const sekretaris = await prisma.user.findFirst({
    where: {
      role: 'SEKRETARIS'
    }
  });

  // If no sekretaris found, use another role or the first user
  const pembuat = sekretaris || await prisma.user.findFirst();
  
  if (!pembuat) {
    return;
  }

  // Get some users for notifications
  const users = await prisma.user.findMany({
    take: 10
  });

  const now = new Date();
  
  // Create publikasi with various classifications and target recipients
  const publikasiData = [
    // Important announcement for everyone
    {
      judul: 'Jadwal Misa Natal dan Tahun Baru',
      isi: `Salam damai Kristus,
      
Bersama ini disampaikan jadwal Misa Natal dan Tahun Baru:

Misa Malam Natal: 24 Desember 2023, pukul 19.00
Misa Natal: 25 Desember 2023, pukul 09.00
Misa Tahun Baru: 1 Januari 2024, pukul 09.00

Mohon kehadiran seluruh umat lingkungan St. Agatha.

Terima kasih.`,
      lampiran: ['jadwal-misa-natal.pdf'],
      klasifikasi: KlasifikasiPublikasi.PENTING,
      targetPenerima: [Role.KETUA, Role.WAKIL_KETUA, Role.SEKRETARIS, Role.WAKIL_SEKRETARIS, Role.BENDAHARA, Role.WAKIL_BENDAHARA, Role.UMAT],
      deadline: addDays(now, 20),
      pembuatId: pembuat.id
    },
    
    // General announcement
    {
      judul: 'Jadwal Doa Lingkungan Bulan Oktober',
      isi: `Salam damai Kristus,
      
Bersama ini disampaikan jadwal Doa Lingkungan untuk bulan Oktober:

Minggu 1: Keluarga Budi Santoso
Minggu 2: Keluarga Anton Wijaya
Minggu 3: Keluarga Hendro Susanto
Minggu 4: Keluarga Leo Gunawan

Mohon partisipasi aktif seluruh umat.

Terima kasih.`,
      lampiran: [],
      klasifikasi: KlasifikasiPublikasi.UMUM,
      targetPenerima: [Role.KETUA, Role.WAKIL_KETUA, Role.UMAT],
      deadline: null,
      pembuatId: pembuat.id
    },
    
    // Urgent announcement
    {
      judul: 'Perubahan Jadwal Rapat Pengurus',
      isi: `Salam damai Kristus,
      
Diberitahukan bahwa rapat pengurus yang semula dijadwalkan pada tanggal 15 Oktober 2023 diubah menjadi tanggal 17 Oktober 2023, pukul 19.00.

Mohon kehadiran seluruh pengurus lingkungan.

Terima kasih.`,
      lampiran: ['surat-undangan-rapat.pdf'],
      klasifikasi: KlasifikasiPublikasi.SEGERA,
      targetPenerima: [Role.KETUA, Role.WAKIL_KETUA, Role.SEKRETARIS, Role.WAKIL_SEKRETARIS, Role.BENDAHARA, Role.WAKIL_BENDAHARA],
      deadline: addDays(now, 5),
      pembuatId: pembuat.id
    },
    
    // Confidential announcement
    {
      judul: 'Rencana Anggaran Tahunan',
      isi: `Salam damai Kristus,
      
Bersama ini disampaikan draft Rencana Anggaran Tahunan lingkungan St. Agatha untuk tahun 2024.

Mohon diperiksa dan diberikan masukan sebelum difinalisasi.

Terima kasih.`,
      lampiran: ['draft-anggaran-2024.xlsx'],
      klasifikasi: KlasifikasiPublikasi.RAHASIA,
      targetPenerima: [Role.KETUA, Role.WAKIL_KETUA, Role.BENDAHARA, Role.WAKIL_BENDAHARA],
      deadline: addDays(now, 10),
      pembuatId: pembuat.id
    },
    
    // Past announcement
    {
      judul: 'Pengumuman Kegiatan Bakti Sosial',
      isi: `Salam damai Kristus,
      
Diberitahukan bahwa lingkungan St. Agatha akan mengadakan kegiatan bakti sosial pada:

Hari/Tanggal: Sabtu, 12 September 2023
Waktu: 09.00 - 12.00
Tempat: Panti Asuhan St. Maria

Mohon partisipasi aktif seluruh umat dengan memberikan sumbangan berupa sembako, pakaian layak pakai, atau dana tunai.

Terima kasih.`,
      lampiran: ['poster-baksos.jpg'],
      klasifikasi: KlasifikasiPublikasi.PENTING,
      targetPenerima: [Role.KETUA, Role.WAKIL_KETUA, Role.SEKRETARIS, Role.WAKIL_SEKRETARIS, Role.BENDAHARA, Role.WAKIL_BENDAHARA, Role.UMAT],
      deadline: subWeeks(now, 4),
      pembuatId: pembuat.id
    }
  ];

  // Create publikasi records
  for (const publikasi of publikasiData) {
    await prisma.publikasi.create({
      data: publikasi,
    });
  }

  // Create notifications related to publikasi and other activities
  const notificationData = [
    {
      pesan: 'Pengumuman baru: Jadwal Misa Natal dan Tahun Baru',
      dibaca: false,
      userId: users[0].id
    },
    {
      pesan: 'Pengumuman baru: Jadwal Doa Lingkungan Bulan Oktober',
      dibaca: true,
      userId: users[1].id
    },
    {
      pesan: 'Pengumuman baru: Perubahan Jadwal Rapat Pengurus',
      dibaca: false,
      userId: users[2].id
    },
    {
      pesan: 'Pengumuman baru: Rencana Anggaran Tahunan',
      dibaca: false,
      userId: users[3].id
    },
    {
      pesan: 'Iuran Dana Mandiri Anda telah disetor ke Paroki',
      dibaca: true,
      userId: users[4].id
    },
    {
      pesan: 'Anda memiliki tunggakan Iuran IKATA sebesar Rp 60.000',
      dibaca: false,
      userId: users[5].id
    },
    {
      pesan: 'Pengajuan Dana untuk Kegiatan Natal menunggu persetujuan',
      dibaca: false,
      userId: users[6].id
    },
    {
      pesan: 'Jadwal doa lingkungan: Anda menjadi tuan rumah minggu depan',
      dibaca: true,
      userId: users[7].id
    },
    {
      pesan: 'Selamat! Pengajuan Kegiatan Bakti Sosial telah disetujui',
      dibaca: false,
      userId: users[8].id
    },
    {
      pesan: 'Pembayaran Dana Mandiri untuk bulan Oktober telah diterima',
      dibaca: true,
      userId: users[9].id
    }
  ];

  // Create notification records
  for (const notification of notificationData) {
    await prisma.notification.create({
      data: notification,
    });
  }
} 