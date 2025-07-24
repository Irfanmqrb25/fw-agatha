"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { JadwalDoling } from "../types";
import { ReactNode } from "react";
import { Calendar, CheckCircle, Clock } from "lucide-react";

interface SummaryCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon?: ReactNode;
  className?: string;
  valueColor?: string;
}

export function SummaryCard({
  title,
  value,
  subtitle,
  icon,
  className = "",
  valueColor = "",
}: SummaryCardProps) {
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          {icon && <span>{icon}</span>}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${valueColor}`}>
          {value}
        </div>
        {subtitle && (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
}

interface JadwalDolingCardsProps {
  jadwalState: JadwalDoling[];
  className?: string;
}

export function JadwalDolingCards({ jadwalState, className = "" }: JadwalDolingCardsProps) {
  // Dapatkan tanggal hari ini tanpa waktu
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Hitung jadwal mendatang (jadwal yang sudah disetujui dan tanggalnya di masa depan)
  const jadwalMendatang = jadwalState.filter(jadwal => {
    const jadwalDate = new Date(jadwal.tanggal);
    jadwalDate.setHours(0, 0, 0, 0);
    return jadwalDate > today && (jadwal.status === 'selesai' || jadwal.status === 'terjadwal');
  }).length;

  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${className}`}>
      <SummaryCard
        title="Total Jadwal"
        value={jadwalState.length}
        subtitle="Semua periode"
        icon={<Calendar className="h-4 w-4 text-blue-600" />}
        className="bg-blue-50 gap-0"
      />

      <SummaryCard
        title="Jadwal Selesai"
        value={jadwalState.filter(j => j.status === "selesai").length}
        subtitle={`Dari total ${jadwalState.length} jadwal`}
        icon={<CheckCircle className="h-4 w-4 text-green-600" />}
        className="bg-green-50 gap-0"
      />

      <SummaryCard
        title="Jadwal Mendatang"
        value={jadwalMendatang}
        subtitle="Jadwal yang akan dilaksanakan"
        icon={<Clock className="h-4 w-4 text-yellow-600" />}
        className="bg-yellow-50 gap-0"
      />
    </div>
  );
} 