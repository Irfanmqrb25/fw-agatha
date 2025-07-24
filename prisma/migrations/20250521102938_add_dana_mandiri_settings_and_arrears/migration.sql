-- CreateTable
CREATE TABLE "DanaMandiriSetting" (
    "id" TEXT NOT NULL,
    "tahun" INTEGER NOT NULL,
    "jumlahIuran" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DanaMandiriSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DanaMandiriArrears" (
    "id" TEXT NOT NULL,
    "keluargaId" TEXT NOT NULL,
    "namaKepalaKeluarga" TEXT NOT NULL,
    "alamat" TEXT,
    "nomorTelepon" TEXT,
    "tahunTertunggak" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "totalTunggakan" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DanaMandiriArrears_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DanaMandiriSetting_tahun_key" ON "DanaMandiriSetting"("tahun");

-- CreateIndex
CREATE UNIQUE INDEX "DanaMandiriArrears_keluargaId_key" ON "DanaMandiriArrears"("keluargaId");
