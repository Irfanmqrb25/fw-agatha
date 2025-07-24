-- AlterTable
ALTER TABLE "IuranIkata" ALTER COLUMN "totalIuran" SET DEFAULT 0;

-- CreateTable
CREATE TABLE "IkataSetting" (
    "id" TEXT NOT NULL,
    "tahun" INTEGER NOT NULL,
    "jumlahIuran" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IkataSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IkataArrears" (
    "id" TEXT NOT NULL,
    "keluargaId" TEXT NOT NULL,
    "namaKepalaKeluarga" TEXT NOT NULL,
    "alamat" TEXT,
    "nomorTelepon" TEXT,
    "tahunTertunggak" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "totalTunggakan" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IkataArrears_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "IkataSetting_tahun_key" ON "IkataSetting"("tahun");

-- CreateIndex
CREATE UNIQUE INDEX "IkataArrears_keluargaId_key" ON "IkataArrears"("keluargaId");
