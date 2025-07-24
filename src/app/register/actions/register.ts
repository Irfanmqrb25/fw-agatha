"use server"

import { prisma } from "@/lib/db" // Menggunakan prisma client dari lib/db
import bcrypt from "bcryptjs"
import { Role } from "@prisma/client"

export async function registerAction({ 
  username, 
  password, 
  passphrase, 
  familyHeadName 
}: { 
  username: string, 
  password: string, 
  passphrase: string, 
  familyHeadName: string 
}) {
  try {
    // Validasi input
    if (!username || !password || !passphrase || !familyHeadName) {
      return { error: "Data tidak lengkap" }
    }

    // Cari Kepala Keluarga berdasarkan nama
    const keluargaUmat = await prisma.keluargaUmat.findFirst({ 
      where: { 
        namaKepalaKeluarga: familyHeadName,
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

    // Cek username sudah ada
    const existingUser = await prisma.user.findUnique({ 
      where: { username } 
    })
    
    if (existingUser) {
      return { error: "Username sudah terdaftar" }
    }

    // Hash password dan passphrase
    const hashedPassword = await bcrypt.hash(password, 10)
    const hashedPassphrase = await bcrypt.hash(passphrase, 10)

    // Buat user baru dengan role UMAT
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        passphrase: hashedPassphrase,
        role: "UMAT" as Role, // Gunakan enum Role
        keluarga: {
          connect: {
            id: keluargaUmat.id // Hubungkan dengan KeluargaUmat
          }
        }
      },
    })

    return { 
      success: true, 
      message: "Pendaftaran berhasil", 
      user: { 
        id: user.id, 
        username: user.username 
      } 
    }
  } catch (error) {
    console.error("Error registering user:", error)
    return { error: "Terjadi kesalahan saat pendaftaran" }
  }
} 