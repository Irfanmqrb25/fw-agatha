"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PieChart, BookOpen, Activity, BarChart2, ChevronRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";

interface GroupedData {
  [jenisIbadat: string]: {
    [subIbadat: string]: number;
  };
}

interface IbadatCardsProps {
  groupedData: GroupedData;
}

export function IbadatCards({ groupedData }: IbadatCardsProps) {
  // Warna yang ditentukan berdasarkan nama jenis ibadat
  const getColorByName = (name: string): string => {
    // Menggunakan hash sederhana dari string untuk mendapatkan indeks warna yang konsisten
    const hash = name.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    
    const colors = [
      "bg-blue-100 text-blue-700 border-blue-200",
      "bg-purple-100 text-purple-700 border-purple-200",
      "bg-green-100 text-green-700 border-green-200",
      "bg-amber-100 text-amber-700 border-amber-200",
      "bg-rose-100 text-rose-700 border-rose-200",
      "bg-cyan-100 text-cyan-700 border-cyan-200",
      "bg-lime-100 text-lime-700 border-lime-200",
      "bg-indigo-100 text-indigo-700 border-indigo-200",
      "bg-teal-100 text-teal-700 border-teal-200",
      "bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200",
    ];
    
    // Mendapatkan indeks dengan modulo untuk memastikan dalam range
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  // Mendapatkan total pertemuan dari seluruh data
  const getTotalMeetings = () => {
    let total = 0;
    Object.values(groupedData).forEach(subIbadatMap => {
      Object.values(subIbadatMap).forEach(count => {
        total += count;
      });
    });
    return total;
  };

  const totalMeetings = getTotalMeetings();

  // Jika tidak ada data, tampilkan pesan
  if (Object.keys(groupedData).length === 0) {
    return (
      <div className="p-4 text-center border rounded-lg bg-muted/20">
        <Activity className="h-8 w-8 text-muted mx-auto mb-2" />
        <h3 className="text-base font-medium mb-1">Tidak ada data</h3>
        <p className="text-xs text-muted-foreground">
          Tidak ada data untuk periode yang dipilih. Silakan ubah filter periode.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {Object.entries(groupedData).map(([jenisIbadat, subIbadatMap]) => {
        const totalPertemuan = Object.values(subIbadatMap).reduce((acc, count) => acc + count, 0);
        const percentage = Math.round((totalPertemuan / totalMeetings) * 100);
        const colorClass = getColorByName(jenisIbadat);
        const [bgColor, textColor] = colorClass.split(' ');
        
        // Mengurutkan sub ibadat berdasarkan jumlah pertemuan (tertinggi ke terendah)
        const sortedSubIbadat = Object.entries(subIbadatMap).sort((a, b) => b[1] - a[1]);
        
        return (
          <Card key={jenisIbadat} className="overflow-hidden border shadow-sm">
            <CardHeader className="py-2 px-3 border-b">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className={`p-1 rounded-md ${bgColor}`}>
                    <BarChart2 className="h-3.5 w-3.5" />
                  </div>
                  <CardTitle className="text-sm font-medium">{jenisIbadat}</CardTitle>
                </div>
                <Badge variant="outline" className={`text-xs px-1.5 py-0 ${textColor}`}>
                  {totalPertemuan} kegiatan
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="px-3 py-1.5 bg-muted/10">
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="text-muted-foreground">{percentage}% dari total kegiatan</span>
                  <span className="font-medium">{totalPertemuan}/{totalMeetings}</span>
                </div>
                <Progress value={percentage} className="h-1.5" />
              </div>
              <ScrollArea className="h-[120px]">
                <div className="divide-y">
                  {sortedSubIbadat.map(([subIbadat, count]) => {
                    const subPercentage = Math.round((count / totalPertemuan) * 100);
                    
                    return (
                      <div key={subIbadat} className="py-1.5 px-3 flex items-center hover:bg-muted/5">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <div className={`w-1.5 h-1.5 rounded-full ${bgColor}`}></div>
                            <span className="text-xs font-medium truncate">{subIbadat}</span>
                          </div>
                          <div className="mt-0.5 flex items-center gap-2">
                            <Progress value={subPercentage} className="h-1 flex-1" />
                            <span className="text-[10px] text-muted-foreground w-7 text-right">{subPercentage}%</span>
                          </div>
                        </div>
                        <Badge variant="outline" className="ml-2 rounded-full h-4 min-w-6 px-1 text-[10px] flex items-center justify-center">
                          {count}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
} 