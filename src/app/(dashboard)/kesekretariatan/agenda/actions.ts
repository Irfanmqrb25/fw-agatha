"use server";

import { prisma } from "@/lib/db";
import { unstable_noStore as noStore } from "next/cache";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { AgendaFormValues, AgendaAttachment } from "./types";
import { z } from "zod";
import { uploadFile, updateFile, deleteFile } from "@/lib/uploads";
import { createNotification } from "@/lib/notifications";
import { getCurrentJakartaTime } from '@/lib/date-utils';
import { Prisma, Role, StatusApproval, StatusPengajuan, TindakLanjut, UpdateStatus, HasilAkhir, TujuanPengajuan } from "@prisma/client";

// Schema validasi untuk agenda
const agendaSchema = z.object({
  title: z.string().min(3, "Judul harus minimal 3 karakter"),
  description: z.string().min(10, "Deskripsi harus minimal 10 karakter"),
  date: z.date(),
  location: z.string().min(3, "Lokasi harus minimal 3 karakter"),
  target: z.enum(["lingkungan", "stasi", "paroki"]),
});

// Tipe untuk response dari server action
type ActionResponse = {
  success: boolean;
  message: string;
  data?: any;
};

// Buat tipe untuk NotificationData dengan recipientId dan senderId sebagai string
type NotificationData = {
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  recipientId?: string;
  senderId?: string;
  relatedItemId?: number;
  relatedItemType?: string;
};

// Fungsi untuk mendapatkan daftar agenda
export async function getAgendas() {
  noStore();
  
  try {
    // Menggunakan model Agenda yang telah dibuat di Prisma
    const agendas = await prisma.pengajuan.findMany({
      where: { 
        /* Gunakan kondisi yang sesuai atau tidak perlu filter tipe */
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });
    
    return agendas;
  } catch (error) {
    console.error("Error fetching agendas:", error);
    throw new Error("Gagal mengambil data agenda");
  }
}

// Fungsi untuk mendapatkan agenda berdasarkan ID
export async function getAgendaById(id: string) {
  noStore();
  
  try {
    const agenda = await prisma.pengajuan.findUnique({
      where: { id }
    });
    
    return agenda;
  } catch (error) {
    console.error(`Error fetching agenda with id ${id}:`, error);
    return null;
  }
}

// Fungsi untuk menambahkan agenda baru
export async function createAgenda(formData: AgendaFormValues): Promise<ActionResponse> {
  noStore();
  
  try {
    // Dapatkan data user dari session
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return {
        success: false,
        message: "Tidak ada sesi yang ditemukan. Silakan login kembali."
      };
    }
    
    if (!session.user) {
      return {
        success: false,
        message: "Tidak ada data pengguna dalam sesi. Silakan login kembali."
      };
    }
    
    // Cara alternatif untuk mendapatkan userId jika tidak ada di session
    let userId: string;
    
    if (session.user.id) {
      // Gunakan ID yang ada di session
      userId = session.user.id;
    } else {
      // Cari user berdasarkan nama pengguna sebagai fallback
      const username = session.user.name;
      if (!username) {
        return {
          success: false,
          message: "Nama pengguna tidak ditemukan dalam sesi. Silakan login kembali."
        };
      }
      
      // Cari user di database
      const user = await prisma.user.findUnique({
        where: { username }
      });
      
      if (!user) {
        return {
          success: false,
          message: "Pengguna tidak ditemukan di database. Silakan login kembali."
        };
      }
      
      userId = user.id;
    }

    // Konversi target ke TujuanPengajuan enum
    let targetEnum: TujuanPengajuan;
    if (formData.target === 'lingkungan') {
      targetEnum = TujuanPengajuan.DPL;
    } else if (formData.target === 'stasi') {
      targetEnum = TujuanPengajuan.STASI;
    } else {
      targetEnum = TujuanPengajuan.PAROKI;
    }

    // Buat agenda baru dengan userId yang didapatkan
    const newAgenda = await prisma.pengajuan.create({
      data: {
        perihal: formData.title,
        alasanPenolakan: formData.description,
        tanggal: formData.date,
        tindakLanjut: null,
        tujuan: targetEnum,
        status: StatusPengajuan.OPEN,
        pengajuId: userId
      }
    });

    // Buat notifikasi untuk pengelola atau admin berdasarkan target
    // Target bisa berupa 'lingkungan', 'stasi', atau 'paroki'
    if (formData.target === 'lingkungan' || formData.target === 'stasi' || formData.target === 'paroki') {
      // Fetch users with role that matches the target
      const adminRole = formData.target === 'lingkungan' 
        ? Role.KETUA 
        : formData.target === 'stasi' 
          ? Role.WAKIL_KETUA 
          : Role.SUPER_USER;
      
      // Get admins based on role
      const admins = await prisma.user.findMany({
        where: {
          role: adminRole
        },
        select: {
          id: true
        }
      });
      
      // Create notifications for each admin using their string IDs directly
      for (const admin of admins) {
        await createNotification({
          title: "Agenda Baru Dibuat",
          message: `Agenda baru "${formData.title}" memerlukan persetujuan Anda. Silakan cek menu agenda.`,
          type: "info",
          recipientId: admin.id,
          senderId: userId,
          relatedItemId: parseInt(newAgenda.id),
          relatedItemType: "Agenda"
        } as NotificationData);
      }
    }

    // Revalidasi path agar data diperbarui
    revalidatePath('/kesekretariatan/agenda');
    
    return {
      success: true,
      message: "Agenda berhasil dibuat",
      data: newAgenda
    };
  } catch (error) {
    console.error("Error creating agenda:", error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: `Validasi gagal: ${error.errors.map(e => e.message).join(", ")}`
      };
    }
    
    // Tambahkan informasi error lebih detail
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      message: `Gagal membuat agenda: ${errorMessage}`
    };
  }
}

// Fungsi untuk memperbarui agenda yang sudah ada
export async function updateAgenda(id: string, formData: AgendaFormValues): Promise<ActionResponse> {
  noStore();
  
  try {
    // Ambil data agenda saat ini untuk pengecekan
    const currentAgenda = await prisma.pengajuan.findUnique({
      where: { id }
    });
    
    if (!currentAgenda) {
      return {
        success: false,
        message: "Agenda tidak ditemukan"
      };
    }

    // Konversi target ke TujuanPengajuan enum
    let targetEnum: TujuanPengajuan;
    if (formData.target === 'lingkungan') {
      targetEnum = TujuanPengajuan.DPL;
    } else if (formData.target === 'stasi') {
      targetEnum = TujuanPengajuan.STASI;
    } else {
      targetEnum = TujuanPengajuan.PAROKI;
    }
    
    // Update agenda tanpa memeriksa lampiran
    const updatedAgenda = await prisma.pengajuan.update({
      where: { id },
      data: {
        perihal: formData.title,
        alasanPenolakan: formData.description,
        tanggal: formData.date,
        tujuan: targetEnum,
        updatedAt: new Date()
      }
    });
    
    // Dapatkan data user untuk mengirim notifikasi
    const session = await getServerSession(authOptions);
    let senderId: string | undefined;
    
    if (session?.user?.id) {
      senderId = session.user.id;
    }
    
    // Kirim notifikasi ke pembuat agenda jika editor bukan pembuat
    if (senderId && senderId !== updatedAgenda.pengajuId) {
      await createNotification({
        title: "Agenda Diperbarui",
        message: `Agenda "${formData.title}" telah diperbarui.`,
        type: "info",
        recipientId: updatedAgenda.pengajuId,
        senderId: senderId,
        relatedItemId: parseInt(id),
        relatedItemType: "Agenda"
      } as NotificationData);
    }
    
    // Revalidasi path agar data diperbarui
    revalidatePath('/kesekretariatan/agenda');
    
    return {
      success: true,
      message: "Agenda berhasil diperbarui",
      data: updatedAgenda
    };
  } catch (error) {
    console.error("Error updating agenda:", error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: `Validasi gagal: ${error.errors.map(e => e.message).join(", ")}`
      };
    }
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      message: `Gagal memperbarui agenda: ${errorMessage}`
    };
  }
}

// Memperbaiki deleteAgenda untuk menghilangkan error
export async function deleteAgenda(agendaId: string): Promise<ActionResponse> {
  noStore();
  
  try {
    // Dapatkan data user dari session
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return {
        success: false,
        message: "Anda harus login terlebih dahulu"
      };
    }
    
    // Dapatkan agenda yang akan dihapus
    const agenda = await prisma.pengajuan.findUnique({
      where: { id: agendaId }
    });
    
    // Periksa apakah agenda ditemukan
    if (!agenda) {
      return {
        success: false,
        message: "Agenda tidak ditemukan"
      };
    }
    
    // Periksa apakah user adalah pembuat agenda atau admin
    if (agenda.pengajuId !== session.user.id && session.user.role !== Role.SUPER_USER) {
      return {
        success: false,
        message: "Anda tidak memiliki izin untuk menghapus agenda ini"
      };
    }
    
    // Hapus agenda tanpa mencoba menghapus lampiran
    await prisma.pengajuan.delete({
      where: { id: agendaId }
    });
    
    // Dapatkan data user untuk mengirim notifikasi
    let senderId: string | undefined;
    
    if (session?.user?.id) {
      senderId = session.user.id;
      
      // Kirim notifikasi ke pembuat agenda jika deleter bukan pembuat
      if (senderId !== agenda.pengajuId) {
        await createNotification({
          title: "Agenda Dihapus",
          message: `Agenda "${agenda.perihal}" telah dihapus.`,
          type: "warning",
          recipientId: agenda.pengajuId,
          senderId: senderId,
          relatedItemType: "Agenda"
        } as NotificationData);
      }
    }
    
    // Revalidasi path agar data diperbarui
    revalidatePath('/kesekretariatan/agenda');
    
    return {
      success: true,
      message: "Agenda berhasil dihapus"
    };
  } catch (error) {
    console.error("Error deleting agenda:", error);
    return {
      success: false,
      message: "Gagal menghapus agenda"
    };
  }
}

// Fungsi untuk menghapus agenda yang sudah selesai secara otomatis
export async function autoDeleteCompletedAgendas(): Promise<ActionResponse> {
  noStore();
  
  try {
    // Dapatkan semua agenda yang sudah selesai/ditolak dan lebih dari 7 hari
    const cutoffDate = new Date(getCurrentJakartaTime());
    cutoffDate.setDate(cutoffDate.getDate() - 7); // 7 hari yang lalu

    // Cari agenda yang akan dihapus dengan status yang sesuai
    const agendasToDelete = await prisma.pengajuan.findMany({
      where: {
        status: StatusPengajuan.CLOSED,
        hasilAkhir: {
          in: [HasilAkhir.SELESAI, HasilAkhir.DITOLAK]
        },
        updatedAt: {
          lt: cutoffDate
        }
      }
    });

    // Hapus agenda dari database tanpa memeriksa lampiran
    const result = await prisma.pengajuan.deleteMany({
      where: {
        status: StatusPengajuan.CLOSED,
        hasilAkhir: {
          in: [HasilAkhir.SELESAI, HasilAkhir.DITOLAK] 
        },
        updatedAt: {
          lt: cutoffDate
        }
      }
    });

    // Kirim notifikasi ke admin
    try {
      const admins = await prisma.user.findMany({
        where: {
          role: Role.SUPER_USER
        }
      });

      for (const admin of admins) {
        await createNotification({
          title: "Auto-Delete Agenda",
          message: `${result.count} agenda yang sudah selesai/ditolak telah dihapus secara otomatis.`,
          type: "info",
          recipientId: admin.id,
          relatedItemType: "Agenda"
        } as NotificationData);
      }
    } catch (error) {
      console.error("Error sending notifications:", error);
    }

    // Revalidasi path setelah penghapusan
    revalidatePath('/kesekretariatan/agenda');
    
    return {
      success: true,
      message: `${result.count} agenda telah dihapus secara otomatis`,
      data: result
    };
  } catch (error) {
    console.error("Error auto-deleting agendas:", error);
    return {
      success: false,
      message: "Gagal menghapus agenda secara otomatis"
    };
  }
}

// Fungsi untuk mengirim notifikasi pengingat ke pengurus
export async function sendReminderNotifications(): Promise<ActionResponse> {
  noStore();
  
  try {
    // Hitung jumlah agenda open
    const openAgendas = await prisma.pengajuan.count({
      where: {
        status: StatusPengajuan.OPEN // Gunakan enum yang benar
      }
    });

    if (openAgendas > 0) {
      // Dapatkan semua pengurus
      const pengurus = await prisma.user.findMany({
        where: {
          role: {
            in: [
              Role.KETUA,
              Role.WAKIL_KETUA,
              Role.SEKRETARIS,
              Role.WAKIL_SEKRETARIS,
              Role.BENDAHARA,
              Role.WAKIL_BENDAHARA,
              Role.SUPER_USER
            ]
          }
        }
      });

      // Kirim notifikasi ke setiap pengurus
      for (const user of pengurus) {
        await createNotification({
          title: "Pengingat Agenda",
          message: `Terdapat ${openAgendas} agenda yang menunggu tindak lanjut.`,
          type: "info",
          recipientId: user.id,
          relatedItemType: "Agenda"
        } as NotificationData);
      }
    }

    return {
      success: true,
      message: "Notifikasi pengingat berhasil dikirim"
    };
  } catch (error) {
    console.error("Error sending reminder notifications:", error);
    return {
      success: false,
      message: "Gagal mengirim notifikasi pengingat"
    };
  }
}

// Fungsi untuk mengubah status agenda
export async function updateAgendaStatus(
  id: string, 
  status: 'processing_lingkungan' | 'processing_stasi' | 'processing_paroki' | 'forwarded_to_paroki' | 'completed' | 'rejected',
  reason?: string
): Promise<ActionResponse> {
  noStore();
  
  try {
    // Dapatkan data user dari session
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return {
        success: false,
        message: "Tidak ada sesi yang ditemukan. Silakan login kembali."
      };
    }
    
    if (!session.user) {
      return {
        success: false,
        message: "Tidak ada data pengguna dalam sesi. Silakan login kembali."
      };
    }
    
    // Cek apakah user memiliki role yang diizinkan untuk mengubah status
    const allowedRoles = [
      'SUPER_USER', 
      'KETUA', 
      'WAKIL_KETUA', 
      'BENDAHARA', 
      'WAKIL_BENDAHARA', 
      'SEKRETARIS', 
      'WAKIL_SEKRETARIS'
    ];
    
    if (!session.user.role || !allowedRoles.includes(session.user.role)) {
      return {
        success: false,
        message: "Anda tidak memiliki izin untuk mengubah status agenda."
      };
    }
    
    // Ambil data agenda saat ini untuk pengecekan
    const currentAgenda = await prisma.pengajuan.findUnique({
      where: { id },
      include: {
        pengaju: {
          select: {
            id: true,
            username: true,
          }
        }
      }
    });
    
    if (!currentAgenda) {
      return {
        success: false,
        message: "Agenda tidak ditemukan"
      };
    }

    // Konversi status ke StatusPengajuan, TindakLanjut, UpdateStatus, dan HasilAkhir
    let statusPengajuan: StatusPengajuan = StatusPengajuan.OPEN;
    let tindakLanjut: TindakLanjut | null = null;
    let updateStatusValue: UpdateStatus | null = null;
    let hasilAkhir: HasilAkhir | null = null;
    
    // Pemetaan status
    if (status.startsWith('processing_')) {
      statusPengajuan = StatusPengajuan.OPEN;
      
      if (status === 'processing_lingkungan') {
        tindakLanjut = TindakLanjut.DIPROSES_DI_LINGKUNGAN;
      } else if (status === 'processing_stasi') {
        tindakLanjut = TindakLanjut.DIPROSES_DI_STASI;
      } else if (status === 'processing_paroki') {
        tindakLanjut = TindakLanjut.DIPROSES_DI_PAROKI;
      }
    } else if (status === 'forwarded_to_paroki') {
      statusPengajuan = StatusPengajuan.OPEN;
      updateStatusValue = UpdateStatus.DITERUSKAN_KE_PAROKI;
    } else if (status === 'completed') {
      statusPengajuan = StatusPengajuan.CLOSED;
      hasilAkhir = HasilAkhir.SELESAI;
      updateStatusValue = UpdateStatus.SELESAI;
    } else if (status === 'rejected') {
      statusPengajuan = StatusPengajuan.CLOSED;
      hasilAkhir = HasilAkhir.DITOLAK;
      updateStatusValue = UpdateStatus.DITOLAK;
      tindakLanjut = TindakLanjut.DITOLAK;
    }
    
    // Update agenda di database
    const updatedAgenda = await prisma.pengajuan.update({
      where: { id },
      data: {
        status: statusPengajuan,
        tindakLanjut: tindakLanjut,
        updateStatus: updateStatusValue,
        hasilAkhir: hasilAkhir,
        alasanPenolakan: reason || currentAgenda.alasanPenolakan,
        updatedAt: new Date()
      }
    });
    
    // Dapatkan data user untuk mengirim notifikasi
    let senderId: string | undefined;
    
    if (session?.user?.id) {
      senderId = session.user.id;
      
      // Kirim notifikasi ke pembuat agenda jika editor bukan pembuat
      if (senderId !== currentAgenda.pengajuId) {
        // Tentukan pesan notifikasi berdasarkan status
        let notificationTitle = "";
        let notificationMessage = "";
        let notificationType: "info" | "success" | "warning" | "error" = "info";
        
        if (status.startsWith('processing_')) {
          const targetName = status === 'processing_lingkungan' 
            ? 'Lingkungan' 
            : status === 'processing_stasi' 
              ? 'Stasi' 
              : 'Paroki';
          
          notificationTitle = "Agenda Diproses";
          notificationMessage = `Agenda "${currentAgenda.perihal}" sedang diproses di ${targetName}`;
        } else if (status === 'forwarded_to_paroki') {
          notificationTitle = "Agenda Diteruskan";
          notificationMessage = `Agenda "${currentAgenda.perihal}" telah diteruskan ke Paroki`;
        } else if (status === 'completed') {
          notificationTitle = "Agenda Selesai";
          notificationMessage = `Agenda "${currentAgenda.perihal}" telah diselesaikan`;
          notificationType = "success";
        } else if (status === 'rejected') {
          notificationTitle = "Agenda Ditolak";
          notificationMessage = `Agenda "${currentAgenda.perihal}" telah ditolak`;
          if (reason) {
            notificationMessage += ` dengan alasan: ${reason}`;
          }
          notificationType = "error";
        }
        
        // Kirim notifikasi
        await createNotification({
          title: notificationTitle,
          message: notificationMessage,
          type: notificationType,
          recipientId: currentAgenda.pengajuId,
          senderId: senderId,
          relatedItemId: parseInt(id),
          relatedItemType: "Agenda"
        } as NotificationData);
      }
    }
    
    // Revalidasi path agar data diperbarui
    revalidatePath('/kesekretariatan/agenda');
    
    return {
      success: true,
      message: "Status agenda berhasil diperbarui",
      data: updatedAgenda
    };
  } catch (error) {
    console.error("Error updating agenda status:", error);
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      message: `Gagal memperbarui status agenda: ${errorMessage}`
    };
  }
} 