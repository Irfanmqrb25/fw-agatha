"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { signOut } from "next-auth/react"

export default function LogoutPage() {
  const router = useRouter()

  useEffect(() => {
    // Langsung gunakan NextAuth signOut
    signOut({ callbackUrl: "/login" })
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <p>Logging out...</p>
      </div>
    </div>
  )
} 