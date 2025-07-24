"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import {
  LayoutDashboard
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { navMain } from "@/lib/nav-menu"

interface AppSidebarProps extends Omit<React.ComponentProps<typeof Sidebar>, 'userRole'> {
  userRole?: string | null;
}

export function AppSidebar({
  userRole,
  ...props
}: AppSidebarProps) {
  const pathname = usePathname()
  const { data: session, status } = useSession()
  
  // Jika session masih loading, kita bisa menampilkan loading state
  if (status === "loading") {
    return null // Atau komponen loading
  }

  // Gunakan role dari session jika tersedia, jika tidak gunakan prop userRole, atau fallback ke "UMAT"
  const sessionRole = session?.user?.role as string | undefined
  const effectiveRole = sessionRole || userRole || "UMAT"
  
  // Pastikan role yang digunakan ada dalam navMain
  const validRole = navMain[effectiveRole] ? effectiveRole : "UMAT"
  const menuItems = navMain[validRole] || []

  const userData = {
    name: session?.user?.name || "",
    email: "", // Email tidak disediakan dalam session saat ini
    avatar: "/avatars/default.jpg", // Gunakan avatar default
  }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/dashboard">
                <LayoutDashboard className="!size-5" />
                <span className="text-base font-semibold">Dashboard</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={menuItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  )
}
