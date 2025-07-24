import { PrismaClient, StatusKehidupan, StatusPernikahan, JenisTanggungan, Agama, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const password = bcrypt.hashSync('password123', 10);

export async function seedKeluargaUmat(prisma: PrismaClient) {
  // Generate 20 keluarga umat
  const keluargaData = [
    {
      namaKepalaKeluarga: 'Budi Santoso',
      tanggalBergabung: new Date('2020-01-15'),
      alamat: 'Jl. Mangga Besar No. 10',
      jumlahAnakTertanggung: 2,
      jumlahKerabatTertanggung: 1,
      jumlahAnggotaKeluarga: 4,
      tempatLahir: 'Jakarta',
      tanggalLahir: new Date('1975-06-12'),
      nomorTelepon: '08123456789',
      status: StatusKehidupan.HIDUP,
      kotaDomisili: 'Jakarta Barat',
      pendidikanTerakhir: 'S1',
      tanggalBaptis: new Date('1975-08-20'),
      tanggalKrisma: new Date('1988-07-15'),
      statusPernikahan: StatusPernikahan.MENIKAH,
    },
    {
      namaKepalaKeluarga: 'Anton Wijaya',
      tanggalBergabung: new Date('2019-05-20'),
      alamat: 'Jl. Kelapa Gading No. 55',
      jumlahAnakTertanggung: 3,
      jumlahKerabatTertanggung: 0,
      jumlahAnggotaKeluarga: 5,
      tempatLahir: 'Surabaya',
      tanggalLahir: new Date('1980-11-05'),
      nomorTelepon: '08567891234',
      status: StatusKehidupan.HIDUP,
      kotaDomisili: 'Jakarta Utara',
      pendidikanTerakhir: 'S2',
      tanggalBaptis: new Date('1980-12-25'),
      tanggalKrisma: new Date('1994-06-10'),
      statusPernikahan: StatusPernikahan.MENIKAH,
    },
    {
      namaKepalaKeluarga: 'Hendro Susanto',
      tanggalBergabung: new Date('2018-03-10'),
      alamat: 'Jl. Tebet Raya No. 23',
      jumlahAnakTertanggung: 1,
      jumlahKerabatTertanggung: 1,
      jumlahAnggotaKeluarga: 4,
      tempatLahir: 'Bandung',
      tanggalLahir: new Date('1982-04-18'),
      nomorTelepon: '087812345678',
      status: StatusKehidupan.HIDUP,
      kotaDomisili: 'Jakarta Selatan',
      pendidikanTerakhir: 'S1',
      tanggalBaptis: new Date('1982-05-30'),
      tanggalKrisma: new Date('1995-07-22'),
      statusPernikahan: StatusPernikahan.MENIKAH,
    },
    {
      namaKepalaKeluarga: 'Leo Gunawan',
      tanggalBergabung: new Date('2021-08-12'),
      alamat: 'Jl. Jendral Sudirman No. 45',
      jumlahAnakTertanggung: 2,
      jumlahKerabatTertanggung: 0,
      jumlahAnggotaKeluarga: 4,
      tempatLahir: 'Semarang',
      tanggalLahir: new Date('1978-09-25'),
      nomorTelepon: '081398765432',
      status: StatusKehidupan.HIDUP,
      kotaDomisili: 'Jakarta Pusat',
      pendidikanTerakhir: 'S1',
      tanggalBaptis: new Date('1979-01-07'),
      tanggalKrisma: new Date('1991-06-15'),
      statusPernikahan: StatusPernikahan.MENIKAH,
    },
    {
      namaKepalaKeluarga: 'Rudi Hartono',
      tanggalBergabung: new Date('2017-11-05'),
      alamat: 'Jl. Kemanggisan No. 32',
      jumlahAnakTertanggung: 0,
      jumlahKerabatTertanggung: 0,
      jumlahAnggotaKeluarga: 2,
      tempatLahir: 'Yogyakarta',
      tanggalLahir: new Date('1985-12-07'),
      nomorTelepon: '085756431890',
      status: StatusKehidupan.HIDUP,
      kotaDomisili: 'Jakarta Barat',
      pendidikanTerakhir: 'D3',
      tanggalBaptis: new Date('1986-01-19'),
      tanggalKrisma: new Date('1999-07-10'),
      statusPernikahan: StatusPernikahan.MENIKAH,
    },
    {
      namaKepalaKeluarga: 'Bambang Supriadi',
      tanggalBergabung: new Date('2016-02-28'),
      alamat: 'Jl. Cilandak Raya No. 15',
      jumlahAnakTertanggung: 3,
      jumlahKerabatTertanggung: 2,
      jumlahAnggotaKeluarga: 7,
      tempatLahir: 'Malang',
      tanggalLahir: new Date('1970-03-12'),
      nomorTelepon: '0813278965430',
      status: StatusKehidupan.HIDUP,
      kotaDomisili: 'Jakarta Selatan',
      pendidikanTerakhir: 'SMA',
      tanggalBaptis: new Date('1970-05-01'),
      tanggalKrisma: new Date('1984-06-12'),
      statusPernikahan: StatusPernikahan.MENIKAH,
    },
    {
      namaKepalaKeluarga: 'Agus Setiawan',
      tanggalBergabung: new Date('2022-01-10'),
      alamat: 'Jl. Pluit Selatan No. 8',
      jumlahAnakTertanggung: 1,
      jumlahKerabatTertanggung: 0,
      jumlahAnggotaKeluarga: 3,
      tempatLahir: 'Medan',
      tanggalLahir: new Date('1988-07-22'),
      nomorTelepon: '08567891478',
      status: StatusKehidupan.HIDUP,
      kotaDomisili: 'Jakarta Utara',
      pendidikanTerakhir: 'S1',
      tanggalBaptis: new Date('1988-09-10'),
      tanggalKrisma: new Date('2001-06-25'),
      statusPernikahan: StatusPernikahan.MENIKAH,
    },
    {
      namaKepalaKeluarga: 'Tono Widodo',
      tanggalBergabung: new Date('2015-07-15'),
      alamat: 'Jl. Rawamangun No. 21',
      jumlahAnakTertanggung: 2,
      jumlahKerabatTertanggung: 1,
      jumlahAnggotaKeluarga: 5,
      tempatLahir: 'Jakarta',
      tanggalLahir: new Date('1972-11-30'),
      nomorTelepon: '0815678912345',
      status: StatusKehidupan.HIDUP,
      kotaDomisili: 'Jakarta Timur',
      pendidikanTerakhir: 'D3',
      tanggalBaptis: new Date('1973-01-15'),
      tanggalKrisma: new Date('1986-07-05'),
      statusPernikahan: StatusPernikahan.MENIKAH,
    },
    {
      namaKepalaKeluarga: 'Eko Sutrisno',
      tanggalBergabung: new Date('2019-12-20'),
      tanggalKeluar: new Date('2023-06-15'),
      alamat: 'Jl. Cililitan No. 17',
      jumlahAnakTertanggung: 1,
      jumlahKerabatTertanggung: 0,
      jumlahAnggotaKeluarga: 3,
      tempatLahir: 'Palembang',
      tanggalLahir: new Date('1983-05-18'),
      nomorTelepon: '087834561290',
      status: StatusKehidupan.HIDUP,
      kotaDomisili: 'Jakarta Timur',
      pendidikanTerakhir: 'SMA',
      tanggalBaptis: new Date('1983-06-30'),
      tanggalKrisma: new Date('1997-06-15'),
      statusPernikahan: StatusPernikahan.MENIKAH,
    },
    {
      namaKepalaKeluarga: 'Joko Purnomo',
      tanggalBergabung: new Date('2017-05-05'),
      alamat: 'Jl. Kemang Raya No. 78',
      jumlahAnakTertanggung: 0,
      jumlahKerabatTertanggung: 0,
      jumlahAnggotaKeluarga: 1,
      tempatLahir: 'Solo',
      tanggalLahir: new Date('1990-09-12'),
      nomorTelepon: '085634289710',
      status: StatusKehidupan.HIDUP,
      kotaDomisili: 'Jakarta Selatan',
      pendidikanTerakhir: 'S1',
      tanggalBaptis: new Date('1990-10-20'),
      tanggalKrisma: new Date('2004-07-10'),
      statusPernikahan: StatusPernikahan.TIDAK_MENIKAH,
    }
  ];

  // Create keluarga umat records
  const keluargaUmatRecords = [];
  for (const keluarga of keluargaData) {
    const createdKeluarga = await prisma.keluargaUmat.upsert({
      where: { namaKepalaKeluarga: keluarga.namaKepalaKeluarga },
      update: {},
      create: keluarga,
    });
    keluargaUmatRecords.push(createdKeluarga);
  }

  // Create pasangan for each keluarga with MENIKAH status
  const pasanganData = [
    {
      nama: 'Maria Santoso',
      tempatLahir: 'Jakarta',
      tanggalLahir: new Date('1977-08-20'),
      nomorTelepon: '081234567890',
      pendidikanTerakhir: 'S1',
      agama: Agama.KATOLIK,
      noBiduk: 'BDK-001',
      tanggalBaptis: new Date('1977-10-15'),
      tanggalKrisma: new Date('1990-06-20'),
      status: StatusKehidupan.HIDUP,
      keluargaId: keluargaUmatRecords[0].id
    },
    {
      nama: 'Lina Wijaya',
      tempatLahir: 'Surabaya',
      tanggalLahir: new Date('1982-04-15'),
      nomorTelepon: '085678912345',
      pendidikanTerakhir: 'S1',
      agama: Agama.KATOLIK,
      noBiduk: 'BDK-002',
      tanggalBaptis: new Date('1982-06-10'),
      tanggalKrisma: new Date('1996-07-15'),
      status: StatusKehidupan.HIDUP,
      keluargaId: keluargaUmatRecords[1].id
    },
    {
      nama: 'Dewi Susanto',
      tempatLahir: 'Bandung',
      tanggalLahir: new Date('1983-07-25'),
      nomorTelepon: '087812345679',
      pendidikanTerakhir: 'D3',
      agama: Agama.KATOLIK,
      noBiduk: 'BDK-003',
      tanggalBaptis: new Date('1983-09-05'),
      tanggalKrisma: new Date('1997-06-25'),
      status: StatusKehidupan.HIDUP,
      keluargaId: keluargaUmatRecords[2].id
    },
    {
      nama: 'Sinta Gunawan',
      tempatLahir: 'Jakarta',
      tanggalLahir: new Date('1980-03-18'),
      nomorTelepon: '081398765431',
      pendidikanTerakhir: 'S1',
      agama: Agama.KATOLIK,
      noBiduk: 'BDK-004',
      tanggalBaptis: new Date('1980-05-12'),
      tanggalKrisma: new Date('1994-07-10'),
      status: StatusKehidupan.HIDUP,
      keluargaId: keluargaUmatRecords[3].id
    },
    {
      nama: 'Maya Hartono',
      tempatLahir: 'Yogyakarta',
      tanggalLahir: new Date('1987-02-14'),
      nomorTelepon: '085756431891',
      pendidikanTerakhir: 'S1',
      agama: Agama.KATOLIK,
      noBiduk: 'BDK-005',
      tanggalBaptis: new Date('1987-04-05'),
      tanggalKrisma: new Date('2000-06-18'),
      status: StatusKehidupan.HIDUP,
      keluargaId: keluargaUmatRecords[4].id
    },
    {
      nama: 'Yanti Supriadi',
      tempatLahir: 'Jakarta',
      tanggalLahir: new Date('1973-11-07'),
      nomorTelepon: '0813278965431',
      pendidikanTerakhir: 'SMA',
      agama: Agama.KATOLIK,
      noBiduk: 'BDK-006',
      tanggalBaptis: new Date('1973-12-25'),
      tanggalKrisma: new Date('1987-07-15'),
      status: StatusKehidupan.HIDUP,
      keluargaId: keluargaUmatRecords[5].id
    },
    {
      nama: 'Rina Setiawan',
      tempatLahir: 'Jakarta',
      tanggalLahir: new Date('1990-05-12'),
      nomorTelepon: '08567891479',
      pendidikanTerakhir: 'S1',
      agama: Agama.KATOLIK,
      noBiduk: 'BDK-007',
      tanggalBaptis: new Date('1990-06-30'),
      tanggalKrisma: new Date('2004-06-20'),
      status: StatusKehidupan.HIDUP,
      keluargaId: keluargaUmatRecords[6].id
    },
    {
      nama: 'Sari Widodo',
      tempatLahir: 'Jakarta',
      tanggalLahir: new Date('1975-08-24'),
      nomorTelepon: '0815678912346',
      pendidikanTerakhir: 'SMA',
      agama: Agama.KATOLIK,
      noBiduk: 'BDK-008',
      tanggalBaptis: new Date('1975-10-15'),
      tanggalKrisma: new Date('1988-07-02'),
      status: StatusKehidupan.HIDUP,
      keluargaId: keluargaUmatRecords[7].id
    },
    {
      nama: 'Tari Sutrisno',
      tempatLahir: 'Jakarta',
      tanggalLahir: new Date('1985-12-10'),
      nomorTelepon: '087834561291',
      pendidikanTerakhir: 'D3',
      agama: Agama.KATOLIK,
      noBiduk: 'BDK-009',
      tanggalBaptis: new Date('1986-01-25'),
      tanggalKrisma: new Date('1999-07-08'),
      status: StatusKehidupan.HIDUP,
      keluargaId: keluargaUmatRecords[8].id
    }
  ];

  // Create pasangan records
  for (const pasangan of pasanganData) {
    await prisma.pasangan.upsert({
      where: { keluargaId: pasangan.keluargaId },
      update: {},
      create: pasangan,
    });
  }

  // Create tanggungan for each keluarga
  const tanggunganData = [
    // Budi Santoso's children
    {
      jenisTanggungan: JenisTanggungan.ANAK,
      nama: 'Kevin Santoso',
      tanggalLahir: new Date('2005-04-12'),
      pendidikanTerakhir: 'SMA',
      agama: Agama.KATOLIK,
      tanggalBaptis: new Date('2005-06-15'),
      tanggalKrisma: new Date('2019-07-20'),
      statusPernikahan: StatusPernikahan.TIDAK_MENIKAH,
      keluargaId: keluargaUmatRecords[0].id
    },
    {
      jenisTanggungan: JenisTanggungan.ANAK,
      nama: 'Jessica Santoso',
      tanggalLahir: new Date('2008-07-25'),
      pendidikanTerakhir: 'SMP',
      agama: Agama.KATOLIK,
      tanggalBaptis: new Date('2008-09-10'),
      tanggalKrisma: null,
      statusPernikahan: StatusPernikahan.TIDAK_MENIKAH,
      keluargaId: keluargaUmatRecords[0].id
    },
    {
      jenisTanggungan: JenisTanggungan.KERABAT,
      nama: 'Agatha Maria',
      tanggalLahir: new Date('1950-01-15'),
      pendidikanTerakhir: 'SD',
      agama: Agama.KATOLIK,
      tanggalBaptis: new Date('1950-03-20'),
      tanggalKrisma: new Date('1964-06-25'),
      statusPernikahan: StatusPernikahan.TIDAK_MENIKAH,
      keluargaId: keluargaUmatRecords[0].id
    },
    
    // Anton Wijaya's children
    {
      jenisTanggungan: JenisTanggungan.ANAK,
      nama: 'Daniel Wijaya',
      tanggalLahir: new Date('2010-02-18'),
      pendidikanTerakhir: 'SD',
      agama: Agama.KATOLIK,
      tanggalBaptis: new Date('2010-04-10'),
      tanggalKrisma: null,
      statusPernikahan: StatusPernikahan.TIDAK_MENIKAH,
      keluargaId: keluargaUmatRecords[1].id
    },
    {
      jenisTanggungan: JenisTanggungan.ANAK,
      nama: 'Natasha Wijaya',
      tanggalLahir: new Date('2013-06-22'),
      pendidikanTerakhir: 'SD',
      agama: Agama.KATOLIK,
      tanggalBaptis: new Date('2013-08-15'),
      tanggalKrisma: null,
      statusPernikahan: StatusPernikahan.TIDAK_MENIKAH,
      keluargaId: keluargaUmatRecords[1].id
    },
    {
      jenisTanggungan: JenisTanggungan.ANAK,
      nama: 'Michael Wijaya',
      tanggalLahir: new Date('2017-11-05'),
      pendidikanTerakhir: 'TK',
      agama: Agama.KATOLIK,
      tanggalBaptis: new Date('2017-12-25'),
      tanggalKrisma: null,
      statusPernikahan: StatusPernikahan.TIDAK_MENIKAH,
      keluargaId: keluargaUmatRecords[1].id
    },
    
    // Hendro Susanto's child and kerabat
    {
      jenisTanggungan: JenisTanggungan.ANAK,
      nama: 'Adrian Susanto',
      tanggalLahir: new Date('2015-08-30'),
      pendidikanTerakhir: 'TK',
      agama: Agama.KATOLIK,
      tanggalBaptis: new Date('2015-10-15'),
      tanggalKrisma: null,
      statusPernikahan: StatusPernikahan.TIDAK_MENIKAH,
      keluargaId: keluargaUmatRecords[2].id
    },
    {
      jenisTanggungan: JenisTanggungan.KERABAT,
      nama: 'Yohanes Susilo',
      tanggalLahir: new Date('1945-12-24'),
      pendidikanTerakhir: 'SMA',
      agama: Agama.KATOLIK,
      tanggalBaptis: new Date('1946-01-15'),
      tanggalKrisma: new Date('1958-06-20'),
      statusPernikahan: StatusPernikahan.TIDAK_MENIKAH,
      keluargaId: keluargaUmatRecords[2].id
    },
    
    // Leo Gunawan's children
    {
      jenisTanggungan: JenisTanggungan.ANAK,
      nama: 'Samuel Gunawan',
      tanggalLahir: new Date('2012-03-15'),
      pendidikanTerakhir: 'SD',
      agama: Agama.KATOLIK,
      tanggalBaptis: new Date('2012-05-06'),
      tanggalKrisma: null,
      statusPernikahan: StatusPernikahan.TIDAK_MENIKAH,
      keluargaId: keluargaUmatRecords[3].id
    },
    {
      jenisTanggungan: JenisTanggungan.ANAK,
      nama: 'Celine Gunawan',
      tanggalLahir: new Date('2015-10-08'),
      pendidikanTerakhir: 'TK',
      agama: Agama.KATOLIK,
      tanggalBaptis: new Date('2015-12-24'),
      tanggalKrisma: null,
      statusPernikahan: StatusPernikahan.TIDAK_MENIKAH,
      keluargaId: keluargaUmatRecords[3].id
    }
  ];

  // Create tanggungan records
  for (const tanggungan of tanggunganData) {
    await prisma.tanggungan.create({
      data: tanggungan,
    });
  }

  // Create user accounts for each keluarga umat (role UMAT)
  for (const keluarga of keluargaUmatRecords) {
    const username = keluarga.namaKepalaKeluarga.toLowerCase().replace(/\s+/g, '');
    await prisma.user.upsert({
      where: { username },
      update: {},
      create: {
        username,
        password: password,
        passphrase: 'pengurus123',
        role: Role.UMAT,
        keluargaId: keluarga.id
      },
    });
  }

} 