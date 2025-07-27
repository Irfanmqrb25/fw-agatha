import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const routeAccessMap: { [key: string]: string[] } = {
  "/dashboard": [
    "SUPER_USER",
    "KETUA",
    "WAKIL_KETUA",
    "SEKRETARIS",
    "WAKIL_SEKRETARIS",
    "BENDAHARA",
    "WAKIL_BENDAHARA",
    "UMAT",
  ],
  "/lingkungan": [
    "SUPER_USER",
    "BENDAHARA",
    "WAKIL_BENDAHARA",
  ],
  "/lingkungan/kas": [
    "SUPER_USER",
    "BENDAHARA",
    "WAKIL_BENDAHARA",
  ],
  "/lingkungan/mandiri": [
    "SUPER_USER",
    "BENDAHARA",
    "WAKIL_BENDAHARA",
  ],
  "/ikata": [
    "SUPER_USER",
    "BENDAHARA",
    "WAKIL_BENDAHARA",
  ],
  "/ikata/kas": [
    "SUPER_USER",
    "BENDAHARA",
    "WAKIL_BENDAHARA",
  ],
  "/ikata/monitoring": [
    "SUPER_USER",
    "BENDAHARA",
    "WAKIL_BENDAHARA",
  ],
  "/kesekretariatan": [
    "SUPER_USER",
    "KETUA",
    "WAKIL_KETUA",
    "SEKRETARIS",
    "WAKIL_SEKRETARIS",
    "BENDAHARA",
    "WAKIL_BENDAHARA",
    "UMAT",
  ],
  "/kesekretariatan/umat": [
    "SUPER_USER",
    "KETUA",
    "WAKIL_KETUA",
    "SEKRETARIS",
    "WAKIL_SEKRETARIS",
  ],
  "/kesekretariatan/doling": [
    "SUPER_USER",
    "KETUA",
    "WAKIL_KETUA",
    "SEKRETARIS",
    "WAKIL_SEKRETARIS",
  ],
  "/kesekretariatan/kaleidoskop": [
    "SUPER_USER",
    "SEKRETARIS",
    "WAKIL_SEKRETARIS",
  ],
  "/kesekretariatan/agenda": [
    "SUPER_USER",
    "KETUA",
    "WAKIL_KETUA",
    "SEKRETARIS",
    "WAKIL_SEKRETARIS",
    "BENDAHARA",
    "WAKIL_BENDAHARA",
    "UMAT",
  ],
  "/kesekretariatan/ulang-tahun": [
    "SUPER_USER",
    "KETUA",
    "WAKIL_KETUA",
    "SEKRETARIS",
    "WAKIL_SEKRETARIS",
    "BENDAHARA",
    "WAKIL_BENDAHARA",
  ],
  "/publikasi": [
    "SUPER_USER",
    "KETUA",
    "WAKIL_KETUA",
    "SEKRETARIS",
    "WAKIL_SEKRETARIS",
    "BENDAHARA",
    "WAKIL_BENDAHARA",
    "UMAT",
  ],
  "/approval": [
    "SUPER_USER",
    "BENDAHARA",
    "WAKIL_BENDAHARA",
  ],
  "/histori-pembayaran": ["SUPER_USER", "UMAT"],
  "/pengaturan": [
    "SUPER_USER",
    "KETUA",
    "WAKIL_KETUA",
    "SEKRETARIS",
    "WAKIL_SEKRETARIS",
    "BENDAHARA",
    "WAKIL_BENDAHARA",
    "UMAT",
  ],
  "/pengaturan/profil": ["SUPER_USER", "UMAT"],
  "/pengaturan/password": [
    "SUPER_USER",
    "KETUA",
    "WAKIL_KETUA",
    "SEKRETARIS",
    "WAKIL_SEKRETARIS",
    "BENDAHARA",
    "WAKIL_BENDAHARA",
    "UMAT",
  ],
  "/pengaturan/wipe": ["SUPER_USER"],
  "/notifications": [
    "SUPER_USER",
    "KETUA",
    "WAKIL_KETUA",
    "SEKRETARIS",
    "WAKIL_SEKRETARIS",
    "BENDAHARA",
    "WAKIL_BENDAHARA",
    "UMAT",
  ],
};

const checkAccess = (path: string, role: string): boolean => {
  if (!role) return false;

  if (routeAccessMap[path]) {
    return routeAccessMap[path].includes(role);
  }

  // Khusus untuk halaman detail notifikasi (/notifications/[id])
  if (path.startsWith("/notifications/")) {
    return routeAccessMap["/notifications"]?.includes(role) || false;
  }

  const pathSegments = path.split("/").filter(Boolean);
  // Cek dari path paling spesifik ke paling umum
  for (let i = pathSegments.length; i > 0; i--) {
    const currentPath = `/${pathSegments.slice(0, i).join("/")}`;
    if (routeAccessMap[currentPath] && routeAccessMap[currentPath].includes(role)) {
      return true;
    }
  }
  return false;
};

export async function middleware(request: NextRequest) {
  let path = request.nextUrl.pathname;
  if (path !== "/" && path.endsWith("/")) {
    path = path.replace(/\/$/, "");
  }

  // ✅ Jangan proses file gambar
  if (/\.(jpg|jpeg|png|gif|svg|webp|ico)$/i.test(path)) {
    return NextResponse.next();
  }

  if (
    path.includes("/_next") ||
    path.startsWith("/api") ||
    path.includes("/static") ||
    path === "/"
  ) {
    return NextResponse.next();
  }

  const publicRoutes = [
    "/login",
    "/register",
    "/forgot-password",
    "/verify",
    "/__nextjs_original-stack-frame",
  ];

  if (publicRoutes.includes(path)) {
    try {
      const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
        secureCookie: false,
      });

      if (token?.role) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    } catch {
      return NextResponse.next();
    }

    return NextResponse.next();
  }

  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
      secureCookie: false,
    });

    const userRole = token?.role as string | undefined;

    if (!userRole) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Debug log, bisa dihapus setelah yakin berfungsi
    console.log("Middleware checking access:", { path, userRole, access: checkAccess(path, userRole) });

    if (!checkAccess(path, userRole)) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  } catch {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
