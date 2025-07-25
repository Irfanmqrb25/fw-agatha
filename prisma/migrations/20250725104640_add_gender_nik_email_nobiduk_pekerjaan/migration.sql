/*
  Warnings:

  - A unique constraint covering the columns `[nik]` on the table `KeluargaUmat` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `KeluargaUmat` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[noBiduk]` on the table `KeluargaUmat` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[nik]` on the table `Pasangan` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `Pasangan` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "KeluargaUmat" ADD COLUMN     "email" TEXT,
ADD COLUMN     "jenisKelamin" TEXT,
ADD COLUMN     "nik" TEXT,
ADD COLUMN     "noBiduk" TEXT,
ADD COLUMN     "pekerjaan" TEXT;

-- AlterTable
ALTER TABLE "Pasangan" ADD COLUMN     "email" TEXT,
ADD COLUMN     "jenisKelamin" TEXT,
ADD COLUMN     "kotaDomisili" TEXT,
ADD COLUMN     "nik" TEXT,
ADD COLUMN     "pekerjaan" TEXT;

-- AlterTable
ALTER TABLE "Tanggungan" ADD COLUMN     "jenisKelamin" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "KeluargaUmat_nik_key" ON "KeluargaUmat"("nik");

-- CreateIndex
CREATE UNIQUE INDEX "KeluargaUmat_email_key" ON "KeluargaUmat"("email");

-- CreateIndex
CREATE UNIQUE INDEX "KeluargaUmat_noBiduk_key" ON "KeluargaUmat"("noBiduk");

-- CreateIndex
CREATE UNIQUE INDEX "Pasangan_nik_key" ON "Pasangan"("nik");

-- CreateIndex
CREATE UNIQUE INDEX "Pasangan_email_key" ON "Pasangan"("email");
