-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SUPER_USER', 'KETUA', 'WAKIL_KETUA', 'BENDAHARA', 'WAKIL_BENDAHARA', 'SEKRETARIS', 'WAKIL_SEKRETARIS', 'UMAT');

-- CreateEnum
CREATE TYPE "StatusKehidupan" AS ENUM ('HIDUP', 'MENINGGAL');

-- CreateEnum
CREATE TYPE "StatusPernikahan" AS ENUM ('MENIKAH', 'TIDAK_MENIKAH');

-- CreateEnum
CREATE TYPE "JenisTanggungan" AS ENUM ('ANAK', 'KERABAT');

-- CreateEnum
CREATE TYPE "Agama" AS ENUM ('KATOLIK', 'ISLAM', 'KRISTEN', 'HINDU', 'BUDHA');

-- CreateEnum
CREATE TYPE "JenisTransaksi" AS ENUM ('UANG_MASUK', 'UANG_KELUAR');

-- CreateEnum
CREATE TYPE "TipeTransaksiLingkungan" AS ENUM ('KOLEKTE_I', 'KOLEKTE_II', 'SUMBANGAN_UMAT', 'PENERIMAAN_LAIN', 'BIAYA_OPERASIONAL', 'PENYELENGGARAAN_KEGIATAN', 'PEMBELIAN', 'SOSIAL_DUKA', 'TRANSFER_DANA_KE_IKATA', 'LAIN_LAIN');

-- CreateEnum
CREATE TYPE "TipeTransaksiIkata" AS ENUM ('IURAN_ANGGOTA', 'TRANSFER_DANA_DARI_LINGKUNGAN', 'SUMBANGAN_ANGGOTA', 'PENERIMAAN_LAIN', 'UANG_DUKA_PAPAN_BUNGA', 'KUNJUNGAN_KASIH', 'CINDERAMATA_KELAHIRAN', 'CINDERAMATA_PERNIKAHAN', 'UANG_AKOMODASI', 'PEMBELIAN', 'LAIN_LAIN');

-- CreateEnum
CREATE TYPE "StatusIuran" AS ENUM ('LUNAS', 'SEBAGIAN_BULAN', 'BELUM_BAYAR');

-- CreateEnum
CREATE TYPE "JenisIbadat" AS ENUM ('DOA_LINGKUNGAN', 'MISA', 'PERTEMUAN', 'BAKTI_SOSIAL', 'KEGIATAN_LAIN');

-- CreateEnum
CREATE TYPE "SubIbadat" AS ENUM ('IBADAT_SABDA', 'IBADAT_SABDA_TEMATIK', 'PRAPASKAH', 'BKSN', 'BULAN_ROSARIO', 'NOVENA_NATAL', 'MISA_SYUKUR', 'MISA_REQUEM', 'MISA_ARWAH', 'MISA_PELINDUNG');

-- CreateEnum
CREATE TYPE "StatusApproval" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "TujuanPengajuan" AS ENUM ('DPL', 'STASI', 'PAROKI');

-- CreateEnum
CREATE TYPE "StatusPengajuan" AS ENUM ('OPEN', 'CLOSED');

-- CreateEnum
CREATE TYPE "TindakLanjut" AS ENUM ('DIPROSES_DI_LINGKUNGAN', 'DIPROSES_DI_STASI', 'DIPROSES_DI_PAROKI', 'DITOLAK');

-- CreateEnum
CREATE TYPE "UpdateStatus" AS ENUM ('DITERUSKAN_KE_PAROKI', 'SELESAI', 'DITOLAK');

-- CreateEnum
CREATE TYPE "HasilAkhir" AS ENUM ('SELESAI', 'DITOLAK');

-- CreateEnum
CREATE TYPE "KlasifikasiPublikasi" AS ENUM ('PENTING', 'UMUM', 'RAHASIA', 'SEGERA');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "passphrase" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'UMAT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "keluargaId" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KeluargaUmat" (
    "id" TEXT NOT NULL,
    "namaKepalaKeluarga" TEXT NOT NULL,
    "tanggalBergabung" TIMESTAMP(3) NOT NULL,
    "tanggalKeluar" TIMESTAMP(3),
    "alamat" TEXT NOT NULL,
    "jumlahAnakTertanggung" INTEGER NOT NULL,
    "jumlahKerabatTertanggung" INTEGER NOT NULL,
    "jumlahAnggotaKeluarga" INTEGER NOT NULL,
    "tempatLahir" TEXT,
    "tanggalLahir" TIMESTAMP(3),
    "nomorTelepon" TEXT,
    "status" "StatusKehidupan" NOT NULL DEFAULT 'HIDUP',
    "kotaDomisili" TEXT,
    "pendidikanTerakhir" TEXT,
    "tanggalBaptis" TIMESTAMP(3),
    "tanggalKrisma" TIMESTAMP(3),
    "tanggalMeninggal" TIMESTAMP(3),
    "statusPernikahan" "StatusPernikahan" NOT NULL DEFAULT 'TIDAK_MENIKAH',

    CONSTRAINT "KeluargaUmat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pasangan" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "tempatLahir" TEXT NOT NULL,
    "tanggalLahir" TIMESTAMP(3) NOT NULL,
    "nomorTelepon" TEXT,
    "pendidikanTerakhir" TEXT NOT NULL,
    "agama" "Agama" NOT NULL,
    "noBiduk" TEXT,
    "tanggalBaptis" TIMESTAMP(3),
    "tanggalKrisma" TIMESTAMP(3),
    "status" "StatusKehidupan" NOT NULL DEFAULT 'HIDUP',
    "tanggalMeninggal" TIMESTAMP(3),
    "keluargaId" TEXT NOT NULL,

    CONSTRAINT "Pasangan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tanggungan" (
    "id" TEXT NOT NULL,
    "jenisTanggungan" "JenisTanggungan" NOT NULL,
    "nama" TEXT NOT NULL,
    "tanggalLahir" TIMESTAMP(3) NOT NULL,
    "pendidikanTerakhir" TEXT NOT NULL,
    "agama" "Agama" NOT NULL,
    "tanggalBaptis" TIMESTAMP(3),
    "tanggalKrisma" TIMESTAMP(3),
    "statusPernikahan" "StatusPernikahan" NOT NULL DEFAULT 'TIDAK_MENIKAH',
    "keluargaId" TEXT NOT NULL,

    CONSTRAINT "Tanggungan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KasLingkungan" (
    "id" TEXT NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "jenisTranasksi" "JenisTransaksi" NOT NULL,
    "tipeTransaksi" "TipeTransaksiLingkungan" NOT NULL,
    "keterangan" TEXT,
    "debit" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "kredit" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "keluargaId" TEXT,

    CONSTRAINT "KasLingkungan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DanaMandiri" (
    "id" TEXT NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "keluargaId" TEXT NOT NULL,
    "jumlahDibayar" DOUBLE PRECISION NOT NULL,
    "statusSetor" BOOLEAN NOT NULL DEFAULT false,
    "tanggalSetor" TIMESTAMP(3),
    "tahun" INTEGER NOT NULL,
    "bulan" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DanaMandiri_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KasIkata" (
    "id" TEXT NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "jenisTranasksi" "JenisTransaksi" NOT NULL,
    "tipeTransaksi" "TipeTransaksiIkata" NOT NULL,
    "keterangan" TEXT,
    "debit" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "kredit" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KasIkata_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IuranIkata" (
    "id" TEXT NOT NULL,
    "keluargaId" TEXT NOT NULL,
    "status" "StatusIuran" NOT NULL,
    "bulanAwal" INTEGER,
    "bulanAkhir" INTEGER,
    "tahun" INTEGER NOT NULL,
    "jumlahDibayar" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IuranIkata_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DoaLingkungan" (
    "id" TEXT NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "jenisIbadat" "JenisIbadat" NOT NULL,
    "subIbadat" "SubIbadat",
    "temaIbadat" TEXT,
    "tuanRumahId" TEXT NOT NULL,
    "jumlahKKHadir" INTEGER NOT NULL DEFAULT 0,
    "bapak" INTEGER NOT NULL DEFAULT 0,
    "ibu" INTEGER NOT NULL DEFAULT 0,
    "omk" INTEGER NOT NULL DEFAULT 0,
    "bir" INTEGER NOT NULL DEFAULT 0,
    "biaBawah" INTEGER NOT NULL DEFAULT 0,
    "biaAtas" INTEGER NOT NULL DEFAULT 0,
    "kolekteI" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "kolekteII" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ucapanSyukur" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "pemimpinIbadat" TEXT,
    "pemimpinRosario" TEXT,
    "pembawaRenungan" TEXT,
    "pembawaLagu" TEXT,
    "doaUmat" TEXT,
    "pemimpinMisa" TEXT,
    "bacaanI" TEXT,
    "pemazmur" TEXT,
    "jumlahPeserta" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DoaLingkungan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AbsensiDoling" (
    "id" TEXT NOT NULL,
    "doaLingkunganId" TEXT NOT NULL,
    "keluargaId" TEXT NOT NULL,
    "hadir" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AbsensiDoling_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Approval" (
    "id" TEXT NOT NULL,
    "kasLingkunganId" TEXT,
    "doaLingkunganId" TEXT,
    "status" "StatusApproval" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Approval_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pengajuan" (
    "id" TEXT NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "perihal" TEXT NOT NULL,
    "tujuan" "TujuanPengajuan" NOT NULL,
    "status" "StatusPengajuan" NOT NULL DEFAULT 'OPEN',
    "tindakLanjut" "TindakLanjut",
    "updateStatus" "UpdateStatus",
    "hasilAkhir" "HasilAkhir",
    "alasanPenolakan" TEXT,
    "pengajuId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pengajuan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Publikasi" (
    "id" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "isi" TEXT NOT NULL,
    "lampiran" TEXT[],
    "klasifikasi" "KlasifikasiPublikasi" NOT NULL,
    "deadline" TIMESTAMP(3),
    "targetPenerima" "Role"[],
    "pembuatId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Publikasi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "pesan" TEXT NOT NULL,
    "dibaca" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "KeluargaUmat_namaKepalaKeluarga_key" ON "KeluargaUmat"("namaKepalaKeluarga");

-- CreateIndex
CREATE UNIQUE INDEX "Pasangan_keluargaId_key" ON "Pasangan"("keluargaId");

-- CreateIndex
CREATE UNIQUE INDEX "Approval_kasLingkunganId_key" ON "Approval"("kasLingkunganId");

-- CreateIndex
CREATE UNIQUE INDEX "Approval_doaLingkunganId_key" ON "Approval"("doaLingkunganId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_keluargaId_fkey" FOREIGN KEY ("keluargaId") REFERENCES "KeluargaUmat"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pasangan" ADD CONSTRAINT "Pasangan_keluargaId_fkey" FOREIGN KEY ("keluargaId") REFERENCES "KeluargaUmat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tanggungan" ADD CONSTRAINT "Tanggungan_keluargaId_fkey" FOREIGN KEY ("keluargaId") REFERENCES "KeluargaUmat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KasLingkungan" ADD CONSTRAINT "KasLingkungan_keluargaId_fkey" FOREIGN KEY ("keluargaId") REFERENCES "KeluargaUmat"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DanaMandiri" ADD CONSTRAINT "DanaMandiri_keluargaId_fkey" FOREIGN KEY ("keluargaId") REFERENCES "KeluargaUmat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IuranIkata" ADD CONSTRAINT "IuranIkata_keluargaId_fkey" FOREIGN KEY ("keluargaId") REFERENCES "KeluargaUmat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DoaLingkungan" ADD CONSTRAINT "DoaLingkungan_tuanRumahId_fkey" FOREIGN KEY ("tuanRumahId") REFERENCES "KeluargaUmat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AbsensiDoling" ADD CONSTRAINT "AbsensiDoling_doaLingkunganId_fkey" FOREIGN KEY ("doaLingkunganId") REFERENCES "DoaLingkungan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AbsensiDoling" ADD CONSTRAINT "AbsensiDoling_keluargaId_fkey" FOREIGN KEY ("keluargaId") REFERENCES "KeluargaUmat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Approval" ADD CONSTRAINT "Approval_kasLingkunganId_fkey" FOREIGN KEY ("kasLingkunganId") REFERENCES "KasLingkungan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Approval" ADD CONSTRAINT "Approval_doaLingkunganId_fkey" FOREIGN KEY ("doaLingkunganId") REFERENCES "DoaLingkungan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pengajuan" ADD CONSTRAINT "Pengajuan_pengajuId_fkey" FOREIGN KEY ("pengajuId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Publikasi" ADD CONSTRAINT "Publikasi_pembuatId_fkey" FOREIGN KEY ("pembuatId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
