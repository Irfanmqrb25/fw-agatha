import "./../globals.css";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { AuthProvider } from "@/contexts/auth-context"
import { AppClientWrapper, HeaderClientWrapper } from "@/components/client-wrappers"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div>
      <AuthProvider>
        <SidebarProvider
          style={
            {
              "--sidebar-width": "calc(var(--spacing) * 72)",
              "--header-height": "calc(var(--spacing) * 12)",
            } as React.CSSProperties
          }
        >
          <AppClientWrapper />
          <SidebarInset>
            <HeaderClientWrapper />
            <main className="flex flex-1 flex-col">
              {children}
            </main>
          </SidebarInset>
        </SidebarProvider>
      </AuthProvider>
    </div>
  )
}
