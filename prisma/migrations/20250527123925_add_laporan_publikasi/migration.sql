/*
  Warnings:

  - You are about to drop the `Laporan` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Laporan" DROP CONSTRAINT "Laporan_publikasiId_fkey";

-- DropTable
DROP TABLE "Laporan";

-- CreateTable
CREATE TABLE "LaporanPublikasi" (
    "id" TEXT NOT NULL,
    "jenis" TEXT NOT NULL,
    "keterangan" TEXT NOT NULL,
    "publikasiId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LaporanPublikasi_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "LaporanPublikasi" ADD CONSTRAINT "LaporanPublikasi_publikasiId_fkey" FOREIGN KEY ("publikasiId") REFERENCES "Publikasi"("id") ON DELETE CASCADE ON UPDATE CASCADE;
