"use client"

import { useState, useEffect, useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Check, ChevronsUpDown } from "lucide-react"
import { TransactionFormValues, transactionFormSchema, StatusPembayaran } from "../types"
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { SearchableFamilyDropdown } from "./searchable-family-dropdown"

// Periode bulan untuk pembayaran
const getPeriodeBulanOptions = () => {
  const months = [
    { value: 1, label: 'Januari' },
    { value: 2, label: 'Februari' },
    { value: 3, label: 'Maret' },
    { value: 4, label: 'April' },
    { value: 5, label: 'Mei' },
    { value: 6, label: 'Juni' },
    { value: 7, label: 'Juli' },
    { value: 8, label: 'Agustus' },
    { value: 9, label: 'September' },
    { value: 10, label: 'Oktober' },
    { value: 11, label: 'November' },
    { value: 12, label: 'Desember' }
  ];
  
  return months;
};

interface TransactionFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: TransactionFormValues) => void
  initialData?: TransactionFormValues
  keluargaList: {id: string, namaKepalaKeluarga: string, alamat?: string | null, nomorTelepon?: string | null}[]
}

export function TransactionFormDialog({
  open, 
  onOpenChange, 
  onSubmit,
  initialData,
  keluargaList
}: TransactionFormDialogProps) {
  const [showPeriodeBayar, setShowPeriodeBayar] = useState(false);
  
  // Current year for default value
  const currentYear = new Date().getFullYear()
  
  // Create year options (current year +/- 10 years)
  const yearOptions = Array.from({ length: 21 }, (_, i) => currentYear - 10 + i)
  
  // Form
  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      familyHeadId: "",
      year: currentYear,
      amount: 100000,
      statusPembayaran: "lunas" as const,
      periodeBayar: undefined,
    },
  })
  
  const watchStatusPembayaran = form.watch('statusPembayaran');
  
  // Update field visibility based on status pembayaran
  useEffect(() => {
    if (watchStatusPembayaran === 'sebagian_bulan') {
      setShowPeriodeBayar(true);
    } else {
      setShowPeriodeBayar(false);
      // Reset values when not needed
      form.setValue('periodeBayar', undefined);
    }
  }, [watchStatusPembayaran, form]);
  
  // Reset form when dialog opens or initialData changes
  useEffect(() => {
    if (open) {
      const defaultValues: TransactionFormValues = {
        familyHeadId: "",
        year: currentYear,
        amount: 100000,
        statusPembayaran: "lunas" as const,
        periodeBayar: undefined,
      };
      
      form.reset(initialData || defaultValues);
    }
  }, [open, initialData, form, currentYear]);
  
  const isEditMode = !!initialData
  const title = isEditMode ? "Edit Data Transaksi" : "Tambah Data Transaksi"
  const buttonText = isEditMode ? "Simpan" : "Tambah"
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] md:max-w-[550px] w-full mx-auto max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Isi formulir di bawah untuk {isEditMode ? "mengubah" : "menambahkan"} data transaksi Dana Mandiri.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto px-1">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="familyHeadId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kepala Keluarga</FormLabel>
                    <FormControl>
                      <SearchableFamilyDropdown
                        value={field.value || null}
                        onValueChange={(value) => field.onChange(value || "")}
                        familyHeads={keluargaList}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tahun</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      value={field.value?.toString()}
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
                name="statusPembayaran"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status Pembayaran</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih status pembayaran" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="lunas">Lunas</SelectItem>
                        <SelectItem value="sebagian_bulan">Sebagian Bulan</SelectItem>
                        <SelectItem value="belum_ada_pembayaran">Belum Ada Pembayaran</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {showPeriodeBayar && (
                <FormField
                  control={form.control}
                  name="periodeBayar"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bulan yang Dibayar</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        value={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih bulan" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {getPeriodeBulanOptions().map((option) => (
                            <SelectItem key={option.value} value={option.value.toString()}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jumlah Dibayar</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Masukkan jumlah"
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Batal
                </Button>
                <Button type="submit">
                  {buttonText}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  )
} 