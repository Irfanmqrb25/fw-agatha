"use client";

import { Badge } from "@/components/ui/badge";
import { CheckCircleIcon, XCircleIcon } from "lucide-react";
import { JadwalDoling, DetilDoling } from "../types";

interface StatusBadgeProps {
  status: JadwalDoling['status'] | DetilDoling['status'];
  className?: string;
}

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  switch (status) {
    case 'terjadwal':
      return (
        <Badge 
          variant="outline" 
          className={`bg-blue-50 text-blue-700 border-blue-200 ${className}`}
        >
          Terjadwal
        </Badge>
      );
    case 'selesai':
      return (
        <Badge 
          variant="outline" 
          className={`bg-green-50 text-green-700 border-green-200 ${className}`}
        >
          Selesai
        </Badge>
      );
    case 'dibatalkan':
      return (
        <Badge 
          variant="outline" 
          className={`bg-red-50 text-red-700 border-red-200 ${className}`}
        >
          Dibatalkan
        </Badge>
      );
    default:
      return null;
  }
}

interface JenisIbadatBadgeProps {
  jenisIbadat?: string;
  className?: string;
}

export function JenisIbadatBadge({ jenisIbadat, className = "" }: JenisIbadatBadgeProps) {
  if (!jenisIbadat) return null;

  const jenisMap: Record<string, { color: string, label: string }> = {
    'doa-lingkungan': { color: 'blue', label: 'Doa Lingkungan' },
    'misa': { color: 'purple', label: 'Misa' },
    'pertemuan': { color: 'orange', label: 'Pertemuan' },
    'bakti-sosial': { color: 'green', label: 'Bakti Sosial' },
    'kegiatan-lainnya': { color: 'gray', label: 'Lainnya' }
  };

  const { color, label } = jenisMap[jenisIbadat] || { color: 'gray', label: jenisIbadat };
  
  return (
    <Badge 
      variant="outline" 
      className={`bg-${color}-50 text-${color}-700 border-${color}-200 ${className}`}
    >
      {label}
    </Badge>
  );
}

interface ApprovalStatusProps {
  sudahDiapprove?: boolean;
  className?: string;
}

export function ApprovalStatus({ sudahDiapprove, className = "" }: ApprovalStatusProps) {
  if (sudahDiapprove) {
    return (
      <div className={`flex items-center gap-1 text-green-600 ${className}`}>
        <CheckCircleIcon className="h-4 w-4" />
        <span className="text-xs">Disetujui</span>
      </div>
    );
  }
  
  return (
    <div className={`flex items-center gap-1 text-amber-600 ${className}`}>
      <XCircleIcon className="h-4 w-4" />
      <span className="text-xs">Belum Disetujui</span>
    </div>
  );
} 