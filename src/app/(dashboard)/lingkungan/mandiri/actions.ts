"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { 
  transactionFormSchema, 
  printPdfSchema, 
  setDuesSchema, 
  submitToParokiSchema, 
  sendReminderSchema,
  DanaMandiriArrears
} from "./types"
import { z } from "zod"
import { calculateDanaMandiriArrearsDetailed } from "../../dashboard/utils/arrears-utils"

// Mendapatkan data transaksi dana mandiri
export async function getDanaMandiriTransactions(year?: number) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      throw new Error("Anda harus login untuk mengakses data ini")
    }

    // Filter berdasarkan tahun jika disediakan
    const filter = year ? { tahun: year } : {}

    // Dapatkan transaksi dari database
    const transactions = await prisma.danaMandiri.findMany({
      where: filter,
      select: {
        id: true,
        keluargaId: true,
        tahun: true,
        jumlahDibayar: true,
        tanggal: true,
        bulan: true,
        statusSetor: true,
        tanggalSetor: true,
        statusPembayaran: true,
        periodeBayar: true,
        totalIuran: true,
        keluarga: {
          select: {
            id: true,
            namaKepalaKeluarga: true,
            alamat: true,
            nomorTelepon: true,
          }
        }
      },
      orderBy: {
        tanggal: 'desc'
      }
    })

    return { success: true, data: transactions }
  } catch (error) {
    console.error("Error saat mengambil data transaksi:", error)
    return { success: false, error: "Gagal mengambil data transaksi" }
  }
}

// Mendapatkan ringkasan dana mandiri (total terkumpul, jumlah KK lunas, jumlah KK belum lunas)
export async function getDanaMandiriSummary(year: number) {
  try {
    // Dapatkan tahun saat ini jika tidak disediakan
    const targetYear = year || new Date().getFullYear()

    // Dapatkan pengaturan iuran untuk tahun tersebut
    const setting = await prisma.danaMandiriSetting.findFirst({
      where: { tahun: targetYear }
    })

    if (!setting) {
      return { 
        success: true, 
        data: {
          totalTerkumpul: 0,
          jumlahKKLunas: 0,
          jumlahKKBelumLunas: 0
        } 
      }
    }

    // Dapatkan semua keluarga aktif
    const totalKeluarga = await prisma.keluargaUmat.count({
      where: {
        tanggalKeluar: null,
        status: "HIDUP"
      }
    })

    // Dapatkan keluarga dengan data pembayaran dana mandiri
    const keluargaWithPayments = await prisma.keluargaUmat.findMany({
      where: {
        tanggalKeluar: null,
        status: "HIDUP"
      },
      select: {
        id: true,
        danaMandiri: {
          where: { tahun: targetYear },
          select: {
            jumlahDibayar: true,
            statusPembayaran: true,
            totalIuran: true,
          }
        }
      }
    })

    // Hitung total terkumpul
    const totalTerkumpul = await prisma.danaMandiri.aggregate({
      _sum: {
        jumlahDibayar: true
      },
      where: {
        tahun: targetYear
      }
    })

    // Hitung keluarga lunas dan belum lunas
    let jumlahKKLunas = 0
    let jumlahKKBelumLunas = 0

    for (const keluarga of keluargaWithPayments) {
      if (keluarga.danaMandiri.length === 0) {
        // Belum ada pembayaran sama sekali
        jumlahKKBelumLunas++
      } else {
        const pembayaran = keluarga.danaMandiri[0]
        
        if (pembayaran.statusPembayaran === "lunas") {
          jumlahKKLunas++
        } else if (pembayaran.statusPembayaran === "sebagian_bulan") {
          const totalExpected = pembayaran.totalIuran || setting.jumlahIuran
          const sisaTunggakan = totalExpected - pembayaran.jumlahDibayar
          
          if (sisaTunggakan <= 0) {
            jumlahKKLunas++
          } else {
            jumlahKKBelumLunas++
          }
        } else if (pembayaran.statusPembayaran === "belum_ada_pembayaran") {
          jumlahKKBelumLunas++
        } else {
          // Fallback: hitung berdasarkan total yang sudah dibayar vs yang seharusnya
          const totalDibayar = keluarga.danaMandiri.reduce((sum, payment) => sum + payment.jumlahDibayar, 0)
          
          if (totalDibayar >= setting.jumlahIuran) {
            jumlahKKLunas++
          } else {
            jumlahKKBelumLunas++
          }
        }
      }
    }

    return { 
      success: true, 
      data: {
        totalTerkumpul: totalTerkumpul._sum.jumlahDibayar || 0,
        jumlahKKLunas,
        jumlahKKBelumLunas
      } 
    }
  } catch (error) {
    console.error("Error saat mengambil ringkasan dana mandiri:", error)
    return { success: false, error: "Gagal mengambil ringkasan dana mandiri" }
  }
}

// Mendapatkan data keluarga untuk dropdown
export async function getKeluargaList() {
  try {
    const keluarga = await prisma.keluargaUmat.findMany({
      select: {
        id: true,
        namaKepalaKeluarga: true,
        alamat: true,
        nomorTelepon: true
      },
      orderBy: {
        namaKepalaKeluarga: 'asc'
      }
    })

    return { success: true, data: keluarga }
  } catch (error) {
    console.error("Error saat mengambil data keluarga:", error)
    return { success: false, error: "Gagal mengambil data keluarga" }
  }
}

// Tambah transaksi dana mandiri baru
export async function addDanaMandiriTransaction(formData: FormData) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user.role !== "BENDAHARA" && session.user.role !== "WAKIL_BENDAHARA" && session.user.role !== "SUPER_USER")) {
      throw new Error("Anda tidak memiliki izin untuk menambahkan transaksi")
    }

    // Parse dan validasi data form
    const validatedData = transactionFormSchema.parse({
      familyHeadId: formData.get("familyHeadId"),
      year: parseInt(formData.get("year") as string),
      amount: parseFloat(formData.get("amount") as string),
      statusPembayaran: formData.get("statusPembayaran") || "lunas",
      periodeBayar: formData.get("periodeBayar") ? parseInt(formData.get("periodeBayar") as string) : undefined,
    })

    // Ambil setting iuran untuk tahun tersebut
    const setting = await prisma.danaMandiriSetting.findUnique({
      where: { tahun: validatedData.year }
    })

    const currentDate = new Date()

    // Buat transaksi baru di database
    const transaction = await prisma.danaMandiri.create({
      data: {
        keluargaId: validatedData.familyHeadId as string,
        tahun: validatedData.year,
        jumlahDibayar: validatedData.amount,
        tanggal: currentDate,
        bulan: currentDate.getMonth() + 1, // Bulan dari 1-12
        statusSetor: false,
        statusPembayaran: validatedData.statusPembayaran,
        periodeBayar: validatedData.periodeBayar,
        totalIuran: setting?.jumlahIuran || 0,
      }
    })

    // Buat notifikasi untuk pengguna terkait (jika pengguna terdaftar)
    const keluarga = await prisma.keluargaUmat.findUnique({
      where: { id: validatedData.familyHeadId as string },
      include: {
        users: true
      }
    })

    if (keluarga?.users.length) {
      // Buat notifikasi untuk setiap pengguna terkait
      for (const user of keluarga.users) {
        await prisma.notification.create({
          data: {
            userId: user.id,
            pesan: `Pembayaran Dana Mandiri tahun ${validatedData.year} sebesar ${validatedData.amount.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })} telah dicatat.`,
            dibaca: false
          }
        })
      }
    }

    revalidatePath("/lingkungan/mandiri")
    return { success: true, data: transaction }
  } catch (error) {
    console.error("Error saat menambahkan transaksi:", error)
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    return { success: false, error: "Gagal menambahkan transaksi" }
  }
}

// Update transaksi dana mandiri
export async function updateDanaMandiriTransaction(formData: FormData) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user.role !== "BENDAHARA" && session.user.role !== "WAKIL_BENDAHARA" && session.user.role !== "SUPER_USER")) {
      throw new Error("Anda tidak memiliki izin untuk mengubah transaksi")
    }

    // Ambil ID dari formData
    const id = formData.get("id") as string
    if (!id) {
      throw new Error("ID transaksi diperlukan")
    }

    // Periksa apakah transaksi sudah disetor ke paroki
    const existingTransaction = await prisma.danaMandiri.findUnique({
      where: { id }
    })

    if (!existingTransaction) {
      throw new Error("Transaksi tidak ditemukan")
    }

    if (existingTransaction.statusSetor && session.user.role !== "SUPER_USER") {
      throw new Error("Transaksi yang sudah disetor ke paroki tidak dapat diubah")
    }

    // Parse dan validasi data form
    const validatedData = transactionFormSchema.parse({
      familyHeadId: formData.get("familyHeadId"),
      year: parseInt(formData.get("year") as string),
      amount: parseFloat(formData.get("amount") as string),
      statusPembayaran: formData.get("statusPembayaran") || "lunas",
      periodeBayar: formData.get("periodeBayar") ? parseInt(formData.get("periodeBayar") as string) : undefined,
    })

    // Ambil setting iuran untuk tahun tersebut
    const setting = await prisma.danaMandiriSetting.findUnique({
      where: { tahun: validatedData.year }
    })

    // Update transaksi di database
    const updatedTransaction = await prisma.danaMandiri.update({
      where: { id },
      data: {
        keluargaId: validatedData.familyHeadId as string,
        tahun: validatedData.year,
        jumlahDibayar: validatedData.amount,
        tanggal: new Date(),
        bulan: new Date().getMonth() + 1, // Bulan dari 1-12
        statusSetor: false,
        statusPembayaran: validatedData.statusPembayaran,
        periodeBayar: validatedData.periodeBayar,
        totalIuran: setting?.jumlahIuran || 0,
      }
    })

    revalidatePath("/lingkungan/mandiri")
    return { success: true, data: updatedTransaction }
  } catch (error) {
    console.error("Error saat mengubah transaksi:", error)
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    return { success: false, error: error instanceof Error ? error.message : "Gagal mengubah transaksi" }
  }
}

// Hapus transaksi dana mandiri
export async function deleteDanaMandiriTransaction(id: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user.role !== "BENDAHARA" && session.user.role !== "WAKIL_BENDAHARA" && session.user.role !== "SUPER_USER")) {
      throw new Error("Anda tidak memiliki izin untuk menghapus transaksi")
    }

    // Periksa apakah transaksi sudah disetor ke paroki
    const transaction = await prisma.danaMandiri.findUnique({
      where: { id }
    })

    if (!transaction) {
      throw new Error("Transaksi tidak ditemukan")
    }

    if (transaction.statusSetor) {
      throw new Error("Transaksi yang sudah disetor ke paroki tidak dapat dihapus")
    }

    // Hapus transaksi dari database
    await prisma.danaMandiri.delete({
      where: { id }
    })

    revalidatePath("/lingkungan/mandiri")
    return { success: true }
  } catch (error) {
    console.error("Error saat menghapus transaksi:", error)
    return { success: false, error: error instanceof Error ? error.message : "Gagal menghapus transaksi" }
  }
}

// Setor transaksi ke paroki
export async function submitToParoki(formData: FormData) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user.role !== "BENDAHARA" && session.user.role !== "WAKIL_BENDAHARA" && session.user.role !== "SUPER_USER")) {
      throw new Error("Anda tidak memiliki izin untuk menyetor ke paroki")
    }

    // Parse dan validasi data
    const transactionIds = formData.get("transactionIds") as string
    const submissionDate = new Date(formData.get("submissionDate") as string)
    const submissionNote = formData.get("submissionNote") as string || ""

    if (!transactionIds || !submissionDate) {
      throw new Error("Data penyetoran tidak lengkap")
    }

    const ids = transactionIds.split(",")

    // Update status semua transaksi yang dipilih
    const updatedTransactions = await prisma.$transaction(
      ids.map(id => 
        prisma.danaMandiri.update({
          where: { id },
          data: {
            statusSetor: true,
            tanggalSetor: submissionDate
          }
        })
      )
    )

    // Buat notifikasi untuk setiap keluarga yang dananya disetor
    for (const transaction of updatedTransactions) {
      const keluarga = await prisma.keluargaUmat.findUnique({
        where: { id: transaction.keluargaId },
        include: {
          users: true
        }
      })

      if (keluarga?.users.length) {
        // Buat notifikasi untuk setiap pengguna terkait
        for (const user of keluarga.users) {
          await prisma.notification.create({
            data: {
              userId: user.id,
              pesan: `Dana Mandiri tahun ${transaction.tahun} telah disetor ke paroki pada tanggal ${submissionDate.toLocaleDateString('id-ID')}.`,
              dibaca: false
            }
          })
        }
      }
    }

    revalidatePath("/lingkungan/mandiri")
    return { success: true, data: updatedTransactions }
  } catch (error) {
    console.error("Error saat menyetor ke paroki:", error)
    return { success: false, error: error instanceof Error ? error.message : "Gagal menyetor ke paroki" }
  }
}

// Mendapatkan data tunggakan dana mandiri
export async function getDanaMandiriArrears() {
  try {
    const currentYear = new Date().getFullYear();
    
    // Gunakan utilitas untuk menghitung tunggakan dengan format detail
    const arrearsData = await calculateDanaMandiriArrearsDetailed(currentYear);
    
    return arrearsData;
  } catch (error) {
    console.error("Error getting dana mandiri arrears:", error);
    return [];
  }
}

// Kirim pengingat notifikasi
export async function sendReminderNotifications(formData: FormData) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user.role !== "BENDAHARA" && session.user.role !== "WAKIL_BENDAHARA" && session.user.role !== "SUPER_USER")) {
      throw new Error("Anda tidak memiliki izin untuk mengirim pengingat")
    }

    // Parse dan validasi data
    const keluargaIds = (formData.get("familyHeadIds") as string).split(",")
    const message = formData.get("message") as string

    if (!keluargaIds.length || !message) {
      throw new Error("Data pengingat tidak lengkap")
    }

    // Dapatkan user untuk setiap keluarga yang dipilih
    const keluargaWithUsers = await prisma.keluargaUmat.findMany({
      where: {
        id: {
          in: keluargaIds
        }
      },
      include: {
        users: true
      }
    })

    // Buat notifikasi untuk setiap pengguna
    const notificationPromises = []
    for (const keluarga of keluargaWithUsers) {
      for (const user of keluarga.users) {
        notificationPromises.push(
          prisma.notification.create({
            data: {
              userId: user.id,
              pesan: message,
              dibaca: false
            }
          })
        )
      }
    }

    // Kirim semua notifikasi
    await Promise.all(notificationPromises)

    return { success: true, count: notificationPromises.length }
  } catch (error) {
    console.error("Error saat mengirim pengingat:", error)
    return { success: false, error: error instanceof Error ? error.message : "Gagal mengirim pengingat" }
  }
}

// Set jumlah iuran dana mandiri
export async function setDanaMandiriDues(formData: FormData) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user.role !== "BENDAHARA" && session.user.role !== "WAKIL_BENDAHARA" && session.user.role !== "SUPER_USER")) {
      throw new Error("Anda tidak memiliki izin untuk mengatur iuran dana mandiri")
    }

    const year = parseInt(formData.get("year") as string)
    const amount = parseFloat(formData.get("amount") as string)

    if (!year || !amount) {
      throw new Error("Data iuran tidak lengkap")
    }

    // Simpan pengaturan di database
    await prisma.danaMandiriSetting.upsert({
      where: {
        tahun: year
      },
      update: {
        jumlahIuran: amount
      },
      create: {
        tahun: year,
        jumlahIuran: amount
      }
    })
    
    // Dapatkan semua keluarga
    const keluarga = await prisma.keluargaUmat.findMany({
      select: {
        id: true,
        namaKepalaKeluarga: true,
        alamat: true,
        nomorTelepon: true,
        danaMandiri: {
          where: {
            tahun: year
          }
        }
      }
    })

    // Filter keluarga yang belum bayar untuk tahun ini
    const belumBayar = keluarga.filter(k => k.danaMandiri.length === 0)
    
    // Buat array untuk menyimpan operasi database
    const operations = [];
    
    // Mendapatkan semua pengaturan iuran dana mandiri yang ada
    const settingIuran = await prisma.danaMandiriSetting.findMany();
    
    // Proses untuk semua keluarga yang belum bayar
    for (const kel of belumBayar) {
      // Cari apakah keluarga sudah ada di daftar tunggakan
      const existingArrear = await prisma.danaMandiriArrears.findUnique({
        where: { keluargaId: kel.id }
      });
      
      if (existingArrear) {
        // Jika sudah ada, perbarui tahun tertunggak dan total tunggakan
        let tahunTertunggak = existingArrear.tahunTertunggak;
        if (!tahunTertunggak.includes(year)) {
          tahunTertunggak.push(year);
        }
        
        // Hitung ulang total tunggakan berdasarkan tahun-tahun tertunggak
        let totalTunggakan = 0;
        for (const tahun of tahunTertunggak) {
          const setting = settingIuran.find(s => s.tahun === tahun);
          if (tahun === year) {
            // Gunakan nilai iuran yang baru untuk tahun yang sedang diatur
            totalTunggakan += amount;
          } else if (setting) {
            // Gunakan nilai dari database untuk tahun lain
            totalTunggakan += setting.jumlahIuran;
          }
        }
        
        operations.push(
          prisma.danaMandiriArrears.update({
            where: { keluargaId: kel.id },
            data: {
              tahunTertunggak,
              totalTunggakan
            }
          })
        );
      } else {
        // Jika belum ada, buat baru
        operations.push(
          prisma.danaMandiriArrears.create({
            data: {
              keluargaId: kel.id,
              namaKepalaKeluarga: kel.namaKepalaKeluarga,
              alamat: kel.alamat || "",
              nomorTelepon: kel.nomorTelepon || "",
              tahunTertunggak: [year],
              totalTunggakan: amount
            }
          })
        );
      }
    }
    
    // Perbarui total tunggakan untuk keluarga yang sudah memiliki tunggakan tahun ini
    const existingArrears = await prisma.danaMandiriArrears.findMany({
      where: {
        tahunTertunggak: {
          has: year
        }
      }
    });
    
    for (const arrear of existingArrears) {
      // Hanya perbarui total tunggakan jika tahun ini termasuk dalam tunggakan
      if (arrear.tahunTertunggak.includes(year)) {
        // Hitung ulang total tunggakan
        let totalTunggakan = 0;
        for (const tahun of arrear.tahunTertunggak) {
          if (tahun === year) {
            totalTunggakan += amount;
          } else {
            const setting = settingIuran.find(s => s.tahun === tahun);
            if (setting) {
              totalTunggakan += setting.jumlahIuran;
            }
          }
        }
        
        // Hanya tambahkan ke operasi jika keluarga belum diproses sebelumnya
        const alreadyProcessed = belumBayar.some(k => k.id === arrear.keluargaId);
        if (!alreadyProcessed) {
          operations.push(
            prisma.danaMandiriArrears.update({
              where: { keluargaId: arrear.keluargaId },
              data: {
                totalTunggakan
              }
            })
          );
        }
      }
    }
    
    // Jalankan semua operasi database dalam satu transaksi
    if (operations.length > 0) {
      await prisma.$transaction(operations);
    }
    
    // Revalidasi path untuk memperbarui UI
    revalidatePath("/lingkungan/mandiri")

    return { success: true, data: { year, amount, updatedCount: operations.length } }
  } catch (error) {
    console.error("Error saat mengatur iuran dana mandiri:", error)
    return { success: false, error: error instanceof Error ? error.message : "Gagal mengatur iuran dana mandiri" }
  }
}

// Dapatkan pengaturan iuran dana mandiri berdasarkan tahun
export async function getDanaMandiriSetting(year: number) {
  try {
    // Cek hak akses (opsional, bisa dihapus jika semua pengguna boleh melihat setting)
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      throw new Error("Anda harus login untuk melihat data ini")
    }
    
    // Ambil data setting dari database
    const setting = await prisma.danaMandiriSetting.findUnique({
      where: {
        tahun: year
      }
    })
    
    // Jika tidak ada setting untuk tahun tersebut, gunakan nilai default 0
    const amount = setting?.jumlahIuran || 0
    
    return { success: true, data: { year, amount } }
  } catch (error) {
    console.error("Error saat mengambil setting iuran dana mandiri:", error)
    return { success: false, error: error instanceof Error ? error.message : "Gagal mengambil setting iuran dana mandiri" }
  }
}
