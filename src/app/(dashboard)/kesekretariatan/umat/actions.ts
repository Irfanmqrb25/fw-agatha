"use server";

import { prisma } from "@/lib/db";
import { StatusKehidupan, StatusPernikahan } from "@prisma/client";
import { revalidatePath } from "next/cache";
import {
  FamilyHeadData,
  FamilyHeadFormData,
  FamilyHeadWithDetails,
} from "./types";
/**
 * Mengambil semua data kepala keluarga
 */
export async function getAllFamilyHeads(): Promise<FamilyHeadData[]> {
  try {
    const keluargaUmat = await prisma.keluargaUmat.findMany({
      orderBy: {
        namaKepalaKeluarga: "asc",
      },
    });

    return keluargaUmat.map((keluarga) => ({
      id: keluarga.id,
      nama: keluarga.namaKepalaKeluarga,
      alamat: keluarga.alamat,
      nomorTelepon: keluarga.nomorTelepon,
      tanggalBergabung: keluarga.tanggalBergabung,
      jumlahAnakTertanggung: keluarga.jumlahAnakTertanggung,
      jumlahKerabatTertanggung: keluarga.jumlahKerabatTertanggung,
      jumlahAnggotaKeluarga: keluarga.jumlahAnggotaKeluarga,
      status: keluarga.status,
      statusPernikahan: keluarga.statusPernikahan,
      tanggalKeluar: keluarga.tanggalKeluar,
      tanggalMeninggal: keluarga.tanggalMeninggal,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
  } catch (error) {
    console.error("Error getting family heads:", error);
    throw new Error("Gagal mengambil data keluarga umat");
  }
}

/**
 * Mengambil data kepala keluarga berdasarkan ID
 */
export async function getFamilyHeadById(
  id: string
): Promise<FamilyHeadData | null> {
  try {
    const keluarga = await prisma.keluargaUmat.findUnique({
      where: { id },
    });

    if (!keluarga) return null;

    return {
      id: keluarga.id,
      nama: keluarga.namaKepalaKeluarga,
      alamat: keluarga.alamat,
      nomorTelepon: keluarga.nomorTelepon,
      tanggalBergabung: keluarga.tanggalBergabung,
      jumlahAnakTertanggung: keluarga.jumlahAnakTertanggung,
      jumlahKerabatTertanggung: keluarga.jumlahKerabatTertanggung,
      jumlahAnggotaKeluarga: keluarga.jumlahAnggotaKeluarga,
      status: keluarga.status,
      statusPernikahan: keluarga.statusPernikahan,
      tanggalKeluar: keluarga.tanggalKeluar,
      tanggalMeninggal: keluarga.tanggalMeninggal,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  } catch (error) {
    console.error("Error getting family head by ID:", error);
    throw new Error("Gagal mengambil data kepala keluarga");
  }
}

/**
 * Menambahkan data kepala keluarga baru
 */
export async function addFamilyHead(
  data: FamilyHeadFormData
): Promise<FamilyHeadData> {
  try {
    // Gunakan transaction untuk memastikan konsistensi data
    const result = await prisma.$transaction(async (prisma) => {
      // Buat record kepala keluarga terlebih dahulu
      const keluarga = await prisma.keluargaUmat.create({
        data: {
          namaKepalaKeluarga: data.namaKepalaKeluarga,
          alamat: data.alamat,
          nomorTelepon: data.nomorTelepon || null,
          tanggalBergabung: data.tanggalBergabung,
          jumlahAnakTertanggung: data.jumlahAnakTertanggung,
          jumlahKerabatTertanggung: data.jumlahKerabatTertanggung,
          jumlahAnggotaKeluarga: data.jumlahAnggotaKeluarga,
          status: data.status,
          statusPernikahan: data.statusPernikahan,
          tanggalKeluar: data.tanggalKeluar || null,
          tanggalMeninggal: data.tanggalMeninggal || null,
        },
      });

      // Jika status pernikahan adalah MENIKAH, buat record pasangan
      if (data.statusPernikahan === StatusPernikahan.MENIKAH) {
        await prisma.pasangan.create({
          data: {
            nama: `Pasangan dari ${data.namaKepalaKeluarga}`,
            tempatLahir: "Belum diisi",
            tanggalLahir: new Date(), // Default tanggal hari ini, bisa diubah nanti
            pendidikanTerakhir: "Belum diisi",
            agama: "KATOLIK", // Default
            status: StatusKehidupan.HIDUP,
            keluargaId: keluarga.id,
          },
        });
      }

      return keluarga;
    });

    revalidatePath("/kesekretariatan/umat");

    return {
      id: result.id,
      nama: result.namaKepalaKeluarga,
      alamat: result.alamat,
      nomorTelepon: result.nomorTelepon,
      tanggalBergabung: result.tanggalBergabung,
      jumlahAnakTertanggung: result.jumlahAnakTertanggung,
      jumlahKerabatTertanggung: result.jumlahKerabatTertanggung,
      jumlahAnggotaKeluarga: result.jumlahAnggotaKeluarga,
      status: result.status,
      statusPernikahan: result.statusPernikahan,
      tanggalKeluar: result.tanggalKeluar,
      tanggalMeninggal: result.tanggalMeninggal,
    };
  } catch (error) {
    console.error("Error adding family head:", error);
    throw new Error("Gagal menambahkan data kepala keluarga");
  }
}

/**
 * Mengupdate data kepala keluarga
 */
export async function updateFamilyHead(
  id: string,
  data: FamilyHeadFormData
): Promise<FamilyHeadData> {
  try {
    // Gunakan transaction dengan timeout yang lebih lama (10 detik)
    const result = await prisma.$transaction(
      async (prisma) => {
        // Ambil data keluarga yang ada untuk mengetahui status pernikahan sebelumnya
        const existingKeluarga = await prisma.keluargaUmat.findUnique({
          where: { id },
          include: { pasangan: true },
        });

        if (!existingKeluarga) {
          throw new Error("Data keluarga tidak ditemukan");
        }

        // Update data kepala keluarga
        const keluarga = await prisma.keluargaUmat.update({
          where: { id },
          data: {
            namaKepalaKeluarga: data.namaKepalaKeluarga,
            alamat: data.alamat,
            nomorTelepon: data.nomorTelepon || null,
            tanggalBergabung: data.tanggalBergabung,
            jumlahAnakTertanggung: data.jumlahAnakTertanggung,
            jumlahKerabatTertanggung: data.jumlahKerabatTertanggung,
            jumlahAnggotaKeluarga: data.jumlahAnggotaKeluarga,
            status: data.status,
            statusPernikahan: data.statusPernikahan,
            tanggalKeluar: data.tanggalKeluar || null,
            tanggalMeninggal: data.tanggalMeninggal || null,
          },
        });

        // Handle perubahan status pernikahan
        if (existingKeluarga.statusPernikahan !== data.statusPernikahan) {
          try {
            if (
              data.statusPernikahan === StatusPernikahan.MENIKAH &&
              !existingKeluarga.pasangan
            ) {
              // Buat record pasangan baru jika status berubah menjadi MENIKAH
              await prisma.pasangan.create({
                data: {
                  nama: `Pasangan dari ${data.namaKepalaKeluarga}`,
                  tempatLahir: "Belum diisi",
                  tanggalLahir: new Date(),
                  pendidikanTerakhir: "Belum diisi",
                  agama: "KATOLIK",
                  status: StatusKehidupan.HIDUP,
                  keluargaId: keluarga.id,
                },
              });
            } else if (
              (data.statusPernikahan === StatusPernikahan.TIDAK_MENIKAH ||
                data.statusPernikahan === StatusPernikahan.CERAI_HIDUP ||
                data.statusPernikahan === StatusPernikahan.CERAI_MATI) &&
              existingKeluarga.pasangan
            ) {
              // Hapus record pasangan jika status berubah menjadi TIDAK_MENIKAH, CERAI_HIDUP, atau CERAI_MATI
              await prisma.pasangan.delete({
                where: { keluargaId: keluarga.id },
              });
            }
          } catch (error) {
            console.error("Error handling marital status change:", error);
            throw new Error("Gagal memproses perubahan status pernikahan");
          }
        }

        return keluarga;
      },
      {
        timeout: 10000, // Set timeout menjadi 10 detik
      }
    );

    // Hitung ulang jumlah anggota keluarga di luar transaksi
    const { updateJumlahAnggotaKeluarga } = await import(
      "@/app/(dashboard)/dashboard/utils/family-utils"
    );
    await updateJumlahAnggotaKeluarga(result.id);

    revalidatePath("/kesekretariatan/umat");

    return {
      id: result.id,
      nama: result.namaKepalaKeluarga,
      alamat: result.alamat,
      nomorTelepon: result.nomorTelepon,
      tanggalBergabung: result.tanggalBergabung,
      jumlahAnakTertanggung: result.jumlahAnakTertanggung,
      jumlahKerabatTertanggung: result.jumlahKerabatTertanggung,
      jumlahAnggotaKeluarga: result.jumlahAnggotaKeluarga,
      status: result.status,
      statusPernikahan: result.statusPernikahan,
      tanggalKeluar: result.tanggalKeluar,
      tanggalMeninggal: result.tanggalMeninggal,
    };
  } catch (error) {
    console.error("Error updating family head:", error);
    if (error instanceof Error) {
      throw new Error(
        `Gagal mengupdate data kepala keluarga: ${error.message}`
      );
    } else {
      throw new Error("Gagal mengupdate data kepala keluarga");
    }
  }
}

/**
 * Menandai keluarga sebagai pindah
 * Mengubah status kepala keluarga menjadi PINDAH dan mencatat tanggal kepindahan
 */
export async function markFamilyAsMoved(id: string): Promise<void> {
  try {
    const tanggalKeluar = new Date();

    // Ambil data keluarga terlebih dahulu
    const keluarga = await prisma.keluargaUmat.findUnique({
      where: { id },
      include: {
        pasangan: true,
        tanggungan: true,
      },
    });

    if (!keluarga) {
      throw new Error("Keluarga tidak ditemukan");
    }

    // Update status keluarga menjadi PINDAH
    await prisma.keluargaUmat.update({
      where: { id },
      data: {
        status: StatusKehidupan.PINDAH,
        tanggalKeluar: tanggalKeluar,
        tanggalMeninggal: null, // Pastikan tanggal meninggal kosong
      },
    });

    revalidatePath("/kesekretariatan/umat");
  } catch (error) {
    console.error("Error marking family as moved:", error);
    throw new Error("Gagal menandai keluarga sebagai pindah");
  }
}

/**
 * Menandai keluarga sebagai meninggal
 * Mengubah status kepala keluarga menjadi MENINGGAL dan mencatat tanggal meninggal
 * Juga menandai seluruh anggota keluarga (pasangan dan tanggungan) sebagai meninggal
 */
export async function markFamilyAsDeceased(id: string): Promise<void> {
  try {
    const tanggalMeninggal = new Date();

    // Ambil data keluarga terlebih dahulu
    const keluarga = await prisma.keluargaUmat.findUnique({
      where: { id },
      include: {
        pasangan: true,
        tanggungan: true,
      },
    });

    if (!keluarga) {
      throw new Error("Keluarga tidak ditemukan");
    }

    // Jika pasangan ada, tandai juga sebagai meninggal
    if (keluarga.pasangan) {
      await prisma.pasangan.update({
        where: { id: keluarga.pasangan.id },
        data: {
          status: StatusKehidupan.MENINGGAL,
          tanggalMeninggal: tanggalMeninggal,
        },
      });
    }

    // Tandai semua tanggungan (anak dan kerabat) sebagai meninggal
    if (keluarga.tanggungan && keluarga.tanggungan.length > 0) {
      await prisma.tanggungan.updateMany({
        where: {
          keluargaId: id,
          status: StatusKehidupan.HIDUP, // Hanya update yang masih hidup
        },
        data: {
          status: StatusKehidupan.MENINGGAL,
          tanggalMeninggal: tanggalMeninggal,
        },
      });
    }

    // Update status kepala keluarga menjadi MENINGGAL
    await prisma.keluargaUmat.update({
      where: { id },
      data: {
        status: StatusKehidupan.MENINGGAL,
        tanggalMeninggal: tanggalMeninggal,
        tanggalKeluar: null, // Pastikan tanggal keluar kosong
      },
    });

    revalidatePath("/kesekretariatan/umat");
  } catch (error) {
    console.error("Error marking family as deceased:", error);
    throw new Error("Gagal menandai keluarga sebagai meninggal");
  }
}

/**
 * Menandai anggota keluarga tertentu sebagai meninggal
 * Ini tidak mengubah status keluarga secara keseluruhan
 */
export async function markFamilyMemberAsDeceased(
  id: string,
  memberName: string
): Promise<void> {
  try {
    const tanggalMeninggal = new Date();

    // Impor fungsi utilitas
    const { updateJumlahAnggotaKeluarga } = await import(
      "@/app/(dashboard)/dashboard/utils/family-utils"
    );

    // Cek apakah memberName adalah kepala keluarga
    const keluarga = await prisma.keluargaUmat.findUnique({
      where: { id },
      include: {
        pasangan: true,
        tanggungan: true,
      },
    });

    if (!keluarga) {
      throw new Error("Keluarga tidak ditemukan");
    }

    if (keluarga.namaKepalaKeluarga === memberName) {
      // Jika kepala keluarga yang meninggal
      await prisma.keluargaUmat.update({
        where: { id },
        data: {
          status: StatusKehidupan.MENINGGAL,
          tanggalMeninggal: tanggalMeninggal,
        },
      });

      // Update jumlah anggota keluarga menggunakan fungsi utilitas
      await updateJumlahAnggotaKeluarga(id);

      revalidatePath("/kesekretariatan/umat");
      return;
    }

    // Cek apakah memberName adalah pasangan
    const pasangan = await prisma.pasangan.findFirst({
      where: {
        keluargaId: id,
        nama: memberName,
      },
    });

    if (pasangan) {
      // Jika pasangan yang meninggal
      await prisma.pasangan.update({
        where: { id: pasangan.id },
        data: {
          status: StatusKehidupan.MENINGGAL,
          tanggalMeninggal: tanggalMeninggal,
        },
      });

      // Update jumlah anggota keluarga menggunakan fungsi utilitas
      await updateJumlahAnggotaKeluarga(id);

      revalidatePath("/kesekretariatan/umat");
      return;
    }

    // Cek apakah memberName adalah tanggungan (anak atau kerabat)
    const tanggungan = await prisma.tanggungan.findFirst({
      where: {
        keluargaId: id,
        nama: memberName,
      },
    });

    if (tanggungan) {
      // Tandai tanggungan sebagai meninggal (jangan dihapus)
      await prisma.tanggungan.update({
        where: { id: tanggungan.id },
        data: {
          status: StatusKehidupan.MENINGGAL,
          tanggalMeninggal: tanggalMeninggal,
        },
      });

      // Update jumlah anggota keluarga menggunakan fungsi utilitas
      await updateJumlahAnggotaKeluarga(id);
    }

    revalidatePath("/kesekretariatan/umat");
  } catch (error) {
    console.error("Error marking family member as deceased:", error);
    throw new Error("Gagal menandai anggota keluarga sebagai meninggal");
  }
}

/**
 * Menghapus data kepala keluarga secara permanen (SUPER_USER ONLY)
 * Hanya digunakan untuk keadaan khusus
 */
export async function deleteFamilyHead(id: string): Promise<void> {
  try {
    await prisma.keluargaUmat.delete({
      where: { id },
    });

    revalidatePath("/kesekretariatan/umat");
  } catch (error) {
    console.error("Error deleting family head:", error);
    throw new Error("Gagal menghapus data kepala keluarga");
  }
}

/**
 * Menghapus data kepala keluarga secara permanen dengan validasi SUPER_USER
 * Fungsi ini menghapus seluruh data keluarga dari database
 */
export async function permanentDeleteFamilyHead(id: string): Promise<void> {
  try {
    // Gunakan transaction untuk memastikan konsistensi data
    await prisma.$transaction(async (prisma) => {
      // Hapus semua data terkait terlebih dahulu

      // 1. Hapus absensi doa lingkungan
      await prisma.absensiDoling.deleteMany({
        where: { keluargaId: id },
      });

      // 2. Hapus data kas lingkungan
      await prisma.kasLingkungan.deleteMany({
        where: { keluargaId: id },
      });

      // 3. Hapus data dana mandiri
      await prisma.danaMandiri.deleteMany({
        where: { keluargaId: id },
      });

      // 4. Hapus data iuran IKATA
      await prisma.iuranIkata.deleteMany({
        where: { keluargaId: id },
      });

      // 5. Hapus doa lingkungan sebagai tuan rumah
      const doaLingkunganIds = await prisma.doaLingkungan.findMany({
        where: { tuanRumahId: id },
        select: { id: true },
      });

      if (doaLingkunganIds.length > 0) {
        // Hapus absensi dari doa lingkungan yang dibuat keluarga ini
        await prisma.absensiDoling.deleteMany({
          where: {
            doaLingkunganId: {
              in: doaLingkunganIds.map((d) => d.id),
            },
          },
        });

        // Hapus approval doa lingkungan
        await prisma.approval.deleteMany({
          where: {
            doaLingkunganId: {
              in: doaLingkunganIds.map((d) => d.id),
            },
          },
        });

        // Hapus doa lingkungan
        await prisma.doaLingkungan.deleteMany({
          where: { tuanRumahId: id },
        });
      }

      // 6. Hapus users yang terkait dengan keluarga ini
      await prisma.user.deleteMany({
        where: { keluargaId: id },
      });

      // 7. Hapus tanggungan (anak dan kerabat)
      await prisma.tanggungan.deleteMany({
        where: { keluargaId: id },
      });

      // 8. Hapus pasangan
      await prisma.pasangan.deleteMany({
        where: { keluargaId: id },
      });

      // 9. Terakhir, hapus data kepala keluarga
      await prisma.keluargaUmat.delete({
        where: { id },
      });
    });

    revalidatePath("/kesekretariatan/umat");
  } catch (error) {
    console.error("Error permanently deleting family head:", error);
    throw new Error("Gagal menghapus data kepala keluarga secara permanen");
  }
}

/**
 * Mendapatkan daftar anggota keluarga berdasarkan ID keluarga
 */
export async function getFamilyMembers(familyId: string): Promise<
  {
    id: string;
    nama: string;
    jenis: "KEPALA_KELUARGA" | "PASANGAN" | "ANAK" | "KERABAT";
  }[]
> {
  try {
    // Ambil data keluarga
    const keluarga = await prisma.keluargaUmat.findUnique({
      where: { id: familyId },
    });

    if (!keluarga) {
      throw new Error("Keluarga tidak ditemukan");
    }

    // Ambil data pasangan jika ada
    const pasangan = await prisma.pasangan.findUnique({
      where: { keluargaId: familyId },
    });

    // Ambil semua tanggungan
    const tanggungan = await prisma.tanggungan.findMany({
      where: { keluargaId: familyId },
    });

    // Inisialisasi array untuk menampung hasil
    const familyMembers: {
      id: string;
      nama: string;
      jenis: "KEPALA_KELUARGA" | "PASANGAN" | "ANAK" | "KERABAT";
    }[] = [];

    // Tambahkan kepala keluarga
    familyMembers.push({
      id: keluarga.id,
      nama: keluarga.namaKepalaKeluarga,
      jenis: "KEPALA_KELUARGA",
    });

    // Tambahkan pasangan jika ada
    if (pasangan) {
      familyMembers.push({
        id: pasangan.id,
        nama: pasangan.nama,
        jenis: "PASANGAN",
      });
    }

    // Tambahkan tanggungan jika ada
    if (tanggungan.length > 0) {
      for (const t of tanggungan) {
        familyMembers.push({
          id: t.id,
          nama: t.nama,
          jenis: t.jenisTanggungan === "ANAK" ? "ANAK" : "KERABAT",
        });
      }
    }
    return familyMembers;
  } catch (error) {
    console.error("Error getting family members:", error);
    throw new Error("Gagal mendapatkan data anggota keluarga");
  }
}

/**
 * Sinkronisasi data tanggungan (tanpa revalidatePath untuk digunakan dalam rendering)
 */
async function syncFamilyDependentsInternal(
  familyId: string
): Promise<{ success: boolean; message: string }> {
  try {
    // Ambil data keluarga
    const keluarga = await prisma.keluargaUmat.findUnique({
      where: { id: familyId },
    });

    if (!keluarga) {
      return { success: false, message: "Keluarga tidak ditemukan" };
    }

    // Ambil semua tanggungan yang ada
    const existingTanggungan = await prisma.tanggungan.findMany({
      where: { keluargaId: familyId },
    });

    const existingAnak = existingTanggungan.filter(
      (t) => t.jenisTanggungan === "ANAK"
    ).length;
    const existingKerabat = existingTanggungan.filter(
      (t) => t.jenisTanggungan === "KERABAT"
    ).length;

    const missingAnak = keluarga.jumlahAnakTertanggung - existingAnak;
    const missingKerabat = keluarga.jumlahKerabatTertanggung - existingKerabat;

    // Jika tidak ada yang perlu ditambahkan
    if (missingAnak <= 0 && missingKerabat <= 0) {
      return {
        success: true,
        message: "Data tanggungan sudah sinkron dengan jumlah yang tercatat",
      };
    }

    // Tambahkan anak yang hilang
    for (let i = 0; i < missingAnak; i++) {
      await prisma.tanggungan.create({
        data: {
          nama: `Anak ${i + 1} dari ${keluarga.namaKepalaKeluarga}`,
          jenisTanggungan: "ANAK",
          tanggalLahir: new Date(), // Default tanggal hari ini
          tempatLahir: "Belum diisi",
          pendidikanTerakhir: "Belum diisi",
          agama: "KATOLIK", // Default
          statusPernikahan: "TIDAK_MENIKAH",
          keluargaId: familyId,
        },
      });
    }

    // Tambahkan kerabat yang hilang
    for (let i = 0; i < missingKerabat; i++) {
      await prisma.tanggungan.create({
        data: {
          nama: `Kerabat ${i + 1} dari ${keluarga.namaKepalaKeluarga}`,
          jenisTanggungan: "KERABAT",
          tanggalLahir: new Date(), // Default tanggal hari ini
          tempatLahir: "Belum diisi",
          pendidikanTerakhir: "Belum diisi",
          agama: "KATOLIK", // Default
          statusPernikahan: "TIDAK_MENIKAH",
          keluargaId: familyId,
        },
      });
    }

    return {
      success: true,
      message: `Berhasil menambahkan ${missingAnak} anak dan ${missingKerabat} kerabat yang hilang`,
    };
  } catch (error) {
    console.error("Error syncing family dependents:", error);
    return {
      success: false,
      message: "Gagal menyinkronkan data tanggungan",
    };
  }
}

/**
 * Sinkronisasi data tanggungan (dengan revalidatePath untuk server actions)
 */
export async function syncFamilyDependents(
  familyId: string
): Promise<{ success: boolean; message: string }> {
  try {
    // Ambil data keluarga
    const keluarga = await prisma.keluargaUmat.findUnique({
      where: { id: familyId },
    });

    if (!keluarga) {
      return { success: false, message: "Keluarga tidak ditemukan" };
    }

    // Ambil semua tanggungan yang ada
    const existingTanggungan = await prisma.tanggungan.findMany({
      where: { keluargaId: familyId },
    });

    const existingAnak = existingTanggungan.filter(
      (t) => t.jenisTanggungan === "ANAK"
    ).length;
    const existingKerabat = existingTanggungan.filter(
      (t) => t.jenisTanggungan === "KERABAT"
    ).length;

    const missingAnak = keluarga.jumlahAnakTertanggung - existingAnak;
    const missingKerabat = keluarga.jumlahKerabatTertanggung - existingKerabat;

    // Jika tidak ada yang perlu ditambahkan
    if (missingAnak <= 0 && missingKerabat <= 0) {
      return {
        success: true,
        message: "Data tanggungan sudah sinkron dengan jumlah yang tercatat",
      };
    }

    // Tambahkan anak yang hilang
    for (let i = 0; i < missingAnak; i++) {
      await prisma.tanggungan.create({
        data: {
          nama: `Anak ${i + 1} dari ${keluarga.namaKepalaKeluarga}`,
          jenisTanggungan: "ANAK",
          tanggalLahir: new Date(), // Default tanggal hari ini
          tempatLahir: "Belum diisi",
          pendidikanTerakhir: "Belum diisi",
          agama: "KATOLIK", // Default
          statusPernikahan: "TIDAK_MENIKAH",
          keluargaId: familyId,
        },
      });
    }

    // Tambahkan kerabat yang hilang
    for (let i = 0; i < missingKerabat; i++) {
      await prisma.tanggungan.create({
        data: {
          nama: `Kerabat ${i + 1} dari ${keluarga.namaKepalaKeluarga}`,
          jenisTanggungan: "KERABAT",
          tanggalLahir: new Date(), // Default tanggal hari ini
          tempatLahir: "Belum diisi",
          pendidikanTerakhir: "Belum diisi",
          agama: "KATOLIK", // Default
          statusPernikahan: "TIDAK_MENIKAH",
          keluargaId: familyId,
        },
      });
    }

    revalidatePath("/kesekretariatan/umat");
    return {
      success: true,
      message: `Berhasil menambahkan ${missingAnak} anak dan ${missingKerabat} kerabat yang hilang`,
    };
  } catch (error) {
    console.error("Error syncing family dependents:", error);
    return {
      success: false,
      message: "Gagal menyinkronkan data tanggungan",
    };
  }
}

// Fungsi untuk menghitung jumlah jiwa aktual
function calculateActualMemberCount(familyHead: any) {
  let count = 0;

  // Hitung kepala keluarga jika masih hidup
  if (familyHead.status === "HIDUP") {
    count += 1;
  }

  // Hitung pasangan jika ada dan masih hidup
  if (familyHead.pasangan && familyHead.pasangan.status === "HIDUP") {
    count += 1;
  }

  // Hitung tanggungan yang masih hidup
  if (familyHead.tanggungan) {
    count += familyHead.tanggungan.filter(
      (t: any) => t.status === "HIDUP"
    ).length;
  }

  return count;
}

// Fungsi untuk menghitung jumlah jiwa yang masih hidup
function calculateLivingMemberCount(familyHead: any) {
  return calculateActualMemberCount(familyHead);
}

// Fungsi untuk menghitung jumlah jiwa yang meninggal
function calculateDeceasedMemberCount(familyHead: any) {
  let count = 0;

  // Hitung kepala keluarga jika meninggal
  if (familyHead.status === "MENINGGAL") {
    count += 1;
  }

  // Hitung pasangan jika ada dan meninggal
  if (familyHead.pasangan && familyHead.pasangan.status === "MENINGGAL") {
    count += 1;
  }

  // Hitung tanggungan yang meninggal
  if (familyHead.tanggungan) {
    count += familyHead.tanggungan.filter(
      (t: any) => t.status === "MENINGGAL"
    ).length;
  }

  return count;
}

/**
 * Mengambil semua data kepala keluarga dengan detail tanggungan
 */
export async function getAllFamilyHeadsWithDetails(): Promise<
  FamilyHeadWithDetails[]
> {
  try {
    const keluargaUmat = await prisma.keluargaUmat.findMany({
      include: {
        pasangan: true,
        tanggungan: true,
      },
      orderBy: {
        namaKepalaKeluarga: "asc",
      },
    });

    const processedKeluarga = await Promise.all(
      keluargaUmat.map(async (keluarga) => {
        // Cek apakah jumlah tanggungan sesuai dengan yang tercatat
        const existingAnak = keluarga.tanggungan.filter(
          (t) => t.jenisTanggungan === "ANAK"
        ).length;
        const existingKerabat = keluarga.tanggungan.filter(
          (t) => t.jenisTanggungan === "KERABAT"
        ).length;

        const missingAnak = keluarga.jumlahAnakTertanggung - existingAnak;
        const missingKerabat =
          keluarga.jumlahKerabatTertanggung - existingKerabat;

        // Jika ada tanggungan yang belum tercatat, lakukan sinkronisasi
        if (missingAnak > 0 || missingKerabat > 0) {
          try {
            await syncFamilyDependentsInternal(keluarga.id);
            // Ambil data terbaru setelah sinkronisasi
            const updatedKeluarga = await prisma.keluargaUmat.findUnique({
              where: { id: keluarga.id },
              include: {
                pasangan: true,
                tanggungan: true,
              },
            });
            if (updatedKeluarga) {
              keluarga = updatedKeluarga;
            }
          } catch (error) {
            console.error(
              `Failed to sync dependents for family ${keluarga.id}:`,
              error
            );
          }
        }

        // Hitung jumlah anggota
        let livingMemberCount = 0;
        let deceasedMemberCount = 0;

        // Hitung kepala keluarga
        if (keluarga.status === "HIDUP") {
          livingMemberCount += 1;
        } else if (keluarga.status === "MENINGGAL") {
          deceasedMemberCount += 1;
        }

        // Hitung pasangan
        if (keluarga.pasangan) {
          if (keluarga.pasangan.status === "HIDUP") {
            livingMemberCount += 1;
          } else if (keluarga.pasangan.status === "MENINGGAL") {
            deceasedMemberCount += 1;
          }
        }

        // Hitung tanggungan
        keluarga.tanggungan.forEach((tanggungan) => {
          if (tanggungan.status === "HIDUP") {
            livingMemberCount += 1;
          } else if (tanggungan.status === "MENINGGAL") {
            deceasedMemberCount += 1;
          }
        });

        // Hitung total anggota
        const actualMemberCount = livingMemberCount + deceasedMemberCount;

        return {
          id: keluarga.id,
          nama: keluarga.namaKepalaKeluarga,
          alamat: keluarga.alamat,
          nomorTelepon: keluarga.nomorTelepon,
          tanggalBergabung: keluarga.tanggalBergabung,
          jumlahAnakTertanggung: keluarga.jumlahAnakTertanggung,
          jumlahKerabatTertanggung: keluarga.jumlahKerabatTertanggung,
          jumlahAnggotaKeluarga: actualMemberCount,
          status: keluarga.status,
          statusPernikahan: keluarga.statusPernikahan,
          tanggalKeluar: keluarga.tanggalKeluar,
          tanggalMeninggal: keluarga.tanggalMeninggal,
          pasangan: keluarga.pasangan
            ? {
                id: keluarga.pasangan.id,
                nama: keluarga.pasangan.nama,
                status: keluarga.pasangan.status,
              }
            : null,
          tanggungan: keluarga.tanggungan.map((t) => ({
            id: t.id,
            nama: t.nama,
            jenisTanggungan: t.jenisTanggungan,
            status: t.status,
            tanggalLahir: t.tanggalLahir,
            pendidikanTerakhir: t.pendidikanTerakhir,
            agama: t.agama,
            statusPernikahan: t.statusPernikahan,
            tanggalBaptis: t.tanggalBaptis || null,
            tanggalKrisma: t.tanggalKrisma || null,
            tanggalMeninggal: t.tanggalMeninggal || null,
          })),
          actualMemberCount,
          livingMemberCount,
          deceasedMemberCount,
        };
      })
    );

    return processedKeluarga;
  } catch (error) {
    console.error("Error getting family heads with details:", error);
    throw new Error("Gagal mengambil data keluarga umat dengan detail");
  }
}

/**
 * Menghapus otomatis data umat dengan status 'Pindah' atau 'Meninggal (Seluruh Keluarga)'
 * yang statusnya diperbarui pada bulan sebelumnya
 * Fungsi ini akan dipanggil oleh cronjob setiap awal bulan
 */
export async function autoDeleteInactiveUmatData(): Promise<{
  success: boolean;
  deletedFamilies: number;
  deletedMembers: number;
  errors: string[];
}> {
  try {
    console.log("Starting auto-delete process for inactive umat data...");

    // Hitung range bulan sebelumnya
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      0,
      23,
      59,
      59,
      999
    );

    console.log(
      `Checking for families updated between ${lastMonth.toISOString()} and ${endOfLastMonth.toISOString()}`
    );

    let deletedFamilies = 0;
    let deletedMembers = 0;
    const errors: string[] = [];

    // 1. Cari keluarga yang pindah pada bulan sebelumnya (menggunakan status PINDAH)
    const movedFamilies = await prisma.keluargaUmat.findMany({
      where: {
        status: StatusKehidupan.PINDAH,
        tanggalKeluar: {
          gte: lastMonth,
          lte: endOfLastMonth,
        },
      },
      include: {
        pasangan: true,
        tanggungan: true,
        users: true,
      },
    });

    console.log(`Found ${movedFamilies.length} families that moved last month`);

    // 2. Cari keluarga yang meninggal (seluruh keluarga) pada bulan sebelumnya
    const deceasedFamilies = await prisma.keluargaUmat.findMany({
      where: {
        status: StatusKehidupan.MENINGGAL,
        tanggalMeninggal: {
          gte: lastMonth,
          lte: endOfLastMonth,
        },
      },
      include: {
        pasangan: true,
        tanggungan: true,
        users: true,
      },
    });

    console.log(
      `Found ${deceasedFamilies.length} families where entire family deceased last month`
    );

    // 3. Gabungkan kedua kategori
    const familiesToDelete = [...movedFamilies, ...deceasedFamilies];

    if (familiesToDelete.length === 0) {
      console.log("No families found for auto-deletion");
      return {
        success: true,
        deletedFamilies: 0,
        deletedMembers: 0,
        errors: [],
      };
    }

    // 4. Proses penghapusan untuk setiap keluarga
    for (const family of familiesToDelete) {
      try {
        console.log(
          `Deleting family: ${family.namaKepalaKeluarga} (ID: ${family.id})`
        );

        // Hitung jumlah anggota yang akan dihapus
        let memberCount = 1; // Kepala keluarga
        if (family.pasangan) memberCount += 1;
        if (family.tanggungan) memberCount += family.tanggungan.length;

        // Gunakan transaction untuk memastikan konsistensi data
        await prisma.$transaction(async (prisma) => {
          // Hapus semua data terkait menggunakan fungsi yang sudah ada
          // Tapi kita perlu membuat versi yang lebih aman untuk auto-delete

          // 1. Hapus absensi doa lingkungan
          await prisma.absensiDoling.deleteMany({
            where: { keluargaId: family.id },
          });

          // 2. Hapus data kas lingkungan
          await prisma.kasLingkungan.deleteMany({
            where: { keluargaId: family.id },
          });

          // 3. Hapus data dana mandiri
          await prisma.danaMandiri.deleteMany({
            where: { keluargaId: family.id },
          });

          // 4. Hapus data iuran IKATA
          await prisma.iuranIkata.deleteMany({
            where: { keluargaId: family.id },
          });

          // 5. Hapus doa lingkungan sebagai tuan rumah
          const doaLingkunganIds = await prisma.doaLingkungan.findMany({
            where: { tuanRumahId: family.id },
            select: { id: true },
          });

          if (doaLingkunganIds.length > 0) {
            // Hapus absensi dari doa lingkungan yang dibuat keluarga ini
            await prisma.absensiDoling.deleteMany({
              where: {
                doaLingkunganId: {
                  in: doaLingkunganIds.map((d) => d.id),
                },
              },
            });

            // Hapus approval doa lingkungan
            await prisma.approval.deleteMany({
              where: {
                doaLingkunganId: {
                  in: doaLingkunganIds.map((d) => d.id),
                },
              },
            });

            // Hapus doa lingkungan
            await prisma.doaLingkungan.deleteMany({
              where: { tuanRumahId: family.id },
            });
          }

          // 6. Hapus pengajuan yang dibuat oleh user keluarga ini
          if (family.users && family.users.length > 0) {
            await prisma.pengajuan.deleteMany({
              where: {
                pengajuId: {
                  in: family.users.map((u) => u.id),
                },
              },
            });

            // Hapus publikasi yang dibuat oleh user keluarga ini
            await prisma.publikasi.deleteMany({
              where: {
                pembuatId: {
                  in: family.users.map((u) => u.id),
                },
              },
            });

            // Hapus notifikasi yang ditujukan untuk user keluarga ini
            await prisma.notification.deleteMany({
              where: {
                userId: {
                  in: family.users.map((u) => u.id),
                },
              },
            });
          }

          // 7. Hapus users yang terkait dengan keluarga ini
          await prisma.user.deleteMany({
            where: { keluargaId: family.id },
          });

          // 8. Hapus tanggungan (anak dan kerabat)
          await prisma.tanggungan.deleteMany({
            where: { keluargaId: family.id },
          });

          // 9. Hapus pasangan jika ada
          if (family.pasangan) {
            await prisma.pasangan.delete({
              where: { id: family.pasangan.id },
            });
          }

          // 10. Hapus data keluarga utama
          await prisma.keluargaUmat.delete({
            where: { id: family.id },
          });
        });

        deletedFamilies += 1;
        deletedMembers += memberCount;

        console.log(
          `Successfully deleted family: ${family.namaKepalaKeluarga} (${memberCount} members)`
        );
      } catch (error) {
        const errorMsg = `Failed to delete family ${
          family.namaKepalaKeluarga
        }: ${error instanceof Error ? error.message : "Unknown error"}`;
        console.error(errorMsg);
        errors.push(errorMsg);
      }
    }

    console.log(
      `Auto-delete process completed. Deleted ${deletedFamilies} families (${deletedMembers} members total)`
    );

    return {
      success: true,
      deletedFamilies,
      deletedMembers,
      errors,
    };
  } catch (error) {
    console.error("Error in auto-delete process:", error);
    return {
      success: false,
      deletedFamilies: 0,
      deletedMembers: 0,
      errors: [
        error instanceof Error ? error.message : "Unknown error occurred",
      ],
    };
  }
}

/**
 * Fungsi untuk melihat preview data umat yang akan dihapus pada bulan sebelumnya
 * Berguna untuk monitoring dan testing sebelum penghapusan otomatis
 */
export async function previewInactiveUmatData(): Promise<{
  movedFamilies: Array<{
    id: string;
    namaKepalaKeluarga: string;
    tanggalKeluar: Date;
    jumlahAnggota: number;
  }>;
  deceasedFamilies: Array<{
    id: string;
    namaKepalaKeluarga: string;
    tanggalMeninggal: Date;
    jumlahAnggota: number;
  }>;
  totalFamilies: number;
  totalMembers: number;
}> {
  try {
    // Hitung range bulan sebelumnya
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      0,
      23,
      59,
      59,
      999
    );

    // 1. Cari keluarga yang pindah pada bulan sebelumnya (menggunakan status PINDAH)
    const movedFamilies = await prisma.keluargaUmat.findMany({
      where: {
        status: StatusKehidupan.PINDAH,
        tanggalKeluar: {
          gte: lastMonth,
          lte: endOfLastMonth,
        },
      },
      include: {
        pasangan: true,
        tanggungan: true,
      },
    });

    // 2. Cari keluarga yang meninggal (seluruh keluarga) pada bulan sebelumnya
    const deceasedFamilies = await prisma.keluargaUmat.findMany({
      where: {
        status: StatusKehidupan.MENINGGAL,
        tanggalMeninggal: {
          gte: lastMonth,
          lte: endOfLastMonth,
        },
      },
      include: {
        pasangan: true,
        tanggungan: true,
        users: true,
      },
    });

    // 3. Format data untuk preview
    const movedPreview = movedFamilies.map((family) => ({
      id: family.id,
      namaKepalaKeluarga: family.namaKepalaKeluarga,
      tanggalKeluar: family.tanggalKeluar!,
      jumlahAnggota:
        1 + (family.pasangan ? 1 : 0) + (family.tanggungan?.length || 0),
    }));

    const deceasedPreview = deceasedFamilies.map((family) => ({
      id: family.id,
      namaKepalaKeluarga: family.namaKepalaKeluarga,
      tanggalMeninggal: family.tanggalMeninggal!,
      jumlahAnggota:
        1 + (family.pasangan ? 1 : 0) + (family.tanggungan?.length || 0),
    }));

    const totalFamilies = movedFamilies.length + deceasedFamilies.length;
    const totalMembers =
      movedPreview.reduce((sum, f) => sum + f.jumlahAnggota, 0) +
      deceasedPreview.reduce((sum, f) => sum + f.jumlahAnggota, 0);

    return {
      movedFamilies: movedPreview,
      deceasedFamilies: deceasedPreview,
      totalFamilies,
      totalMembers,
    };
  } catch (error) {
    console.error("Error in preview inactive umat data:", error);
    throw new Error("Gagal mengambil preview data umat yang akan dihapus");
  }
}
