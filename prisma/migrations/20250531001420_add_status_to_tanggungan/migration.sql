-- AlterTable
ALTER TABLE "DanaMandiri" ADD COLUMN     "periodeBayar" INTEGER,
ADD COLUMN     "statusPembayaran" TEXT,
ADD COLUMN     "totalIuran" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Tanggungan" ADD COLUMN     "status" "StatusKehidupan" NOT NULL DEFAULT 'HIDUP',
ADD COLUMN     "tanggalMeninggal" TIMESTAMP(3);
