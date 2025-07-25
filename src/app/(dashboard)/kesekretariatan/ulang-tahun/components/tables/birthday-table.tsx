"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { BirthdayCalendar } from "../birthday-calendar";
import { BirthdayModeToggle } from "../birthday-mode-toggle";

import { Birthday } from "../../types";
import { TableToolbar } from "./table-toolbar";
import { DataTable } from "./data-table";
import { columns } from "./columns";

export function BirthdayTable({
  initialData,
  initialMonth,
}: {
  initialData: Birthday[];
  initialMonth: number;
}) {
  const [search, setSearch] = useState("");
  const [month, setMonth] = useState(initialMonth);
  const [mode, setMode] = useState<"table" | "calendar">("table");

  const router = useRouter();
  const searchParams = useSearchParams();

  const handleMonthChange = (newMonth: number) => {
    setMonth(newMonth);
    const params = new URLSearchParams(searchParams.toString());
    params.set("bulan", String(newMonth));
    router.replace("?" + params.toString());
  };

  const filtered = initialData.filter((item) =>
    item.nama.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <BirthdayModeToggle mode={mode} onChange={setMode} />
      <TableToolbar
        onSearch={setSearch}
        onFilterMonth={handleMonthChange}
        mode={mode}
      />
      {mode === "table" ? (
        <DataTable columns={columns} data={filtered} />
      ) : (
        <BirthdayCalendar data={initialData} month={month} />
      )}
    </div>
  );
}
