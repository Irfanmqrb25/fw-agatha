
"use server"

import { prisma } from "@/lib/db"
import { StatusApproval } from "@prisma/client"
import { revalidatePath } from "next/cache"

export async function rejectApproval(approvalId: string, alasanPenolakan?: string) {
    try {
        const updatedApproval = await prisma.approval.update({
            where: { id: approvalId },
            data: {
                status: StatusApproval.REJECTED,
            },
        })

        revalidatePath("/approval")
        return {
            success: true,
            data: updatedApproval,
        }
    } catch (error) {
        console.error("Gagal menolak approval:", error)
        return {
            success: false,
            error: "Gagal menolak approval",
        }
    }
}