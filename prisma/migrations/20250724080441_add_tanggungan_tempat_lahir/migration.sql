/*
  Warnings:

  - Added the required column `tempatLahir` to the `Tanggungan` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "StatusKehidupan" ADD VALUE 'PINDAH';

-- AlterTable
ALTER TABLE "Tanggungan" ADD COLUMN     "tempatLahir" TEXT NOT NULL;
