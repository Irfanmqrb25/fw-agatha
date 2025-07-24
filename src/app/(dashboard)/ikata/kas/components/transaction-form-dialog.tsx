'use client';

import { useState, useEffect, useMemo } from 'react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Check, ChevronsUpDown } from 'lucide-react'; 
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { 
  IKATATransaction, 
  TransactionFormData, 
  JenisTransaksi, 
  TipeTransaksi, 
  TipeTransaksiMasuk, 
  TipeTransaksiKeluar,
  StatusPembayaran
} from '../types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { 
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import { useRouter } from 'next/navigation';
import { parseJakartaDateString } from '@/lib/timezone';

// Periode bulan untuk pembayaran
const getPeriodeBulanOptions = () => {
  const currentYear = new Date().getFullYear();
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  
  return months.map((month, index) => ({
    value: `${currentYear}-${(index + 1).toString().padStart(2, '0')}`,
    label: `${month} ${currentYear}`
  }));
};

// Definisikan skema validasi dengan tipe yang benar
const transactionFormSchema = z.object({
  tanggal: z.date({
    required_error: "Tanggal wajib diisi",
  }),
  jenis: z.enum(['uang_masuk', 'uang_keluar'], {
    required_error: "Jenis transaksi wajib diisi",
  }),
  tipeTransaksi: z.string({
    required_error: "Tipe transaksi wajib diisi",
  }).min(1, "Tipe transaksi wajib diisi"),
  keterangan: z.string().optional(),
  jumlah: z.number({
    required_error: "Jumlah wajib diisi",
  }).min(1, "Jumlah harus lebih dari 0"),
  anggotaId: z.string().optional(),
  statusPembayaran: z.enum(['lunas', 'sebagian_bulan', 'belum_ada_pembayaran']).optional(),
  periodeBayar: z.array(z.string()).optional(),
  totalIuran: z.number().optional(),
}).superRefine((data, ctx) => {
  // Validasi untuk iuran anggota
  if (data.jenis === 'uang_masuk' && data.tipeTransaksi === 'iuran_anggota') {
    if (!data.anggotaId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Anggota IKATA wajib dipilih untuk iuran anggota",
        path: ["anggotaId"]
      });
    }
    if (!data.statusPembayaran) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Status pembayaran wajib dipilih untuk iuran anggota",
        path: ["statusPembayaran"]
      });
    }
    if (data.statusPembayaran === 'sebagian_bulan' && (!data.periodeBayar || data.periodeBayar.length === 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Periode pembayaran wajib dipilih untuk pembayaran sebagian bulan",
        path: ["periodeBayar"]
      });
    }
  }

  // Validasi untuk sumbangan anggota
  if (data.jenis === 'uang_masuk' && data.tipeTransaksi === 'sumbangan_anggota' && !data.anggotaId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Anggota IKATA wajib dipilih untuk sumbangan anggota",
      path: ["anggotaId"]
    });
  }
});

// Definisikan tipe dari skema
type TransactionFormValues = z.infer<typeof transactionFormSchema>;

interface TransactionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: TransactionFormData) => void;
  editTransaction?: IKATATransaction | null;
  keluargaUmatList: { id: string; namaKepalaKeluarga: string }[];
  currentDuesAmount?: number;
}

export function TransactionFormDialog({ 
  open, 
  onOpenChange, 
  onSubmit, 
  editTransaction,
  keluargaUmatList,
  currentDuesAmount
}: TransactionFormDialogProps) {
  const [showAnggotaFields, setShowAnggotaFields] = useState(false);
  const [showStatusPembayaran, setShowStatusPembayaran] = useState(false);
  const [showPeriodeBayar, setShowPeriodeBayar] = useState(false);
  const [showTotalIuran, setShowTotalIuran] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!editTransaction;
  const router = useRouter();
  
  // Ambil parameter keluargaId dari URL jika ada
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const keluargaId = urlParams.get('keluargaId');
      
      if (keluargaId && open && !isEditing) {
        // Set default values untuk pembayaran iuran dari parameter URL
        form.setValue('jenis', 'uang_masuk');
        form.setValue('tipeTransaksi', 'iuran_anggota');
        form.setValue('anggotaId', keluargaId);
        setShowAnggotaFields(true);
        setShowStatusPembayaran(true);
        setShowTotalIuran(true);
      }
    }
  }, [open, isEditing]);
  
  // Gunakan tipe yang sudah didefinisikan untuk form
  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      tanggal: new Date(),
      jenis: 'uang_masuk',
      tipeTransaksi: '',
      keterangan: '',
      jumlah: 0,
      totalIuran: currentDuesAmount || 120000,
    },
  });

  // Reset form ketika dialog dibuka atau editTransaction berubah
  useEffect(() => {
    if (open) {
      if (editTransaction) {
        // Isi form dengan data transaksi yang akan diedit
        // Gunakan parseJakartaDateString untuk memastikan tanggal tidak bergeser
        const tanggalObj = parseJakartaDateString(editTransaction.tanggal);

        // Set nilai form
        form.reset({
          tanggal: tanggalObj,
          jenis: editTransaction.jenis,
          tipeTransaksi: editTransaction.tipeTransaksi,
          keterangan: editTransaction.keterangan || '',
          jumlah: editTransaction.jumlah,
          anggotaId: editTransaction.anggotaId,
          statusPembayaran: editTransaction.statusPembayaran as any,
          periodeBayar: editTransaction.periodeBayar || [],
          totalIuran: editTransaction.totalIuran || 120000,
        });

        // Update tampilan field berdasarkan tipe transaksi
        if (editTransaction.jenis === 'uang_masuk') {
          if (editTransaction.tipeTransaksi === 'iuran_anggota') {
            setShowAnggotaFields(true);
            setShowStatusPembayaran(true);
            setShowTotalIuran(true);
            if (editTransaction.statusPembayaran === 'sebagian_bulan') {
              setShowPeriodeBayar(true);
            }
          } else if (editTransaction.tipeTransaksi === 'sumbangan_anggota') {
            setShowAnggotaFields(true);
            setShowStatusPembayaran(false);
            setShowTotalIuran(false);
          }
        }
      } else {
        // Reset form untuk transaksi baru
        form.reset({
          tanggal: new Date(),
          jenis: 'uang_masuk',
          tipeTransaksi: '',
          keterangan: '',
          jumlah: 0,
          anggotaId: undefined,
          statusPembayaran: undefined,
          periodeBayar: [],
          totalIuran: currentDuesAmount || 120000,
        });
      }
    }
  }, [open, editTransaction, form, currentDuesAmount]);

  const watchJenis = form.watch('jenis');
  const watchTipeTransaksi = form.watch('tipeTransaksi');
  const watchStatusPembayaran = form.watch('statusPembayaran');

  // Mendapatkan opsi tipe transaksi berdasarkan jenis transaksi yang dipilih
  const tipeTransaksiOptions = useMemo(() => {
    if (watchJenis === 'uang_masuk') {
      return [
        { value: 'iuran_anggota', label: 'Iuran Anggota' },
        { value: 'transfer_dana_lingkungan', label: 'Transfer Dana dari Lingkungan' },
        { value: 'sumbangan_anggota', label: 'Sumbangan Anggota' },
        { value: 'penerimaan_lain', label: 'Penerimaan Lain-Lain' },
      ];
    } else {
      return [
        { value: 'uang_duka', label: 'Uang Duka / Papan Bunga' },
        { value: 'kunjungan_kasih', label: 'Kunjungan Kasih' },
        { value: 'cinderamata_kelahiran', label: 'Cinderamata Kelahiran' },
        { value: 'cinderamata_pernikahan', label: 'Cinderamata Pernikahan' },
        { value: 'uang_akomodasi', label: 'Uang Akomodasi' },
        { value: 'pembelian', label: 'Pembelian' },
        { value: 'lain_lain', label: 'Lain-Lain' },
      ];
    }
  }, [watchJenis]);

  // Update field saat jenis transaksi berubah
  useEffect(() => {
    // Reset tipe transaksi saat jenis transaksi berubah
    form.setValue('tipeTransaksi', '');
    
    // Reset field terkait anggota
    form.setValue('anggotaId', undefined);
    form.setValue('statusPembayaran', undefined);
    form.setValue('periodeBayar', []);
    form.setValue('totalIuran', currentDuesAmount || 120000);
    
    // Reset tampilan field
    setShowAnggotaFields(false);
    setShowStatusPembayaran(false);
    setShowPeriodeBayar(false);
    setShowTotalIuran(false);

    // Reset keterangan jika bukan mode edit
    if (!editTransaction) {
      form.setValue('keterangan', '');
    }
  }, [watchJenis, form, editTransaction, currentDuesAmount]);

  // Update field saat tipe transaksi berubah
  useEffect(() => {
    if (watchJenis === 'uang_masuk') {
      if (watchTipeTransaksi === 'iuran_anggota') {
        setShowAnggotaFields(true);
        setShowStatusPembayaran(true);
        setShowTotalIuran(true);
        // Set totalIuran dari currentDuesAmount
        form.setValue('totalIuran', currentDuesAmount || 120000);
      } else if (watchTipeTransaksi === 'sumbangan_anggota') {
        setShowAnggotaFields(true);
        setShowStatusPembayaran(false);
        setShowTotalIuran(false);
        // Reset field yang tidak diperlukan
        form.setValue('statusPembayaran', undefined);
        form.setValue('periodeBayar', []);
        form.setValue('totalIuran', undefined);
      } else {
        setShowAnggotaFields(false);
        setShowStatusPembayaran(false);
        setShowTotalIuran(false);
        // Reset semua field terkait anggota
        form.setValue('anggotaId', undefined);
        form.setValue('statusPembayaran', undefined);
        form.setValue('periodeBayar', []);
        form.setValue('totalIuran', undefined);
      }
    } else {
      setShowAnggotaFields(false);
      setShowStatusPembayaran(false);
      setShowTotalIuran(false);
      // Reset semua field terkait anggota
      form.setValue('anggotaId', undefined);
      form.setValue('statusPembayaran', undefined);
      form.setValue('periodeBayar', []);
      form.setValue('totalIuran', undefined);
    }
  }, [watchJenis, watchTipeTransaksi, form, currentDuesAmount]);

  // Tambahkan useEffect untuk memastikan totalIuran selalu sinkron dengan currentDuesAmount
  useEffect(() => {
    if (showTotalIuran && currentDuesAmount) {
      form.setValue('totalIuran', currentDuesAmount);
    }
  }, [currentDuesAmount, showTotalIuran, form]);

  // Update field saat status pembayaran berubah
  useEffect(() => {
    if (watchStatusPembayaran === 'sebagian_bulan') {
      setShowPeriodeBayar(true);
    } else {
      setShowPeriodeBayar(false);
      // Reset periode bayar jika status bukan sebagian bulan
      form.setValue('periodeBayar', []);
    }
  }, [watchStatusPembayaran, form]);

  const handleSubmit = async (values: TransactionFormValues) => {
    try {

      // Format tanggal ke string YYYY-MM-DD dengan timezone Jakarta yang benar
      const tanggalString = format(values.tanggal, 'yyyy-MM-dd');

      // Siapkan keterangan berdasarkan tipe transaksi
      let keterangan = values.keterangan || '';
      if (values.jenis === 'uang_masuk') {
        if (values.tipeTransaksi === 'sumbangan_anggota' && values.anggotaId) {
          const anggota = keluargaUmatList.find(k => k.id === values.anggotaId);
          if (anggota) {
            keterangan = `Sumbangan dari ${anggota.namaKepalaKeluarga}`;
          }
        } else if (values.tipeTransaksi === 'iuran_anggota' && values.anggotaId) {
          const anggota = keluargaUmatList.find(k => k.id === values.anggotaId);
          if (anggota) {
            keterangan = `Iuran dari ${anggota.namaKepalaKeluarga}`;
            if (values.statusPembayaran) {
              keterangan += ` (${values.statusPembayaran === 'lunas' ? 'Lunas' : 
                values.statusPembayaran === 'sebagian_bulan' ? 'Sebagian Bulan' : 'Belum Ada Pembayaran'})`;
              if (values.statusPembayaran === 'sebagian_bulan' && values.periodeBayar && values.periodeBayar.length > 0) {
                const periodeBulan = values.periodeBayar.map(periode => {
                  const [tahun, bulan] = periode.split('-');
                  const namaBulan = new Date(parseInt(tahun), parseInt(bulan) - 1).toLocaleString('id-ID', { month: 'long' });
                  return `${namaBulan} ${tahun}`;
                }).join(', ');
                keterangan += ` - ${periodeBulan}`;
              }
            }
          }
        }
      }

      // Persiapkan data untuk dikirim
      const submissionData: TransactionFormData = {
        tanggal: tanggalString,
        jenis: values.jenis,
        tipeTransaksi: values.tipeTransaksi as TipeTransaksi,
        keterangan: keterangan,
        jumlah: values.jumlah,
        anggotaId: values.anggotaId,
        statusPembayaran: values.statusPembayaran,
        periodeBayar: values.periodeBayar,
        totalIuran: currentDuesAmount || 120000
      };
      
      await onSubmit(submissionData);
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error("[handleSubmit] Error:", error);
      toast.error("Gagal menyimpan transaksi", {
        description: error instanceof Error ? error.message : "Terjadi kesalahan yang tidak diketahui"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] md:max-w-[550px] lg:max-w-[600px] w-full mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Transaksi' : 'Tambah Transaksi'}</DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Ubah data transaksi yang sudah ada.'
              : 'Isi formulir di bawah untuk menambahkan transaksi kas IKATA.'
            }
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit(async (values) => {
                
                try {
                  setIsSubmitting(true);
                  
                  // Validasi tambahan untuk field yang required berdasarkan tipe transaksi
                  if (values.jenis === 'uang_masuk') {
                    if (values.tipeTransaksi === 'iuran_anggota') {
                      if (!values.anggotaId) {
                        toast.error("Anggota IKATA wajib dipilih untuk iuran anggota");
                        return;
                      }
                      if (!values.statusPembayaran) {
                        toast.error("Status pembayaran wajib dipilih untuk iuran anggota");
                        return;
                      }
                      if (values.statusPembayaran === 'sebagian_bulan' && (!values.periodeBayar || values.periodeBayar.length === 0)) {
                        toast.error("Periode pembayaran wajib dipilih untuk pembayaran sebagian bulan");
                        return;
                      }
                    } else if (values.tipeTransaksi === 'sumbangan_anggota' && !values.anggotaId) {
                      toast.error("Anggota IKATA wajib dipilih untuk sumbangan anggota");
                      return;
                    }
                  }

                  // Parse tanggal dengan timezone Jakarta yang benar
                  const tanggalString = format(values.tanggal, 'yyyy-MM-dd');

                  // Persiapkan data untuk dikirim
                  const submissionData: TransactionFormData = {
                    tanggal: tanggalString,
                    jenis: values.jenis,
                    tipeTransaksi: values.tipeTransaksi as TipeTransaksi,
                    keterangan: values.keterangan || '',
                    jumlah: values.jumlah,
                    anggotaId: values.anggotaId,
                    statusPembayaran: values.statusPembayaran,
                    periodeBayar: values.periodeBayar,
                    totalIuran: currentDuesAmount || 120000
                  };

                  // Kirim data ke server
                  await onSubmit(submissionData);

                  // Reset form dan tutup dialog
                  form.reset();
                  onOpenChange(false);
                  
                  toast.success("Berhasil", {
                    description: isEditing ? "Transaksi berhasil diperbarui" : "Transaksi berhasil ditambahkan"
                  });

                  // Refresh halaman untuk mendapatkan data terbaru
                  router.refresh();
                } catch (error) {
                  console.error("Error:", error);
                  toast.error("Gagal menyimpan transaksi", {
                    description: error instanceof Error ? error.message : "Terjadi kesalahan yang tidak diketahui"
                  });
                } finally {
                  setIsSubmitting(false);
                }
              })(e);
            }} 
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="jenis"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jenis Transaksi</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih jenis transaksi" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="uang_masuk">Uang Masuk</SelectItem>
                      <SelectItem value="uang_keluar">Uang Keluar</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tipeTransaksi"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipe Transaksi</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value}
                    disabled={!watchJenis}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih tipe transaksi" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {tipeTransaksiOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
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
              name="tanggal"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Tanggal</FormLabel>
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
                        locale={id}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {showAnggotaFields && (
              <FormField
                control={form.control}
                name="anggotaId"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Anggota IKATA</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "w-full justify-between",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value
                              ? keluargaUmatList.find((anggota) => anggota.id === field.value)?.namaKepalaKeluarga
                              : "Pilih anggota"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput placeholder="Cari anggota..." />
                          <CommandEmpty>Anggota tidak ditemukan.</CommandEmpty>
                          <CommandGroup className="max-h-60 overflow-auto">
                            {keluargaUmatList.map((anggota) => (
                              <CommandItem
                                key={anggota.id}
                                value={anggota.namaKepalaKeluarga}
                                onSelect={() => {
                                  form.setValue("anggotaId", anggota.id)
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    anggota.id === field.value
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {anggota.namaKepalaKeluarga}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {showTotalIuran && (
              <FormField
                control={form.control}
                name="totalIuran"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Iuran</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder={currentDuesAmount ? currentDuesAmount.toString() : "120000"} 
                        {...field}
                        value={currentDuesAmount || 120000}
                        disabled
                        className="bg-muted"
                      />
                    </FormControl>
                    <FormDescription>
                      Nilai ini diambil dari pengaturan iuran IKATA (dapat diatur melalui tombol "Atur Iuran")
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {showStatusPembayaran && (
              <FormField
                control={form.control}
                name="statusPembayaran"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status Pembayaran</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
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
            )}

            {showPeriodeBayar && (
              <FormField
                control={form.control}
                name="periodeBayar"
                render={() => (
                  <FormItem>
                    <div className="mb-2">
                      <FormLabel>Periode Bulan yang Dilunasi</FormLabel>
                      <FormDescription>
                        Pilih bulan-bulan yang sudah dilunasi
                      </FormDescription>
                    </div>
                    <div className="grid grid-cols-2 gap-3 max-h-40 overflow-y-auto p-1">
                      {getPeriodeBulanOptions().map((periode) => (
                        <FormField
                          key={periode.value}
                          control={form.control}
                          name="periodeBayar"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={periode.value}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(periode.value)}
                                    onCheckedChange={(checked) => {
                                      const current = field.value || [];
                                      if (checked) {
                                        form.setValue("periodeBayar", [
                                          ...current,
                                          periode.value,
                                        ]);
                                      } else {
                                        form.setValue("periodeBayar", current.filter(
                                          (value) => value !== periode.value
                                        ));
                                      }
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="text-sm font-normal cursor-pointer">
                                  {periode.label}
                                </FormLabel>
                              </FormItem>
                            )
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="jumlah"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jumlah (Rp)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="0" 
                      {...field}
                      onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!showAnggotaFields && (
              <FormField
                control={form.control}
                name="keterangan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Keterangan</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Keterangan transaksi" 
                        className="resize-none"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Batal
              </Button>
              <Button 
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Menyimpan...' : isEditing ? 'Simpan Perubahan' : 'Simpan'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 