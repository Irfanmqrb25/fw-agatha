"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useState, useEffect } from "react"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { signIn, useSession } from "next-auth/react"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [showPassword, setShowPassword] = useState(false)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const router = useRouter()
  const { data: session, status } = useSession()

  // Redirect jika sudah login menggunakan useEffect
  useEffect(() => {
    if (status === "authenticated" && session) {
      router.push("/dashboard")
    }
  }, [status, router, session])

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    
    try {
      const res = await signIn("credentials", {
        redirect: false,
        username,
        password,
        callbackUrl: "/dashboard"
      })

      if (res?.error) {
        if (res.error === "CredentialsSignin") {
          setError("Username atau password tidak valid")
        } else {
          setError(`Login gagal: ${res.error}`)
        }
      } else if (res?.ok) {
        router.push(res.url || "/dashboard") 
        
        // Gunakan setTimeout sebagai fallback jika router.push macet
        setTimeout(() => {
          window.location.href = res.url || "/dashboard"
        }, 1000)
      }
    } catch (error) {
      console.error("Login error:", error)
      setError("Terjadi kesalahan saat login. Silakan coba lagi.")
    } finally {
      setIsLoading(false)
    }
  }

  // Menampilkan indikator loading saat sedang checking status
  if (status === "loading") {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-center md:text-base font-bold">Portal Administrasi Lingkungan St. Agatha</CardTitle>
          <CardDescription className="text-center md:text-sm">
            Silahkan Login untuk mengakses portal administrasi lingkungan St. Agatha
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 rounded-md bg-red-50 text-red-500 text-sm border border-red-200">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Masukkan Username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="/forgot-password"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Lupa Password?
                  </Link>
                </div>
                <div className="relative">
                  <Input 
                    id="password" 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Masukkan Password" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-500 cursor-pointer" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500 cursor-pointer" />
                    )}
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Memproses...
                    </>
                  ) : "Masuk"}
                </Button>
              </div>
            </div>
            <div className="mt-4 text-center text-sm">
              Belum punya akun?{" "}
              <Link href="/register" className="underline underline-offset-4">
                Silahkan Register
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
