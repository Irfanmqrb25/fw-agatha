"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, UseFormReturn } from "react-hook-form"
import { CalendarIcon, PlusCircle, PencilIcon } from "lucide-react"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { JenisTransaksi, TipeTransaksiLingkungan } from "@prisma/client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

// Import types dan utilities
import { TransactionFormValues, transactionTypeOptions, transactionSubtypeOptions, KeluargaOption } from "../types"
// Jangan import dari kas-service yang menggunakan Prisma secara langsung
// import { getKeluargaList } from "../utils/kas-service"
// Gunakan server action
import { fetchKeluargaOptions } from "../utils/actions"

// Types untuk props
interface CommonProps {
  form: UseFormReturn<TransactionFormValues>;
  onSubmit: (values: TransactionFormValues) => void;
}

interface CreateTransactionProps extends CommonProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  disabled?: boolean;
}

interface EditTransactionProps extends CommonProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Dialog untuk menambahkan transaksi baru (tanpa trigger bawaan)
export function AddTransactionDialog({ 
  form, 
  onSubmit, 
  open, 
  onOpenChange,
  disabled = false
}: CreateTransactionProps) {
  const [keluargaOptions, setKeluargaOptions] = useState<KeluargaOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    // Ambil data keluarga saat komponen dimuat
    async function getKeluargaData() {
      try {
        setIsLoading(true);
        // Menggunakan server action untuk mengambil data
        const data = await fetchKeluargaOptions();
        if (data.success) {
          setKeluargaOptions(data.data);
        }
      } catch (error) {
        console.error("Error fetching keluarga options:", error);
      } finally {
        setIsLoading(false);
      }
    }
    
    if (open) {
      getKeluargaData();
    }
  }, [open]);
  
  const handleSubmit = (values: TransactionFormValues) => {
    onSubmit(values);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Input Transaksi Baru</DialogTitle>
          <DialogDescription>
            Tambahkan transaksi baru untuk Kas Lingkungan.
          </DialogDescription>
        </DialogHeader>
        <TransactionForm 
          form={form} 
          onSubmit={handleSubmit} 
          isEditing={false}
          keluargaOptions={keluargaOptions}
          isLoadingKeluarga={isLoading}
        />
      </DialogContent>
    </Dialog>
  )
}

// Dialog untuk membuat transaksi baru (dengan trigger bawaan)
export function CreateTransactionDialog({ 
  form, 
  onSubmit, 
  open, 
  onOpenChange,
  disabled = false
}: CreateTransactionProps) {
  const [keluargaOptions, setKeluargaOptions] = useState<KeluargaOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    // Ambil data keluarga saat komponen dimuat
    async function getKeluargaData() {
      try {
        setIsLoading(true);
        // Menggunakan server action untuk mengambil data
        const data = await fetchKeluargaOptions();
        if (data.success) {
          setKeluargaOptions(data.data);
        }
      } catch (error) {
        console.error("Error fetching keluarga options:", error);
      } finally {
        setIsLoading(false);
      }
    }
    
    if (open) {
      getKeluargaData();
    }
  }, [open]);
  
  const handleSubmit = (values: TransactionFormValues) => {
    onSubmit(values);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button 
          className="h-10" 
          disabled={disabled}
          title={disabled ? "Saldo awal harus diset terlebih dahulu" : "Input Transaksi"}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Input Transaksi
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Input Transaksi Baru</DialogTitle>
          <DialogDescription>
            Tambahkan transaksi baru untuk Kas Lingkungan.
          </DialogDescription>
        </DialogHeader>
        <TransactionForm 
          form={form} 
          onSubmit={handleSubmit} 
          isEditing={false}
          keluargaOptions={keluargaOptions}
          isLoadingKeluarga={isLoading}
        />
      </DialogContent>
    </Dialog>
  )
}

// Dialog untuk mengedit transaksi
export function EditTransactionDialog({ 
  form, 
  onSubmit, 
  open, 
  onOpenChange 
}: EditTransactionProps) {
  const [keluargaOptions, setKeluargaOptions] = useState<KeluargaOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    // Ambil data keluarga saat komponen dimuat
    async function getKeluargaData() {
      try {
        setIsLoading(true);
        // Menggunakan server action untuk mengambil data
        const data = await fetchKeluargaOptions();
        if (data.success) {
          setKeluargaOptions(data.data);
        }
      } catch (error) {
        console.error("Error fetching keluarga options:", error);
      } finally {
        setIsLoading(false);
      }
    }
    
    if (open) {
      getKeluargaData();
    }
  }, [open]);
  
  const handleSubmit = (values: TransactionFormValues) => {
    onSubmit(values);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Edit Transaksi</DialogTitle>
          <DialogDescription>
            Perbarui data transaksi yang dipilih.
          </DialogDescription>
        </DialogHeader>
        <TransactionForm 
          form={form} 
          onSubmit={handleSubmit} 
          isEditing={true}
          keluargaOptions={keluargaOptions}
          isLoadingKeluarga={isLoading}
        />
      </DialogContent>
    </Dialog>
  )
}

// Form komponen yang digunakan oleh kedua dialog
function TransactionForm({ 
  form, 
  onSubmit, 
  isEditing,
  keluargaOptions,
  isLoadingKeluarga
}: { 
  form: UseFormReturn<TransactionFormValues>;
  onSubmit: (values: TransactionFormValues) => void;
  isEditing: boolean;
  keluargaOptions: KeluargaOption[];
  isLoadingKeluarga: boolean;
}) {
  const [showConfirmTransfer, setShowConfirmTransfer] = useState(false);
  const currentType = form.watch("jenisTransaksi");
  const currentSubtype = form.watch("tipeTransaksi");
  
  // State untuk menyimpan subtipe transaksi yang tersedia
  const [availableSubtypes, setAvailableSubtypes] = useState(
    transactionSubtypeOptions[currentType] || []
  );
  
  // State untuk menentukan apakah perlu tampilkan dropdown keluarga
  const [showKeluargaSelect, setShowKeluargaSelect] = useState(
    currentSubtype === TipeTransaksiLingkungan.SUMBANGAN_UMAT
  );
  
  // Konfirmasi jika user memilih transaksi transfer dana ke IKATA
  useEffect(() => {
    if (
      currentType === JenisTransaksi.UANG_KELUAR && 
      currentSubtype === TipeTransaksiLingkungan.TRANSFER_DANA_KE_IKATA &&
      !isEditing
    ) {
      setShowConfirmTransfer(true);
    } else {
      setShowConfirmTransfer(false);
    }
  }, [currentType, currentSubtype, isEditing]);

  // Update available subtypes when transaction type changes
  const onTransactionTypeChange = (value: JenisTransaksi) => {
    setAvailableSubtypes(transactionSubtypeOptions[value] || []);
    // Reset tipe transaksi ketika jenis transaksi berubah
    form.setValue("tipeTransaksi", transactionSubtypeOptions[value][0].value);
    // Periksa apakah perlu menampilkan dropdown keluarga
    setShowKeluargaSelect(transactionSubtypeOptions[value][0].value === TipeTransaksiLingkungan.SUMBANGAN_UMAT);
  };
  
  // Update ketika tipe transaksi berubah untuk menentukan tampilan dropdown keluarga
  const onTransactionSubtypeChange = (value: TipeTransaksiLingkungan) => {
    setShowKeluargaSelect(value === TipeTransaksiLingkungan.SUMBANGAN_UMAT);
    
    // Jika tidak lagi menampilkan dropdown keluarga, reset nilai keluargaId
    if (value !== TipeTransaksiLingkungan.SUMBANGAN_UMAT) {
      form.setValue("keluargaId", undefined);
    }
  };
  
  // Handle the form submission
  const handleFormSubmit = (values: TransactionFormValues) => {
    onSubmit(values);
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* Tanggal Transaksi */}
          <FormField
            control={form.control}
            name="tanggal"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Tanggal Transaksi</FormLabel>
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
                          format(field.value, "PPP", { locale: id })
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
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Jenis Transaksi */}
          <FormField
            control={form.control}
            name="jenisTransaksi"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Jenis Transaksi</FormLabel>
                <Select 
                  onValueChange={(value) => {
                    field.onChange(value as JenisTransaksi);
                    onTransactionTypeChange(value as JenisTransaksi);
                  }} 
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih jenis transaksi" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {transactionTypeOptions.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Tipe Transaksi */}
          <FormField
            control={form.control}
            name="tipeTransaksi"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipe Transaksi</FormLabel>
                <Select 
                  onValueChange={(value) => {
                    field.onChange(value as TipeTransaksiLingkungan);
                    onTransactionSubtypeChange(value as TipeTransaksiLingkungan);
                  }} 
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih tipe transaksi" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="max-h-60 overflow-y-auto">
                    {availableSubtypes.map((subtype) => (
                      <SelectItem key={subtype.value} value={subtype.value}>
                        {subtype.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  {field.value === TipeTransaksiLingkungan.TRANSFER_DANA_KE_IKATA ? 
                    "Transaksi ini akan otomatis membuat transaksi masuk di Kas IKATA." : 
                    "Pilih kategori transaksi sesuai kebutuhan."
                  }
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Tampilkan dropdown keluarga jika tipe transaksi adalah sumbangan umat */}
          {showKeluargaSelect && (
            <FormField
              control={form.control}
              name="keluargaId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Keluarga</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isLoadingKeluarga}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={isLoadingKeluarga ? "Memuat data..." : "Pilih keluarga"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-60 overflow-y-auto">
                      {isLoadingKeluarga ? (
                        <SelectItem value="loading" disabled>Memuat data keluarga...</SelectItem>
                      ) : keluargaOptions.length > 0 ? (
                        keluargaOptions.map((option) => (
                          <SelectItem key={option.id} value={option.id}>
                            {option.namaKepalaKeluarga}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="empty" disabled>Tidak ada data keluarga</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Pilih keluarga yang memberikan sumbangan
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          
          {/* Keterangan */}
          <FormField
            control={form.control}
            name="keterangan"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Keterangan</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Masukkan keterangan transaksi"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Jumlah */}
          <FormField
            control={form.control}
            name="jumlah"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Jumlah</FormLabel>
                <FormControl>
                  <div className="flex items-center">
                    <span className="mr-2 text-gray-500">Rp</span>
                    <Input
                      type="number"
                      min="0"
                      step="1000"
                      placeholder="0"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormDescription>
                  Masukkan jumlah dalam Rupiah
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Submit Button */}
          <div className="pt-4">
            <Button type="submit" className="w-full">
              {isEditing ? "Simpan Perubahan" : "Tambah Transaksi"}
            </Button>
          </div>
        </form>
      </Form>

      {/* Konfirmasi untuk transaksi transfer dana ke IKATA */}
      <AlertDialog open={showConfirmTransfer} onOpenChange={setShowConfirmTransfer}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Transfer Dana</AlertDialogTitle>
            <AlertDialogDescription>
              Transaksi ini akan otomatis membuat transaksi masuk di Kas IKATA.
              Apakah Anda yakin ingin melanjutkan?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              form.setValue("tipeTransaksi", TipeTransaksiLingkungan.LAIN_LAIN);
            }}>
              Batal
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => setShowConfirmTransfer(false)}>
              Lanjutkan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
} 