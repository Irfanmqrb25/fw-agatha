"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DataTable } from "./data-table";
import { TableToolbar } from "./table-toolbar";
import { columns } from "./columns";

type Birthday = {
  nama: string;
  kepalaKeluarga: string;
  tanggalLahir: Date;
  usia: string;
};

export function BirthdayTable({
  initialData,
  initialMonth,
}: {
  initialData: Birthday[];
  initialMonth: number;
}) {
  const [search, setSearch] = useState("");
  const [month, setMonth] = useState(initialMonth);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Jika ingin refetch via query params:
  const handleMonthChange = (newMonth: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("bulan", String(newMonth));
    router.replace("?" + params.toString());
  };

  const filtered = initialData.filter((item) =>
    item.nama.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <TableToolbar onSearch={setSearch} onFilterMonth={handleMonthChange} />
      <DataTable columns={columns} data={filtered} />
    </div>
  );
}
