import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const months = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

type Props = {
  value: number;
  onChange: (value: number) => void;
};

export function MonthFilter({ value, onChange }: Props) {
  return (
    <Select
      value={value.toString()}
      onValueChange={(val) => onChange(Number(val))}
    >
      <SelectTrigger className="w-[160px]">
        <SelectValue placeholder="Pilih Bulan" />
      </SelectTrigger>
      <SelectContent>
        {months.map((month, i) => (
          <SelectItem key={i} value={(i + 1).toString()}>
            {month}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
