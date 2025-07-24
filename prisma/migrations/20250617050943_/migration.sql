-- CreateEnum
CREATE TYPE "StatusKegiatan" AS ENUM ('BELUM_SELESAI', 'SELESAI', 'DIBATALKAN');

-- AlterTable
ALTER TABLE "DoaLingkungan" ADD COLUMN     "statusKegiatan" "StatusKegiatan" NOT NULL DEFAULT 'BELUM_SELESAI';
