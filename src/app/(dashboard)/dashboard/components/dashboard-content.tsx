"use client";

import * as React from "react";

import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";

// Import komponen
import { PeriodFilter } from "./period-filter";
import { KeuanganLingkunganCards } from "./keuangan-lingkungan-cards";
import { KeuanganIkataCards } from "./keuangan-ikata-cards";
import { KesekretariatanCards } from "./kesekretariatan-cards";
import { PenunggakDanaMandiriTable, PenunggakIkataTable } from "./penunggak-table";
import type { DashboardContentProps } from "../types";
import { DaftarPenunggakSection } from "./daftar-penunggak-section";


export default function DashboardContent({
  keuanganLingkunganData,
  keuanganIkataData,
  kesekretariatanData,
  penunggakDanaMandiri,
  penunggakIkata,
  userRole,
}: DashboardContentProps) {
  // Cek akses berdasarkan role sesuai dengan enum Role di schema.prisma
  const canViewKeuanganLingkungan = [
    'SUPER_USER', 
    'KETUA', 
    'WAKIL_KETUA',
    'BENDAHARA',
    'UMAT'
  ].includes(userRole);
  
  const canViewKeuanganIkata = [
    'SUPER_USER', 
    'KETUA', 
    'WAKIL_KETUA',
    'WAKIL_BENDAHARA',
    'UMAT'
  ].includes(userRole);
  
  const canViewKesekretariatan = [
    'SUPER_USER', 
    'KETUA', 
    'WAKIL_KETUA',
    'SEKRETARIS', 
    'WAKIL_SEKRETARIS',
    'UMAT'
  ].includes(userRole);
  
  // Semua pengguna dapat melihat daftar penunggak pada dashboard
  const canViewPenunggak = true;

  return (
    <div className="space-y-8 p-2">
      {/* Filter Periode */}
      <div className="w-full">
        <PeriodFilter />
      </div>
      
      {/* Resume Keuangan Lingkungan */}
      {canViewKeuanganLingkungan && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Resume Keuangan Lingkungan</h2>
          <KeuanganLingkunganCards data={keuanganLingkunganData} />
        </div>
      )}
      
      {/* Resume Keuangan IKATA */}
      {canViewKeuanganIkata && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Resume Keuangan IKATA</h2>
          <KeuanganIkataCards data={keuanganIkataData} />
        </div>
      )}
      
      {/* Resume Kesekretariatan */}
      {canViewKesekretariatan && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Resume Kesekretariatan</h2>
          <KesekretariatanCards data={kesekretariatanData} />
        </div>
      )}
      
      {/* Daftar Penunggak */}
      {canViewPenunggak && (
        <DaftarPenunggakSection 
          penunggakDanaMandiri={penunggakDanaMandiri}
          penunggakIkata={penunggakIkata}
        />
      )}
    </div>
  );
} 