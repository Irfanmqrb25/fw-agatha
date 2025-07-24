"use server"

import { prisma } from "@/lib/db"

export async function verifyFamilyHead(name: string) {
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
        users: true // Include users untuk mendapatkan akun
      }
    })

    if (!keluargaUmat) {
      return { error: "Nama Kepala Keluarga tidak ditemukan atau tidak aktif" }
    }

    // Cek apakah Kepala Keluarga memiliki akun
    if (keluargaUmat.users.length === 0) {
      return { error: "Kepala Keluarga belum memiliki akun" }
    }

    // Jika verifikasi berhasil
    return { 
      verified: true, 
      familyHead: {
        id: keluargaUmat.id,
        name: keluargaUmat.namaKepalaKeluarga,
        userId: keluargaUmat.users[0].id // Ambil ID user pertama
      }
    }
  } catch (error) {
    console.error("Error verifying family head:", error)
    return { error: "Terjadi kesalahan saat memverifikasi Kepala Keluarga" }
  }
} 