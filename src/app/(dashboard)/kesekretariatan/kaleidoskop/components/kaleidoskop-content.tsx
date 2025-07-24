"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { PeriodeSelector } from "./periode-selector";
import { getKaleidoskopData, getStatistikPerJenisIbadat, getRingkasanKegiatan } from "../actions";
import { getMonthRange } from "../utils/data-utils";
import { JenisIbadat, SubIbadat } from "@prisma/client";
import { ChartBarIcon, Calendar, Users2, Filter } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { KaleidoskopActivityData, StatistikPerJenisIbadat, RingkasanKegiatan } from "../actions";

// Definisi interface untuk props
interface KaleidoskopContentProps {
  activityData: KaleidoskopActivityData[];
  summaryData: RingkasanKegiatan;
  periodRange?: {
    startDate: Date;
    endDate: Date;
  };
}

// Komponen utama untuk halaman Kaleidoskop
export function KaleidoskopContent({
  activityData: initialActivityData, 
  summaryData: initialSummaryData,
  periodRange
}: KaleidoskopContentProps) {
  // State untuk filter periode
  const currentDate = new Date();

  const [bulan, setBulan] = useState("all");
  const [tahun, setTahun] = useState("all");
  
  // State untuk menampilkan filter
  const [showFilter, setShowFilter] = useState(false);
  
  // State untuk data
  const [activityData, setActivityData] = useState<KaleidoskopActivityData[]>(initialActivityData);
  const [statistikData, setStatistikData] = useState<StatistikPerJenisIbadat[]>([]);
  const [ringkasanData, setRingkasanData] = useState<RingkasanKegiatan | null>(initialSummaryData);
  const [isLoading, setIsLoading] = useState(false);
  
  // Fungsi untuk memuat data
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      let startDate: Date | undefined;
      let endDate: Date | undefined;
      
      // Jika filter dipilih, konversi ke Date menggunakan utility functions
      if (bulan !== "all" && tahun !== "all") {
        const monthRange = getMonthRange(parseInt(tahun), parseInt(bulan));
        startDate = monthRange.startDate;
        endDate = monthRange.endDate;
      }
      
      // Panggil server actions
      const [activities, statistik, ringkasan] = await Promise.all([
        getKaleidoskopData(startDate, endDate),
        getStatistikPerJenisIbadat(startDate, endDate),
        getRingkasanKegiatan(startDate, endDate)
      ]);
      
      setActivityData(activities);
      setStatistikData(statistik);
      setRingkasanData(ringkasan);
    } catch (error) {
      // Error akan di-handle secara silent
    } finally {
      setIsLoading(false);
    }
  }, [bulan, tahun]);
  
  // Memuat data ketika komponen dimount
  useEffect(() => {
    if (initialActivityData.length > 0 && initialSummaryData) {
      // Gunakan data awal dan dapatkan statistiknya
      getStatistikPerJenisIbadat()
        .then(statistik => {
          setStatistikData(statistik);
        })
        .catch(error => {
          // Error akan di-handle secara silent
        });
    } else {
      // Jika tidak ada data awal, lakukan fetch lengkap
      loadData();
    }
  }, [loadData, initialActivityData, initialSummaryData]);
  
  // Handler untuk tombol "Filter Sekarang"
  const handleFilter = useCallback(() => {
    loadData();
    setShowFilter(false);
  }, [loadData]);

  // Membuat label periode
  const getPeriodeLabel = () => {
    if (bulan === "all" || tahun === "all") {
      return "Semua Data";
    }
    
    const months = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];
    
    const bulanText = months[parseInt(bulan)];
    return `${bulanText} ${tahun}`;
  };
  
  // Mendapatkan warna berdasarkan jenisIbadat
  const getColor = (jenisIbadat: JenisIbadat) => {
    const colors: Record<JenisIbadat, string> = {
      DOA_LINGKUNGAN: "bg-blue-100 text-blue-700 border-blue-200",
      MISA: "bg-purple-100 text-purple-700 border-purple-200",
      PERTEMUAN: "bg-amber-100 text-amber-700 border-amber-200",
      BAKTI_SOSIAL: "bg-green-100 text-green-700 border-green-200",
      KEGIATAN_LAIN: "bg-gray-100 text-gray-700 border-gray-200",
    };
    
    return colors[jenisIbadat];
  };
  
  // Mendapatkan nama yang mudah dibaca untuk jenis ibadat
  const getReadableJenisIbadat = (jenisIbadat: JenisIbadat): string => {
    const names: Record<JenisIbadat, string> = {
      DOA_LINGKUNGAN: "Doa Lingkungan",
      MISA: "Misa",
      PERTEMUAN: "Pertemuan",
      BAKTI_SOSIAL: "Bakti Sosial",
      KEGIATAN_LAIN: "Kegiatan Lain",
    };
    
    return names[jenisIbadat];
  };
  
  // Mendapatkan nama yang mudah dibaca untuk sub ibadat
  const getReadableSubIbadat = (subIbadat: SubIbadat | null, customNama?: string | null): string => {
    // Prioritaskan customNama jika ada
    if (customNama) return customNama;
    
    if (!subIbadat) return "Umum";
    
    const names: Record<SubIbadat, string> = {
      IBADAT_SABDA: "Ibadat Sabda",
      IBADAT_SABDA_TEMATIK: "Ibadat Sabda Tematik",
      PRAPASKAH: "Prapaskah",
      BKSN: "BKSN",
      BULAN_ROSARIO: "Bulan Rosario",
      NOVENA_NATAL: "Novena Natal",
      MISA_SYUKUR: "Misa Syukur",
      MISA_REQUEM: "Misa Requem",
      MISA_ARWAH: "Misa Arwah",
      MISA_PELINDUNG: "Misa Pelindung",
    };
    
    return names[subIbadat];
  };
  
  // Mendapatkan background color
  const getBgColor = (colorClass: string) => {
    return colorClass.split(' ')[0];
  };
  
  // Mendapatkan text color
  const getTextColor = (colorClass: string) => {
    return colorClass.split(' ')[1];
  };

  return (
    <div className="container mx-auto px-2 py-3 max-w-7xl">
      {/* Header Section */}
      <div className="mb-4 flex flex-col gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ChartBarIcon className="h-6 w-6 text-primary" />
            <h1 className="text-lg font-bold tracking-tight">Kaleidoskop Doa Lingkungan</h1>
          </div>
          <p className="text-muted-foreground text-xs md:textsm">
            Rekap frekuensi kegiatan doa lingkungan berdasarkan jenis dan sub ibadat
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-2">
          <Badge variant="outline" className="px-3 py-1 text-sm font-medium flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            <span>{getPeriodeLabel()}</span>
          </Badge>
          
          <button
            className="flex items-center gap-1.5 text-sm px-3 py-1 border rounded-md bg-amber-300 cursor-pointer hover:bg-amber-400 transition-colors"
            onClick={() => setShowFilter(!showFilter)}
          >
            <Filter className="h-3.5 w-3.5" />
            Filter Periode
          </button>
        </div>
      </div>
      
      {/* Filter Section */}
      {showFilter && (
        <div className="mb-6 bg-muted/20 border rounded-lg p-4">
          <div className="mb-2 flex justify-between items-center">
            <h2 className="text-lg font-semibold">Filter Periode</h2>
            <button 
              className="text-sm text-muted-foreground"
              onClick={() => setShowFilter(false)}
            >
              Tutup
            </button>
          </div>
          <PeriodeSelector
            bulan={bulan}
            setBulan={setBulan}
            tahun={tahun}
            setTahun={setTahun}
            onFilter={handleFilter}
          />
        </div>
      )}
      
      {/* Loading State */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Memuat data kaleidoskop...</p>
          </div>
        </div>
      ) : (
        <>
      {/* Summary Cards */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-3 mb-6">
        <div className="bg-blue-50 border border-blue-100 rounded-lg shadow-sm">
          <div className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-blue-600 mb-1">Total Kegiatan</p>
                    <h3 className="text-3xl font-bold text-blue-800">{ringkasanData?.totalKegiatan || 0}</h3>
                <p className="text-xs text-blue-600 mt-1">Pertemuan dalam periode {getPeriodeLabel()}</p>
              </div>
              <div className="bg-blue-100 p-2 rounded-full">
                <Calendar className="h-5 w-5 text-blue-700" />
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-purple-50 border border-purple-100 rounded-lg shadow-sm">
          <div className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-purple-600 mb-1">Jenis Ibadat</p>
                    <h3 className="text-3xl font-bold text-purple-800">{ringkasanData?.totalJenisIbadat || 0}</h3>
                <p className="text-xs text-purple-600 mt-1">Kategori ibadat yang dilaksanakan</p>
              </div>
              <div className="bg-purple-100 p-2 rounded-full">
                <ChartBarIcon className="h-5 w-5 text-purple-700" />
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-amber-50 border border-amber-100 rounded-lg shadow-sm">
          <div className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-amber-600 mb-1">Sub Ibadat</p>
                    <h3 className="text-3xl font-bold text-amber-800">{ringkasanData?.totalSubIbadat || 0}</h3>
                <p className="text-xs text-amber-600 mt-1">Variasi kegiatan dalam ibadat</p>
              </div>
              <div className="bg-amber-100 p-2 rounded-full">
                <Users2 className="h-5 w-5 text-amber-700" />
              </div>
            </div>
          </div>
        </div>
      </div>
      
          {/* Tabs for different views */}
          <Tabs defaultValue="statistik" className="mb-8">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="statistik">Statistik</TabsTrigger>
              <TabsTrigger value="detil">Daftar Kegiatan</TabsTrigger>
            </TabsList>
            
            {/* Statistik View */}
            <TabsContent value="statistik">
              <div className="space-y-6">
                {statistikData.length === 0 ? (
                  <Alert variant="default">
                    <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Tidak ada data</AlertTitle>
                    <AlertDescription>
                      Tidak ada kegiatan yang tercatat pada periode {getPeriodeLabel()}
                    </AlertDescription>
                  </Alert>
                ) : (
                  <>
                    <div className="bg-white rounded-lg border p-4">
                      <h3 className="text-lg font-semibold mb-4">Distribusi Jenis Ibadat</h3>
                      <div className="space-y-4">
                        {statistikData.map((stat, index) => (
                          <div key={index} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Badge className={getColor(stat.jenisIbadat)}>
                                  {getReadableJenisIbadat(stat.jenisIbadat)}
                                </Badge>
                                <span className="text-sm text-muted-foreground">
                                  {stat.jumlah} kegiatan
                                </span>
                              </div>
                              <span className="font-semibold">
                                {stat.persentase.toFixed(1)}%
                              </span>
                            </div>
                            <Progress value={stat.persentase} className="h-2" />
                            
                            {/* Sub ibadat breakdown */}
                            {stat.subIbadat.length > 0 && (
                              <div className="ml-4 mt-2 text-sm">
                                <div className="flex flex-wrap gap-2 mt-1">
                                  {stat.subIbadat.map((sub, subIndex) => (
                                    <Badge 
                                      key={subIndex}
                                      variant="outline"
                                      className="text-xs font-normal"
                                    >
                                      {getReadableSubIbadat(sub.nama, sub.customNama)}: {sub.jumlah}
                            </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                        </div>
                            </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white rounded-lg border p-4">
                        <h3 className="text-lg font-semibold mb-2">Kehadiran</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Rata-rata KK per kegiatan</span>
                            <span className="font-medium">{ringkasanData?.kehadiranRataRata.toFixed(1) || 0}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Total kehadiran (semua kegiatan)</span>
                            <span className="font-medium">{ringkasanData?.totalPeserta || 0} orang</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-white rounded-lg border p-4">
                        <h3 className="text-lg font-semibold mb-2">Jenis Ibadat Terbanyak</h3>
                        {ringkasanData?.jenisIbadatTerbanyak ? (
                          <Badge className={`${getColor(ringkasanData.jenisIbadatTerbanyak)} text-base px-3 py-1.5`}>
                            {getReadableJenisIbadat(ringkasanData.jenisIbadatTerbanyak)}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </div>
                  </div>
                </>
              )}
            </div>
          </TabsContent>
          
            {/* Detail View */}
            <TabsContent value="detil">
              <div className="bg-white rounded-lg border">
                <div className="p-4 border-b">
                  <h3 className="text-lg font-semibold">Daftar Kegiatan</h3>
                  <p className="text-sm text-muted-foreground">
                    Total {activityData.length} kegiatan dalam periode {getPeriodeLabel()}
                  </p>
                        </div>
                
                <ScrollArea className="h-[400px]">
                  {activityData.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                      Tidak ada kegiatan yang tercatat pada periode ini
                      </div>
                  ) : (
                    <ul className="divide-y">
                      {activityData.map((activity) => (
                        <li key={activity.id} className="p-4 hover:bg-muted/20">
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                                  <div>
                              <div className="flex items-center gap-2 mb-1">
                                <Badge className={getColor(activity.jenisIbadat)}>
                                  {getReadableJenisIbadat(activity.jenisIbadat)}
                                </Badge>
                                {(activity.subIbadat || activity.customSubIbadat) && (
                                  <Badge variant="outline">
                                    {getReadableSubIbadat(activity.subIbadat, activity.customSubIbadat)}
                                  </Badge>
                                )}
                              </div>
                              
                              <h4 className="font-medium">
                                {activity.temaIbadat || getReadableJenisIbadat(activity.jenisIbadat)}
                              </h4>
                              
                              <div className="text-sm text-muted-foreground mt-1">
                                Tuan Rumah: {activity.tuanRumah}
                              </div>
                            </div>
                            
                            <div className="mt-2 md:mt-0 flex flex-col items-start md:items-end">
                              <div className="text-sm font-medium">
                                {activity.tanggal.toLocaleDateString('id-ID', {
                                  weekday: 'long',
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric'
                                })}
                              </div>
                              
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {activity.jumlahKKHadir} KK
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {activity.totalPeserta} orang
                                </Badge>
                              </div>
                                </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                        </ScrollArea>
            </div>
          </TabsContent>
        </Tabs>
          
          {/* Info Section */}
          <Alert variant="default" className="mt-8 bg-blue-50">
            <Info className="h-4 w-4" />
            <AlertTitle>Tentang Kaleidoskop</AlertTitle>
            <AlertDescription>
              Kaleidoskop menampilkan statistik dan rekapitulasi dari seluruh kegiatan doa lingkungan.
              Gunakan filter periode untuk melihat data pada rentang waktu tertentu.
            </AlertDescription>
          </Alert>
        </>
      )}
    </div>
  );
} 