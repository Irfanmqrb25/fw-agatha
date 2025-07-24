"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format, isBefore, isAfter, addMonths } from "date-fns";
import { id } from "date-fns/locale";
import { CalendarIcon, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { DolingData } from "../types";
import { JenisIbadat, SubIbadat } from "@prisma/client";

// Validasi untuk tanggal
const disabledDays = [
  // Contoh: tanggal yang sudah dipesan
  new Date(2023, 10, 10),
  new Date(2023, 10, 15),
  new Date(2023, 10, 20),
];

// Membuat skema validasi form dengan tipe-tipe yang sesuai
const formSchema = z.object({
  tuanRumah: z
    .string()
    .min(3, "Nama tuan rumah minimal 3 karakter")
    .max(50, "Nama tuan rumah maksimal 50 karakter"),
  alamat: z
    .string()
    .min(5, "Alamat minimal 5 karakter")
    .max(200, "Alamat maksimal 200 karakter"),
  tanggal: z
    .date({
      required_error: "Tanggal doa lingkungan wajib diisi",
    })
    .refine(
      (date) => isAfter(date, new Date()), 
      "Tanggal harus setelah hari ini"
    )
    .refine(
      (date) => isBefore(date, addMonths(new Date(), 6)), 
      "Tanggal tidak boleh lebih dari 6 bulan dari sekarang"
    ),
  waktu: z
    .string()
    .min(5, "Format waktu tidak valid"),
  nomorTelepon: z
    .string()
    .min(10, "Nomor telepon minimal 10 digit")
    .max(15, "Nomor telepon maksimal 15 digit"),
  jenisIbadat: z.nativeEnum(JenisIbadat, {
    required_error: "Jenis ibadat harus dipilih",
  }),
  subIbadat: z.string().optional(),
  temaIbadat: z
    .string()
    .max(500, "Catatan maksimal 500 karakter")
    .optional(),
  status: z.enum(["terjadwal", "selesai", "dibatalkan", "menunggu"], {
    required_error: "Status harus dipilih",
  }),
});

type FormValues = {
  tuanRumah: string;
  alamat: string;
  tanggal: Date;
  waktu: string;
  nomorTelepon: string;
  jenisIbadat: JenisIbadat;
  subIbadat?: string;
  temaIbadat?: string;
  status: "terjadwal" | "selesai" | "dibatalkan" | "menunggu";
}

interface FormJadwalDolingProps {
  initialData?: DolingData;
  onSubmit: (data: DolingData) => void;
  onCancel: () => void;
}

export function FormJadwalDoling({ initialData, onSubmit, onCancel }: FormJadwalDolingProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData ? {
      tuanRumah: initialData.tuanRumah,
      alamat: initialData.alamat,
      tanggal: initialData.tanggal,
      waktu: initialData.waktu,
      nomorTelepon: initialData.nomorTelepon || "",
      jenisIbadat: initialData.jenisIbadat,
      subIbadat: initialData.subIbadat ? initialData.subIbadat : "NONE",
      temaIbadat: initialData.temaIbadat || undefined,
      status: initialData.status as "terjadwal" | "selesai" | "dibatalkan" | "menunggu",
    } : {
      tuanRumah: "",
      alamat: "",
      tanggal: new Date(),
      waktu: "19:00",
      nomorTelepon: "",
      jenisIbadat: JenisIbadat.DOA_LINGKUNGAN,
      subIbadat: "NONE",
      temaIbadat: undefined,
      status: "terjadwal",
    },
  });

  // Mengamati perubahan jenis ibadat untuk menampilkan/menyembunyikan field subIbadat yang sesuai
  const jenisIbadat = form.watch("jenisIbadat");

  // Mendapatkan subIbadat berdasarkan jenisIbadat yang dipilih
  const getSubIbadatOptions = () => {
    switch (jenisIbadat) {
      case JenisIbadat.DOA_LINGKUNGAN:
        return [
          SubIbadat.IBADAT_SABDA,
          SubIbadat.IBADAT_SABDA_TEMATIK,
          SubIbadat.PRAPASKAH,
          SubIbadat.BKSN,
          SubIbadat.BULAN_ROSARIO,
          SubIbadat.NOVENA_NATAL
        ];
      case JenisIbadat.MISA:
        return [
          SubIbadat.MISA_SYUKUR,
          SubIbadat.MISA_REQUEM,
          SubIbadat.MISA_ARWAH,
          SubIbadat.MISA_PELINDUNG
        ];
      default:
        return [];
    }
  };

  // Mapping untuk menampilkan jenis ibadat dalam bahasa yang lebih mudah dibaca
  const jenisIbadatMap: Record<JenisIbadat, string> = {
    [JenisIbadat.DOA_LINGKUNGAN]: "Doa Lingkungan",
    [JenisIbadat.MISA]: "Misa",
    [JenisIbadat.PERTEMUAN]: "Pertemuan",
    [JenisIbadat.BAKTI_SOSIAL]: "Bakti Sosial",
    [JenisIbadat.KEGIATAN_LAIN]: "Kegiatan Lain"
  };

  // Mapping untuk menampilkan sub ibadat dalam bahasa yang lebih mudah dibaca
  const subIbadatMap: Record<SubIbadat, string> = {
    [SubIbadat.IBADAT_SABDA]: "Ibadat Sabda",
    [SubIbadat.IBADAT_SABDA_TEMATIK]: "Ibadat Sabda Tematik",
    [SubIbadat.PRAPASKAH]: "Prapaskah (APP)",
    [SubIbadat.BKSN]: "BKSN",
    [SubIbadat.BULAN_ROSARIO]: "Bulan Rosario",
    [SubIbadat.NOVENA_NATAL]: "Novena Natal",
    [SubIbadat.MISA_SYUKUR]: "Misa Syukur",
    [SubIbadat.MISA_REQUEM]: "Misa Requem",
    [SubIbadat.MISA_ARWAH]: "Misa Arwah",
    [SubIbadat.MISA_PELINDUNG]: "Misa Pelindung"
  };

  function handleSubmit(values: FormValues) {
    // Proses values.subIbadat agar sesuai dengan yang diharapkan
    let subIbadatValue: SubIbadat | undefined = undefined;
    if (values.subIbadat && values.subIbadat !== "NONE") {
      subIbadatValue = values.subIbadat as SubIbadat;
    }
    
    // Karena kita tidak bisa membuat DolingData lengkap di sini (banyak properti dari database),
    // kita kirim hanya yang kita edit dan biarkan handler di komponen parent mengurus sisanya
    onSubmit({
      ...(initialData || {
        id: "",
        tuanRumahId: "",
        jumlahKKHadir: 0,
        bapak: 0,
        ibu: 0,
        omk: 0,
        bir: 0,
        biaBawah: 0,
        biaAtas: 0,
        kolekteI: 0,
        kolekteII: 0,
        ucapanSyukur: 0,
        pemimpinIbadat: null,
        pemimpinRosario: null,
        pembawaRenungan: null,
        pembawaLagu: null,
        doaUmat: null,
        pemimpinMisa: null,
        bacaanI: null,
        pemazmur: null,
        jumlahPeserta: 0,
        approved: false,
        createdAt: new Date(),
      } as DolingData),
      ...values,
      subIbadat: subIbadatValue || null,
      updatedAt: new Date(),
    });
  }

  const timeOptions = [
    "18:00", "18:30", "19:00", "19:30", "20:00"
  ];

  const isEditMode = !!initialData;
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{isEditMode ? "Edit Jadwal Doa Lingkungan" : "Tambah Jadwal Doa Lingkungan"}</CardTitle>
        <CardDescription>
          Silakan isi formulir di bawah untuk {isEditMode ? "mengubah" : "menambahkan"} jadwal doa lingkungan
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="tuanRumah"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tuan Rumah <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="Masukkan nama tuan rumah" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="nomorTelepon"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nomor Telepon <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="Contoh: 081234567890" type="tel" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="tanggal"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Tanggal <span className="text-destructive">*</span></FormLabel>
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
                              disabledDays.some(disabled => 
                                disabled.getDate() === date.getDate() &&
                                disabled.getMonth() === date.getMonth() &&
                                disabled.getFullYear() === date.getFullYear()
                              ) ||
                              isBefore(date, new Date()) || 
                              isAfter(date, addMonths(new Date(), 6))
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="waktu"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Waktu <span className="text-destructive">*</span></FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih waktu" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {timeOptions.map((time) => (
                            <SelectItem key={time} value={time}>
                              {time} WIB
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="alamat"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alamat <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Masukkan alamat tuan rumah" 
                          className="min-h-[120px]" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="jenisIbadat"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Jenis Ibadat <span className="text-destructive">*</span></FormLabel>
                      <Select 
                        value={field.value} 
                        onValueChange={(value) => {
                          field.onChange(value);
                          // Reset subIbadat when jenisIbadat changes
                          form.setValue("subIbadat", "NONE");
                        }}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih jenis ibadat" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.values(JenisIbadat).map((jenis) => (
                            <SelectItem key={jenis} value={jenis}>
                              {jenisIbadatMap[jenis]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {(jenisIbadat === JenisIbadat.DOA_LINGKUNGAN || jenisIbadat === JenisIbadat.MISA) && (
                  <FormField
                    control={form.control}
                    name="subIbadat"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sub Ibadat</FormLabel>
                        <Select 
                          value={field.value || "NONE"} 
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih sub ibadat" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="NONE">-- Tidak Ada --</SelectItem>
                            {getSubIbadatOptions().map((sub) => (
                              <SelectItem key={sub} value={sub}>
                                {subIbadatMap[sub]}
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
                  name="temaIbadat"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tema Ibadat</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Masukkan tema ibadat (opsional)" 
                          className="min-h-[80px]" 
                          {...field} 
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {isEditMode && (
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="terjadwal">Terjadwal</SelectItem>
                            <SelectItem value="menunggu">Menunggu</SelectItem>
                            <SelectItem value="selesai">Selesai</SelectItem>
                            <SelectItem value="dibatalkan">Dibatalkan</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            </div>
            
            <Alert variant="default" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Perhatian</AlertTitle>
              <AlertDescription>
                Pastikan semua informasi yang Anda masukkan sudah benar. Data jadwal doa lingkungan akan digunakan untuk notifikasi otomatis.
              </AlertDescription>
            </Alert>
            
            <Separator className="my-4" />
            
            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={onCancel}>
                Batal
              </Button>
              <Button type="submit">
                {isEditMode ? "Perbarui" : "Simpan"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
} 