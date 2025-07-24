"use client"

import { useState, useEffect, useMemo } from "react";
import { CheckCircle2, XCircle, User2, Home, FileText } from "lucide-react";
import {
  Card,
  CardHeader,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { DropdownBulanTahun } from "@/app/(dashboard)/approval/components/dropdown-bulan-tahun";
import { StatusApproval, JenisTransaksi, TipeTransaksiLingkungan } from "@prisma/client";
import { ExtendedApproval } from "../types";

type ApprovalHistoryProps = {
  selectedMonth: string;
  approvalData: ExtendedApproval[];
};

export function ApprovalHistory({ selectedMonth, approvalData }: ApprovalHistoryProps) {
  const [month, setMonth] = useState<string>("all");

  useEffect(() => {
    if (selectedMonth !== 'all') {
      setMonth(selectedMonth);
    }
  }, [selectedMonth]);

  const filteredHistory = useMemo(() => {
    if (!approvalData.length) return [];
    
    // Filter out saldo awal and status approved/rejected
    let history = approvalData.filter(item => 
      (item.status === StatusApproval.APPROVED || 
      item.status === StatusApproval.REJECTED) &&
      !(item.kasLingkungan?.jenisTranasksi === JenisTransaksi.UANG_MASUK &&
        item.kasLingkungan?.tipeTransaksi === TipeTransaksiLingkungan.LAIN_LAIN &&
        item.kasLingkungan?.keterangan === "SALDO AWAL")
    );
    
    if (month === 'all') {
      return [...history].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }
    
    const [year, monthNum] = month.split("-").map((n) => parseInt(n));
    
    let filtered = history.filter((item) => {
      let itemDate: Date | null = null;
      
      if (item.doaLingkungan) {
        itemDate = new Date(item.doaLingkungan.tanggal);
      } else if (item.kasLingkungan) {
        itemDate = new Date(item.kasLingkungan.tanggal);
      } else {
        itemDate = new Date(item.createdAt);
      }
      
      const itemYear = itemDate.getFullYear();
      const itemMonth = itemDate.getMonth() + 1;
      return itemYear === year && itemMonth === monthNum;
    });
    
    // Exclude initial balance transactions
    filtered = filtered.filter((item) => {
      if (item.kasLingkungan) {
        return !(
          item.kasLingkungan.keterangan === "SALDO AWAL" &&
          item.kasLingkungan.debit > 0
        );
      }
      return true;
    });
    
    // Urutkan terbaru di atas
    filtered.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    return filtered;
  }, [month, approvalData]);

  // Fungsi untuk mendapatkan tanggal
  const getItemDate = (item: ExtendedApproval): Date => {
    if (item.doaLingkungan) {
      return new Date(item.doaLingkungan.tanggal);
    } else if (item.kasLingkungan) {
      return new Date(item.kasLingkungan.tanggal);
    }
    return new Date(item.createdAt);
  };

  // Fungsi untuk mendapatkan nilai kolekte I
  const getKolekteI = (item: ExtendedApproval): number => {
    return item.doaLingkungan?.kolekteI || 0;
  };

  // Fungsi untuk mendapatkan nilai kolekte II
  const getKolekteII = (item: ExtendedApproval): number => {
    return item.doaLingkungan?.kolekteII || 0;
  };

  // Fungsi untuk mendapatkan nilai ucapan syukur
  const getUcapanSyukur = (item: ExtendedApproval): number => {
    return item.doaLingkungan?.ucapanSyukur || 0;
  };

  // Fungsi untuk mendapatkan total nilai
  const getTotal = (item: ExtendedApproval): number => {
    if (item.doaLingkungan) {
      return item.doaLingkungan.kolekteI + item.doaLingkungan.kolekteII + item.doaLingkungan.ucapanSyukur;
    } else if (item.kasLingkungan) {
      return item.kasLingkungan.debit;
    }
    return 0;
  };

  // Fungsi untuk mendapatkan keterangan
  const getKeterangan = (item: ExtendedApproval): string => {
    if (item.doaLingkungan) {
      return item.doaLingkungan.tuanRumah.namaKepalaKeluarga;
    } else if (item.kasLingkungan?.keterangan) {
      return item.kasLingkungan.keterangan;
    }
    return '-';
  };

  return (
    <section className="space-y-6">
      {/* Judul & Deskripsi */}
      <div className="mb-2">
        <h2 className="text-xl font-bold">Riwayat Persetujuan</h2>
        <p className="text-sm text-muted-foreground">
          Daftar permohonan yang telah disetujui atau ditolak
        </p>
      </div>

      {/* Filter */}
      <div className="flex flex-col gap-3 mb-6">
        <div className="space-y-1">
          <label className="text-sm font-medium text-muted-foreground">Pilih Periode</label>
          <DropdownBulanTahun value={month} onChange={setMonth} />
        </div>
      </div>

      {/* Daftar Riwayat */}
      {filteredHistory.length === 0 ? (
        <div className="p-8 text-center text-muted-foreground rounded border bg-muted/40">
          Tidak ada data riwayat untuk periode ini.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredHistory.map((item) => (
            <Card
              key={item.id}
              className={`flex flex-col border shadow-sm transition hover:shadow-md ${
                item.status === StatusApproval.APPROVED
                  ? "border-green-200 bg-green-50/40"
                  : "border-red-200 bg-red-50/40"
              }`}
            >
              <CardHeader className="flex flex-row items-center gap-2 pb-2 flex-wrap">
                <div className="flex items-center gap-2">
                  {item.status === StatusApproval.APPROVED ? (
                    <CheckCircle2 className="text-green-500 w-5 h-5" />
                  ) : (
                    <XCircle className="text-red-500 w-5 h-5" />
                  )}
                  <Badge
                    variant="outline"
                    className={`text-xs px-2 py-0.5 font-semibold border-0 ${
                      item.status === StatusApproval.APPROVED
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {item.status === StatusApproval.APPROVED ? "Disetujui" : "Ditolak"}
                  </Badge>
                </div>
                <span className="ml-auto text-xs text-muted-foreground">
                  {getItemDate(item).toLocaleDateString("id-ID", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </CardHeader>
              <CardContent className="flex flex-col gap-2 pt-1 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User2 className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">
                    <span className="font-medium text-foreground">Pengurus: </span>
                    Bendahara
                  </span>
                </div>
                {item.doaLingkungan && (
                  <>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <FileText className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">
                        <span className="font-medium text-foreground">Kolekte I: </span>
                        {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(getKolekteI(item))}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <FileText className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">
                        <span className="font-medium text-foreground">Kolekte II: </span>
                        {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(getKolekteII(item))}
                      </span>
                    </div>
                    {getUcapanSyukur(item) > 0 && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <FileText className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">
                          <span className="font-medium text-foreground">Ucapan Syukur: </span>
                          {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(getUcapanSyukur(item))}
                        </span>
                      </div>
                    )}
                  </>
                )}
                <div className="flex items-center gap-2 text-muted-foreground">
                  <FileText className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">
                    <span className="font-medium text-foreground">Total: </span>
                    {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(getTotal(item))}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Home className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate" title={getKeterangan(item)}>
                    <span className="font-medium text-foreground">Tuan Rumah: </span>
                    {getKeterangan(item)}
                  </span>
                </div>
                <Separator className="my-2" />
                <div>
                  <div className="text-xs text-muted-foreground font-medium mb-1">
                    Catatan:
                  </div>
                  <div className="text-sm text-foreground whitespace-pre-line line-clamp-2">
                    {item.status === StatusApproval.APPROVED 
                      ? "Disetujui dan diintegrasikan ke Kas Lingkungan"
                      : "Data ditolak"}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}