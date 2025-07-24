import type { Metadata } from "next"
import { Inter as FontSans } from "next/font/google"
import "./globals.css"
import { cn } from "@/lib/utils"
import { NotificationProvider } from "@/contexts/notification-context"
import { Toaster } from "@/components/ui/sonner"
import { NextAuthProvider } from "@/providers/next-auth-provider"
import { initScheduler } from '@/lib/scheduler'

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})

// Inisialisasi scheduler
if (process.env.NODE_ENV === 'production') {
  initScheduler();
}

export const metadata: Metadata = {
  title: "Portal Administrasi Lingkungan St. Agatha",
  description: "Portal Administrasi Lingkungan St. Agatha",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        <NextAuthProvider>
          <NotificationProvider>
            {children}
          </NotificationProvider>
        </NextAuthProvider>
        <Toaster richColors closeButton position="top-right" />
      </body>
    </html>
  )
}
