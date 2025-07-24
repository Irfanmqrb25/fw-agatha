'use server'

import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { KlasifikasiPublikasi, Role } from "@prisma/client"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { z } from "zod"

// Schema validasi untuk publikasi baru
const publikasiSchema = z.object({
  judul: z.string().min(1, "Judul wajib diisi"),
  isi: z.string().min(1, "Isi wajib diisi"),
  klasifikasi: z.nativeEnum(KlasifikasiPublikasi),
  targetPenerima: z.array(z.nativeEnum(Role)).min(1, "Minimal satu penerima harus dipilih"),
  deadline: z.date().nullable(),
  lampiran: z.array(z.string()).optional(),
})

export type PublikasiFormData = z.infer<typeof publikasiSchema>

// Mengambil semua publikasi
export async function getPublikasi() {
  try {
    const publikasi = await prisma.publikasi.findMany({
      include: {
        pembuat: {
          select: {
            username: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
    
    return { success: true, data: publikasi }
  } catch (error) {
    console.error("Error fetching publikasi:", error)
    return { success: false, error: "Gagal mengambil data publikasi" }
  }
}

// Membuat publikasi baru
export async function createPublikasi(formData: PublikasiFormData) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return { success: false, error: "Anda harus login untuk membuat publikasi" }
    }

    const userRole = session.user.role as string
    const userId = session.user.id as string

    // Pastikan yang membuat adalah pengguna dengan role yang diizinkan
    if (!['SUPER_USER', 'SEKRETARIS', 'WAKIL_SEKRETARIS'].includes(userRole)) {
      return { success: false, error: "Anda tidak memiliki izin untuk membuat publikasi" }
    }

    // Validasi data
    const validatedData = publikasiSchema.parse(formData)

    // Buat publikasi baru
    const newPublikasi = await prisma.publikasi.create({
      data: {
        ...validatedData,
        pembuatId: userId,
      },
    })

    // Buat notifikasi untuk target penerima
    for (const role of formData.targetPenerima) {
      const targetUsers = await prisma.user.findMany({
        where: { role },
      })

      for (const user of targetUsers) {
        await prisma.notification.create({
          data: {
            pesan: `Pengumuman baru: ${formData.judul}`,
            userId: user.id,
          },
        })
      }
    }

    revalidatePath('/publikasi')
    return { success: true, data: newPublikasi }
  } catch (error) {
    console.error("Error creating publikasi:", error)
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    return { success: false, error: "Gagal membuat publikasi baru" }
  }
}

// Mendapatkan detail publikasi berdasarkan ID
export async function getPublikasiById(id: string) {
  try {
    const publikasi = await prisma.publikasi.findUnique({
      where: { id },
      include: {
        pembuat: {
          select: {
            username: true,
            role: true,
          },
        },
      },
    })
    
    if (!publikasi) {
      return { success: false, error: "Publikasi tidak ditemukan" }
    }
    
    return { success: true, data: publikasi }
  } catch (error) {
    console.error("Error fetching publikasi detail:", error)
    return { success: false, error: "Gagal mengambil detail publikasi" }
  }
}

// Memperbarui publikasi
export async function updatePublikasi(id: string, formData: PublikasiFormData) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return { success: false, error: "Anda harus login untuk memperbarui publikasi" }
    }

    const userId = session.user.id as string
    const userRole = session.user.role as string

    // Pastikan yang mengedit adalah pembuat atau admin
    const publikasi = await prisma.publikasi.findUnique({
      where: { id },
      select: { pembuatId: true },
    })

    if (!publikasi) {
      return { success: false, error: "Publikasi tidak ditemukan" }
    }

    if (publikasi.pembuatId !== userId && userRole !== 'SUPER_USER') {
      return { success: false, error: "Anda tidak memiliki izin untuk mengedit publikasi ini" }
    }

    // Validasi data
    const validatedData = publikasiSchema.parse(formData)

    // Update publikasi
    const updatedPublikasi = await prisma.publikasi.update({
      where: { id },
      data: validatedData,
    })

    revalidatePath('/publikasi')
    return { success: true, data: updatedPublikasi }
  } catch (error) {
    console.error("Error updating publikasi:", error)
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    return { success: false, error: "Gagal memperbarui publikasi" }
  }
}

// Menghapus publikasi
export async function deletePublikasi(id: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return { success: false, error: "Anda harus login untuk menghapus publikasi" }
    }

    const userId = session.user.id as string
    const userRole = session.user.role as string

    // Pastikan yang menghapus adalah pembuat atau admin
    const publikasi = await prisma.publikasi.findUnique({
      where: { id },
      select: { pembuatId: true },
    })

    if (!publikasi) {
      return { success: false, error: "Publikasi tidak ditemukan" }
    }

    if (publikasi.pembuatId !== userId && userRole !== 'SUPER_USER') {
      return { success: false, error: "Anda tidak memiliki izin untuk menghapus publikasi ini" }
    }

    // Hapus notifikasi terkait publikasi
    await prisma.notification.deleteMany({
      where: {
        pesan: {
          contains: id,
        },
      },
    })

    // Hapus publikasi
    await prisma.publikasi.delete({
      where: { id },
    })

    revalidatePath('/publikasi')
    return { success: true }
  } catch (error) {
    console.error("Error deleting publikasi:", error)
    return { success: false, error: "Gagal menghapus publikasi" }
  }
}

// Mengirim notifikasi untuk publikasi yang sudah ada
export async function sendPublikasiNotification(id: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return { success: false, error: "Anda harus login untuk mengirim notifikasi" }
    }

    const publikasi = await prisma.publikasi.findUnique({
      where: { id },
    })

    if (!publikasi) {
      return { success: false, error: "Publikasi tidak ditemukan" }
    }

    // Kirim notifikasi ke target penerima
    for (const role of publikasi.targetPenerima) {
      const targetUsers = await prisma.user.findMany({
        where: { role },
      })

      for (const user of targetUsers) {
        await prisma.notification.create({
          data: {
            pesan: `Pengingat: ${publikasi.judul}`,
            userId: user.id,
          },
        })
      }
    }

    revalidatePath('/publikasi')
    return { success: true }
  } catch (error) {
    console.error("Error sending notification:", error)
    return { success: false, error: "Gagal mengirim notifikasi" }
  }
}

// Mengunci/membuka kunci publikasi
export async function lockPublikasi(id: string, locked: boolean) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return { success: false, error: "Anda harus login untuk mengunci/membuka kunci publikasi" }
    }

    const userId = session.user.id as string
    const userRole = session.user.role as string

    // Pastikan yang mengunci adalah pembuat atau admin
    const publikasi = await prisma.publikasi.findUnique({
      where: { id },
      select: { pembuatId: true },
    })

    if (!publikasi) {
      return { success: false, error: "Publikasi tidak ditemukan" }
    }

    if (publikasi.pembuatId !== userId && userRole !== 'SUPER_USER') {
      return { success: false, error: "Anda tidak memiliki izin untuk mengunci/membuka kunci publikasi ini" }
    }

    // Ubah status locked publikasi
    const updatedPublikasi = await prisma.publikasi.update({
      where: { id },
      data: { locked },
    })

    revalidatePath('/publikasi')
    return { success: true, data: updatedPublikasi }
  } catch (error) {
    console.error("Error locking/unlocking publikasi:", error)
    return { success: false, error: "Gagal mengunci/membuka kunci publikasi" }
  }
}

// Fungsi untuk membuat laporan publikasi
export async function createLaporanPublikasi(data: {
  jenis: string;
  keterangan: string;
  publikasiId: string;
}) {
  try {
    const result = await prisma.laporanPublikasi.create({
      data: {
        jenis: data.jenis,
        keterangan: data.keterangan,
        publikasiId: data.publikasiId,
      }
    });

    return {
      success: true,
      data: result
    };
  } catch (error) {
    console.error("Gagal membuat laporan publikasi:", error);
    return {
      success: false,
      error: "Terjadi kesalahan saat membuat laporan publikasi"
    };
  }
}

// Fungsi untuk mendapatkan semua laporan publikasi berdasarkan ID publikasi
export async function getLaporanByPublikasiId(publikasiId: string) {
  try {
    const laporan = await prisma.laporanPublikasi.findMany({
      where: {
        publikasiId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return {
      success: true,
      data: laporan
    };
  } catch (error) {
    console.error("Gagal mendapatkan laporan publikasi:", error);
    return {
      success: false,
      error: "Terjadi kesalahan saat mendapatkan laporan publikasi"
    };
  }
} 