"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { SearchIcon, X } from "lucide-react"

import { YearFilter } from "./year-filter"
import { PaymentHistoryTable } from "./payment-history-table"
import { SummaryCards } from "./summary-cards"
import LoadingSkeleton from "./loading-skeleton"
import { DanaMandiriHistory, IkataHistory } from "../types"
import { 
  filterDanaMandiriByYear, 
  filterIkataByYear, 
  getCombinedYears
} from "../utils"
import { 
  getAllDanaMandiri, 
  getDanaMandiriByKeluargaId, 
  updateDanaMandiri, 
  deleteDanaMandiri,
  getTotalDanaMandiriByYear
} from "../actions/dana-mandiri"
import {
  getAllIkata,
  getIkataByKeluargaId,
  updateIkata,
  deleteIkata,
  getTotalIkataByYear,
  fixIkataMonthData
} from "../actions/ikata"
import { getCurrentUserKeluarga, getCurrentUserRole } from "../actions/user"

export default function HistoriPembayaranContent() {
  // State
  const [userRole, setUserRole] = useState<string | null>(null)
  const [keluargaId, setKeluargaId] = useState<string | null>(null)
  const [namaKepalaKeluarga, setNamaKepalaKeluarga] = useState<string | null>(null)
  const [danaMandiriData, setDanaMandiriData] = useState<DanaMandiriHistory[]>([])
  const [ikataData, setIkataData] = useState<IkataHistory[]>([])
  const [selectedYear, setSelectedYear] = useState<number | undefined>(undefined)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [danaMandiriTotal, setDanaMandiriTotal] = useState({ total: 0, count: 0 })
  const [ikataTotal, setIkataTotal] = useState({ total: 0, count: 0 })
  
  // Mengecek apakah pengguna adalah SuperUser atau memiliki hak admin
  const isSuperUser = userRole === "SUPER_USER"
  const hasAdminAccess = ["SUPER_USER", "KETUA", "WAKIL_KETUA", "BENDAHARA", "WAKIL_BENDAHARA"].includes(userRole || "")
  
  // Pastikan pengguna dengan role UMAT hanya bisa melihat datanya sendiri
  useEffect(() => {
    if (userRole === "UMAT" && namaKepalaKeluarga && searchTerm !== namaKepalaKeluarga) {
      setSearchTerm(namaKepalaKeluarga);
    }
  }, [userRole, namaKepalaKeluarga, searchTerm]);
  
  // Fetch data saat komponen di-mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        
        // Mendapatkan role pengguna
        const role = await getCurrentUserRole()
        setUserRole(role || null)
        
        // Jika bukan SuperUser atau admin, dapatkan keluargaId pengguna
        let keluargaData = null
        if (role && !["SUPER_USER", "KETUA", "WAKIL_KETUA", "BENDAHARA", "WAKIL_BENDAHARA"].includes(role)) {
          keluargaData = await getCurrentUserKeluarga()
          setKeluargaId(keluargaData.id)
          setNamaKepalaKeluarga(keluargaData.namaKepalaKeluarga)
          
          // Dapatkan data pembayaran untuk keluarga ini
          const danaMandiri = await getDanaMandiriByKeluargaId(keluargaData.id)
          const ikata = await getIkataByKeluargaId(keluargaData.id)
          
          setDanaMandiriData(danaMandiri)
          setIkataData(ikata)
          
          // Set total khusus untuk data umat yang sedang login
          const danaMandiriTotalData = {
            total: danaMandiri.filter(item => item.statusSetor).reduce((sum, item) => sum + item.jumlahDibayar, 0),
            count: danaMandiri.filter(item => item.statusSetor).length
          }
          
          const ikataTotalData = {
            total: ikata.filter(item => item.status === "LUNAS").reduce((sum, item) => sum + item.jumlahDibayar, 0),
            count: ikata.filter(item => item.status === "LUNAS").length
          }
          
          setDanaMandiriTotal(danaMandiriTotalData)
          setIkataTotal(ikataTotalData)
        } else {
          // Dapatkan semua data pembayaran untuk SuperUser dan admin
          const danaMandiri = await getAllDanaMandiri()
          const ikata = await getAllIkata()
          
          setDanaMandiriData(danaMandiri)
          setIkataData(ikata)
          
          // Set tahun default ke tahun terbaru yang ada di data
          const years = getCombinedYears(danaMandiriData, ikataData)
          if (years.length > 0) {
            // Tidak perlu set selectedYear agar menampilkan semua data
            
            // Dapatkan total untuk data tanpa filter tahun
            const danaMandiriTotalData = await getTotalDanaMandiriByYear(0) // 0 artinya semua tahun
            const ikataTotalData = await getTotalIkataByYear(0) // 0 artinya semua tahun
            
            setDanaMandiriTotal(danaMandiriTotalData)
            setIkataTotal(ikataTotalData)
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        toast.error("Gagal memuat data histori pembayaran")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])
  
  // Mendapatkan total dan menghitung ringkasan saat tahun berubah
  useEffect(() => {
    const updateTotals = async () => {
      try {
        if (hasAdminAccess) {
          // Jika selectedYear adalah undefined, maka kita mendapatkan total semua tahun
          const yearToQuery = selectedYear ?? 0;
          const danaMandiriTotalData = await getTotalDanaMandiriByYear(yearToQuery);
          const ikataTotalData = await getTotalIkataByYear(yearToQuery);
          
          setDanaMandiriTotal(danaMandiriTotalData);
          setIkataTotal(ikataTotalData);
        } else if (keluargaId) {
          // Untuk role umat, filter data berdasarkan tahun yang dipilih
          const filteredDanaMandiri = filterDanaMandiriByYear(danaMandiriData, selectedYear);
          const filteredIkata = filterIkataByYear(ikataData, selectedYear);
          
          const danaMandiriTotalData = {
            total: filteredDanaMandiri.filter(item => item.statusSetor).reduce((sum, item) => sum + item.jumlahDibayar, 0),
            count: filteredDanaMandiri.filter(item => item.statusSetor).length
          }
          
          const ikataTotalData = {
            total: filteredIkata.filter(item => item.status === "LUNAS").reduce((sum, item) => sum + item.jumlahDibayar, 0),
            count: filteredIkata.filter(item => item.status === "LUNAS").length
          }
          
          setDanaMandiriTotal(danaMandiriTotalData);
          setIkataTotal(ikataTotalData);
        }
      } catch (error) {
        console.error("Error updating totals:", error);
      }
    };
    
    updateTotals();
  }, [selectedYear, keluargaId, hasAdminAccess, danaMandiriData, ikataData]);
  
  // Data untuk tabel, difilter berdasarkan tahun dan search term
  const getFilteredDanaMandiriData = () => {
    let data = filterDanaMandiriByYear(danaMandiriData, selectedYear)
    
    // Filter berdasarkan nama kepala keluarga jika pencarian dilakukan
    if (searchTerm.trim() !== "") {
      const lowercaseSearchTerm = searchTerm.toLowerCase()
      data = data.filter(payment => 
        payment.namaKepalaKeluarga.toLowerCase().includes(lowercaseSearchTerm)
      )
    }
    
    return data
  }
  
  const getFilteredIkataData = () => {
    let data = filterIkataByYear(ikataData, selectedYear)
    
    // Filter untuk tidak menampilkan status BELUM_BAYAR
    data = data.filter(payment => payment.status !== "BELUM_BAYAR")
    
    // Filter berdasarkan nama kepala keluarga jika pencarian dilakukan
    if (searchTerm.trim() !== "") {
      const lowercaseSearchTerm = searchTerm.toLowerCase()
      data = data.filter(payment => 
        payment.namaKepalaKeluarga.toLowerCase().includes(lowercaseSearchTerm)
      )
    }
    
    return data
  }
  
  // Data yang sudah difilter
  const filteredDanaMandiriData = getFilteredDanaMandiriData()
  const filteredIkataData = getFilteredIkataData()
  
  // Mendapatkan daftar tahun untuk filter
  const availableYears = getCombinedYears(danaMandiriData, ikataData)
  
  // Handler untuk mengubah tahun yang dipilih
  const handleYearChange = (year?: number) => {
    setSelectedYear(year)
  }
  
  // Handler untuk mencari berdasarkan nama
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }
  
  // Handler untuk mengubah status Dana Mandiri
  const handleDanaMandiriStatusChange = async (payment: DanaMandiriHistory, statusSetor: boolean) => {
    try {
      const result = await updateDanaMandiri(payment.id, {
        statusSetor,
        tanggalSetor: statusSetor ? new Date() : null
      })
      
      if (result.success) {
        // Update local state
        setDanaMandiriData(prev => 
          prev.map(item => 
            item.id === payment.id 
              ? { 
                  ...item, 
                  statusSetor, 
                  tanggalSetor: statusSetor ? new Date() : null 
                } 
              : item
          )
        )
        
        toast.success(`Status berhasil diubah menjadi ${statusSetor ? "Sudah Disetor" : "Belum Disetor"}`)
        
        // Update total khusus untuk umat yang login jika mempunyai keluargaId
        if (keluargaId && !hasAdminAccess) {
          const filteredDanaMandiri = filterDanaMandiriByYear(
            danaMandiriData.map(item => 
              item.id === payment.id 
                ? { ...item, statusSetor, tanggalSetor: statusSetor ? new Date() : null } 
                : item
            ), 
            selectedYear
          );

          const danaMandiriTotalData = {
            total: filteredDanaMandiri.filter(item => item.statusSetor).reduce((sum, item) => sum + item.jumlahDibayar, 0),
            count: filteredDanaMandiri.filter(item => item.statusSetor).length
          };
          
          setDanaMandiriTotal(danaMandiriTotalData);
        } else {
          // Update total admin/superuser seperti biasa
          const yearToQuery = selectedYear ?? 0;
          const danaMandiriTotalData = await getTotalDanaMandiriByYear(yearToQuery);
          setDanaMandiriTotal(danaMandiriTotalData);
        }
      }
    } catch (error) {
      console.error("Error updating payment status:", error)
      toast.error("Gagal mengubah status pembayaran")
    }
  }
  
  // Handler untuk mengubah status IKATA
  const handleIkataStatusChange = async (payment: IkataHistory, status: "LUNAS" | "SEBAGIAN_BULAN" | "BELUM_BAYAR") => {
    try {
      const updates: any = { status }
      
      // Jika status berubah menjadi Lunas, atur bulanAwal dan bulanAkhir ke seluruh tahun
      if (status === "LUNAS") {
        updates.bulanAwal = 1
        updates.bulanAkhir = 12
      } else if (status === "BELUM_BAYAR") {
        updates.bulanAwal = null
        updates.bulanAkhir = null
        updates.jumlahDibayar = 0
      }
      
      const result = await updateIkata(payment.id, updates)
      
      if (result.success) {
        // Update local state
        setIkataData(prev => 
          prev.map(item => 
            item.id === payment.id ? { ...item, ...updates } : item
          )
        )
        
        const statusText = {
          "LUNAS": "Lunas",
          "SEBAGIAN_BULAN": "Sebagian Bulan",
          "BELUM_BAYAR": "Belum Bayar"
        }
        
        toast.success(`Status berhasil diubah menjadi ${statusText[status]}`)
        
        // Update total khusus untuk umat yang login jika mempunyai keluargaId
        if (keluargaId && !hasAdminAccess) {
          const updatedIkataData = ikataData.map(item => 
            item.id === payment.id ? { ...item, ...updates } : item
          );
          
          const filteredIkata = filterIkataByYear(updatedIkataData, selectedYear);
          
          const ikataTotalData = {
            total: filteredIkata.filter(item => item.status === "LUNAS").reduce((sum, item) => sum + item.jumlahDibayar, 0),
            count: filteredIkata.filter(item => item.status === "LUNAS").length
          };
          
          setIkataTotal(ikataTotalData);
        } else {
          // Update total untuk admin/superuser seperti biasa
          const yearToQuery = selectedYear ?? 0;
          const ikataTotalData = await getTotalIkataByYear(yearToQuery);
          setIkataTotal(ikataTotalData);
        }
      }
    } catch (error) {
      console.error("Error updating payment status:", error)
      toast.error("Gagal mengubah status pembayaran")
    }
  }
  
  // Handler untuk menghapus pembayaran Dana Mandiri
  const handleDeleteDanaMandiri = async (payment: DanaMandiriHistory) => {
    try {
      const result = await deleteDanaMandiri(payment.id)
      
      if (result.success) {
        // Update local state
        setDanaMandiriData(prev => prev.filter(item => item.id !== payment.id))
        
        toast.success("Pembayaran berhasil dihapus")
        
        // Perbarui total berdasarkan role dan keluargaId
        if (keluargaId && !hasAdminAccess) {
          const filteredDanaMandiri = filterDanaMandiriByYear(
            danaMandiriData.filter(item => item.id !== payment.id),
            selectedYear
          );
          
          const danaMandiriTotalData = {
            total: filteredDanaMandiri.filter(item => item.statusSetor).reduce((sum, item) => sum + item.jumlahDibayar, 0),
            count: filteredDanaMandiri.filter(item => item.statusSetor).length
          };
          
          setDanaMandiriTotal(danaMandiriTotalData);
        } else {
          const yearToQuery = selectedYear ?? 0;
          const danaMandiriTotalData = await getTotalDanaMandiriByYear(yearToQuery);
          setDanaMandiriTotal(danaMandiriTotalData);
        }
      }
    } catch (error) {
      console.error("Error deleting payment:", error)
      toast.error("Gagal menghapus pembayaran")
    }
  }
  
  // Handler untuk menghapus pembayaran IKATA
  const handleDeleteIkata = async (payment: IkataHistory) => {
    try {
      const result = await deleteIkata(payment.id)
      
      if (result.success) {
        // Update local state
        setIkataData(prev => prev.filter(item => item.id !== payment.id))
        
        toast.success("Pembayaran berhasil dihapus")
        
        // Perbarui total berdasarkan role dan keluargaId
        if (keluargaId && !hasAdminAccess) {
          const filteredIkata = filterIkataByYear(
            ikataData.filter(item => item.id !== payment.id),
            selectedYear
          );
          
          const ikataTotalData = {
            total: filteredIkata.filter(item => item.status === "LUNAS").reduce((sum, item) => sum + item.jumlahDibayar, 0),
            count: filteredIkata.filter(item => item.status === "LUNAS").length
          };
          
          setIkataTotal(ikataTotalData);
        } else {
          const yearToQuery = selectedYear ?? 0;
          const ikataTotalData = await getTotalIkataByYear(yearToQuery);
          setIkataTotal(ikataTotalData);
        }
      }
    } catch (error) {
      console.error("Error deleting payment:", error)
      toast.error("Gagal menghapus pembayaran")
    }
  }
  
  // Handler untuk memperbaiki data bulan IKATA
  const handleFixIkataMonthData = async () => {
    try {
      setIsLoading(true)
      const result = await fixIkataMonthData()
      
      if (result.success) {
        toast.success(`Berhasil memperbaiki ${result.fixed} data bulan IKATA`)
        
        // Refresh data setelah perbaikan
        try {
          if (hasAdminAccess) {
            const danaMandiri = await getAllDanaMandiri()
            const ikata = await getAllIkata()
            
            setDanaMandiriData(danaMandiri)
            setIkataData(ikata)
            
            // Perbarui total
            const yearToQuery = selectedYear ?? 0;
            const danaMandiriTotalData = await getTotalDanaMandiriByYear(yearToQuery);
            const ikataTotalData = await getTotalIkataByYear(yearToQuery);
            
            setDanaMandiriTotal(danaMandiriTotalData)
            setIkataTotal(ikataTotalData)
          }
        } catch (refreshError) {
          console.error("Error refreshing data:", refreshError)
          toast.error("Gagal memperbarui data setelah perbaikan")
        }
      }
    } catch (error) {
      console.error("Error fixing IKATA month data:", error)
      toast.error("Gagal memperbaiki data bulan IKATA")
    } finally {
      setIsLoading(false)
    }
  }
  
  // Jika masih loading, tampilkan pesan loading
  if (isLoading) {
    return <LoadingSkeleton />
  }

  return (
    <div className="space-y-6 p-2">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Histori Pembayaran</h2>
        {/* Tombol perbaikan data hanya untuk super user */}
        {isSuperUser && (
          <Button
            variant="outline"
            onClick={handleFixIkataMonthData}
            disabled={isLoading}
            className="text-sm"
          >
            Perbaiki Data Bulan IKATA
          </Button>
        )}
      </div>
      
      {/* Summary Cards */}
      <SummaryCards
        danaMandiriTotal={danaMandiriTotal.total}
        danaMandiriCount={danaMandiriTotal.count}
        ikataTotal={ikataTotal.total}
        ikataCount={ikataTotal.count}
      />
      
      {/* Tabs */}
      <Tabs defaultValue="dana-mandiri" className="w-full">
        <TabsList>
          <TabsTrigger value="dana-mandiri">Dana Mandiri</TabsTrigger>
          <TabsTrigger value="ikata">IKATA</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dana-mandiri" className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2 items-center">
              <YearFilter 
                availableYears={availableYears} 
                selectedYear={selectedYear}
                onChange={handleYearChange}
              />
              
              {/* Search input (selalu tampil, readonly jika role UMAT) */}
              <div className="relative w-full md:w-64">
                <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari nama umat..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={handleSearch}
                  readOnly={userRole === "UMAT"}
                />
                {searchTerm && hasAdminAccess && (
                  <Button
                    variant="ghost"
                    className="absolute right-0 top-0 h-9 w-9 p-0"
                    onClick={() => setSearchTerm("")}
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Clear search</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
          
          <div className="rounded-md border">
            <PaymentHistoryTable 
              data={filteredDanaMandiriData} 
              type="Dana Mandiri"
              showUserColumn={hasAdminAccess}
              onStatusChange={handleDanaMandiriStatusChange}
              onDelete={handleDeleteDanaMandiri}
              showActions={hasAdminAccess}
            />
          </div>
        </TabsContent>

        <TabsContent value="ikata" className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2 items-center">
              <YearFilter 
                availableYears={availableYears} 
                selectedYear={selectedYear}
                onChange={handleYearChange}
              />
              
              {/* Search input (selalu tampil, readonly jika role UMAT) */}
              <div className="relative w-full md:w-64">
                <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari nama umat..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={handleSearch}
                  readOnly={userRole === "UMAT"}
                />
                {searchTerm && hasAdminAccess && (
                  <Button
                    variant="ghost"
                    className="absolute right-0 top-0 h-9 w-9 p-0"
                    onClick={() => setSearchTerm("")}
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Clear search</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
          
          <div className="rounded-md border">
            <PaymentHistoryTable 
              data={filteredIkataData}
              type="IKATA"
              showUserColumn={hasAdminAccess}
              onStatusChange={handleIkataStatusChange}
              onDelete={handleDeleteIkata}
              showActions={hasAdminAccess}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 