"use server"

import { prisma } from "@/lib/db"

export async function getFilteredApprovals(monthYear: string, status: string) {
    try {
        let whereClause: any = {
            // Hanya ambil approval yang terkait dengan doa lingkungan
            // Ini akan otomatis mengecualikan semua transaksi kas ikata
            doaLingkunganId: {
                not: null
            }
        }

        // Filter berdasarkan status
        if (status !== "all") {
            whereClause.status = status.toUpperCase()
        }

        // Filter berdasarkan bulan/tahun
        if (monthYear !== "all") {
            // Cek apakah berformat all-{bulan} atau {tahun}-all
            const [year, month] = monthYear.split("-")

            if (year !== "all" && month !== "all") {
                // Format normal: tahun-bulan
                const startDate = new Date(parseInt(year), parseInt(month) - 1, 1)
                const endDate = new Date(parseInt(year), parseInt(month), 0)

                whereClause.doaLingkungan = {
                    tanggal: {
                        gte: startDate,
                        lte: endDate,
                    },
                }
            } else if (year !== "all" && month === "all") {
                // Filter hanya berdasarkan tahun
                const startDate = new Date(parseInt(year), 0, 1)
                const endDate = new Date(parseInt(year), 11, 31)

                whereClause.doaLingkungan = {
                    tanggal: {
                        gte: startDate,
                        lte: endDate,
                    },
                }
            } else if (year === "all" && month !== "all") {
                // Filter hanya berdasarkan bulan (dari semua tahun)
                const monthInt = parseInt(month)

                // Definisikan tahun-tahun yang dicakup (misalnya 2020-2030)
                const tahunList = Array.from({ length: 11 }, (_, i) => (2020 + i).toString())

                // Buat array gte-lte untuk setiap tahun dengan bulan yang sama
                const tanggalFilters = tahunList.map(tahun => {
                    const tahunInt = parseInt(tahun)
                    return {
                        gte: new Date(tahunInt, monthInt - 1, 1),
                        lte: new Date(tahunInt, monthInt, 0)
                    }
                })

                // Buat OR condition untuk setiap range tanggal
                const doaLingkunganConditions = tanggalFilters.map(filter => ({
                    tanggal: filter
                }))

                whereClause.doaLingkungan = {
                    OR: doaLingkunganConditions
                }
            }
        }

        const approvals = await prisma.approval.findMany({
            where: whereClause,
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
        console.error("Gagal mengambil data approval terfilter:", error)
        return {
            success: false,
            error: "Gagal mengambil data approval terfilter",
        }
    }
}