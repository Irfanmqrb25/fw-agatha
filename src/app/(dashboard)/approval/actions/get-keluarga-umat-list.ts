
"use server"

import { prisma } from "@/lib/db"

export async function getKeluargaUmatList() {
    try {
        const keluarga = await prisma.keluargaUmat.findMany({
            select: {
                id: true,
                namaKepalaKeluarga: true
            },
            orderBy: {
                namaKepalaKeluarga: 'asc'
            },
            where: {
                status: 'HIDUP',
                tanggalKeluar: null,
            }
        });

        return {
            success: true,
            data: keluarga,
        };
    } catch (error) {
        console.error("Error fetching keluarga umat list:", error);
        return {
            success: false,
            error: "Gagal mengambil data keluarga umat",
        };
    }
} 