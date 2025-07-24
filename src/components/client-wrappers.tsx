"use client"

import { useAuth } from "@/contexts/auth-context"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"

export function AppClientWrapper() {
  const { userRole } = useAuth()
  return <AppSidebar variant="inset" userRole={userRole || undefined} />
}

export function HeaderClientWrapper() {
  const { userRole } = useAuth()
  return <SiteHeader userRole={userRole || undefined} />
} 