"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/db"
import { DataType } from "../types"
import { getDataTypeLabel } from "../utils"

// Parameter untuk fungsi wipe data selektif
interface WipeDataParams {
  dataType: DataType
  startDate?: Date
  endDate?: Date
}

// Parameter untuk emergency wipe
interface EmergencyWipeParams {
  confirmText: string
}

/**
 * Server action untuk menghapus data berdasarkan jenis dan rentang waktu
 */
export async function wipeDataAction(params: WipeDataParams) {
  try {
    const { dataType, startDate, endDate } = params

    // Validasi parameter
    if (!dataType) {
      return { success: false, message: "Jenis data tidak valid" }
    }

    if (!startDate || !endDate) {
      return { success: false, message: "Rentang tanggal tidak valid" }
    }

    // Persiapkan filter tanggal untuk query
    const dateFilter = {
      gte: startDate,
      lte: endDate,
    }

    // Eksekusi penghapusan berdasarkan jenis data
    let deletedCount = 0

    switch (dataType) {
      case "publikasi":
        const publikasiResult = await prisma.publikasi.deleteMany({
          where: {
            createdAt: dateFilter,
          },
        })
        deletedCount = publikasiResult.count
        break

      case "kas_lingkungan":
        const kasLingkunganResult = await prisma.kasLingkungan.deleteMany({
          where: {
            tanggal: dateFilter,
          },
        })
        deletedCount = kasLingkunganResult.count
        break

      case "dana_mandiri":
        const danaMandiriResult = await prisma.danaMandiri.deleteMany({
          where: {
            tanggal: dateFilter,
          },
        })
        deletedCount = danaMandiriResult.count
        break

      case "kas_ikata":
        const kasIkataResult = await prisma.kasIkata.deleteMany({
          where: {
            tanggal: dateFilter,
          },
        })
        deletedCount = kasIkataResult.count
        break

      case "doling":
        // Hapus terlebih dahulu data yang terkait (absensi)
        await prisma.absensiDoling.deleteMany({
          where: {
            doaLingkungan: {
              tanggal: dateFilter,
            },
          },
        })

        // Hapus juga data approval yang terkait
        await prisma.approval.deleteMany({
          where: {
            doaLingkungan: {
              tanggal: dateFilter,
            },
          },
        })

        // Hapus data utama
        const doaLingkunganResult = await prisma.doaLingkungan.deleteMany({
          where: {
            tanggal: dateFilter,
          },
        })
        deletedCount = doaLingkunganResult.count
        break

      case "agenda":
        const agendaResult = await prisma.pengajuan.deleteMany({
          where: {
            tanggal: dateFilter,
          },
        })
        deletedCount = agendaResult.count
        break

      case "semua":
        // Hapus data dari semua model dengan urutan yang benar (menghindari constraint violation)
        
        // 1. Hapus data yang tidak memiliki constraint terlebih dahulu
        await prisma.notification.deleteMany({
          where: {
            createdAt: dateFilter,
          },
        })

        await prisma.absensiDoling.deleteMany({
          where: {
            createdAt: dateFilter,
          },
        })

        await prisma.approval.deleteMany({
          where: {
            createdAt: dateFilter,
          },
        })

        // 2. Hapus data yang memiliki foreign key ke model lain
        await prisma.kasLingkungan.deleteMany({
          where: {
            tanggal: dateFilter,
          },
        })

        await prisma.danaMandiri.deleteMany({
          where: {
            tanggal: dateFilter,
          },
        })

        await prisma.iuranIkata.deleteMany({
          where: {
            createdAt: dateFilter,
          },
        })

        await prisma.doaLingkungan.deleteMany({
          where: {
            tanggal: dateFilter,
          },
        })

        await prisma.publikasi.deleteMany({
          where: {
            createdAt: dateFilter,
          },
        })

        await prisma.pengajuan.deleteMany({
          where: {
            tanggal: dateFilter,
          },
        })

        await prisma.kasIkata.deleteMany({
          where: {
            tanggal: dateFilter,
          },
        })

        deletedCount = -1 // Tidak menghitung total untuk penghapusan semua data
        break

      default:
        return { success: false, message: "Jenis data tidak valid" }
    }

    revalidatePath("/pengaturan/wipe")
    return { 
      success: true, 
      message: `${dataType === "semua" ? "Semua data" : getDataTypeLabel(dataType)} berhasil dihapus${deletedCount >= 0 ? ` (${deletedCount} entri)` : ""}` 
    }
  } catch (error) {
    console.error("Error wiping data:", error)
    return { success: false, message: "Terjadi kesalahan saat menghapus data" }
  }
}

/**
 * Server action untuk emergency wipe (menghapus semua data)
 */
export async function emergencyWipeAction(params: EmergencyWipeParams) {
  try {
    const { confirmText } = params

    // Validasi konfirmasi
    if (confirmText !== "EMERGENCY WIPE") {
      return { success: false, message: "Konfirmasi tidak valid" }
    }

    // Hapus semua data dalam urutan yang benar (untuk menghindari constraint violation)
    
    // 1. Hapus data yang tidak memiliki constraint terlebih dahulu
    await prisma.notification.deleteMany({})
    await prisma.absensiDoling.deleteMany({})
    await prisma.approval.deleteMany({})
    
    // 2. Hapus data yang memiliki foreign key ke model lain
    await prisma.kasLingkungan.deleteMany({})
    await prisma.danaMandiri.deleteMany({})
    await prisma.iuranIkata.deleteMany({})
    await prisma.doaLingkungan.deleteMany({})
    await prisma.publikasi.deleteMany({})
    await prisma.pengajuan.deleteMany({})
    await prisma.kasIkata.deleteMany({})
    
    // 3. Hapus data Tanggungan yang mereferensi ke KeluargaUmat
    await prisma.tanggungan.deleteMany({})
    
    // 4. Hapus data Pasangan yang mereferensi ke KeluargaUmat
    await prisma.pasangan.deleteMany({})
    
    // 5. Update User untuk menghapus referensi ke KeluargaUmat
    await prisma.user.updateMany({
      where: { keluargaId: { not: null } },
      data: { keluargaId: null }
    })
    
    // 6. Hapus data KeluargaUmat
    await prisma.keluargaUmat.deleteMany({})

    revalidatePath("/pengaturan/wipe")
    return { success: true, message: "Emergency wipe berhasil dilakukan. Semua data telah dihapus." }
  } catch (error) {
    console.error("Error performing emergency wipe:", error)
    return { success: false, message: "Terjadi kesalahan saat melakukan emergency wipe" }
  }
} 