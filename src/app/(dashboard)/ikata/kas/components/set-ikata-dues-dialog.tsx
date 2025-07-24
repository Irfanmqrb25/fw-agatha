"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
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
import { useEffect } from "react"

// Schema untuk validasi form
const setIkataDuesSchema = z.object({
  year: z.number({
    required_error: "Tahun wajib diisi",
  }),
  amount: z.coerce.number().positive({
    message: "Jumlah iuran harus lebih dari 0",
  }),
});

export type SetIkataDuesValues = z.infer<typeof setIkataDuesSchema>;

// Fungsi untuk format mata uang
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

interface SetIkataDuesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: SetIkataDuesValues) => void
  currentAmount?: number
}

export function SetIkataDuesDialog({
  open,
  onOpenChange,
  onSubmit,
  currentAmount = 0,
}: SetIkataDuesDialogProps) {
  // Current year as default
  const currentYear = new Date().getFullYear()
  
  // Create year options (current year +/- 10 years)
  const yearOptions = Array.from({ length: 21 }, (_, i) => currentYear - 10 + i)
  
  // Form
  const form = useForm<SetIkataDuesValues>({
    resolver: zodResolver(setIkataDuesSchema),
    defaultValues: {
      year: currentYear,
      amount: currentAmount || 0,
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
  const handleSubmit = (values: SetIkataDuesValues) => {
    onSubmit(values)
    onOpenChange(false)
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Set Iuran IKATA</DialogTitle>
          <DialogDescription>
            Tetapkan jumlah iuran IKATA untuk tahun tertentu.
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