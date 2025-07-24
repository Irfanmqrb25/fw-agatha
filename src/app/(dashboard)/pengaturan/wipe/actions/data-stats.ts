"use server"

import { prisma } from "@/lib/db"

/**
 * Interface untuk statistik data
 */
export interface DataStats {
  publikasi: number
  kasLingkungan: number
  danaMandiri: number
  kasIkata: number
  doaLingkungan: number
  pengajuan: number
  keluargaUmat: number
  user: number
  tanggungan: number
  pasangan: number
}

/**
 * Server action untuk mendapatkan statistik jumlah data
 */
export async function getDataStats(): Promise<DataStats> {
  try {
    const [
      publikasiCount,
      kasLingkunganCount,
      danaMandiriCount,
      kasIkataCount,
      doaLingkunganCount,
      pengajuanCount,
      keluargaUmatCount,
      userCount,
      tanggunganCount,
      pasanganCount
    ] = await Promise.all([
      prisma.publikasi.count(),
      prisma.kasLingkungan.count(),
      prisma.danaMandiri.count(),
      prisma.kasIkata.count(),
      prisma.doaLingkungan.count(),
      prisma.pengajuan.count(),
      prisma.keluargaUmat.count(),
      prisma.user.count(),
      prisma.tanggungan.count(),
      prisma.pasangan.count()
    ])

    return {
      publikasi: publikasiCount,
      kasLingkungan: kasLingkunganCount,
      danaMandiri: danaMandiriCount,
      kasIkata: kasIkataCount,
      doaLingkungan: doaLingkunganCount,
      pengajuan: pengajuanCount,
      keluargaUmat: keluargaUmatCount,
      user: userCount,
      tanggungan: tanggunganCount,
      pasangan: pasanganCount
    }
  } catch (error) {
    console.error("Error fetching data stats:", error)
    return {
      publikasi: 0,
      kasLingkungan: 0,
      danaMandiri: 0,
      kasIkata: 0,
      doaLingkungan: 0,
      pengajuan: 0,
      keluargaUmat: 0,
      user: 0,
      tanggungan: 0,
      pasangan: 0
    }
  }
} 