"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// Skeleton component (simple)
function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-gray-200 rounded h-4 w-24 ${className}`}
      style={{ minHeight: 16 }}
    />
  );
}

export function TableToolbar({
  onSearch,
  onFilterMonth,
  mode,
}: {
  onSearch: (query: string) => void;
  onFilterMonth: (month: number) => void;
  mode?: "table" | "calendar";
}) {
  const searchParams = useSearchParams();
  const [isLoadingMonth, setIsLoadingMonth] = useState(true);

  useEffect(() => {
    setIsLoadingMonth(false);
  }, []);

  const paramMonth = parseInt(searchParams.get("bulan") || "");
  const initialMonth =
    !isNaN(paramMonth) && paramMonth >= 1 && paramMonth <= 12
      ? paramMonth
      : new Date().getMonth() + 1;

  const [search, setSearch] = useState("");
  const [filterMonth, setFilterMonth] = useState<number>(initialMonth);

  useEffect(() => {
    onFilterMonth(initialMonth);
  }, []);

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row gap-4 mb-4",
        mode === "table" ? "justify-between md:items-center" : "justify-start"
      )}
    >
      {mode === "table" && (
        <Input
          placeholder="Cari nama..."
          value={search}
          onChange={(e) => {
            const value = e.target.value;
            setSearch(value);
            onSearch(value);
          }}
          className="max-w-sm border-pink-700 bg-white/30 backdrop-blur-sm focus:ring-pink-400 focus-visible:border-pink-700 focus-visible:ring-pink-300"
        />
      )}
      <div className="w-[190px]">
        <Select
          value={isLoadingMonth ? "" : String(filterMonth)}
          onValueChange={(value) => {
            const month = parseInt(value);
            setFilterMonth(month);
            onFilterMonth(month);
          }}
          disabled={isLoadingMonth}
        >
          <SelectTrigger className="w-full border-pink-700 bg-white/30 backdrop-blur-sm focus:ring-pink-400">
            <SelectValue
              placeholder={isLoadingMonth ? <Skeleton /> : "Pilih Bulan"}
            />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: 12 }, (_, i) => (
              <SelectItem key={i + 1} value={String(i + 1)}>
                {new Date(0, i).toLocaleString("id-ID", { month: "long" })}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
