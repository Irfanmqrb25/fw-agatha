import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

const routeAccessMap: { [key: string]: string[] } = {
  '/dashboard': ['SUPER_USER', 'KETUA', 'WAKIL_KETUA', 'SEKRETARIS', 'WAKIL_SEKRETARIS', 'BENDAHARA', 'WAKIL_BENDAHARA', 'UMAT'],
  '/lingkungan': ['SUPER_USER', 'KETUA', 'WAKIL_KETUA', 'BENDAHARA'],
  '/lingkungan/kas': ['SUPER_USER', 'KETUA', 'WAKIL_KETUA', 'BENDAHARA'],
  '/lingkungan/mandiri': ['SUPER_USER', 'KETUA', 'WAKIL_KETUA', 'BENDAHARA'],
  '/ikata': ['SUPER_USER', 'KETUA', 'WAKIL_KETUA', 'WAKIL_BENDAHARA'],
  '/ikata/kas': ['SUPER_USER', 'KETUA', 'WAKIL_KETUA', 'WAKIL_BENDAHARA'],
  '/ikata/monitoring': ['SUPER_USER', 'KETUA', 'WAKIL_KETUA', 'WAKIL_BENDAHARA'],
  '/kesekretariatan': ['SUPER_USER', 'KETUA', 'WAKIL_KETUA', 'SEKRETARIS', 'WAKIL_SEKRETARIS', 'BENDAHARA', 'WAKIL_BENDAHARA', 'UMAT'],
  '/kesekretariatan/umat': ['SUPER_USER', 'KETUA', 'WAKIL_KETUA', 'SEKRETARIS', 'WAKIL_SEKRETARIS'],
  '/kesekretariatan/doling': ['SUPER_USER', 'KETUA', 'WAKIL_KETUA', 'SEKRETARIS', 'WAKIL_SEKRETARIS'],
  '/kesekretariatan/kaleidoskop': ['SUPER_USER', 'SEKRETARIS', 'WAKIL_SEKRETARIS'],
  '/kesekretariatan/agenda': ['SUPER_USER', 'KETUA', 'WAKIL_KETUA', 'SEKRETARIS', 'WAKIL_SEKRETARIS', 'BENDAHARA', 'WAKIL_BENDAHARA', 'UMAT'],
  '/publikasi': ['SUPER_USER', 'KETUA', 'WAKIL_KETUA', 'SEKRETARIS', 'WAKIL_SEKRETARIS', 'BENDAHARA', 'WAKIL_BENDAHARA', 'UMAT'],
  '/approval': ['SUPER_USER', 'KETUA', 'WAKIL_KETUA', 'BENDAHARA'],
  '/histori-pembayaran': ['SUPER_USER', 'UMAT'],
  '/pengaturan': ['SUPER_USER', 'KETUA', 'WAKIL_KETUA', 'SEKRETARIS', 'WAKIL_SEKRETARIS', 'BENDAHARA', 'WAKIL_BENDAHARA', 'UMAT'],
  '/pengaturan/profil': ['SUPER_USER', 'UMAT'],
  '/pengaturan/password': ['SUPER_USER', 'KETUA', 'WAKIL_KETUA', 'SEKRETARIS', 'WAKIL_SEKRETARIS', 'BENDAHARA', 'WAKIL_BENDAHARA', 'UMAT'],
  '/pengaturan/wipe': ['SUPER_USER'],
  '/notifications': ['SUPER_USER', 'KETUA', 'WAKIL_KETUA', 'SEKRETARIS', 'WAKIL_SEKRETARIS', 'BENDAHARA', 'WAKIL_BENDAHARA', 'UMAT'],
}

const checkAccess = (path: string, role: string): boolean => {
  if (!role) return false
  
  if (routeAccessMap[path]) {
    return routeAccessMap[path].includes(role)
  }
  
  // Khusus untuk halaman detail notifikasi (/notifications/[id])
  if (path.startsWith('/notifications/')) {
    return routeAccessMap['/notifications']?.includes(role) || false
  }
  
  const pathSegments = path.split('/').filter(Boolean)
  let currentPath = ''
  for (let i = 0; i < pathSegments.length; i++) {
    currentPath = `/${pathSegments.slice(0, i + 1).join('/')}`
    if (routeAccessMap[currentPath]) {
      return routeAccessMap[currentPath].includes(role)
    }
  }
  return false
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  // Skip static, api, dsb
  if (
    path.includes('/_next') ||
    path.startsWith('/api') ||
    path.includes('/static') ||
    path === '/'
  ) {
    return NextResponse.next()
  }
  
  // Allow public routes (login, register, forgot-password, dsb)
  const publicRoutes = ['/login', '/register', '/forgot-password', '/verify', '/__nextjs_original-stack-frame']
  
  if (publicRoutes.includes(path)) {
    // Jika sudah login, redirect ke dashboard
    try {
      const token = await getToken({ 
        req: request, 
        secret: process.env.NEXTAUTH_SECRET,
        secureCookie: false
      })
      
      if (token?.role) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    } catch (error) {
      return NextResponse.next()
    }
    
    return NextResponse.next()
  }
  
  // Ambil session NextAuth.js
  try {
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET,
      secureCookie: false
    })
    
    const userRole = token?.role as string | undefined
    
    if (!userRole) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    
    if (!checkAccess(path, userRole)) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    
  } catch (error) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
} 