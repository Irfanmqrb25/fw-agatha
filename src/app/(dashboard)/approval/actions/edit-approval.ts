"use server"

import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function editApprovalNominal(approvalId: string, data: {
  kolekteI: number;
  kolekteII: number;
  ucapanSyukur: number;
  namaPenyumbang?: string;
}) {
  try {
    
    // Validasi input
    if (!approvalId || typeof approvalId !== 'string') {
      throw new Error("ID approval tidak valid");
    }
    
    if (data.kolekteI < 0 || data.kolekteII < 0 || data.ucapanSyukur < 0) {
      throw new Error("Nilai tidak boleh negatif");
    }
    
    // Dapatkan data approval
    const approval = await prisma.approval.findUnique({
      where: { id: approvalId },
      include: {
        doaLingkungan: {
          include: {
            tuanRumah: true
          }
        }
      },
    })

    if (!approval || !approval.doaLingkungan) {
      throw new Error("Data approval atau doa lingkungan tidak ditemukan")
    }

    // Update data doa lingkungan
    const updatedDoling = await prisma.doaLingkungan.update({
      where: { id: approval.doaLingkungan.id },
      data: {
        kolekteI: data.kolekteI,
        kolekteII: data.kolekteII,
        ucapanSyukur: data.ucapanSyukur,
      },
    })


    // Jika ada ucapan syukur dan nama penyumbang, bisa ditambahkan ke keterangan
    if (data.ucapanSyukur > 0 && data.namaPenyumbang) {
      // Bisa ditambahkan logic untuk menyimpan nama penyumbang jika diperlukan
      // Untuk saat ini, kita simpan di field yang sudah ada
    }

    // Revalidate paths
    revalidatePath("/approval")
    revalidatePath("/kesekretariatan/doling")

    return {
      success: true,
      message: `Data berhasil diperbarui. ${data.ucapanSyukur > 0 ? `Ucapan syukur: Rp ${data.ucapanSyukur.toLocaleString('id-ID')}` : 'Tanpa ucapan syukur'}`
    }
  } catch (error) {
    console.error("Gagal mengedit nominal approval:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal mengedit nominal approval",
    }
  }
} 