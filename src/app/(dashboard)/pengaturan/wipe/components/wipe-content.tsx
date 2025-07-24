"use client"

import { useState, useEffect } from "react"
import { Trash2, ShieldAlert, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useSession } from "next-auth/react"

import SelectiveWipeTab from "./selective-wipe-tab"
import EmergencyWipeTab from "./emergency-wipe-tab"
import DataStatsComponent from "./data-stats"
import { getDataTypeLabel } from "../utils"
import { DataType, WipeMode } from "../types"
import { wipeDataAction, emergencyWipeAction } from "../actions/wipe-actions"

export default function WipeContent() {
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [dataType, setDataType] = useState<string>("")
  const [confirmText, setConfirmText] = useState("")
  const [backupConfirm, setBackupConfirm] = useState(false)
  const [activeTab, setActiveTab] = useState<WipeMode>("selective")
  const [isProcessing, setIsProcessing] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const { data: session } = useSession()
  const router = useRouter()
  
  // Redirect jika bukan SuperUser
  useEffect(() => {
    if (session?.user?.role !== "SUPER_USER") {
      toast.error("Anda tidak memiliki akses ke halaman ini")
      router.push("/dashboard")
    }
  }, [session, router])

  const resetForm = () => {
    setStartDate(undefined)
    setEndDate(undefined)
    setDataType("")
    setConfirmText("")
    setBackupConfirm(false)
  }

  const handleWipeData = async () => {
    if (
      (activeTab === "selective" && confirmText !== "KONFIRMASI") ||
      (activeTab === "emergency" && confirmText !== "EMERGENCY WIPE")
    ) {
      toast.error("Teks konfirmasi tidak cocok")
      return
    }

    setIsProcessing(true)
    
    try {
      if (activeTab === "selective") {
        const result = await wipeDataAction({
          dataType: dataType as DataType,
          startDate,
          endDate
        })

        if (result.success) {
          toast.success(result.message)
        } else {
          toast.error(result.message || "Terjadi kesalahan saat menghapus data")
        }
      } else {
        const result = await emergencyWipeAction({
          confirmText
        })

        if (result.success) {
          toast.success(result.message)
        } else {
          toast.error(result.message || "Terjadi kesalahan saat melakukan emergency wipe")
        }
      }
    } catch (error) {
      toast.error("Terjadi kesalahan saat menghapus data")
      console.error("Error while wiping data:", error)
    } finally {
      setIsProcessing(false)
      resetForm()
      setShowConfirmation(false)
    }
  }
  
  const isSelectiveFormValid = startDate && endDate && dataType && confirmText === "KONFIRMASI" && backupConfirm
  const isEmergencyFormValid = confirmText === "EMERGENCY WIPE" && backupConfirm

  // Cek apakah user adalah SuperUser - hanya SuperUser yang boleh mengakses fitur ini
  const isSuperUser = session?.user?.role === 'SUPER_USER'

  // Jika bukan SuperUser, tampilkan pesan akses ditolak
  if (!isSuperUser) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Akses Ditolak
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>Anda tidak memiliki izin untuk mengakses fitur ini. Fitur ini hanya tersedia untuk pengguna SuperUser.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
      {isSuperUser && <DataStatsComponent />}
      
      <Card>
        <CardHeader>
          <CardTitle className="text-xl md:text-2xl font-bold">Wipe Data</CardTitle>
          <CardDescription>
            Halaman ini digunakan untuk menghapus data berdasarkan parameter yang ditentukan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive" className="mb-6">
            <ShieldAlert className="h-5 w-5" />
            <AlertTitle className="text-base md:text-lg">Peringatan!</AlertTitle>
            <AlertDescription>
              Tindakan pada halaman ini bersifat permanen. Pastikan data telah dibackup sebelum melanjutkan.
            </AlertDescription>
          </Alert>
          
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as WipeMode)} className="w-full">
            <TabsList className="w-full flex flex-wrap md:grid md:grid-cols-2 gap-2 mb-6">
              <TabsTrigger className="flex-1" value="selective">Penghapusan Selektif</TabsTrigger>
              <TabsTrigger className="flex-1" value="emergency">Emergency Wipe</TabsTrigger>
            </TabsList>
            
            <TabsContent value="selective" className="mt-4">
              <SelectiveWipeTab 
                startDate={startDate}
                setStartDate={setStartDate}
                endDate={endDate}
                setEndDate={setEndDate}
                dataType={dataType}
                setDataType={setDataType}
                confirmText={confirmText}
                setConfirmText={setConfirmText}
                backupConfirm={backupConfirm}
                setBackupConfirm={setBackupConfirm}
              />
            </TabsContent>
            
            <TabsContent value="emergency" className="mt-4">
              <EmergencyWipeTab 
                confirmText={confirmText}
                setConfirmText={setConfirmText}
                backupConfirm={backupConfirm}
                setBackupConfirm={setBackupConfirm}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-2 border-t pt-4">
          <Button 
            variant="outline" 
            onClick={resetForm}
            disabled={isProcessing}
            className="w-full sm:w-auto"
          >
            Reset
          </Button>
          
          {activeTab === "selective" ? (
            <Button 
              variant="destructive" 
              className="w-full sm:w-auto sm:ml-auto"
              disabled={!isSelectiveFormValid || isProcessing}
              onClick={() => setShowConfirmation(true)}
            >
              {isProcessing ? (
                <>
                  <span className="mr-2">Memproses...</span>
                  <span className="animate-spin">⏳</span>
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Hapus Data Selektif
                </>
              )}
            </Button>
          ) : (
            <Button 
              variant="destructive" 
              className="w-full sm:w-auto sm:ml-auto"
              disabled={!isEmergencyFormValid || isProcessing}
              onClick={() => setShowConfirmation(true)}
            >
              {isProcessing ? (
                <>
                  <span className="mr-2">Memproses...</span>
                  <span className="animate-spin">⏳</span>
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Emergency Wipe
                </>
              )}
            </Button>
          )}
        </CardFooter>
      </Card>
      
      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent className="max-w-md mx-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Penghapusan Data</AlertDialogTitle>
            <AlertDialogDescription>
              {activeTab === "selective" ? (
                `Tindakan ini akan menghapus permanen ${dataType ? getDataTypeLabel(dataType as DataType) : ""} dari ${startDate ? startDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : "..."} hingga ${endDate ? endDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : "..."}.`
              ) : (
                "TINDAKAN INI AKAN MENGHAPUS PERMANEN SELURUH DATA DALAM SISTEM."
              )}
            </AlertDialogDescription>
            
            <div className="mt-4 text-red-600 font-bold text-sm">
              Data yang sudah dihapus tidak dapat dikembalikan.
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
            <AlertDialogCancel 
              disabled={isProcessing}
              className="w-full sm:w-auto mt-2 sm:mt-0"
            >
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleWipeData}
              disabled={isProcessing}
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700"
            >
              {isProcessing ? (
                <span className="flex items-center">
                  <span className="mr-2">Memproses</span>
                  <span className="animate-spin">⏳</span>
                </span>
              ) : (
                <>
                  Ya, Hapus Data
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
} 