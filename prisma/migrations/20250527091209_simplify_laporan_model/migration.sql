/*
  Warnings:

  - You are about to drop the column `judul` on the `Laporan` table. All the data in the column will be lost.
  - You are about to drop the column `lampiran` on the `Laporan` table. All the data in the column will be lost.
  - You are about to drop the column `tanggal` on the `Laporan` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Laporan" DROP COLUMN "judul",
DROP COLUMN "lampiran",
DROP COLUMN "tanggal";
