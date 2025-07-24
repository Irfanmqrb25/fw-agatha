import { PrismaClient, JenisIbadat, SubIbadat, StatusApproval } from '@prisma/client';
import { addDays, addWeeks, subMonths } from 'date-fns';

export async function seedDoaLingkungan(prisma: PrismaClient) {
  // Get all keluarga umat
  const keluargaUmatList = await prisma.keluargaUmat.findMany();
  
  if (keluargaUmatList.length === 0) {
    return;
  }

  const now = new Date();
  
  // Create doa lingkungan records for past 3 months
  const doaLingkunganData = [
    // Month 1 - Week 1 : Doa Lingkungan reguler
    {
      tanggal: subMonths(now, 3),
      jenisIbadat: JenisIbadat.DOA_LINGKUNGAN,
      subIbadat: SubIbadat.IBADAT_SABDA,
      temaIbadat: 'Tuhan Memberkati Keluarga',
      tuanRumahId: keluargaUmatList[0].id,
      jumlahKKHadir: 8,
      bapak: 6,
      ibu: 8,
      omk: 4,
      bir: 2,
      biaBawah: 3,
      biaAtas: 2,
      kolekteI: 450000,
      kolekteII: 325000,
      ucapanSyukur: 200000,
      pemimpinIbadat: 'Budi Santoso',
      pembawaRenungan: 'Anton Wijaya',
      pembawaLagu: 'Jessica Santoso',
      doaUmat: 'Maria Santoso'
    },
    
    // Month 1 - Week 2 : Misa
    {
      tanggal: addDays(subMonths(now, 3), 7),
      jenisIbadat: JenisIbadat.MISA,
      subIbadat: SubIbadat.MISA_SYUKUR,
      tuanRumahId: keluargaUmatList[1].id,
      jumlahKKHadir: 12,
      kolekteI: 850000,
      kolekteII: 650000,
      ucapanSyukur: 500000,
      pemimpinMisa: 'Romo Agustinus',
      bacaanI: 'Leo Gunawan',
      pemazmur: 'Lina Wijaya',
      jumlahPeserta: 45
    },
    
    // Month 1 - Week 3 : Pertemuan
    {
      tanggal: addDays(subMonths(now, 3), 14),
      jenisIbadat: JenisIbadat.PERTEMUAN,
      tuanRumahId: keluargaUmatList[2].id,
      kolekteI: 300000,
      kolekteII: 250000
    },
    
    // Month 1 - Week 4 : Doa Lingkungan khusus
    {
      tanggal: addDays(subMonths(now, 3), 21),
      jenisIbadat: JenisIbadat.DOA_LINGKUNGAN,
      subIbadat: SubIbadat.BULAN_ROSARIO,
      temaIbadat: 'Bunda Maria Pelindung Keluarga',
      tuanRumahId: keluargaUmatList[3].id,
      jumlahKKHadir: 10,
      bapak: 7,
      ibu: 10,
      omk: 6,
      bir: 3,
      biaBawah: 4,
      biaAtas: 3,
      kolekteI: 550000,
      kolekteII: 375000,
      ucapanSyukur: 300000,
      pemimpinIbadat: 'Hendro Susanto',
      pemimpinRosario: 'Dewi Susanto',
      pembawaRenungan: 'Leo Gunawan',
      pembawaLagu: 'Natasha Wijaya',
      doaUmat: 'Sinta Gunawan'
    },
    
    // Month 2 - Week 1 : Bakti Sosial
    {
      tanggal: subMonths(now, 2),
      jenisIbadat: JenisIbadat.BAKTI_SOSIAL,
      tuanRumahId: keluargaUmatList[4].id,
      kolekteI: 1200000,
      kolekteII: 900000
    },
    
    // Month 2 - Week 2 : Doa Lingkungan reguler
    {
      tanggal: addDays(subMonths(now, 2), 7),
      jenisIbadat: JenisIbadat.DOA_LINGKUNGAN,
      subIbadat: SubIbadat.IBADAT_SABDA_TEMATIK,
      temaIbadat: 'Berkat Melimpah Dalam Kristus',
      tuanRumahId: keluargaUmatList[5].id,
      jumlahKKHadir: 9,
      bapak: 8,
      ibu: 9,
      omk: 5,
      bir: 2,
      biaBawah: 3,
      biaAtas: 4,
      kolekteI: 480000,
      kolekteII: 340000,
      ucapanSyukur: 250000,
      pemimpinIbadat: 'Bambang Supriadi',
      pembawaRenungan: 'Agus Setiawan',
      pembawaLagu: 'Yanti Supriadi',
      doaUmat: 'Rina Setiawan'
    },
    
    // Month 2 - Week 3 : Misa
    {
      tanggal: addDays(subMonths(now, 2), 14),
      jenisIbadat: JenisIbadat.MISA,
      subIbadat: SubIbadat.MISA_ARWAH,
      tuanRumahId: keluargaUmatList[6].id,
      jumlahKKHadir: 14,
      kolekteI: 950000,
      kolekteII: 750000,
      ucapanSyukur: 600000,
      pemimpinMisa: 'Romo Benediktus',
      bacaanI: 'Tono Widodo',
      pemazmur: 'Sari Widodo',
      jumlahPeserta: 52
    },
    
    // Month 2 - Week 4 : Doa Lingkungan khusus
    {
      tanggal: addDays(subMonths(now, 2), 21),
      jenisIbadat: JenisIbadat.DOA_LINGKUNGAN,
      subIbadat: SubIbadat.PRAPASKAH,
      temaIbadat: 'Tobat dan Pembaharuan Hidup',
      tuanRumahId: keluargaUmatList[7].id,
      jumlahKKHadir: 11,
      bapak: 9,
      ibu: 11,
      omk: 7,
      bir: 3,
      biaBawah: 4,
      biaAtas: 3,
      kolekteI: 580000,
      kolekteII: 420000,
      ucapanSyukur: 350000,
      pemimpinIbadat: 'Eko Sutrisno',
      pembawaRenungan: 'Tari Sutrisno',
      pembawaLagu: 'Kevin Santoso',
      doaUmat: 'Jessica Santoso'
    },
    
    // Month 3 - Week 1 : Kegiatan Lain
    {
      tanggal: subMonths(now, 1),
      jenisIbadat: JenisIbadat.KEGIATAN_LAIN,
      tuanRumahId: keluargaUmatList[8].id,
      kolekteI: 700000,
      kolekteII: 550000
    },
    
    // Month 3 - Week 2 : Doa Lingkungan reguler
    {
      tanggal: addDays(subMonths(now, 1), 7),
      jenisIbadat: JenisIbadat.DOA_LINGKUNGAN,
      subIbadat: SubIbadat.IBADAT_SABDA,
      temaIbadat: 'Keluarga dan Kasih',
      tuanRumahId: keluargaUmatList[9].id,
      jumlahKKHadir: 10,
      bapak: 8,
      ibu: 10,
      omk: 6,
      bir: 2,
      biaBawah: 3,
      biaAtas: 3,
      kolekteI: 500000,
      kolekteII: 380000,
      ucapanSyukur: 300000,
      pemimpinIbadat: 'Joko Purnomo',
      pembawaRenungan: 'Budi Santoso',
      pembawaLagu: 'Daniel Wijaya',
      doaUmat: 'Agatha Maria'
    },
    
    // Month 3 - Week 3 : Doa Lingkungan reguler
    {
      tanggal: addDays(subMonths(now, 1), 14),
      jenisIbadat: JenisIbadat.DOA_LINGKUNGAN,
      subIbadat: SubIbadat.IBADAT_SABDA,
      temaIbadat: 'Hidup dalam Berkat Tuhan',
      tuanRumahId: keluargaUmatList[0].id,
      jumlahKKHadir: 9,
      bapak: 7,
      ibu: 9,
      omk: 5,
      bir: 2,
      biaBawah: 3,
      biaAtas: 2,
      kolekteI: 520000,
      kolekteII: 360000,
      ucapanSyukur: 280000,
      pemimpinIbadat: 'Anton Wijaya',
      pembawaRenungan: 'Hendro Susanto',
      pembawaLagu: 'Adrian Susanto',
      doaUmat: 'Lina Wijaya'
    },
    
    // Month 3 - Week 4 (last week) : Misa
    {
      tanggal: addDays(subMonths(now, 1), 21),
      jenisIbadat: JenisIbadat.MISA,
      subIbadat: SubIbadat.MISA_PELINDUNG,
      tuanRumahId: keluargaUmatList[1].id,
      jumlahKKHadir: 15,
      kolekteI: 1050000,
      kolekteII: 820000,
      ucapanSyukur: 700000,
      pemimpinMisa: 'Romo Gabriel',
      bacaanI: 'Bambang Supriadi',
      pemazmur: 'Yanti Supriadi',
      jumlahPeserta: 60
    }
  ];

  // Create doa lingkungan records and add approvals and absensi for each
  for (const [index, dolingData] of doaLingkunganData.entries()) {
    const createdDoling = await prisma.doaLingkungan.create({
      data: dolingData,
    });

    // Create approval status for some records
    if (index % 3 === 0) {
      await prisma.approval.create({
        data: {
          doaLingkunganId: createdDoling.id,
          status: StatusApproval.APPROVED
        }
      });
    } else if (index % 3 === 1) {
      await prisma.approval.create({
        data: {
          doaLingkunganId: createdDoling.id,
          status: StatusApproval.PENDING
        }
      });
    }
    // Leave some without approval

    // Create absensi records for each keluarga (if not BAKTI_SOSIAL or KEGIATAN_LAIN)
    if (
      dolingData.jenisIbadat !== JenisIbadat.BAKTI_SOSIAL && 
      dolingData.jenisIbadat !== JenisIbadat.KEGIATAN_LAIN
    ) {
      for (const keluarga of keluargaUmatList) {
        // Random attendance, with tuanRumah always present
        const hadir = keluarga.id === dolingData.tuanRumahId || Math.random() > 0.3;
        
        await prisma.absensiDoling.create({
          data: {
            doaLingkunganId: createdDoling.id,
            keluargaId: keluarga.id,
            hadir
          }
        });
      }
    }
  }
} 