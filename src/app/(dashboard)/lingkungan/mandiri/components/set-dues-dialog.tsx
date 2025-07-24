"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { SetDuesValues, setDuesSchema } from "../types"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatCurrency } from "../utils"
import { useEffect } from "react"

interface SetDuesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: SetDuesValues) => void
  currentAmount?: number
}

export function SetDuesDialog({
  open,
  onOpenChange,
  onSubmit,
  currentAmount = 0,
}: SetDuesDialogProps) {
  // Current year as default
  const currentYear = new Date().getFullYear()
  
  // Create year options (current year +/- 10 years)
  const yearOptions = Array.from({ length: 21 }, (_, i) => currentYear - 10 + i)
  
  // Form
  const form = useForm<SetDuesValues>({
    resolver: zodResolver(setDuesSchema),
    defaultValues: {
      year: currentYear,
      amount: currentAmount || 1000000,
    },
  })
  
  // Perbarui nilai default saat prop currentAmount berubah
  useEffect(() => {
    if (open && currentAmount > 0) {
      form.setValue("amount", currentAmount);
    }
  }, [open, currentAmount, form]);
  
  // Preview formatted amount
  const watchAmount = form.watch("amount")
  const formattedAmount = watchAmount ? formatCurrency(watchAmount) : ""
  
  // Handle form submission
  const handleSubmit = (values: SetDuesValues) => {
    onSubmit(values)
    onOpenChange(false)
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Set Iuran Dana Mandiri</DialogTitle>
          <DialogDescription>
            Tetapkan jumlah iuran Dana Mandiri untuk tahun tertentu.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="year"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tahun</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    defaultValue={field.value.toString()}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Pilih tahun" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {yearOptions.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jumlah Iuran</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Masukkan jumlah iuran"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  {watchAmount > 0 && (
                    <p className="text-sm text-muted-foreground">{formattedAmount} per KK</p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="submit" className="w-full">Simpan</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 