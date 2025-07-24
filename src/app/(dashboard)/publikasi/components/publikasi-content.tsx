"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { DateRange } from "react-day-picker"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Plus, PlusCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SummaryCards } from "./summary-cards"
import { PublikasiTable } from "./publikasi-table"
import { SearchInput } from "./search-input"
import { StatusFilter } from "./status-filter"
import { KategoriFilter } from "./kategori-filter"
import { PeriodFilter } from "./period-filter"
import BuatLaporanDialog from "./buat-laporan-dialog"
import BuatPublikasiDialog from "./buat-publikasi-dialog"
import { useAuth } from "@/contexts/auth-context"
import { getPublikasi } from "../utils/actions"
import { PublikasiWithRelations, ActionResponse } from "../types/publikasi"
import { format, isAfter, isBefore } from "date-fns"
import { getKategoriColor, isPublikasiExpired } from "../utils/constants"
import { KlasifikasiPublikasi } from "@prisma/client"
import { toast } from "sonner"

export default function PublikasiContent() {
  const { userRole } = useAuth()
  const [activeTab, setActiveTab] = useState("pengumuman")
  const [publikasiData, setPublikasiData] = useState<PublikasiWithRelations[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [kategoriFilter, setKategoriFilter] = useState<KlasifikasiPublikasi | null>(null)
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  
  // Cek apakah pengguna memiliki akses untuk membuat publikasi
  const canCreatePublication = [
    'SUPER_USER', 
    'SEKRETARIS', 
    'WAKIL_SEKRETARIS'
  ].includes(userRole || '')
  
  // Fetch publikasi data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const result = await getPublikasi() as ActionResponse<PublikasiWithRelations[]>
        if (result.success && result.data) {
          setPublikasiData(result.data)
        } else {
          toast.error("Gagal mengambil data publikasi", {
            description: result.error || "Terjadi kesalahan pada server"
          })
        }
      } catch (error) {
        console.error("Error fetching publikasi:", error)
        toast.error("Gagal mengambil data publikasi")
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchData()
  }, [])
  
  // Setup table
  const filteredData = React.useMemo(() => {
    let filtered = [...publikasiData]
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.judul.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    // Filter by status
    if (statusFilter) {
      const isExpiredStatus = statusFilter === 'kedaluwarsa'
      filtered = filtered.filter(item => {
        const itemExpired = item.deadline ? isPublikasiExpired(item.deadline) : false
        return isExpiredStatus ? itemExpired : !itemExpired
      })
    }
    
    // Filter by kategori
    if (kategoriFilter) {
      filtered = filtered.filter(item => item.klasifikasi === kategoriFilter)
    }
    
    // Filter by date range
    if (dateRange?.from) {
      const fromDate = new Date(dateRange.from)
      fromDate.setHours(0, 0, 0, 0)
      
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.createdAt)
        if (dateRange.to) {
          const toDate = new Date(dateRange.to)
          toDate.setHours(23, 59, 59, 999)
          return isAfter(itemDate, fromDate) && isBefore(itemDate, toDate)
        }
        return isAfter(itemDate, fromDate)
      })
    }
    
    return filtered
  }, [publikasiData, searchTerm, statusFilter, kategoriFilter, dateRange])
  
  // Reset all filters
  const resetAllFilters = () => {
    setSearchTerm("")
    setStatusFilter(null)
    setKategoriFilter(null)
    setDateRange(undefined)
  }

  // Handle successful creation
  const handlePublikasiCreated = async () => {
    try {
      const result = await getPublikasi() as ActionResponse<PublikasiWithRelations[]>
      if (result.success && result.data) {
        setPublikasiData(result.data)
        setActiveTab("pengumuman")
      }
    } catch (error) {
      console.error("Error refreshing publikasi:", error)
    }
  }

  return (
    <div className="space-y-6 p-2">
      {/* Summary Cards */}
      <SummaryCards data={publikasiData} />

      {/* Tabs */}
      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="mb-4 bg-muted/60">
          <TabsTrigger value="pengumuman">Pengumuman</TabsTrigger>
          {canCreatePublication && (
            <TabsTrigger 
              value="buat-publikasi" 
              className="flex items-center"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Buat Publikasi
            </TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="pengumuman" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Daftar Pengumuman</CardTitle>
              <CardDescription>
                Kelola semua pengumuman yang tersedia dalam sistem
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filters Section - Ditata ulang agar benar-benar sejajar */}
              <div className="flex flex-wrap gap-4 items-center mb-4">
                <div className="inline-flex">
                  <SearchInput 
                    table={{
                      getColumn: () => ({
                        setFilterValue: () => {},
                      }),
                    } as any} 
                    searchTerm={searchTerm} 
                    setSearchTerm={setSearchTerm}
                    placeholder="Cari pengumuman..."
                  />
                </div>
                
                <div className="inline-flex">
                  <StatusFilter 
                    table={{
                      getColumn: () => ({
                        setFilterValue: () => {},
                      }),
                    } as any} 
                    statusFilter={statusFilter} 
                    setStatusFilter={setStatusFilter} 
                  />
                </div>
                
                <div className="inline-flex">
                  <KategoriFilter 
                    table={{
                      getColumn: () => ({
                        setFilterValue: () => {},
                      }),
                    } as any} 
                    kategoriFilter={kategoriFilter} 
                    setKategoriFilter={setKategoriFilter} 
                  />
                </div>
                
                <div className="inline-flex">
                  <PeriodFilter 
                    dateRange={dateRange} 
                    setDateRange={setDateRange} 
                  />
                </div>
              </div>

              {/* Active Filters Summary */}
              {(searchTerm || statusFilter || kategoriFilter || dateRange) && (
                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mb-4">
                  <span>Filter aktif:</span>
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="ml-auto h-7 text-xs"
                    onClick={resetAllFilters}
                  >
                    Reset Semua
                  </Button>
                </div>
              )}

              {/* Table Section */}
              <PublikasiTable 
                data={filteredData} 
                isLoading={isLoading} 
                onRefresh={handlePublikasiCreated}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        {canCreatePublication && (
          <TabsContent value="buat-publikasi" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Buat Publikasi Baru</CardTitle>
                <CardDescription>
                  Buat publikasi baru untuk disebarkan kepada umat
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BuatPublikasiDialog onSuccess={handlePublikasiCreated} />
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
} 