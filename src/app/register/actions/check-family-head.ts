"use server"

import { prisma } from "@/lib/db"

export async function checkFamilyHead(name: string) {
  try {
    if (!name || name.trim() === "") {
      return { error: "Nama Kepala Keluarga tidak boleh kosong" }
    }

    // Cari KeluargaUmat berdasarkan nama kepala keluarga
    const keluargaUmat = await prisma.keluargaUmat.findFirst({
      where: {
        namaKepalaKeluarga: name,
        status: "HIDUP", // Hanya keluarga dengan status hidup
        tanggalKeluar: null // Belum pindah/keluar
      },
      include: {
        users: true // Include users untuk memeriksa apakah sudah memiliki akun
      }
    })

    if (!keluargaUmat) {
      return { error: "Nama Kepala Keluarga tidak ditemukan atau tidak aktif" }
    }

    // Cek apakah Kepala Keluarga sudah memiliki akun
    if (keluargaUmat.users.length > 0) {
      return { error: "Nama Kepala Keluarga sudah memiliki akun" }
    }

    // Jika verifikasi berhasil
    return { 
      verified: true, 
      familyHead: {
        id: keluargaUmat.id,
        name: keluargaUmat.namaKepalaKeluarga,
        address: keluargaUmat.alamat
      }
    }
  } catch (error) {
    console.error("Error checking family head:", error)
    return { error: "Terjadi kesalahan saat memverifikasi Kepala Keluarga" }
  }
} 