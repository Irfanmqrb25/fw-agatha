"use server";

import { prisma } from "@/lib/db";
import { IkataFormValues } from "../types";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Fungsi untuk mendapatkan data IKATA berdasarkan keluargaId
export async function getIkataByKeluargaId(keluargaId: string) {
  try {
    const ikata = await prisma.iuranIkata.findMany({
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

    return ikata.map((item) => ({
      ...item,
      namaKepalaKeluarga: item.keluarga.namaKepalaKeluarga,
    }));
  } catch (error) {
    console.error("Error loading IKATA data:", error);
    throw new Error("Gagal memuat data IKATA");
  }
}

// Fungsi untuk mendapatkan semua data IKATA (untuk SuperUser)
export async function getAllIkata() {
  try {
    const ikata = await prisma.iuranIkata.findMany({
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

    return ikata.map((item) => ({
      ...item,
      namaKepalaKeluarga: item.keluarga.namaKepalaKeluarga,
    }));
  } catch (error) {
    console.error("Error loading IKATA data:", error);
    throw new Error("Gagal memuat data IKATA");
  }
}

// Fungsi untuk menambah data IKATA baru
export async function createIkata(data: IkataFormValues) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      throw new Error("Anda harus login untuk melakukan tindakan ini");
    }

    // Pastikan bulan diatur dengan benar berdasarkan status
    let createData = { ...data };
    
    if (data.status === "LUNAS") {
      createData.bulanAwal = 1;
      createData.bulanAkhir = 12;
    } else if (data.status === "BELUM_BAYAR") {
      createData.bulanAwal = null;
      createData.bulanAkhir = null;
      createData.jumlahDibayar = 0;
    } else if (data.status === "SEBAGIAN_BULAN") {
      // Untuk sebagian bulan, pastikan bulanAwal dan bulanAkhir ada nilai
      createData.bulanAwal = data.bulanAwal || 1;
      createData.bulanAkhir = data.bulanAkhir || 1;
    }

    const newIkata = await prisma.iuranIkata.create({
      data: {
        keluargaId: createData.keluargaId,
        status: createData.status,
        bulanAwal: createData.bulanAwal,
        bulanAkhir: createData.bulanAkhir,
        tahun: createData.tahun,
        jumlahDibayar: createData.jumlahDibayar,
      },
    });

    revalidatePath("/histori-pembayaran");
    return { success: true, data: newIkata };
  } catch (error) {
    console.error("Error creating IKATA:", error);
    throw new Error("Gagal menyimpan data IKATA");
  }
}

// Fungsi untuk mengupdate data IKATA
export async function updateIkata(id: string, data: Partial<IkataFormValues>) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      throw new Error("Anda harus login untuk melakukan tindakan ini");
    }

    // Pastikan bulan diatur dengan benar berdasarkan status
    let updateData = { ...data };
    
    if (data.status) {
      if (data.status === "LUNAS") {
        updateData.bulanAwal = 1;
        updateData.bulanAkhir = 12;
      } else if (data.status === "BELUM_BAYAR") {
        updateData.bulanAwal = null;
        updateData.bulanAkhir = null;
        updateData.jumlahDibayar = 0;
      } else if (data.status === "SEBAGIAN_BULAN") {
        // Untuk sebagian bulan, pastikan bulanAwal dan bulanAkhir ada nilai
        updateData.bulanAwal = data.bulanAwal || 1;
        updateData.bulanAkhir = data.bulanAkhir || 1;
      }
    }

    const updatedIkata = await prisma.iuranIkata.update({
      where: {
        id,
      },
      data: updateData,
    });

    revalidatePath("/histori-pembayaran");
    return { success: true, data: updatedIkata };
  } catch (error) {
    console.error("Error updating IKATA:", error);
    throw new Error("Gagal memperbarui data IKATA");
  }
}

// Fungsi untuk menghapus data IKATA
export async function deleteIkata(id: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      throw new Error("Anda harus login untuk melakukan tindakan ini");
    }

    await prisma.iuranIkata.delete({
      where: {
        id,
      },
    });

    revalidatePath("/histori-pembayaran");
    return { success: true };
  } catch (error) {
    console.error("Error deleting IKATA:", error);
    throw new Error("Gagal menghapus data IKATA");
  }
}

// Fungsi untuk mendapatkan tahun-tahun yang ada di data IKATA
export async function getUniqueIkataYears() {
  try {
    const years = await prisma.iuranIkata.findMany({
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
    console.error("Error getting unique IKATA years:", error);
    throw new Error("Gagal mendapatkan data tahun IKATA");
  }
}

// Fungsi untuk mendapatkan total pembayaran IKATA berdasarkan tahun
export async function getTotalIkataByYear(year: number) {
  try {
    // Jika year adalah 0, ambil semua tahun
    const whereClause = year === 0 
      ? { status: "LUNAS" as const } 
      : { tahun: year, status: "LUNAS" as const };
    
    const result = await prisma.iuranIkata.aggregate({
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
    console.error("Error getting IKATA total:", error);
    throw new Error("Gagal mendapatkan total IKATA");
  }
}

// Fungsi untuk mendapatkan data keluarga umat
export async function getKeluargaOptions() {
  try {
    const keluarga = await prisma.keluargaUmat.findMany({
      select: {
        id: true,
        namaKepalaKeluarga: true,
      },
      orderBy: {
        namaKepalaKeluarga: "asc",
      },
    });

    return keluarga;
  } catch (error) {
    console.error("Error loading family data:", error);
    throw new Error("Gagal memuat data keluarga");
  }
}

// Fungsi untuk memperbaiki data IKATA yang memiliki bulan null
export async function fixIkataMonthData() {
  try {
    // Ambil semua data IKATA yang memiliki bulanAwal atau bulanAkhir null
    const ikataWithNullMonths = await prisma.iuranIkata.findMany({
      where: {
        OR: [
          { bulanAwal: null },
          { bulanAkhir: null }
        ]
      }
    });

    // Perbaiki setiap data
    for (const ikata of ikataWithNullMonths) {
      let bulanAwal = ikata.bulanAwal;
      let bulanAkhir = ikata.bulanAkhir;

      // Tentukan bulan berdasarkan status
      if (ikata.status === "LUNAS") {
        bulanAwal = 1;
        bulanAkhir = 12;
      } else if (ikata.status === "SEBAGIAN_BULAN") {
        bulanAwal = bulanAwal || 1; // Default ke Januari jika null
        
        // Untuk bulanAkhir, coba hitung berdasarkan jumlah dibayar
        if (!bulanAkhir) {
          // Asumsi iuran bulanan adalah 10.000 (120.000 / 12)
          const iuranBulanan = 10000;
          const bulanTerbayar = Math.floor(ikata.jumlahDibayar / iuranBulanan);
          bulanAkhir = Math.min(bulanAwal + bulanTerbayar - 1, 12);
          
          // Pastikan minimal 1 bulan
          if (bulanAkhir < bulanAwal) {
            bulanAkhir = bulanAwal;
          }
        }
      } else if (ikata.status === "BELUM_BAYAR") {
        bulanAwal = null;
        bulanAkhir = null;
      }

      // Update data
      await prisma.iuranIkata.update({
        where: { id: ikata.id },
        data: {
          bulanAwal,
          bulanAkhir
        }
      });
    }

    revalidatePath("/histori-pembayaran");
    return { success: true, fixed: ikataWithNullMonths.length };
  } catch (error) {
    console.error("Error fixing IKATA month data:", error);
    throw new Error("Gagal memperbaiki data bulan IKATA");
  }
} 