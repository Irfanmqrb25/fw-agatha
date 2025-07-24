"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Archive, FileText, InfoIcon, AlertCircle } from "lucide-react"
import { PublikasiWithRelations } from "../types/publikasi"
import { isPublikasiExpired } from "../utils/constants"
import { cn } from "@/lib/utils"

interface SummaryCardsProps {
  data: PublikasiWithRelations[]
}

export function SummaryCards({ data }: SummaryCardsProps) {
  // Hitung total publikasi
  const totalPublikasi = data.length
  
  // Hitung publikasi aktif vs kedaluwarsa
  const aktifPublikasi = data.filter(item => !item.deadline || !isPublikasiExpired(item.deadline)).length
  const kedaluwarsaPublikasi = data.filter(item => item.deadline && isPublikasiExpired(item.deadline)).length
  
  // Hitung berdasarkan klasifikasi
  const pentingPublikasi = data.filter(item => item.klasifikasi === "PENTING").length
  const segeraPublikasi = data.filter(item => item.klasifikasi === "SEGERA").length
  const umumPublikasi = data.filter(item => item.klasifikasi === "UMUM").length
  const rahasiaPublikasi = data.filter(item => item.klasifikasi === "RAHASIA").length

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 gap-0">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Publikasi</CardTitle>
          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
            <FileText className="h-4 w-4 text-blue-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalPublikasi}</div>
          <p className="text-xs text-muted-foreground">
            {aktifPublikasi} aktif, {kedaluwarsaPublikasi} kedaluwarsa
          </p>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200 gap-0">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Penting</CardTitle>
          <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
            <AlertCircle className="h-4 w-4 text-red-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{pentingPublikasi}</div>
          <p className="text-xs text-muted-foreground">
            {Math.round((pentingPublikasi / totalPublikasi) * 100) || 0}% dari total publikasi
          </p>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 gap-0">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Segera</CardTitle>
          <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
            <InfoIcon className="h-4 w-4 text-orange-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{segeraPublikasi}</div>
          <p className="text-xs text-muted-foreground">
            {Math.round((segeraPublikasi / totalPublikasi) * 100) || 0}% dari total publikasi
          </p>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 gap-0">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Umum & Rahasia</CardTitle>
          <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
            <Archive className="h-4 w-4 text-emerald-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{umumPublikasi + rahasiaPublikasi}</div>
          <p className="text-xs text-muted-foreground">
            {umumPublikasi} umum, {rahasiaPublikasi} rahasia
          </p>
        </CardContent>
      </Card>
    </div>
  )
} 