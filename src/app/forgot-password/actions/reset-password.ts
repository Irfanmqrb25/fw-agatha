"use server"

import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"

export async function resetPassword(userId: string, newPassword: string) {
  try {
    if (!userId || !newPassword) {
      return { error: "Data tidak lengkap" }
    }

    // Validasi password
    if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(newPassword)) {
      return { 
        error: "Password harus terdiri dari minimal 8 karakter, mengandung huruf dan angka" 
      }
    }

    // Hash password baru
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Update password user
    await prisma.user.update({
      where: {
        id: userId
      },
      data: {
        password: hashedPassword,
        updatedAt: new Date() // Update timestamp
      }
    })

    return { 
      success: true,
      message: "Password berhasil diubah"
    }
  } catch (error) {
    console.error("Error resetting password:", error)
    return { error: "Terjadi kesalahan saat reset password" }
  }
} 