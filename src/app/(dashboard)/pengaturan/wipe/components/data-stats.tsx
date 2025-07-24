"use client"

import { useEffect, useState } from "react"
import { DataStats, getDataStats } from "../actions/data-stats"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Database, CreditCard, FileText, Book, CalendarDays, User, Home, HelpCircle, Heart, Users as UsersIcon } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function DataStatsComponent() {
  const [stats, setStats] = useState<DataStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("umat")

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getDataStats()
        setStats(data)
      } catch (error) {
        console.error("Error fetching data stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <Card className="mb-4 md:mb-6">
        <CardContent className="p-3 md:p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="space-y-2">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!stats) {
    return null
  }

  const umatStats = [
    { 
      icon: <Home className="h-4 w-4 md:h-5 md:w-5 text-blue-500" />, 
      label: "Keluarga", 
      value: stats.keluargaUmat,
      dataType: "keluarga_umat",
      description: "Jumlah keluarga terdaftar"
    },
    { 
      icon: <Heart className="h-4 w-4 md:h-5 md:w-5 text-red-500" />, 
      label: "Pasangan", 
      value: stats.pasangan,
      dataType: "pasangan",
      description: "Jumlah pasangan terdaftar"
    },
    { 
      icon: <UsersIcon className="h-4 w-4 md:h-5 md:w-5 text-orange-500" />, 
      label: "Tanggungan", 
      value: stats.tanggungan,
      dataType: "tanggungan",
      description: "Jumlah tanggungan (anak/kerabat)"
    },
    { 
      icon: <User className="h-4 w-4 md:h-5 md:w-5 text-indigo-500" />, 
      label: "Pengguna", 
      value: stats.user,
      dataType: "user",
      description: "Jumlah akun pengguna sistem"
    },
  ]

  const transactionStats = [
    { 
      icon: <CreditCard className="h-4 w-4 md:h-5 md:w-5 text-emerald-500" />, 
      label: "Kas", 
      value: stats.kasLingkungan, 
      dataType: "kas_lingkungan",
      description: "Transaksi kas lingkungan"
    },
    { 
      icon: <CreditCard className="h-4 w-4 md:h-5 md:w-5 text-green-500" />, 
      label: "Dana Mandiri", 
      value: stats.danaMandiri, 
      dataType: "dana_mandiri",
      description: "Data pembayaran dana mandiri"
    },
    { 
      icon: <CreditCard className="h-4 w-4 md:h-5 md:w-5 text-teal-500" />, 
      label: "IKATA", 
      value: stats.kasIkata, 
      dataType: "kas_ikata",
      description: "Transaksi kas IKATA"
    },
  ]

  const activityStats = [
    { 
      icon: <Book className="h-4 w-4 md:h-5 md:w-5 text-amber-500" />, 
      label: "Doa", 
      value: stats.doaLingkungan, 
      dataType: "doling",
      description: "Kegiatan doa lingkungan"
    },
    { 
      icon: <FileText className="h-4 w-4 md:h-5 md:w-5 text-purple-500" />, 
      label: "Publikasi", 
      value: stats.publikasi, 
      dataType: "publikasi",
      description: "Publikasi/pengumuman"
    },
    { 
      icon: <CalendarDays className="h-4 w-4 md:h-5 md:w-5 text-rose-500" />, 
      label: "Agenda", 
      value: stats.pengajuan, 
      dataType: "agenda",
      description: "Pengajuan agenda/kegiatan"
    },
  ]

  // Pilih data yang akan ditampilkan berdasarkan tab aktif
  let currentStats: typeof umatStats = [];
  
  switch (activeTab) {
    case "umat":
      currentStats = umatStats;
      break;
    case "transaksi":
      currentStats = transactionStats;
      break;
    case "kegiatan":
      currentStats = activityStats;
      break;
    case "semua":
      currentStats = [...umatStats, ...transactionStats, ...activityStats];
      break;
  }

  return (
    <Card className="mb-4 md:mb-6">
      <CardContent className="p-3 md:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3 md:mb-4">
          <div className="flex items-center">
            <Database className="h-4 w-4 md:h-5 md:w-5 mr-2 text-gray-500" />
            <h3 className="text-base md:text-lg font-semibold">Statistik Data</h3>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full flex flex-wrap md:grid md:grid-cols-4 mb-3 md:mb-4">
            <TabsTrigger className="flex-1 h-8 md:h-10 text-xs md:text-sm py-1 px-1 md:py-2 md:px-2" value="umat">Data Umat</TabsTrigger>
            <TabsTrigger className="flex-1 h-8 md:h-10 text-xs md:text-sm py-1 px-1 md:py-2 md:px-2" value="transaksi">Transaksi</TabsTrigger>
            <TabsTrigger className="flex-1 h-8 md:h-10 text-xs md:text-sm py-1 px-1 md:py-2 md:px-2" value="kegiatan">Kegiatan</TabsTrigger>
            <TabsTrigger className="flex-1 h-8 md:h-10 text-xs md:text-sm py-1 px-1 md:py-2 md:px-2" value="semua">Semua</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="mt-0">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
              {currentStats.map((item) => (
                <div 
                  key={item.dataType} 
                  className="flex flex-col p-2 md:p-3 border rounded-md"
                >
                  <div className="flex items-center mb-1">
                    {item.icon}
                    <span className="text-xs md:text-sm ml-1">{item.label}</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button className="ml-1">
                            <HelpCircle className="h-3 w-3 md:h-3.5 md:w-3.5 text-muted-foreground" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top" align="center" className="max-w-[200px]">
                          <p className="text-xs">{item.description}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <span className="text-lg md:text-2xl font-bold">
                    {item.value.toLocaleString('id-ID')}
                  </span>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
} 