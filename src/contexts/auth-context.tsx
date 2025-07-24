"use client"

import { 
  createContext, 
  useContext, 
  useState, 
  useEffect,
  ReactNode
} from "react"
import { useSession, signOut } from "next-auth/react"

// Tipe role pengguna - sesuai dengan enum Role di schema.prisma
type UserRole = 
  | 'SUPER_USER' 
  | 'KETUA' 
  | 'WAKIL_KETUA'
  | 'BENDAHARA' 
  | 'WAKIL_BENDAHARA'
  | 'SEKRETARIS'
  | 'WAKIL_SEKRETARIS'
  | 'UMAT'

// Interface konteks autentikasi
interface AuthContextType {
  isAuthenticated: boolean
  userRole: UserRole | null
  userId: string | null
  username: string | null
  logout: () => void
}

// Nilai default untuk konteks
const defaultContext: AuthContextType = {
  isAuthenticated: false,
  userRole: null,
  userId: null,
  username: null,
  logout: () => {}
}

// Membuat konteks
const AuthContext = createContext<AuthContextType>(defaultContext)

// Hook untuk menggunakan konteks autentikasi
export const useAuth = () => useContext(AuthContext)

// Provider untuk konteks autentikasi
export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userRole, setUserRole] = useState<UserRole | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [username, setUsername] = useState<string | null>(null)

  // Memeriksa autentikasi saat aplikasi dimuat atau session berubah
  useEffect(() => {
    // Jika session ada dan user memiliki role, update state
    if (session?.user) {
      setIsAuthenticated(true)
      
      // Ambil role dari session (ditambahkan ke session di NextAuth callbacks)
      const sessionRole = (session.user as any).role as string
    
      
      // Validasi role, pastikan role ada dalam daftar UserRole yang valid
      if (sessionRole && isValidUserRole(sessionRole)) {
        setUserRole(sessionRole as UserRole)
      } else {
        // Fallback ke null jika role tidak valid
        setUserRole(null)
        console.warn(`Invalid role received from session: ${sessionRole}`)
      }
      
      // Ambil userId dan username
      // NextAuth user tidak memiliki id secara default, akses melalui any
      const userId = (session.user as any).id || null
      setUserId(userId)
      setUsername(session.user.name || null)
    } else {
      // Reset ke default jika tidak ada session
      setIsAuthenticated(false)
      setUserRole(null)
      setUserId(null)
      setUsername(null)
    }
  }, [session, status])

  // Fungsi untuk memvalidasi user role
  function isValidUserRole(role: string): role is UserRole {
    return [
      'SUPER_USER', 
      'KETUA', 
      'WAKIL_KETUA',
      'BENDAHARA', 
      'WAKIL_BENDAHARA',
      'SEKRETARIS',
      'WAKIL_SEKRETARIS',
      'UMAT'
    ].includes(role as UserRole)
  }

  // Implementasi fungsi logout
  const handleLogout = () => {
    signOut({ callbackUrl: '/login' });
  };

  // Nilai konteks yang akan disediakan
  const contextValue: AuthContextType = {
    isAuthenticated,
    userRole,
    userId,
    username,
    logout: handleLogout
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
} 