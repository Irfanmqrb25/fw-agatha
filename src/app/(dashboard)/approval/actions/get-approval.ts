"use server"

import { prisma } from "@/lib/db"

export async function getApprovals() {
    try {
        const approvals = await prisma.approval.findMany({
            where: {
                // Hanya ambil approval yang terkait dengan doa lingkungan
                // Ini akan otomatis mengecualikan semua transaksi kas ikata
                doaLingkunganId: {
                    not: null
                }
            },
            include: {
                kasLingkungan: true,
                doaLingkungan: {
                    include: {
                        tuanRumah: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        })

        return {
            success: true,
            data: approvals,
        }
    } catch (error) {
        console.error("Gagal mengambil data approval:", error)
        return {
            success: false,
            error: "Gagal mengambil data approval",
        }
    }
}