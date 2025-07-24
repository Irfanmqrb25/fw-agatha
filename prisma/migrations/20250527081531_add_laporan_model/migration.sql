-- CreateTable
CREATE TABLE "Laporan" (
    "id" TEXT NOT NULL,
    "jenis" TEXT NOT NULL,
    "keterangan" TEXT NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publikasiId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Laporan_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Laporan" ADD CONSTRAINT "Laporan_publikasiId_fkey" FOREIGN KEY ("publikasiId") REFERENCES "Publikasi"("id") ON DELETE CASCADE ON UPDATE CASCADE;
