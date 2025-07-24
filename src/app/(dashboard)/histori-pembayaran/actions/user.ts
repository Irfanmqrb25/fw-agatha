"use server";

import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

// Fungsi untuk mendapatkan informasi keluarga dari user yang sedang login
export async function getCurrentUserKeluarga() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      redirect("/login");
    }

    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      include: {
        keluarga: true,
      },
    });

    if (!user || !user.keluarga) {
      throw new Error("Data keluarga tidak ditemukan");
    }

    return user.keluarga;
  } catch (error) {
    console.error("Error getting current user keluarga:", error);
    throw new Error("Gagal mendapatkan data keluarga user");
  }
}

// Fungsi untuk mendapatkan role user yang sedang login
export async function getCurrentUserRole() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      redirect("/login");
    }

    return session.user.role;
  } catch (error) {
    console.error("Error getting current user role:", error);
    throw new Error("Gagal mendapatkan role user");
  }
} 