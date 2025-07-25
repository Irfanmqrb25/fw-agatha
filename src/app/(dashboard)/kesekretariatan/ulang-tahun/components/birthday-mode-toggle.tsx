"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { CalendarIcon, TableIcon } from "lucide-react";

type Props = {
  mode: "table" | "calendar";
  onChange: (mode: "table" | "calendar") => void;
};

export function BirthdayModeToggle({ mode, onChange }: Props) {
  return (
    <ToggleGroup
      type="single"
      value={mode}
      onValueChange={(val) => val && onChange(val as "table" | "calendar")}
      className="mb-4 flex"
    >
      <ToggleGroupItem
        value="table"
        className="px-3 border border-pink-300 bg-white/70 backdrop-blur-sm text-pink-700 hover:bg-pink-50 hover:text-pink-700 data-[state=on]:bg-pink-100 data-[state=on]:ring-1 data-[state=on]:ring-pink-400"
      >
        <TableIcon className="size-4" />
        Tabel
      </ToggleGroupItem>
      <ToggleGroupItem
        value="calendar"
        className="px-3 border border-pink-300 bg-white/70 backdrop-blur-sm text-pink-700 hover:bg-pink-50 hover:text-pink-700 data-[state=on]:bg-pink-100 data-[state=on]:ring-1 data-[state=on]:ring-pink-400"
      >
        <CalendarIcon className="size-4" />
        Kalender
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
