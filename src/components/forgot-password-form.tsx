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
import { 
  verifyFamilyHead, 
  verifyPassphrase, 
  resetPassword 
} from "@/app/forgot-password/actions"
import { useRouter } from "next/navigation"

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    kepalakeluarga: "",
    passphrase: "",
    newPassword: "",
    confirmPassword: ""
  })
  const [errors, setErrors] = useState<{
    kepalakeluarga?: string;
    passphrase?: string;
    newPassword?: string;
    confirmPassword?: string;
    general?: string;
  }>({})
  
  const [isChecking, setIsChecking] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [showPassphrase, setShowPassphrase] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [userData, setUserData] = useState<{
    userId: string;
    familyHeadId: string;
    familyHeadName: string;
  } | null>(null)
  const [success, setSuccess] = useState(false)
  
  const router = useRouter()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData(prev => ({ ...prev, [id]: value }))
    
    // Clear specific error when typing
    if (errors[id as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [id]: undefined }))
    }
  }

  const togglePassphraseVisibility = () => {
    setShowPassphrase(!showPassphrase)
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword)
  }

  const handleVerifyKepalakeluarga = async () => {
    setIsChecking(true)
    setErrors({})
    
    try {
      // Panggil server action untuk verifikasi kepala keluarga
      const response = await verifyFamilyHead(formData.kepalakeluarga)
      
      if (response.error) {
        setErrors(prev => ({ ...prev, kepalakeluarga: response.error }))
        setIsVerified(false)
        setUserData(null)
      } else if (response.verified && response.familyHead) {
        setIsVerified(true)
        setUserData({
          userId: response.familyHead.userId,
          familyHeadId: response.familyHead.id,
          familyHeadName: response.familyHead.name
        })
        setStep(2)
      }
    } catch (error) {
      setErrors(prev => ({ 
        ...prev, 
        kepalakeluarga: "Terjadi kesalahan saat verifikasi data" 
      }))
    } finally {
      setIsChecking(false)
    }
  }

  const handleVerifyPassphrase = async () => {
    if (!userData || !userData.userId) {
      setErrors(prev => ({ ...prev, general: "Data user tidak tersedia" }))
      return
    }
    
    if (!formData.passphrase.trim()) {
      setErrors(prev => ({ ...prev, passphrase: "Passphrase tidak boleh kosong" }))
      return
    }
    
    setIsChecking(true)
    setErrors({})
    
    try {
      // Verifikasi passphrase dengan server action
      const response = await verifyPassphrase(userData.userId, formData.passphrase)
      
      if (response.error) {
        setErrors(prev => ({ ...prev, passphrase: response.error }))
      } else if (response.verified) {
        setStep(3)
      }
    } catch (error) {
      setErrors(prev => ({ ...prev, passphrase: "Terjadi kesalahan saat verifikasi" }))
    } finally {
      setIsChecking(false)
    }
  }

  const handleResetPassword = async () => {
    if (!userData || !userData.userId) {
      setErrors(prev => ({ ...prev, general: "Data user tidak tersedia" }))
      return
    }
    
    const newErrors: typeof errors = {}
    
    if (!formData.newPassword) {
      newErrors.newPassword = "Password baru tidak boleh kosong"
    } else if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(formData.newPassword)) {
      newErrors.newPassword = "Password harus terdiri dari minimal 8 karakter, mengandung huruf dan angka"
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Konfirmasi password tidak boleh kosong"
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Password tidak cocok"
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    
    setIsChecking(true)
    setErrors({})
    
    try {
      // Reset password dengan server action
      const response = await resetPassword(userData.userId, formData.newPassword)
      
      if (response.error) {
        setErrors(prev => ({ ...prev, general: response.error }))
      } else if (response.success) {
        setSuccess(true)
        // Redirect ke login setelah 2 detik
        setTimeout(() => router.push("/login"), 2000)
      }
    } catch (error) {
      setErrors(prev => ({ ...prev, general: "Terjadi kesalahan saat reset password" }))
    } finally {
      setIsChecking(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-center md:text-base font-bold">Portal Administrasi Lingkungan St. Agatha</CardTitle>
          <CardDescription className="text-center md:text-sm">
            Reset Password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="flex flex-col gap-6">
              {/* Step 1: Verifikasi Nama Kepala Keluarga */}
              {step === 1 && (
                <div className="grid gap-3">
                  <Label htmlFor="kepalakeluarga">Nama Kepala Keluarga</Label>
                  <Input
                    id="kepalakeluarga"
                    type="text"
                    placeholder="Masukkan Nama Kepala Keluarga"
                    value={formData.kepalakeluarga}
                    onChange={handleInputChange}
                    required
                  />
                  {errors.kepalakeluarga && (
                    <Alert variant="destructive" className="py-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        {errors.kepalakeluarga}
                      </AlertDescription>
                    </Alert>
                  )}
                  <Button 
                    type="button" 
                    className="w-full mt-2"
                    onClick={handleVerifyKepalakeluarga}
                    disabled={isChecking || !formData.kepalakeluarga.trim()}
                  >
                    {isChecking ? "Memverifikasi..." : "Verifikasi"}
                  </Button>
                </div>
              )}

              {/* Step 2: Verifikasi Passphrase */}
              {step === 2 && (
                <div className="grid gap-3">
                  {userData && (
                    <Alert className="py-2 bg-green-50 text-green-800 border-green-200">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      <div className="space-y-1">
                        <AlertDescription className="font-medium">
                          Verifikasi berhasil untuk:
                        </AlertDescription>
                        <p className="text-xs">
                          {userData.familyHeadName}
                        </p>
                      </div>
                    </Alert>
                  )}
                  
                  <Label htmlFor="passphrase">Passphrase</Label>
                  <div className="relative">
                    <Input
                      id="passphrase"
                      type={showPassphrase ? "text" : "password"}
                      placeholder="Masukkan Passphrase"
                      value={formData.passphrase}
                      onChange={handleInputChange}
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      onClick={togglePassphraseVisibility}
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
                      <AlertDescription>
                        {errors.passphrase}
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <Button 
                    type="button" 
                    className="w-full mt-2"
                    onClick={handleVerifyPassphrase}
                    disabled={isChecking || !formData.passphrase.trim()}
                  >
                    {isChecking ? "Memverifikasi..." : "Lanjutkan"}
                  </Button>
                </div>
              )}

              {/* Step 3: Input Password Baru */}
              {step === 3 && (
                <>
                  {userData && (
                    <Alert className="py-2 bg-green-50 text-green-800 border-green-200">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      <div className="space-y-1">
                        <AlertDescription className="font-medium">
                          Passphrase terverifikasi. Silahkan atur password baru untuk akun:
                        </AlertDescription>
                        <p className="text-xs">
                          {userData.familyHeadName}
                        </p>
                      </div>
                    </Alert>
                  )}
                  
                  <div className="grid gap-3">
                    <Label htmlFor="newPassword">Password Baru</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder="Masukkan Password Baru"
                        value={formData.newPassword}
                        onChange={handleInputChange}
                        required
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
                    
                    {errors.newPassword && (
                      <Alert variant="destructive" className="py-2">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          {errors.newPassword}
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    <p className="text-xs text-muted-foreground">
                      Password harus terdiri dari minimal 8 karakter, mengandung huruf dan angka
                    </p>
                  </div>
                  
                  <div className="grid gap-3">
                    <Label htmlFor="confirmPassword">Ulangi Password Baru</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Ulangi Password Baru"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                        onClick={toggleConfirmPasswordVisibility}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-500 cursor-pointer" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-500 cursor-pointer" />
                        )}
                      </button>
                    </div>
                    
                    {errors.confirmPassword && (
                      <Alert variant="destructive" className="py-2">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          {errors.confirmPassword}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                  
                  {errors.general && (
                    <Alert variant="destructive" className="py-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        {errors.general}
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {success && (
                    <Alert className="py-2 bg-green-50 text-green-800 border-green-200">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      <AlertDescription>
                        Password berhasil diubah! Anda akan diarahkan ke halaman login...
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <Button 
                    type="button" 
                    className="w-full mt-2"
                    onClick={handleResetPassword}
                    disabled={isChecking || success}
                  >
                    {isChecking ? "Memproses..." : "Reset Password"}
                  </Button>
                </>
              )}
            </div>
            
            <div className="mt-4 text-center text-sm">
              <Link href="/login" className="underline underline-offset-4 hover:text-primary">
                Kembali ke halaman Login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
