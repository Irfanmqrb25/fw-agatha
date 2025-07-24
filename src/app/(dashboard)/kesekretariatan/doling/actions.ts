"use server";

import { prisma } from "@/lib/db";
import { JenisIbadat, SubIbadat, StatusApproval, StatusKegiatan } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { format } from "date-fns";
import { createJakartaMonthRange, nowInJakarta, createJakartaYearRange } from "@/lib/timezone";

// Tipe data yang digunakan UI
export interface DolingData {
  id: string;
  tanggal: Date;
  waktu: string;
  tuanRumah: string;
  tuanRumahId: string;
  alamat: string;
  nomorTelepon: string | null;
  jenisIbadat: JenisIbadat;
  subIbadat: SubIbadat | null;
  customSubIbadat: string | null;
  temaIbadat: string | null;
  status: string;
  statusKegiatan: StatusKegiatan;
  jumlahKKHadir: number;
  bapak: number;
  ibu: number;
  omk: number;
  bir: number;
  biaBawah: number;
  biaAtas: number;
  kolekteI: number;
  kolekteII: number;
  ucapanSyukur: number;
  pemimpinIbadat: string | null;
  pemimpinRosario: string | null;
  pembawaRenungan: string | null;
  pembawaLagu: string | null;
  doaUmat: string | null;
  bacaan: string | null;
  pemimpinMisa: string | null;
  bacaanI: string | null;
  pemazmur: string | null;
  jumlahPeserta: number;
  approved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AbsensiData {
  id: string;
  doaLingkunganId: string;
  keluargaId: string;
  namaKeluarga: string;
  hadir: boolean;
  statusKehadiran?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface KeluargaForSelect {
  id: string;
  nama: string;
  alamat: string;
  nomorTelepon: string | null;
  sudahTerpilih: boolean;
}

/**
 * Mendapatkan semua data doa lingkungan
 */
export async function getAllDoling(): Promise<DolingData[]> {
  try {
    const dolingData = await prisma.doaLingkungan.findMany({
      include: {
        tuanRumah: true,
        approval: true,
      },
      orderBy: {
        tanggal: 'desc',
      },
    });

    return dolingData.map(doling => ({
      id: doling.id,
      tanggal: doling.tanggal,
      waktu: doling.tanggal.toLocaleTimeString('id-ID', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false
      }),
      tuanRumah: doling.tuanRumah.namaKepalaKeluarga,
      tuanRumahId: doling.tuanRumahId,
      alamat: doling.tuanRumah.alamat,
      nomorTelepon: doling.tuanRumah.nomorTelepon,
      jenisIbadat: doling.jenisIbadat,
      subIbadat: doling.subIbadat,
      customSubIbadat: doling.customSubIbadat,
      temaIbadat: doling.temaIbadat,
      status: doling.statusKegiatan === StatusKegiatan.SELESAI ? 'selesai' : 
             doling.statusKegiatan === StatusKegiatan.DIBATALKAN ? 'dibatalkan' : 'menunggu',
      statusKegiatan: doling.statusKegiatan || StatusKegiatan.BELUM_SELESAI,
      jumlahKKHadir: doling.jumlahKKHadir,
      bapak: doling.bapak,
      ibu: doling.ibu,
      omk: doling.omk,
      bir: doling.bir,
      biaBawah: doling.biaBawah,
      biaAtas: doling.biaAtas,
      kolekteI: doling.kolekteI,
      kolekteII: doling.kolekteII,
      ucapanSyukur: doling.ucapanSyukur,
      pemimpinIbadat: doling.pemimpinIbadat,
      pemimpinRosario: doling.pemimpinRosario,
      pembawaRenungan: doling.pembawaRenungan,
      pembawaLagu: doling.pembawaLagu,
      doaUmat: doling.doaUmat,
      bacaan: doling.bacaan,
      pemimpinMisa: doling.pemimpinMisa,
      bacaanI: doling.bacaanI,
      pemazmur: doling.pemazmur,
      jumlahPeserta: doling.jumlahPeserta,
      approved: doling.approval?.status === StatusApproval.APPROVED,
      createdAt: doling.createdAt,
      updatedAt: doling.updatedAt,
    }));
  } catch (error) {
    console.error("Error getting doa lingkungan data:", error);
    throw new Error("Gagal mengambil data doa lingkungan");
  }
}

/**
 * Mendapatkan data doa lingkungan berdasarkan ID
 */
export async function getDolingById(id: string): Promise<DolingData | null> {
  try {
    const doling = await prisma.doaLingkungan.findUnique({
      where: { id },
      include: {
        tuanRumah: true,
        approval: true,
      },
    });

    if (!doling) return null;

    return {
      id: doling.id,
      tanggal: doling.tanggal,
      waktu: doling.tanggal.toLocaleTimeString('id-ID', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false
      }),
      tuanRumah: doling.tuanRumah.namaKepalaKeluarga,
      tuanRumahId: doling.tuanRumahId,
      alamat: doling.tuanRumah.alamat,
      nomorTelepon: doling.tuanRumah.nomorTelepon,
      jenisIbadat: doling.jenisIbadat,
      subIbadat: doling.subIbadat,
      customSubIbadat: doling.customSubIbadat,
      temaIbadat: doling.temaIbadat,
      status: doling.statusKegiatan === StatusKegiatan.SELESAI ? 'selesai' : 
             doling.statusKegiatan === StatusKegiatan.DIBATALKAN ? 'dibatalkan' : 'menunggu',
      statusKegiatan: doling.statusKegiatan || StatusKegiatan.BELUM_SELESAI,
      jumlahKKHadir: doling.jumlahKKHadir,
      bapak: doling.bapak,
      ibu: doling.ibu,
      omk: doling.omk,
      bir: doling.bir,
      biaBawah: doling.biaBawah,
      biaAtas: doling.biaAtas,
      kolekteI: doling.kolekteI,
      kolekteII: doling.kolekteII,
      ucapanSyukur: doling.ucapanSyukur,
      pemimpinIbadat: doling.pemimpinIbadat,
      pemimpinRosario: doling.pemimpinRosario,
      pembawaRenungan: doling.pembawaRenungan,
      pembawaLagu: doling.pembawaLagu,
      doaUmat: doling.doaUmat,
      bacaan: doling.bacaan,
      pemimpinMisa: doling.pemimpinMisa,
      bacaanI: doling.bacaanI,
      pemazmur: doling.pemazmur,
      jumlahPeserta: doling.jumlahPeserta,
      approved: doling.approval?.status === StatusApproval.APPROVED,
      createdAt: doling.createdAt,
      updatedAt: doling.updatedAt,
    };
  } catch (error) {
    console.error("Error getting doa lingkungan by ID:", error);
    throw new Error("Gagal mengambil data doa lingkungan");
  }
}

/**
 * Mendapatkan data keluarga yang tersedia sebagai tuan rumah
 */
export async function getKeluargaForSelection(dolingId?: string): Promise<KeluargaForSelect[]> {
  try {
    // Ambil semua keluarga yang masih aktif (status HIDUP dan belum keluar)
    const keluargaData = await prisma.keluargaUmat.findMany({
      where: {
        status: 'HIDUP',
        tanggalKeluar: null,
      },
      orderBy: {
        namaKepalaKeluarga: 'asc',
      },
      include: {
        // Sertakan relasi doaLingkungan untuk mengetahui apakah keluarga pernah menjadi tuan rumah
        doaLingkungan: {
          select: {
            id: true,
          },
        },
      },
    });

    // Jika ada dolingId, dapatkan daftar keluarga yang sudah terabsensi
    let absensiKeluargaIds: string[] = [];
    if (dolingId) {
      const existingAbsensi = await prisma.absensiDoling.findMany({
        where: {
          doaLingkunganId: dolingId,
        },
        select: {
          keluargaId: true,
        },
      });
      absensiKeluargaIds = existingAbsensi.map(absensi => absensi.keluargaId);
    }

    // Map data keluarga ke format yang dibutuhkan UI
    return keluargaData.map(keluarga => ({
      id: keluarga.id,
      nama: keluarga.namaKepalaKeluarga,
      alamat: keluarga.alamat,
      nomorTelepon: keluarga.nomorTelepon,
      sudahTerpilih: dolingId ? absensiKeluargaIds.includes(keluarga.id) : false,
    }));
  } catch (error) {
    console.error("Error getting keluarga data:", error);
    throw new Error("Gagal mengambil data keluarga");
  }
}

/**
 * Menambahkan jadwal doa lingkungan baru
 */
export async function addDoling(data: {
  tanggal: Date;
  tuanRumahId: string;
  jenisIbadat: JenisIbadat;
  subIbadat?: SubIbadat;
  customSubIbadat?: string;
  temaIbadat?: string;
}): Promise<DolingData> {
  try {
    // Validasi subIbadat, jika bukan nilai enum SubIbadat yang valid, set ke null
    let validSubIbadat = null;
    if (data.subIbadat) {
      try {
        // Coba validasi apakah nilai subIbadat ada dalam enum SubIbadat
        const isValidSubIbadat = Object.values(SubIbadat).includes(data.subIbadat as SubIbadat);
        if (isValidSubIbadat) {
          validSubIbadat = data.subIbadat;
        }
      } catch (error) {
        console.error("Error validating subIbadat:", error);
      }
    }
    
    // Verifikasi bahwa keluarga yang dipilih ada di database
    const keluarga = await prisma.keluargaUmat.findUnique({
      where: { 
        id: data.tuanRumahId 
      }
    });
    
    if (!keluarga) {
      throw new Error(`Keluarga dengan ID ${data.tuanRumahId} tidak ditemukan`);
    }
    
    // Gunakan transaksi untuk memastikan konsistensi data
    const result = await prisma.$transaction(async (tx) => {
      // Buat data doa lingkungan baru
      const newDoling = await tx.doaLingkungan.create({
        data: {
          tanggal: data.tanggal,
          tuanRumahId: data.tuanRumahId,
          jenisIbadat: data.jenisIbadat,
          subIbadat: validSubIbadat,
          customSubIbadat: data.customSubIbadat,
          temaIbadat: data.temaIbadat,
          statusKegiatan: StatusKegiatan.BELUM_SELESAI,
        },
        include: {
          tuanRumah: true,
        },
      });

      // Buat record approval dengan status PENDING
      const approval = await tx.approval.create({
        data: {
          doaLingkunganId: newDoling.id,
          status: StatusApproval.PENDING,
        }
      });

      return { newDoling, approval };
    });

    // Refresh data di seluruh aplikasi
    revalidatePath("/kesekretariatan/doling");
    revalidatePath("/approval");

    // Format hasil untuk dikembalikan ke UI
    return {
      id: result.newDoling.id,
      tanggal: result.newDoling.tanggal,
      waktu: result.newDoling.tanggal.toLocaleTimeString('id-ID', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false
      }),
      tuanRumah: result.newDoling.tuanRumah.namaKepalaKeluarga,
      tuanRumahId: result.newDoling.tuanRumahId,
      alamat: result.newDoling.tuanRumah.alamat,
      nomorTelepon: result.newDoling.tuanRumah.nomorTelepon,
      jenisIbadat: result.newDoling.jenisIbadat,
      subIbadat: result.newDoling.subIbadat,
      customSubIbadat: result.newDoling.customSubIbadat,
      temaIbadat: result.newDoling.temaIbadat,
      status: 'menunggu',
      statusKegiatan: result.newDoling.statusKegiatan || StatusKegiatan.BELUM_SELESAI,
      jumlahKKHadir: 0,
      bapak: 0,
      ibu: 0,
      omk: 0,
      bir: 0,
      biaBawah: 0,
      biaAtas: 0,
      kolekteI: 0,
      kolekteII: 0,
      ucapanSyukur: 0,
      pemimpinIbadat: null,
      pemimpinRosario: null,
      pembawaRenungan: null,
      pembawaLagu: null,
      doaUmat: null,
      bacaan: null,
      pemimpinMisa: null,
      bacaanI: null,
      pemazmur: null,
      jumlahPeserta: 0,
      approved: false,
      createdAt: result.newDoling.createdAt,
      updatedAt: result.newDoling.updatedAt,
    };
  } catch (error) {
    console.error("Error adding doa lingkungan:", error);
    throw new Error("Gagal menambahkan jadwal doa lingkungan");
  }
}

/**
 * Mengupdate detail doa lingkungan
 */
export async function updateDolingDetail(id: string, data: {
  jumlahKKHadir?: number;
  bapak?: number;
  ibu?: number;
  omk?: number;
  bir?: number;
  biaBawah?: number;
  biaAtas?: number;
  kolekteI?: number;
  kolekteII?: number;
  ucapanSyukur?: number;
  pemimpinIbadat?: string;
  pemimpinRosario?: string;
  pembawaRenungan?: string;
  pembawaLagu?: string;
  doaUmat?: string;
  bacaan?: string;
  pemimpinMisa?: string;
  bacaanI?: string;
  pemazmur?: string;
  jumlahPeserta?: number;
  status?: StatusKegiatan;
  statusKegiatan?: StatusKegiatan;
  customSubIbadat?: string | null;
}): Promise<DolingData> {
  try {
    // Jika tidak ada perubahan pada jumlahKKHadir, gunakan data absensi yang sebenarnya
    let finalJumlahKKHadir = data.jumlahKKHadir;
    
    if (finalJumlahKKHadir === undefined) {
      // Hitung berdasarkan data absensi yang ada
      const actualAttendanceCount = await prisma.absensiDoling.count({
        where: {
          doaLingkunganId: id,
          hadir: true,
        },
      });
      finalJumlahKKHadir = actualAttendanceCount;
    }

    // Update data doling
    const updatedDoling = await prisma.doaLingkungan.update({
      where: { id },
      data: {
        jumlahKKHadir: finalJumlahKKHadir,
        bapak: data.bapak,
        ibu: data.ibu,
        omk: data.omk,
        bir: data.bir,
        biaBawah: data.biaBawah,
        biaAtas: data.biaAtas,
        kolekteI: data.kolekteI,
        kolekteII: data.kolekteII,
        ucapanSyukur: data.ucapanSyukur,
        pemimpinIbadat: data.pemimpinIbadat,
        pemimpinRosario: data.pemimpinRosario,
        pembawaRenungan: data.pembawaRenungan,
        pembawaLagu: data.pembawaLagu,
        doaUmat: data.doaUmat,
        bacaan: data.bacaan,
        pemimpinMisa: data.pemimpinMisa,
        bacaanI: data.bacaanI,
        pemazmur: data.pemazmur,
        jumlahPeserta: data.jumlahPeserta,
        customSubIbadat: data.customSubIbadat,
        statusKegiatan: data.statusKegiatan || StatusKegiatan.BELUM_SELESAI,
      },
      include: {
        tuanRumah: true,
        approval: true,
      }
    });

    // Refresh data
    revalidatePath("/kesekretariatan/doling");
    revalidatePath("/approval");

    // Format result
    return {
      id: updatedDoling.id,
      tanggal: updatedDoling.tanggal,
      waktu: format(updatedDoling.tanggal, 'HH:mm'),
      tuanRumah: updatedDoling.tuanRumah.namaKepalaKeluarga,
      tuanRumahId: updatedDoling.tuanRumahId,
      alamat: updatedDoling.tuanRumah.alamat,
      nomorTelepon: updatedDoling.tuanRumah.nomorTelepon,
      jenisIbadat: updatedDoling.jenisIbadat,
      subIbadat: updatedDoling.subIbadat,
      customSubIbadat: updatedDoling.customSubIbadat,
      temaIbadat: updatedDoling.temaIbadat,
      status: updatedDoling.statusKegiatan === StatusKegiatan.SELESAI ? 'selesai' : 
             updatedDoling.statusKegiatan === StatusKegiatan.DIBATALKAN ? 'dibatalkan' : 'menunggu',
      statusKegiatan: updatedDoling.statusKegiatan,
      jumlahKKHadir: updatedDoling.jumlahKKHadir,
      bapak: updatedDoling.bapak,
      ibu: updatedDoling.ibu,
      omk: updatedDoling.omk,
      bir: updatedDoling.bir,
      biaBawah: updatedDoling.biaBawah,
      biaAtas: updatedDoling.biaAtas,
      kolekteI: updatedDoling.kolekteI,
      kolekteII: updatedDoling.kolekteII,
      ucapanSyukur: updatedDoling.ucapanSyukur,
      pemimpinIbadat: updatedDoling.pemimpinIbadat,
      pemimpinRosario: updatedDoling.pemimpinRosario,
      pembawaRenungan: updatedDoling.pembawaRenungan,
      pembawaLagu: updatedDoling.pembawaLagu,
      doaUmat: updatedDoling.doaUmat,
      bacaan: updatedDoling.bacaan,
      pemimpinMisa: updatedDoling.pemimpinMisa,
      bacaanI: updatedDoling.bacaanI,
      pemazmur: updatedDoling.pemazmur,
      jumlahPeserta: updatedDoling.jumlahPeserta,
      approved: updatedDoling.approval?.status === StatusApproval.APPROVED,
      createdAt: updatedDoling.createdAt,
      updatedAt: updatedDoling.updatedAt
    };
  } catch (error) {
    console.error("Error updating doa lingkungan detail:", error);
    throw new Error("Gagal mengupdate detail doa lingkungan");
  }
}

/**
 * Mendapatkan absensi untuk doa lingkungan tertentu
 */
export async function getAbsensiByDolingId(dolingId: string): Promise<AbsensiData[]> {
  try {
    // Validasi dolingId
    if (!dolingId || dolingId.trim() === "") {
      return [];
    }

    // Cek apakah dolingId valid
    const doling = await prisma.doaLingkungan.findUnique({
      where: { id: dolingId },
    });

    if (!doling) {
      return [];
    }


    // Ambil data absensi
    const absensiData = await prisma.absensiDoling.findMany({
      where: {
        doaLingkunganId: dolingId,
      },
      include: {
        keluarga: true,
      },
      orderBy: {
        keluarga: {
          namaKepalaKeluarga: 'asc',
        },
      },
    });


    return absensiData.map(absensi => {
      // Memastikan statusKehadiran selalu memiliki nilai yang valid
      let statusKehadiran = absensi.statusKehadiran;
      if (!statusKehadiran) {
        statusKehadiran = absensi.hadir ? "SUAMI_ISTRI_HADIR" : "TIDAK_HADIR";
      }

      return {
        id: absensi.id,
        doaLingkunganId: absensi.doaLingkunganId,
        keluargaId: absensi.keluargaId,
        namaKeluarga: absensi.keluarga.namaKepalaKeluarga,
        hadir: absensi.hadir,
        statusKehadiran,
        createdAt: absensi.createdAt,
        updatedAt: absensi.updatedAt,
      };
    });
  } catch (error) {
    console.error("Error getting absensi data:", error);
    throw new Error("Gagal mengambil data absensi doa lingkungan");
  }
}

/**
 * Menambahkan atau mengupdate data absensi
 */
export async function updateAbsensi(dolingId: string, data: { keluargaId: string, hadir: boolean, statusKehadiran: string }[]): Promise<void> {
  try {

    // Validasi dolingId
    if (!dolingId || dolingId.trim() === "") {
      throw new Error("dolingId kosong atau tidak valid");
    }

    // Cek apakah dolingId valid
    const doling = await prisma.doaLingkungan.findUnique({
      where: { id: dolingId },
    });

    if (!doling) {
      throw new Error(`Doa lingkungan tidak ditemukan untuk id: ${dolingId}`);
    }

    // Validasi data absensi
    if (!data || data.length === 0) {
      throw new Error("Data absensi kosong");
    }

    // Transaksi untuk memastikan semua data absensi terupdate secara konsisten
    await prisma.$transaction(async (tx) => {
      // Iterasi semua data yang akan diupdate
      for (const item of data) {
        if (!item.keluargaId) {
          continue;
        }

        // Cek apakah keluargaId valid
        const keluarga = await tx.keluargaUmat.findUnique({
          where: { id: item.keluargaId },
        });

        if (!keluarga) {
          continue;
        }

        // Cek apakah data absensi sudah ada
        const existingAbsensi = await tx.absensiDoling.findFirst({
          where: {
            doaLingkunganId: dolingId,
            keluargaId: item.keluargaId,
          },
        });

        if (existingAbsensi) {
          // Update jika sudah ada
          const updated = await tx.absensiDoling.update({
            where: { id: existingAbsensi.id },
            data: { 
              hadir: item.hadir,
              statusKehadiran: item.statusKehadiran
            }
          });
        } else {
          // Buat baru jika belum ada
          const created = await tx.absensiDoling.create({
            data: {
              doaLingkungan: { connect: { id: dolingId } },
              keluarga: { connect: { id: item.keluargaId } },
              hadir: item.hadir,
              statusKehadiran: item.statusKehadiran
            }
          });
        }
      }

      // Update jumlahKKHadir pada doa lingkungan
      const hadirCount = await tx.absensiDoling.count({
        where: {
          doaLingkunganId: dolingId,
          hadir: true,
        },
      });

      await tx.doaLingkungan.update({
        where: { id: dolingId },
        data: { jumlahKKHadir: hadirCount }
      });

    });

    revalidatePath("/kesekretariatan/doling");
  } catch (error) {
    console.error("Error updating absensi:", error);
    throw new Error(`Gagal mengupdate data absensi: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Mengubah status approval
 */
export async function updateApprovalStatus(dolingId: string, status: StatusApproval): Promise<void> {
  try {
    // Cek apakah approval sudah ada
    const existingApproval = await prisma.approval.findFirst({
      where: {
        doaLingkunganId: dolingId,
      },
    });

    if (existingApproval) {
      // Update approval yang sudah ada
      await prisma.approval.update({
        where: { id: existingApproval.id },
        data: { status }
      });
    } else {
      // Buat approval baru
      await prisma.approval.create({
        data: {
          doaLingkungan: { connect: { id: dolingId } },
          status
        }
      });
    }

    // Revalidate paths untuk memastikan sinkronisasi data
    revalidatePath("/kesekretariatan/doling");
    revalidatePath("/approval"); // Tambahkan revalidation untuk halaman approval
  } catch (error) {
    console.error("Error updating approval status:", error);
    throw new Error("Gagal mengupdate status approval");
  }
}

/**
 * Menghapus jadwal doa lingkungan
 */
export async function deleteDoling(id: string): Promise<void> {
  try {
    // Hapus terlebih dahulu data absensi yang terkait
    await prisma.absensiDoling.deleteMany({
      where: {
        doaLingkunganId: id,
      },
    });

    // Hapus approval jika ada
    await prisma.approval.deleteMany({
      where: {
        doaLingkunganId: id,
      },
    });

    // Hapus doa lingkungan
    await prisma.doaLingkungan.delete({
      where: { id },
    });

    revalidatePath("/kesekretariatan/doling");
  } catch (error) {
    console.error("Error deleting doa lingkungan:", error);
    throw new Error("Gagal menghapus jadwal doa lingkungan");
  }
}

/**
 * Mendapatkan data riwayat kehadiran keluarga
 */
export async function getRiwayatKehadiran(): Promise<{
  nama: string;
  totalHadir: number;
  persentase: number;
}[]> {
  try {
    // Get all families with their attendance records
    const keluarga = await prisma.keluargaUmat.findMany({
      where: {
        status: 'HIDUP',
        tanggalKeluar: null,
      },
      select: {
        id: true,
        namaKepalaKeluarga: true,
        absensiDoling: {
          select: {
            hadir: true,
            doaLingkungan: {
              select: {
                statusKegiatan: true,
                tanggal: true,
              }
            }
          },
        },
      },
    });

    // Calculate attendance statistics - hanya hitung dari kegiatan yang sudah selesai
    return keluarga.map(k => {
      // Filter absensi hanya dari kegiatan yang sudah berlalu (gunakan timezone Jakarta)
      const currentTime = nowInJakarta();
      const validAbsensi = k.absensiDoling.filter(a => 
        a.doaLingkungan.tanggal <= currentTime // Hanya kegiatan yang sudah berlalu
      );
      
      const totalAbsensi = validAbsensi.length;
      const totalHadir = validAbsensi.filter(a => a.hadir).length;
      const persentase = totalAbsensi > 0 ? (totalHadir / totalAbsensi) * 100 : 0;

      return {
        nama: k.namaKepalaKeluarga,
        totalHadir,
        persentase: Math.round(persentase), // Bulatkan persentase ke bilangan bulat
      };
    }).sort((a, b) => b.persentase - a.persentase);
  } catch (error) {
    console.error("Error getting attendance history:", error);
    throw new Error("Gagal mengambil riwayat kehadiran");
  }
}

/**
 * Mendapatkan rekapitulasi kegiatan per bulan
 */
export async function getRekapitulasiBulanan(tahun: number): Promise<{
  bulan: string;
  jumlahKegiatan: number;
  rataRataHadir: number;
}[]> {
  try {
    const namaBulan = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];
    
    const hasil = [];
    
    // Loop through months
    for (let bulan = 0; bulan < 12; bulan++) {
      // Gunakan timezone Jakarta untuk konsistensi
      const { startDate, endDate } = createJakartaMonthRange(tahun, bulan);
      
      // Get doling data for this month
      const dolingData = await prisma.doaLingkungan.findMany({
        where: {
          tanggal: {
            gte: startDate,
            lte: endDate,
          },
        },
        select: {
          id: true,
          tanggal: true,
          statusKegiatan: true,
        },
      });
      
      const jumlahKegiatan = dolingData.length;
      
      // Hitung rata-rata kehadiran berdasarkan data absensi yang sebenarnya
      let totalHadir = 0;
      let kegiatanDenganAbsensi = 0;
      
      for (const doling of dolingData) {
        // Hanya hitung kegiatan yang sudah berlalu (gunakan timezone Jakarta)
        const currentTime = nowInJakarta();
        if (doling.tanggal <= currentTime) {
          // Ambil data absensi untuk setiap doling
          const absensiCount = await prisma.absensiDoling.count({
            where: {
              doaLingkunganId: doling.id,
              hadir: true,
            },
          });
          
          totalHadir += absensiCount;
          kegiatanDenganAbsensi++;
        }
      }
      
      const rataRataHadir = kegiatanDenganAbsensi > 0 ? 
        Math.round((totalHadir / kegiatanDenganAbsensi) * 100) / 100 : 0;
      
      hasil.push({
        bulan: `${namaBulan[bulan]} ${tahun}`,
        jumlahKegiatan,
        rataRataHadir,
      });
    }
    
    return hasil;
  } catch (error) {
    console.error("Error getting monthly recap:", error);
    throw new Error("Gagal mengambil rekapitulasi bulanan");
  }
}

/**
 * Mendapatkan data kaleidoskop
 */
export async function getKaleidoskopData(): Promise<{
  totalKegiatan: number;
  rataRataKehadiran: number;
  totalKKAktif: number;
}> {
  try {
    // Get total kegiatan this year menggunakan timezone Jakarta
    const currentYear = new Date().getFullYear();
    const { startDate, endDate } = createJakartaYearRange(currentYear);
    
    const kegiatanCount = await prisma.doaLingkungan.count({
      where: {
        tanggal: {
          gte: startDate,
          lte: endDate,
        },
      },
    });
    
    // Calculate average attendance
    const dolingData = await prisma.doaLingkungan.findMany({
      where: {
        tanggal: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        jumlahKKHadir: true,
      },
    });
    
    const totalHadir = dolingData.reduce((sum, d) => sum + d.jumlahKKHadir, 0);
    const rataRataKehadiran = kegiatanCount > 0 ? totalHadir / kegiatanCount : 0;
    
    // Get total active families
    const totalKKAktif = await prisma.keluargaUmat.count({
      where: {
        status: 'HIDUP',
        tanggalKeluar: null,
      },
    });
    
    return {
      totalKegiatan: kegiatanCount,
      rataRataKehadiran,
      totalKKAktif,
    };
  } catch (error) {
    console.error("Error getting kaleidoskop data:", error);
    throw new Error("Gagal mengambil data kaleidoskop");
  }
}

/**
 * Menghapus data absensi berdasarkan ID
 */
export async function deleteAbsensi(absensiId: string): Promise<void> {
  try {

    // Dapatkan data absensi terlebih dahulu untuk mengetahui dolingId-nya
    const absensi = await prisma.absensiDoling.findUnique({
      where: { id: absensiId },
      select: { doaLingkunganId: true }
    });

    if (!absensi) {
      throw new Error(`Absensi dengan ID ${absensiId} tidak ditemukan`);
    }

    const dolingId = absensi.doaLingkunganId;

    // Gunakan transaksi untuk konsistensi data
    await prisma.$transaction(async (tx) => {
      // Hapus absensi
      await tx.absensiDoling.delete({
        where: { id: absensiId }
      });

      // Update jumlahKKHadir pada doa lingkungan
      const hadirCount = await tx.absensiDoling.count({
        where: {
          doaLingkunganId: dolingId,
          hadir: true,
        },
      });

      await tx.doaLingkungan.update({
        where: { id: dolingId },
        data: { jumlahKKHadir: hadirCount }
      });

    });

    revalidatePath("/kesekretariatan/doling");
  } catch (error) {
    console.error("Error deleting absensi:", error);
    throw new Error(`Gagal menghapus absensi: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
} 