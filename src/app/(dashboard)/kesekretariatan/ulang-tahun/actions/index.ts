import { prisma } from "@/lib/db";
import {
  differenceInDays,
  differenceInMonths,
  differenceInYears,
} from "date-fns";

export async function getBirthdays(month?: number) {
  const now = new Date();
  const targetMonth = typeof month === "number" ? month : now.getMonth() + 1;

  // Ambil semua data
  const [keluarga, pasangan, tanggungan] = await Promise.all([
    prisma.keluargaUmat.findMany({
      where: {
        tanggalKeluar: null, // Hanya ambil keluarga yang masih aktif
      },
    }),
    prisma.pasangan.findMany({
      include: { keluarga: true },
    }),
    prisma.tanggungan.findMany({
      include: { keluarga: true },
    }),
  ]);

  // Gabungkan dan filter berdasarkan bulan
  const result = [
    ...keluarga.map((k) => ({
      nama: k.namaKepalaKeluarga,
      kepalaKeluarga: k.namaKepalaKeluarga,
      tanggalLahir: k.tanggalLahir!,
    })),
    ...pasangan.map((p) => ({
      nama: p.nama,
      kepalaKeluarga: p.keluarga?.namaKepalaKeluarga ?? "Tidak diketahui",
      tanggalLahir: p.tanggalLahir,
    })),
    ...tanggungan.map((t) => ({
      nama: t.nama,
      kepalaKeluarga: t.keluarga?.namaKepalaKeluarga ?? "Tidak diketahui",
      tanggalLahir: t.tanggalLahir,
    })),
  ].filter((item) => {
    const birth = new Date(item.tanggalLahir);
    return birth.getMonth() + 1 === targetMonth;
  });

  return result.map((item) => {
    const birth = new Date(item.tanggalLahir);
    const usiaHari = differenceInDays(now, birth);
    const usiaBulan = differenceInMonths(now, birth);
    const usiaTahun = differenceInYears(now, birth);

    let usia: string;
    if (usiaBulan < 1) {
      usia = `${usiaHari} hari`;
    } else if (usiaBulan < 12) {
      usia = `${usiaBulan} bulan`;
    } else {
      usia = `${usiaTahun} tahun`;
    }

    return {
      ...item,
      usia,
    };
  });
}
