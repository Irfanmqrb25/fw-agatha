import { Suspense } from "react";
import LoadingSkeleton from "./components/loading-skeleton";
import AgendaContent from "./components/agenda-content";
import { Agenda, ProcessTarget, AgendaStatus } from "./types";
import { TujuanPengajuan, StatusPengajuan, TindakLanjut, UpdateStatus, HasilAkhir } from "@prisma/client";
import { prisma } from "@/lib/db";

export default async function AgendaPage() {
  // Mengambil data agenda menggunakan server action dengan include user data dan keluarga
  const agendaData = await prisma.pengajuan.findMany({
    include: {
      pengaju: {
        select: {
          id: true,
          username: true,
          keluarga: {
            select: {
              namaKepalaKeluarga: true
            }
          }
        }
      }
    },
    orderBy: {
      updatedAt: 'desc'
    }
  });
  
  // Mengkonversi tipe data dari database ke tipe Agenda
  const agendas = agendaData.map((agenda) => {
    // Validasi target
    const targetValue = (() => {
      switch (agenda.tujuan) {
        case TujuanPengajuan.DPL: return 'lingkungan';
        case TujuanPengajuan.STASI: return 'stasi';
        case TujuanPengajuan.PAROKI: return 'paroki';
        default: return 'lingkungan';
      }
    })() as ProcessTarget;
    
    // Perbaikan mapping status dengan mempertimbangkan semua field status
    const statusValue = (() => {
      // Jika status CLOSED, cek hasilAkhir atau updateStatus
      if (agenda.status === StatusPengajuan.CLOSED) {
        if (agenda.hasilAkhir === HasilAkhir.SELESAI || agenda.updateStatus === UpdateStatus.SELESAI) {
          return 'completed';
        }
        if (agenda.hasilAkhir === HasilAkhir.DITOLAK || agenda.updateStatus === UpdateStatus.DITOLAK) {
          return 'rejected';
        }
        return 'completed'; // Default untuk CLOSED
      }
      
      // Jika status OPEN, cek tindakLanjut dan updateStatus
      if (agenda.status === StatusPengajuan.OPEN) {
        // Cek updateStatus terlebih dahulu
        if (agenda.updateStatus === UpdateStatus.DITERUSKAN_KE_PAROKI) {
          return 'forwarded_to_paroki';
        }
        
        // Cek tindakLanjut
        if (agenda.tindakLanjut === TindakLanjut.DIPROSES_DI_LINGKUNGAN) {
          return 'processing_lingkungan';
        }
        if (agenda.tindakLanjut === TindakLanjut.DIPROSES_DI_STASI) {
          return 'processing_stasi';
        }
        if (agenda.tindakLanjut === TindakLanjut.DIPROSES_DI_PAROKI) {
          return 'processing_paroki';
        }
        if (agenda.tindakLanjut === TindakLanjut.DITOLAK) {
          return 'rejected';
        }
        
        // Jika tidak ada tindakLanjut, berarti masih menunggu
        return 'open';
      }
      
      // Default fallback
      return 'open';
    })() as AgendaStatus;
    
    // Ambil nama kepala keluarga jika ada, jika tidak gunakan username
    const displayName = agenda.pengaju.keluarga?.namaKepalaKeluarga || agenda.pengaju.username;
    
    return {
      id: agenda.id,
      title: agenda.perihal || "",
      description: agenda.alasanPenolakan || "",
      date: new Date(agenda.tanggal),
      location: agenda.alasanPenolakan || "", // Gunakan field lain yang tersedia
      target: targetValue,
      status: statusValue,
      createdBy: {
        id: agenda.pengaju.id,
        name: displayName
      },
      createdAt: new Date(agenda.createdAt),
      updatedAt: new Date(agenda.updatedAt),
      // Menambahkan completedAt jika statusnya completed, atau undefined
      completedAt: statusValue === 'completed' ? new Date() : undefined,
      rejectionReason: agenda.alasanPenolakan || ""
    } as Agenda;
  });
  
  return (
    <div className="p-2 px-4">
      <Suspense fallback={<LoadingSkeleton />}>
        <AgendaContent initialAgendas={agendas} />
      </Suspense>
    </div>
  );
} 