-- CreateTable
CREATE TABLE "SaldoAwalIkata" (
    "id" TEXT NOT NULL,
    "tahun" INTEGER NOT NULL,
    "bulan" INTEGER NOT NULL,
    "saldoAwal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "keterangan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "SaldoAwalIkata_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SaldoAwalIkata_tahun_bulan_key" ON "SaldoAwalIkata"("tahun", "bulan");
