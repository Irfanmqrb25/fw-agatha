'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SaldoAwalFormData } from '../types';
import { BanknoteIcon, CalendarIcon } from "lucide-react";
import { formatCurrency, cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { parseJakartaDateString } from '@/lib/timezone';

interface SaldoAwalFormDialogProps {
  onSubmit: (data: SaldoAwalFormData) => void;
  currentBalance: number;
  isInitialBalanceSet: boolean;
  initialBalanceDate?: Date;
}

export function SaldoAwalFormDialog({
  onSubmit,
  currentBalance,
  isInitialBalanceSet,
  initialBalanceDate,
}: SaldoAwalFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [saldoAwal, setSaldoAwal] = useState<number>(currentBalance);
  const [tanggal, setTanggal] = useState<Date>(new Date());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Konversi tanggal menggunakan utility timezone Jakarta
    // untuk memastikan tanggal yang dipilih tidak bergeser
    const tanggalString = format(tanggal, 'yyyy-MM-dd');
    const jakartaDate = parseJakartaDateString(tanggalString);
    
    onSubmit({ saldoAwal, tanggal: jakartaDate });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline"
          disabled={isInitialBalanceSet}
          className={cn(
            isInitialBalanceSet && "opacity-50 cursor-not-allowed"
          )}
        >
          <BanknoteIcon className="mr-2 h-4 w-4" />
          {isInitialBalanceSet ? "Saldo Awal Sudah Diset" : "Set Saldo Awal"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Atur Saldo Awal</DialogTitle>
          <DialogDescription>
            {isInitialBalanceSet ? (
              <>
                Saldo awal sudah diset sebesar {formatCurrency(currentBalance)} 
                {initialBalanceDate && ` pada tanggal ${format(initialBalanceDate, 'dd MMMM yyyy', { locale: id })}`}.
                <br />
                <strong className="text-red-600">Saldo awal hanya dapat diinput satu kali saja dan tidak dapat diubah.</strong>
              </>
            ) : (
              "Input saldo awal kas IKATA. Pilih tanggal dan masukkan jumlah saldo awal."
            )}
          </DialogDescription>
        </DialogHeader>
        {!isInitialBalanceSet && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid w-full items-center gap-2">
              <Label htmlFor="tanggal">Tanggal Saldo Awal</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full pl-3 text-left font-normal",
                      !tanggal && "text-muted-foreground"
                    )}
                  >
                    {tanggal ? (
                      format(tanggal, "dd MMMM yyyy", { locale: id })
                    ) : (
                      <span>Pilih tanggal</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={tanggal}
                    onSelect={(date) => date && setTanggal(date)}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                    locale={id}
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="grid w-full items-center gap-2">
              <Label htmlFor="saldoAwal">Jumlah Saldo Awal</Label>
              <Input
                id="saldoAwal"
                type="number"
                min={0}
                value={saldoAwal}
                onChange={(e) => setSaldoAwal(Number(e.target.value))}
                placeholder="0"
              />
            </div>
            <DialogFooter>
              <Button type="submit">Simpan</Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
} 