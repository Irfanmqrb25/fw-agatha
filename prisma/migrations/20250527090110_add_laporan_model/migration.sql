-- AlterTable
ALTER TABLE "Laporan" ADD COLUMN     "judul" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "lampiran" TEXT,
ALTER COLUMN "jenis" SET DEFAULT 'lainnya',
ALTER COLUMN "keterangan" SET DEFAULT '';
