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
}: {
  onSearch: (query: string) => void;
  onFilterMonth: (month: number) => void;
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
    <div className="flex flex-col sm:flex-row gap-4 justify-between mb-4">
      <Input
        placeholder="Cari nama..."
        value={search}
        onChange={(e) => {
          const value = e.target.value;
          setSearch(value);
          onSearch(value);
        }}
        className="max-w-sm"
      />
      <div className="w-[180px]">
        <Select
          value={isLoadingMonth ? "" : String(filterMonth)}
          onValueChange={(value) => {
            const month = parseInt(value);
            setFilterMonth(month);
            onFilterMonth(month);
          }}
          disabled={isLoadingMonth}
        >
          <SelectTrigger className="w-full">
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
