
"use server"
import { prisma } from "@/lib/db"
import { StatusApproval } from "@prisma/client"
import { revalidatePath } from "next/cache"

export async function resetApproval(approvalId: string) {
    try {
        const updatedApproval = await prisma.approval.update({
            where: { id: approvalId },
            data: {
                status: StatusApproval.PENDING,
            },
        });

        revalidatePath("/approval");
        return {
            success: true,
            data: updatedApproval,
        };
    } catch (error) {
        console.error("Gagal mereset status approval:", error);
        return {
            success: false,
            error: "Gagal mereset status approval",
        };
    }
}