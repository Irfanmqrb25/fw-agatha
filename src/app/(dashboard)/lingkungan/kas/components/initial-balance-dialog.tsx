"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { BanknoteIcon, CalendarIcon } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { UseFormReturn } from "react-hook-form"
import { InitialBalanceFormValues } from "../types"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { id } from "date-fns/locale"

interface InitialBalanceDialogProps {
  form: UseFormReturn<InitialBalanceFormValues>;
  onSubmit: (values: InitialBalanceFormValues) => void;
  currentBalance: number;
  isInitialBalanceSet: boolean;
  initialBalanceDate?: Date;
}

export function InitialBalanceDialog({ 
  form, 
  onSubmit,
  currentBalance,
  isInitialBalanceSet,
  initialBalanceDate
}: InitialBalanceDialogProps) {
  const [open, setOpen] = useState(false)

  const handleSubmit = (values: InitialBalanceFormValues) => {
    onSubmit(values)
    setOpen(false)
  }

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
                Saldo awal sudah diset sebesar Rp {currentBalance.toLocaleString('id-ID')} 
                {initialBalanceDate && ` pada tanggal ${format(initialBalanceDate, 'dd MMMM yyyy', { locale: id })}`}.
                <br />
                <strong className="text-red-600">Saldo awal hanya dapat diinput satu kali saja dan tidak dapat diubah.</strong>
              </>
            ) : (
              "Input saldo awal kas lingkungan. Pilih tanggal dan masukkan jumlah saldo awal."
            )}
          </DialogDescription>
        </DialogHeader>
        {!isInitialBalanceSet && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="tanggal"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Tanggal Saldo Awal</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "dd MMMM yyyy", { locale: id })
                            ) : (
                              <span>Pilih tanggal</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                          locale={id}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="saldoAwal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jumlah Saldo Awal</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="0"
                        type="number"
                        min={0}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="submit">Simpan</Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  )
} 