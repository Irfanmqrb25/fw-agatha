"use server"

import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"

export async function verifyPassphrase(userId: string, passphrase: string) {
  try {
    if (!userId || !passphrase) {
      return { error: "Data tidak lengkap" }
    }

    // Cari user berdasarkan ID
    const user = await prisma.user.findUnique({
      where: {
        id: userId
      }
    })

    if (!user) {
      return { error: "User tidak ditemukan" }
    }

    // Verifikasi passphrase dengan bcrypt
    const isPassphraseValid = await bcrypt.compare(passphrase, user.passphrase)

    if (!isPassphraseValid) {
      return { error: "Passphrase tidak valid" }
    }

    // Jika passphrase valid
    return { 
      verified: true,
      user: {
        id: user.id
      }
    }
  } catch (error) {
    console.error("Error verifying passphrase:", error)
    return { error: "Terjadi kesalahan saat memverifikasi passphrase" }
  }
} 