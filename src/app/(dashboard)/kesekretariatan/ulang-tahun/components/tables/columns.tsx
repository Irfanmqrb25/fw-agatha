"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Birthday } from "../../types";

export const columns: ColumnDef<Birthday>[] = [
  {
    accessorKey: "nama",
    header: "Nama",
  },
  {
    accessorKey: "kepalaKeluarga",
    header: "Kepala Keluarga",
  },
  {
    accessorKey: "usia",
    header: "Usia",
  },
  {
    accessorKey: "tanggalLahir",
    header: "Tanggal Lahir",
    cell: ({ row }) => {
      const date = new Date(row.original.tanggalLahir);
      const options: Intl.DateTimeFormatOptions = {
        day: "2-digit",
        month: "long",
        year: "numeric",
      };
      return date.toLocaleDateString("id-ID", options);
    },
  },
];
columns.unshift({
  id: "no",
  header: "No",
  cell: ({ row }) => row.index + 1,
});
