"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { changePassword } from "../actions/change-password"
import { toast } from "sonner"

export default function PasswordForm() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })
  const [errors, setErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
    general?: string;
  }>({})
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const toggleCurrentPasswordVisibility = () => {
    setShowCurrentPassword(!showCurrentPassword)
  }

  const toggleNewPasswordVisibility = () => {
    setShowNewPassword(!showNewPassword)
  }

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData(prev => ({ ...prev, [id]: value }))
    
    // Clear specific error when typing
    if (errors[id as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [id]: undefined }))
    }
    
    // Reset success state when user starts typing again
    if (isSuccess) {
      setIsSuccess(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate form
    const newErrors: typeof errors = {}
    
    if (!formData.currentPassword) {
      newErrors.currentPassword = "Password saat ini tidak boleh kosong"
    }
    
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
    
    setErrors(newErrors)
    
    // If no errors, submit form
    if (Object.keys(newErrors).length === 0) {
      setIsLoading(true)
      
      try {
        const result = await changePassword(formData.currentPassword, formData.newPassword)
        
        if (result.success) {
          // Reset form after successful submission
          setFormData({
            currentPassword: "",
            newPassword: "",
            confirmPassword: ""
          })
          setIsSuccess(true)
          toast.success("Password berhasil diubah")
          router.refresh()
        } else {
          // Show error message
          setErrors({ general: result.message })
          toast.error(result.message)
        }
      } catch (error) {
        console.error("Error changing password:", error)
        setErrors({ 
          general: "Terjadi kesalahan saat mengubah password" 
        })
        toast.error("Terjadi kesalahan saat mengubah password")
      } finally {
        setIsLoading(false)
      }
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ubah Password</CardTitle>
        <CardDescription>
          Password harus terdiri dari minimal 8 karakter dan mengandung huruf dan angka.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isSuccess && (
          <Alert className="mb-6 bg-green-50 text-green-700 border-green-200">
            <AlertDescription>
              Password berhasil diubah.
            </AlertDescription>
          </Alert>
        )}
        
        {errors.general && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errors.general}</AlertDescription>
          </Alert>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Password Saat Ini</Label>
            <div className="relative">
              <Input 
                id="currentPassword" 
                type={showCurrentPassword ? "text" : "password"} 
                placeholder="Masukkan password saat ini" 
                value={formData.currentPassword}
                onChange={handleInputChange}
                disabled={isLoading}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2"
                onClick={toggleCurrentPasswordVisibility}
                disabled={isLoading}
              >
                {showCurrentPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-500 cursor-pointer" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-500 cursor-pointer" />
                )}
              </button>
            </div>
            {errors.currentPassword && (
              <Alert variant="destructive" className="py-2 mt-1">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.currentPassword}</AlertDescription>
              </Alert>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="newPassword">Password Baru</Label>
            <div className="relative">
              <Input 
                id="newPassword" 
                type={showNewPassword ? "text" : "password"} 
                placeholder="Masukkan password baru" 
                value={formData.newPassword}
                onChange={handleInputChange}
                disabled={isLoading}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2"
                onClick={toggleNewPasswordVisibility}
                disabled={isLoading}
              >
                {showNewPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-500 cursor-pointer" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-500 cursor-pointer" />
                )}
              </button>
            </div>
            {errors.newPassword && (
              <Alert variant="destructive" className="py-2 mt-1">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.newPassword}</AlertDescription>
              </Alert>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Konfirmasi Password Baru</Label>
            <div className="relative">
              <Input 
                id="confirmPassword" 
                type={showConfirmPassword ? "text" : "password"} 
                placeholder="Masukkan konfirmasi password baru" 
                value={formData.confirmPassword}
                onChange={handleInputChange}
                disabled={isLoading}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2"
                onClick={toggleConfirmPasswordVisibility}
                disabled={isLoading}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-500 cursor-pointer" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-500 cursor-pointer" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <Alert variant="destructive" className="py-2 mt-1">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.confirmPassword}</AlertDescription>
              </Alert>
            )}
          </div>
          
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Memproses...
              </>
            ) : "Ubah Password"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
} 