"use server";

import { prisma } from "@/lib/db";
import { DanaMandiriFormValues } from "../types";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Fungsi untuk mendapatkan data Dana Mandiri berdasarkan keluargaId
export async function getDanaMandiriByKeluargaId(keluargaId: string) {
  try {
    const danaMandiri = await prisma.danaMandiri.findMany({
      where: {
        keluargaId,
      },
      orderBy: {
        tahun: "desc",
      },
      include: {
        keluarga: {
          select: {
            namaKepalaKeluarga: true,
          },
        },
      },
    });

    return danaMandiri.map((item) => ({
      ...item,
      namaKepalaKeluarga: item.keluarga.namaKepalaKeluarga,
    }));
  } catch (error) {
    console.error("Error loading Dana Mandiri data:", error);
    throw new Error("Gagal memuat data Dana Mandiri");
  }
}

// Fungsi untuk mendapatkan semua data Dana Mandiri (untuk SuperUser)
export async function getAllDanaMandiri() {
  try {
    const danaMandiri = await prisma.danaMandiri.findMany({
      orderBy: [
        {
          tahun: "desc",
        },
        {
          bulan: "desc",
        },
      ],
      include: {
        keluarga: {
          select: {
            namaKepalaKeluarga: true,
          },
        },
      },
    });

    return danaMandiri.map((item) => ({
      ...item,
      namaKepalaKeluarga: item.keluarga.namaKepalaKeluarga,
    }));
  } catch (error) {
    console.error("Error loading Dana Mandiri data:", error);
    throw new Error("Gagal memuat data Dana Mandiri");
  }
}

// Fungsi untuk menambah data Dana Mandiri baru
export async function createDanaMandiri(data: DanaMandiriFormValues) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      throw new Error("Anda harus login untuk melakukan tindakan ini");
    }

    const newDanaMandiri = await prisma.danaMandiri.create({
      data: {
        keluargaId: data.keluargaId,
        tanggal: data.tanggal,
        jumlahDibayar: data.jumlahDibayar,
        statusSetor: data.statusSetor,
        tanggalSetor: data.tanggalSetor,
        tahun: data.tahun,
        bulan: data.bulan,
      },
    });

    revalidatePath("/histori-pembayaran");
    return { success: true, data: newDanaMandiri };
  } catch (error) {
    console.error("Error creating Dana Mandiri:", error);
    throw new Error("Gagal menyimpan data Dana Mandiri");
  }
}

// Fungsi untuk mengupdate data Dana Mandiri
export async function updateDanaMandiri(id: string, data: Partial<DanaMandiriFormValues>) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      throw new Error("Anda harus login untuk melakukan tindakan ini");
    }

    const updatedDanaMandiri = await prisma.danaMandiri.update({
      where: {
        id,
      },
      data,
    });

    revalidatePath("/histori-pembayaran");
    return { success: true, data: updatedDanaMandiri };
  } catch (error) {
    console.error("Error updating Dana Mandiri:", error);
    throw new Error("Gagal memperbarui data Dana Mandiri");
  }
}

// Fungsi untuk menghapus data Dana Mandiri
export async function deleteDanaMandiri(id: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      throw new Error("Anda harus login untuk melakukan tindakan ini");
    }

    await prisma.danaMandiri.delete({
      where: {
        id,
      },
    });

    revalidatePath("/histori-pembayaran");
    return { success: true };
  } catch (error) {
    console.error("Error deleting Dana Mandiri:", error);
    throw new Error("Gagal menghapus data Dana Mandiri");
  }
}

// Fungsi untuk mendapatkan tahun-tahun yang ada di data Dana Mandiri
export async function getUniqueDanaMandiriYears() {
  try {
    const years = await prisma.danaMandiri.findMany({
      select: {
        tahun: true,
      },
      distinct: ["tahun"],
      orderBy: {
        tahun: "desc",
      },
    });

    return years.map((item) => item.tahun);
  } catch (error) {
    console.error("Error getting unique Dana Mandiri years:", error);
    throw new Error("Gagal mendapatkan data tahun Dana Mandiri");
  }
}

// Fungsi untuk mendapatkan total Dana Mandiri yang sudah disetor
export async function getTotalDanaMandiriByYear(year: number) {
  try {
    // Jika year adalah 0, ambil semua tahun
    const whereClause = year === 0 
      ? { statusSetor: true } 
      : { tahun: year, statusSetor: true };
    
    const result = await prisma.danaMandiri.aggregate({
      where: whereClause,
      _sum: {
        jumlahDibayar: true,
      },
      _count: true,
    });

    return {
      total: result._sum?.jumlahDibayar || 0,
      count: result._count,
    };
  } catch (error) {
    console.error("Error getting Dana Mandiri total:", error);
    throw new Error("Gagal mendapatkan total Dana Mandiri");
  }
} 