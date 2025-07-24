"use server"

import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { hash, compare } from "bcryptjs"
import { revalidatePath } from "next/cache"

interface ChangePasswordResponse {
  success: boolean
  message: string
}

export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<ChangePasswordResponse> {
  try {
    // Validasi input
    if (!currentPassword || !newPassword) {
      return {
        success: false,
        message: "Password tidak boleh kosong"
      }
    }

    // Verifikasi pattern password baru
    const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/
    if (!passwordPattern.test(newPassword)) {
      return {
        success: false,
        message: "Password harus terdiri dari minimal 8 karakter, mengandung huruf dan angka"
      }
    }

    // Dapatkan session user
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return {
        success: false,
        message: "Tidak ada session yang aktif"
      }
    }

    // Dapatkan user dari database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user) {
      return {
        success: false,
        message: "User tidak ditemukan"
      }
    }

    // Verifikasi password lama
    const isPasswordValid = await compare(currentPassword, user.password)
    if (!isPasswordValid) {
      return {
        success: false,
        message: "Password saat ini tidak valid"
      }
    }

    // Hashing password baru
    const hashedPassword = await hash(newPassword, 12)

    // Update password di database
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    })

    // Buat notifikasi password berhasil diubah
    await prisma.notification.create({
      data: {
        pesan: "Password Anda telah berhasil diubah.",
        dibaca: false,
        userId: user.id
      }
    })

    // Revalidasi path untuk memperbarui UI
    revalidatePath("/pengaturan/password")

    return {
      success: true,
      message: "Password berhasil diubah"
    }
  } catch (error) {
    console.error("Kesalahan saat mengubah password:", error)
    return {
      success: false,
      message: "Terjadi kesalahan saat mengubah password"
    }
  }
} 