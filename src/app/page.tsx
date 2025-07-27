import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function Home() {
  const session = await auth()

  // Jika sudah login, arahkan ke dashboard
  if (session?.user?.role) {
    redirect("/dashboard")
  }

  // Jika belum login, arahkan ke login
  redirect("/login")
}
