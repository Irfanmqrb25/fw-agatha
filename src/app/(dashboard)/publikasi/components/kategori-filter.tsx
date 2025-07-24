"use client"

import * as React from "react"
import { Check, CircleSlash, TagIcon } from "lucide-react"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuGroup, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Table } from "@tanstack/react-table"
import { KATEGORI_PUBLIKASI } from "../utils/constants"
import { KlasifikasiPublikasi } from "@prisma/client"

interface KategoriFilterProps {
  table: Table<any>
  kategoriFilter: KlasifikasiPublikasi | null
  setKategoriFilter: (kategori: KlasifikasiPublikasi | null) => void
}

export function KategoriFilter({ 
  table, 
  kategoriFilter, 
  setKategoriFilter 
}: KategoriFilterProps) {
  const getKategoryLabel = (kategoriId: KlasifikasiPublikasi | null) => {
    if (!kategoriId) return 'Semua Kategori'
    const kategori = KATEGORI_PUBLIKASI.find(k => k.value === kategoriId)
    return kategori ? kategori.label : 'Semua Kategori'
  }

  const getBadgeColor = (kategoriId: KlasifikasiPublikasi) => {
    switch (kategoriId) {
      case KlasifikasiPublikasi.PENTING:
        return 'text-red-500'
      case KlasifikasiPublikasi.SEGERA:
        return 'text-orange-500'
      case KlasifikasiPublikasi.RAHASIA:
        return 'text-purple-500'
      case KlasifikasiPublikasi.UMUM:
        return 'text-blue-500'
      default:
        return 'text-gray-500'
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="flex items-center gap-1 h-8 data-[state=open]:bg-accent"
        >
          <TagIcon className="h-3.5 w-3.5" />
          <span>{getKategoryLabel(kategoriFilter)}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Filter Berdasarkan Kategori</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem 
            onClick={() => {
              setKategoriFilter(null)
              table.getColumn('kategori')?.setFilterValue('')
            }}
          >
            <div className="flex items-center gap-2">
              <CircleSlash className="h-4 w-4" />
              <span>Semua Kategori</span>
              {kategoriFilter === null && <Check className="h-4 w-4 ml-auto" />}
            </div>
          </DropdownMenuItem>

          {KATEGORI_PUBLIKASI.map((kategori) => (
            <DropdownMenuItem
              key={kategori.value}
              onClick={() => {
                setKategoriFilter(kategori.value)
                table.getColumn('kategori')?.setFilterValue(kategori.value)
              }}
            >
              <div className="flex items-center gap-2">
                <span className={`${getBadgeColor(kategori.value)} text-lg`}>●</span>
                <span>{kategori.label}</span>
                {kategoriFilter === kategori.value && <Check className="h-4 w-4 ml-auto" />}
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 