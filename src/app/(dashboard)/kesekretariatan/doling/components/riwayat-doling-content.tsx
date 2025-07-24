"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RiwayatDoling, RekapitulasiKegiatan, DetilDoling, AbsensiDoling } from "../types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SearchIcon, X, DownloadIcon, CalendarIcon, TrendingUpIcon, AlertCircle } from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { PrintRiwayatDialog } from "./print-riwayat-dialog";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend, 
  ResponsiveContainer,
  Cell,
  LabelList
} from 'recharts';

interface RiwayatDolingContentProps {
  riwayat: RiwayatDoling[];
  rekapitulasi: RekapitulasiKegiatan[];
  detilDolingData: DetilDoling[];
  absensiDolingData: AbsensiDoling[];
}

export function RiwayatDolingContent({ 
  riwayat, 
  rekapitulasi, 
  detilDolingData, 
  absensiDolingData 
}: RiwayatDolingContentProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPeriode, setSelectedPeriode] = useState("all");
  const [sortBy, setSortBy] = useState("nama"); // nama, kehadiran, persentase
  const [sortOrder, setSortOrder] = useState("asc"); // asc, desc
  const [printDialogOpen, setPrintDialogOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(0);
  // Untuk menyimpan data periode secara dinamis
  const [periodeOptions, setPeriodeOptions] = useState<{value: string, label: string}[]>([
    { value: "all", label: "Semua Periode" }
  ]);
  
  // Fallback chart data untuk kasus di mana tidak ada data
  const fallbackChartData = Array(6).fill(0).map((_, index) => {
    const bulanNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", 
                       "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    const currentMonth = new Date().getMonth();
    const bulanIndex = (currentMonth - 5 + index + 12) % 12;
    
    return {
      bulan: bulanNames[bulanIndex],
      tahun: new Date().getFullYear().toString(),
      jumlahKegiatan: 0,
      rataRataHadir: 0,
      persentase: 0,
      color: "#e5e7eb" // warna abu-abu muda untuk data kosong
    };
  });

  // Deteksi ukuran layar untuk responsivitas
  useEffect(() => {
    // Set initial width
    setWindowWidth(window.innerWidth);
    
    // Update width on resize
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Mendapatkan tahun-tahun untuk dropdown periode
  useEffect(() => {
    const generatePeriodeOptions = () => {
      const options = [{ value: "all", label: "Semua Periode" }];
      
      // Tahun saat ini
      const currentYear = new Date().getFullYear();
      
      // Tambahkan 3 tahun ke belakang dan 3 tahun ke depan
      for (let year = currentYear - 3; year <= currentYear + 3; year++) {
        options.push({
          value: year.toString(),
          label: `Tahun ${year}`
        });
      }
      
      setPeriodeOptions(options);
    };
    
    generatePeriodeOptions();
  }, []);
  
  // Filter riwayat berdasarkan pencarian
  const filteredRiwayat = riwayat.filter(item => 
    item.nama.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Urutkan data
  const sortedRiwayat = [...filteredRiwayat].sort((a, b) => {
    if (sortBy === "nama") {
      return sortOrder === "asc" 
        ? a.nama.localeCompare(b.nama) 
        : b.nama.localeCompare(a.nama);
    } else if (sortBy === "kehadiran") {
      return sortOrder === "asc" 
        ? a.totalHadir - b.totalHadir 
        : b.totalHadir - a.totalHadir;
    } else {
      return sortOrder === "asc" 
        ? a.persentase - b.persentase 
        : b.persentase - a.persentase;
    }
  });
  
  // Filter rekapitulasi berdasarkan periode
  const filteredRekapitulasi = rekapitulasi.filter(item => {
    if (selectedPeriode === "all") return true;
    
    // Format bulan yang diharapkan: "Januari 2024"
    // Kita perlu mengekstrak tahun dari item.bulan (jika formatnya berbeda)
    const tahunInBulan = item.bulan.split(' ')[1]; // Asumsi format "Bulan Tahun"
    return tahunInBulan === selectedPeriode || item.bulan.includes(selectedPeriode);
  });
  
  // Fungsi untuk mendapatkan warna badge berdasarkan persentase
  const getBadgeVariant = (percentage: number) => {
    if (percentage >= 80) return "success";
    if (percentage >= 60) return "default";
    if (percentage >= 40) return "outline";
    return "destructive";
  };
  
  // Fungsi untuk mendapatkan warna bar berdasarkan nilai rata-rata hadir
  const getBarColor = (value: number) => {
    if (value >= 33) return "#22c55e"; // green-500
    if (value >= 28) return "#3b82f6"; // blue-500
    if (value >= 20) return "#eab308"; // yellow-500
    return "#ef4444"; // red-500
  };
  
  // Data untuk chart dengan konversi ke format yang sesuai untuk Recharts
  // Gunakan 6 bulan terakhir untuk trend chart
  const getChartData = () => {
    // Jika tidak ada data, gunakan fallback
    if (rekapitulasi.length === 0) {
      return fallbackChartData;
    }
    
    // Ambil data dengan jumlah kegiatan > 0
    const dataWithActivity = rekapitulasi.filter(item => item.jumlahKegiatan > 0);
    
    // Jika tidak ada data dengan kegiatan, gunakan fallback
    if (dataWithActivity.length === 0) {
      return fallbackChartData;
    }
    
    // Urutkan data berdasarkan bulan dan tahun
    const sortedData = [...dataWithActivity].sort((a, b) => {
      const bulanNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", 
                         "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
      
      const monthA = a.bulan.split(' ')[0];
      const yearA = parseInt(a.bulan.split(' ')[1] || new Date().getFullYear().toString());
      const monthB = b.bulan.split(' ')[0];
      const yearB = parseInt(b.bulan.split(' ')[1] || new Date().getFullYear().toString());
      
      const monthIndexA = bulanNames.indexOf(monthA);
      const monthIndexB = bulanNames.indexOf(monthB);
      
      // Bandingkan tahun terlebih dahulu
      if (yearA !== yearB) return yearA - yearB;
      
      // Jika tahun sama, bandingkan bulan
      return monthIndexA - monthIndexB;
    });
    
    // Ambil data terakhir (maksimal 6 bulan)
    const lastMonths = sortedData.slice(-6);
    
    return lastMonths.map(item => {
      const bulan = item.bulan.split(' ')[0];
      const tahun = item.bulan.split(' ')[1] || new Date().getFullYear().toString();
      
      return {
        bulan,
        tahun,
        jumlahKegiatan: item.jumlahKegiatan,
        rataRataHadir: item.rataRataHadir,
        persentase: Math.round((item.rataRataHadir / 40) * 100), // Asumsi 40 adalah nilai maksimum
        color: getBarColor(item.rataRataHadir)
      };
    });
  };
  
  const chartData = getChartData();
  
  // Cek apakah chart memiliki data valid - perbaiki definisi disini
  const hasChartData = chartData.length > 0 && chartData.some(item => item.jumlahKegiatan > 0);

  // Custom tooltip untuk chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-md shadow-md">
          <p className="font-medium">{label} {payload[0].payload.tahun}</p>
          <p className="text-sm text-gray-500">Jumlah Kegiatan: {payload[0].payload.jumlahKegiatan}x</p>
          <p className="text-sm text-gray-500">Rata-Rata Hadir (KK): {payload[0].payload.rataRataHadir}</p>
          <p className="text-sm text-gray-500">Persentase: {payload[0].payload.persentase}%</p>
        </div>
      );
    }
    return null;
  };
  
  // Handler untuk cetak riwayat
  const handleCetakRiwayat = () => {
    setPrintDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Riwayat Doa Lingkungan</h2>
          <p className="text-muted-foreground">Rincian kegiatan dan absensi doa lingkungan</p>
        </div>
        <Button 
          variant="outline" 
          onClick={handleCetakRiwayat}
          className="flex items-center gap-2"
        >
          <DownloadIcon className="h-4 w-4" />
          Cetak Riwayat
        </Button>
      </div>
      
      {/* Visualisasi Trend Kehadiran */}
      <Card className="pb-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUpIcon className="h-5 w-5 text-primary" />
            Trend Kehadiran
          </CardTitle>
          <CardDescription>Persentase kehadiran anggota dalam 6 bulan terakhir</CardDescription>
        </CardHeader>
        <CardContent className="p-2 sm:p-6">
          <div className="w-full h-[300px] relative">
            {!hasChartData && (
              <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-gray-50/50 rounded-md">
                <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground text-center">
                  Tidak ada data kehadiran untuk ditampilkan.
                  <br />
                  Tambahkan data absensi untuk melihat trend kehadiran.
                </p>
              </div>
            )}
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ 
                  top: 10, 
                  right: 5, 
                  left: windowWidth < 640 ? -15 : 0, 
                  bottom: windowWidth < 640 ? 30 : 40 
                }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="bulan" 
                  tick={{ fontSize: windowWidth < 640 ? 8 : 10 }}
                  tickFormatter={(value) => value.slice(0, 3)} // Singkat nama bulan
                  tickLine={false}
                  axisLine={{ strokeWidth: 1 }}
                  height={50}
                  label={{
                    value: '',
                    position: 'insideBottom',
                    offset: -15
                  }}
                />
                <YAxis 
                  domain={[0, 40]}
                  tick={{ fontSize: windowWidth < 640 ? 8 : 10 }}
                  tickCount={windowWidth < 640 ? 4 : 5}
                  width={25}
                  label={windowWidth < 640 ? undefined : { 
                    value: 'Rata-rata', 
                    angle: -90, 
                    position: 'insideLeft',
                    style: { textAnchor: 'middle', fontSize: 10 },
                    offset: -5
                  }}
                />
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend 
                  verticalAlign="bottom" 
                  height={windowWidth < 640 ? 24 : 36}
                  iconSize={windowWidth < 640 ? 8 : 10}
                  wrapperStyle={{ 
                    fontSize: windowWidth < 640 ? '8px' : '10px',
                    paddingTop: windowWidth < 640 ? '5px' : '10px'
                  }}
                  payload={[
                    { value: 'Sangat Baik', type: 'square', color: '#22c55e' },
                    { value: 'Baik', type: 'square', color: '#3b82f6' },
                    { value: 'Cukup', type: 'square', color: '#eab308' },
                    { value: 'Kurang', type: 'square', color: '#ef4444' }
                  ]}
                />
                <Bar 
                  dataKey="rataRataHadir" 
                  name="Rata-rata Kehadiran" 
                  radius={[4, 4, 0, 0]}
                  barSize={windowWidth < 640 ? 15 : 30}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                  <LabelList 
                    dataKey="persentase" 
                    position="top" 
                    formatter={(value: number) => `${value}%`}
                    style={{ fontSize: windowWidth < 640 ? 8 : 9, fill: '#6b7280' }}
                  />
                  <LabelList 
                    dataKey="jumlahKegiatan" 
                    position="insideBottom" 
                    formatter={(value: number) => `${value}x`}
                    style={{ fontSize: windowWidth < 640 ? 8 : 9, fill: '#ffffff', fontWeight: 'bold' }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      {/* Rekapitulasi Kehadiran */}
      <Card className="overflow-hidden gap-0">
        <CardHeader className="px-3">
          <div className="flex justify-between items-center">
            <CardTitle>Rekapitulasi Kehadiran</CardTitle>
            <div className="flex gap-2">
              <Select
                value={sortBy}
                onValueChange={setSortBy}
              >
                <SelectTrigger className="w-[100px] sm:w-[120px]">
                  <SelectValue placeholder="Urutkan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nama">Nama</SelectItem>
                  <SelectItem value="kehadiran">Total Hadir</SelectItem>
                  <SelectItem value="persentase">Persentase</SelectItem>
                </SelectContent>
              </Select>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                className="h-8 w-8 sm:h-9 sm:w-9"
              >
                {sortOrder === "asc" ? "↑" : "↓"}
              </Button>
            </div>
          </div>
          
          <div className="relative mt-2 mb-3">
            <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari anggota..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
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
        </CardHeader>
        <CardContent className="p-2 md:p-6">
          <div className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead className="text-center">Total Hadir</TableHead>
                  <TableHead className="text-center">Persentase</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedRiwayat.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-2 text-muted-foreground">
                      Tidak ada data yang sesuai dengan pencarian
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedRiwayat.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.nama}</TableCell>
                      <TableCell className="text-center">{item.totalHadir}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant={getBadgeVariant(item.persentase)}>
                          {item.persentase}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      {/* Rekapitulasi Kegiatan */}
      <Card className="overflow-hidden gap-0">
        <CardHeader className="pb-0 px-3 pt-3 md:p-6">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-2">
            <CardTitle>Rekapitulasi Kegiatan</CardTitle>
            <Select
              value={selectedPeriode}
              onValueChange={setSelectedPeriode}
            >
              <SelectTrigger className="w-[150px] sm:w-[150px]">
                <SelectValue placeholder="Pilih Periode" />
              </SelectTrigger>
              <SelectContent>
                {periodeOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-2 md:p-6">
          <div className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bulan</TableHead>
                  <TableHead className="text-center">Jumlah Kegiatan</TableHead>
                  <TableHead className="text-center">Rata-Rata Hadir (KK)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRekapitulasi.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-2 text-muted-foreground">
                      Tidak ada data untuk periode ini
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRekapitulasi.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                          {item.bulan}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">{item.jumlahKegiatan}</TableCell>
                      <TableCell className="text-center">{item.rataRataHadir}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      {/* Dialog Cetak PDF */}
      <PrintRiwayatDialog 
        open={printDialogOpen}
        onOpenChange={setPrintDialogOpen}
        detilDolingData={detilDolingData}
        absensiDolingData={absensiDolingData}
      />
    </div>
  );
} 