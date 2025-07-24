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
import { useState } from "react"
import { AlertCircle, Eye, EyeOff, CheckCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { registerAction } from "@/app/register/actions/register"
import { checkFamilyHead } from "@/app/register/actions/check-family-head"
import { useRouter } from "next/navigation"

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [formData, setFormData] = useState({
    kepalakeluarga: "",
    username: "",
    password: "",
    passphrase: "",
  })
  const [errors, setErrors] = useState<{
    kepalakeluarga?: string;
    username?: string;
    password?: string;
    passphrase?: string;
  }>({})
  const [isChecking, setIsChecking] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [familyHeadData, setFamilyHeadData] = useState<{
    id: string;
    name: string;
    address: string;
  } | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showPassphrase, setShowPassphrase] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const togglePassphraseVisibility = () => {
    setShowPassphrase(!showPassphrase)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData(prev => ({ ...prev, [id]: value }))
    
    // Clear specific error when typing
    if (errors[id as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [id]: undefined }))
    }
    
    // Reset verification when changing kepala keluarga
    if (id === "kepalakeluarga" && isVerified) {
      setIsVerified(false)
      setFamilyHeadData(null)
    }
  }

  const checkKepalakeluarga = async () => {
    setIsChecking(true)
    setServerError(null)
    
    try {
      // Panggil server action untuk memeriksa kepala keluarga
      const response = await checkFamilyHead(formData.kepalakeluarga)
      
      if (response.error) {
        setErrors(prev => ({ ...prev, kepalakeluarga: response.error }))
        setIsVerified(false)
        setFamilyHeadData(null)
      } else if (response.verified && response.familyHead) {
        setIsVerified(true)
        setFamilyHeadData(response.familyHead)
        setErrors(prev => ({ ...prev, kepalakeluarga: undefined }))
      }
    } catch (error) {
      setErrors(prev => ({ 
        ...prev, 
        kepalakeluarga: "Terjadi kesalahan saat verifikasi" 
      }))
    } finally {
      setIsChecking(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setServerError(null)
    setSuccess(false)
    
    // Validasi form
    const newErrors: typeof errors = {}
    if (!isVerified || !familyHeadData) {
      newErrors.kepalakeluarga = "Silahkan verifikasi Nama Kepala Keluarga terlebih dahulu"
    }
    if (!formData.username) {
      newErrors.username = "Username tidak boleh kosong"
    }
    if (!formData.password) {
      newErrors.password = "Password tidak boleh kosong"
    } else if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(formData.password)) {
      newErrors.password = "Password harus terdiri dari minimal 8 karakter, mengandung huruf dan angka"
    }
    if (!formData.passphrase) {
      newErrors.passphrase = "Passphrase tidak boleh kosong"
    } else if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(formData.passphrase)) {
      newErrors.passphrase = "Passphrase harus terdiri dari minimal 8 karakter, mengandung huruf dan angka"
    }
    
    setErrors(newErrors)
    
    if (Object.keys(newErrors).length === 0) {
      try {
        // Submit ke server action
        const res = await registerAction({
          username: formData.username,
          password: formData.password,
          passphrase: formData.passphrase,
          familyHeadName: formData.kepalakeluarga,
        })
        
        if (res.error) {
          setServerError(res.error)
        } else {
          setSuccess(true)
          setTimeout(() => router.push("/login"), 1500)
        }
      } catch (error) {
        setServerError("Terjadi kesalahan saat mendaftar")
      }
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-center md:text-base font-bold">Portal Administrasi Lingkungan St. Agatha</CardTitle>
          <CardDescription className="text-center md:text-sm">
            Silahkan Register untuk mengakses portal administrasi lingkungan St. Agatha
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label htmlFor="kepalakeluarga">Nama Kepala Keluarga</Label>
                <div className="flex gap-2">
                  <Input
                    id="kepalakeluarga"
                    type="text"
                    placeholder="Masukkan Nama Kepala Keluarga"
                    value={formData.kepalakeluarga}
                    onChange={handleInputChange}
                    disabled={isVerified}
                    required
                  />
                  <Button 
                    type="button" 
                    onClick={checkKepalakeluarga} 
                    disabled={isChecking || isVerified || !formData.kepalakeluarga.trim()}
                    className="whitespace-nowrap"
                  >
                    {isChecking ? "Memeriksa..." : isVerified ? "Terverifikasi" : "Verifikasi"}
                  </Button>
                </div>
                {errors.kepalakeluarga && (
                  <Alert variant="destructive" className="py-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{errors.kepalakeluarga}</AlertDescription>
                  </Alert>
                )}
                {isVerified && familyHeadData && (
                  <Alert className="py-2 bg-green-50 text-green-800 border-green-200">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    <div className="space-y-1">
                      <AlertDescription className="font-medium">
                        Nama Kepala Keluarga terverifikasi
                      </AlertDescription>
                      <p className="text-xs">
                        Alamat: {familyHeadData.address}
                      </p>
                    </div>
                  </Alert>
                )}
              </div>
              
              <div className="grid gap-3">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Masukkan Username"
                  value={formData.username}
                  onChange={handleInputChange}
                  disabled={!isVerified}
                  required
                />
                {errors.username && (
                  <Alert variant="destructive" className="py-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{errors.username}</AlertDescription>
                  </Alert>
                )}
              </div>
              
              <div className="grid gap-3">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input 
                    id="password" 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Masukkan Password" 
                    value={formData.password}
                    onChange={handleInputChange}
                    disabled={!isVerified}
                    required 
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    onClick={togglePasswordVisibility}
                    disabled={!isVerified}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-500 cursor-pointer" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500 cursor-pointer" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <Alert variant="destructive" className="py-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{errors.password}</AlertDescription>
                  </Alert>
                )}
                <p className="text-xs text-muted-foreground">
                  Password harus terdiri dari minimal 8 karakter, mengandung huruf dan angka
                </p>
              </div>
              
              <div className="grid gap-3">
                <Label htmlFor="passphrase">Passphrase (untuk reset password)</Label>
                <div className="relative">
                  <Input 
                    id="passphrase" 
                    type={showPassphrase ? "text" : "password"} 
                    placeholder="Masukkan Passphrase" 
                    value={formData.passphrase}
                    onChange={handleInputChange}
                    disabled={!isVerified}
                    required 
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    onClick={togglePassphraseVisibility}
                    disabled={!isVerified}
                  >
                    {showPassphrase ? (
                      <EyeOff className="h-4 w-4 text-gray-500 cursor-pointer" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500 cursor-pointer" />
                    )}
                  </button>
                </div>
                {errors.passphrase && (
                  <Alert variant="destructive" className="py-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{errors.passphrase}</AlertDescription>
                  </Alert>
                )}
                <p className="text-xs text-muted-foreground">
                  Passphrase harus terdiri dari minimal 8 karakter, mengandung huruf dan angka
                </p>
              </div>
              
              {serverError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{serverError}</AlertDescription>
                </Alert>
              )}
              
              {success && (
                <Alert className="bg-green-50 text-green-800 border-green-200">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>Pendaftaran berhasil! Anda akan diarahkan ke halaman login...</AlertDescription>
                </Alert>
              )}
              
              <Button 
                type="submit"
                disabled={!isVerified || isChecking || success}
                className="w-full"
              >
                Register
              </Button>
              
              <div className="text-center text-sm">
                Sudah punya akun?{" "}
                <Link
                  href="/login"
                  className="underline underline-offset-4 hover:text-primary"
                >
                  Login
                </Link>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

