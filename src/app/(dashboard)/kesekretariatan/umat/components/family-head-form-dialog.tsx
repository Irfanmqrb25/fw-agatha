"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { FamilyHeadWithDetails, FamilyHeadFormValues, familyHeadFormSchema, familyHeadStatuses } from "../types";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusKehidupan, StatusPernikahan } from "@prisma/client";

interface FamilyHeadFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  familyHead?: FamilyHeadWithDetails;
  onSubmit: (values: FamilyHeadFormValues) => Promise<void>;
}

export function FamilyHeadFormDialog({
  open,
  onOpenChange,
  familyHead,
  onSubmit,
}: FamilyHeadFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultValues: FamilyHeadFormValues = {
    namaKepalaKeluarga: "",
    alamat: "",
    nomorTelepon: "",
    tanggalBergabung: new Date(),
    jumlahAnakTertanggung: 0,
    jumlahKerabatTertanggung: 0,
    jumlahAnggotaKeluarga: 1,
    status: StatusKehidupan.HIDUP,
    statusPernikahan: StatusPernikahan.TIDAK_MENIKAH,
    tanggalKeluar: null,
    tanggalMeninggal: null,
  };

  const form = useForm<FamilyHeadFormValues>({
    resolver: zodResolver(familyHeadFormSchema),
    defaultValues,
  });

  // Reset form when dialog is opened/closed or familyHead changes
  useEffect(() => {
    if (open) {
      if (familyHead) {
        // Editing existing family head
        const livingChildren = familyHead.tanggungan?.filter(t => 
          t.jenisTanggungan === 'ANAK' && t.status === StatusKehidupan.HIDUP
        ).length || 0;
        
        const livingRelatives = familyHead.tanggungan?.filter(t => 
          t.jenisTanggungan === 'KERABAT' && t.status === StatusKehidupan.HIDUP
        ).length || 0;

        form.reset({
          namaKepalaKeluarga: familyHead.nama,
          alamat: familyHead.alamat,
          nomorTelepon: familyHead.nomorTelepon || "",
          tanggalBergabung: familyHead.tanggalBergabung,
          jumlahAnakTertanggung: livingChildren,
          jumlahKerabatTertanggung: livingRelatives,
          jumlahAnggotaKeluarga: familyHead.livingMemberCount || 1,
          status: familyHead.status,
          statusPernikahan: familyHead.statusPernikahan,
          tanggalKeluar: familyHead.tanggalKeluar || null,
          tanggalMeninggal: familyHead.tanggalMeninggal || null,
        });
      } else {
        // Adding new family head
        form.reset(defaultValues);
      }
    }
  }, [open, familyHead, form]);

  // Mengawasi perubahan status
  const statusValue = form.watch("status");
  
  // Atur tanggal sesuai dengan status
  useEffect(() => {
    if (statusValue === StatusKehidupan.MENINGGAL && !form.getValues("tanggalMeninggal")) {
      form.setValue("tanggalMeninggal", new Date());
      form.setValue("tanggalKeluar", null);
    } else if (statusValue === StatusKehidupan.PINDAH && !form.getValues("tanggalKeluar")) {
      form.setValue("tanggalKeluar", new Date());
      form.setValue("tanggalMeninggal", null);
    } else if (statusValue === StatusKehidupan.HIDUP) {
      form.setValue("tanggalMeninggal", null);
      form.setValue("tanggalKeluar", null);
    }
  }, [statusValue, form]);

  // Mengawasi perubahan status pernikahan untuk update jumlah anggota keluarga
  const statusPernikahanValue = form.watch("statusPernikahan");
  const jumlahAnakValue = form.watch("jumlahAnakTertanggung");
  const jumlahKerabatValue = form.watch("jumlahKerabatTertanggung");
  const statusKehidupanValue = form.watch("status");
  
  // Update jumlah anggota keluarga secara otomatis saat ada perubahan
  useEffect(() => {
    if (!familyHead) {
      // Untuk data baru, gunakan perhitungan sederhana
      let totalAnggota = 0;
      
      if (statusKehidupanValue === StatusKehidupan.HIDUP) {
        totalAnggota += 1; // Kepala keluarga
      }
      
      if (statusPernikahanValue === StatusPernikahan.MENIKAH) {
        totalAnggota += 1; // Pasangan
      }
      
      totalAnggota += jumlahAnakValue + jumlahKerabatValue;
      
      form.setValue("jumlahAnggotaKeluarga", totalAnggota);
    }
  }, [statusPernikahanValue, jumlahAnakValue, jumlahKerabatValue, statusKehidupanValue, form, familyHead]);

  const handleSubmit = async (values: FamilyHeadFormValues) => {
    try {
      setIsSubmitting(true);
      await onSubmit(values);
      toast.success(
        familyHead
          ? "Data kepala keluarga berhasil diperbarui"
          : "Data kepala keluarga berhasil ditambahkan"
      );
      onOpenChange(false);
    } catch (error) {
      toast.error("Terjadi kesalahan saat menyimpan data");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function to handle dialog close
  const handleDialogClose = (open: boolean) => {
    if (!open) {
      // Reset form when dialog is closed without submitting
      setTimeout(() => form.reset(defaultValues), 100);
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {familyHead ? "Edit Kepala Keluarga" : "Tambah Kepala Keluarga"}
          </DialogTitle>
          <DialogDescription>
            {familyHead
              ? "Perbarui data kepala keluarga di bawah ini"
              : "Isi data kepala keluarga di bawah ini"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="namaKepalaKeluarga"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama</FormLabel>
                  <FormControl>
                    <Input placeholder="Nama kepala keluarga" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="alamat"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alamat</FormLabel>
                  <FormControl>
                    <Input placeholder="Alamat" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="tanggalBergabung"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Tanggal Bergabung</FormLabel>
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
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="jumlahAnakTertanggung"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jumlah Anak Tertanggung</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min={0}
                        placeholder="0" 
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} 
                        value={field.value || 0}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="jumlahKerabatTertanggung"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jumlah Kerabat Tertanggung</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min={0}
                        placeholder="0" 
                        {...field} 
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        value={field.value || 0}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="jumlahAnggotaKeluarga"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jumlah Jiwa (Total)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min={1}
                        placeholder="1" 
                        readOnly
                        className="bg-gray-50"
                        {...field}
                        value={field.value || 1}
                      />
                    </FormControl>
                    <div className="text-xs text-muted-foreground mt-1">
                      <p>Komposisi anggota keluarga:</p>
                      <ul className="mt-1 pl-5 list-disc">
                        {familyHead ? (
                          // Tampilkan data aktual dari database
                          <>
                            {familyHead.status === StatusKehidupan.HIDUP && <li>1 Kepala Keluarga</li>}
                            {familyHead.status === StatusKehidupan.MENINGGAL && <li className="text-red-500">1 Kepala Keluarga (Meninggal)</li>}
                            
                            {familyHead.pasangan?.status === StatusKehidupan.HIDUP && <li>1 Pasangan/Istri</li>}
                            {familyHead.pasangan?.status === StatusKehidupan.MENINGGAL && <li className="text-red-500">1 Pasangan/Istri (Meninggal)</li>}
                            
                            {familyHead.tanggungan?.filter(t => t.jenisTanggungan === 'ANAK' && t.status === StatusKehidupan.HIDUP).length > 0 && (
                              <li>{familyHead.tanggungan.filter(t => t.jenisTanggungan === 'ANAK' && t.status === StatusKehidupan.HIDUP).length} Anak</li>
                            )}
                            {familyHead.tanggungan?.filter(t => t.jenisTanggungan === 'ANAK' && t.status === StatusKehidupan.MENINGGAL).length > 0 && (
                              <li className="text-red-500">{familyHead.tanggungan.filter(t => t.jenisTanggungan === 'ANAK' && t.status === StatusKehidupan.MENINGGAL).length} Anak (Meninggal)</li>
                            )}
                            
                            {familyHead.tanggungan?.filter(t => t.jenisTanggungan === 'KERABAT' && t.status === StatusKehidupan.HIDUP).length > 0 && (
                              <li>{familyHead.tanggungan.filter(t => t.jenisTanggungan === 'KERABAT' && t.status === StatusKehidupan.HIDUP).length} Kerabat</li>
                            )}
                            {familyHead.tanggungan?.filter(t => t.jenisTanggungan === 'KERABAT' && t.status === StatusKehidupan.MENINGGAL).length > 0 && (
                              <li className="text-red-500">{familyHead.tanggungan.filter(t => t.jenisTanggungan === 'KERABAT' && t.status === StatusKehidupan.MENINGGAL).length} Kerabat (Meninggal)</li>
                            )}
                          </>
                        ) : (
                          // Tampilkan data berdasarkan input form untuk data baru
                          <>
                            <li>1 Kepala Keluarga</li>
                            {statusPernikahanValue === StatusPernikahan.MENIKAH && (
                              <li>1 Pasangan/Istri</li>
                            )}
                            {jumlahAnakValue > 0 && (
                              <li>{jumlahAnakValue} Anak tertanggung</li>
                            )}
                            {jumlahKerabatValue > 0 && (
                              <li>{jumlahKerabatValue} Kerabat tertanggung</li>
                            )}
                          </>
                        )}
                      </ul>
                      <p className="mt-1">Total: {field.value} jiwa</p>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="nomorTelepon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nomor Telepon</FormLabel>
                  <FormControl>
                    <Input placeholder="Nomor telepon" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {familyHeadStatuses.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
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
              name="statusPernikahan"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status Pernikahan</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih status pernikahan" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={StatusPernikahan.MENIKAH}>Menikah</SelectItem>
                      <SelectItem value={StatusPernikahan.TIDAK_MENIKAH}>Tidak Menikah</SelectItem>
                      <SelectItem value={StatusPernikahan.CERAI_HIDUP}>Cerai Hidup</SelectItem>
                      <SelectItem value={StatusPernikahan.CERAI_MATI}>Cerai Mati</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {statusValue === StatusKehidupan.PINDAH && (
              <FormField
                control={form.control}
                name="tanggalKeluar"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Tanggal Pindah</FormLabel>
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
                          selected={field.value || undefined}
                          onSelect={(date) => field.onChange(date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            {statusValue === StatusKehidupan.MENINGGAL && (
              <FormField
                control={form.control}
                name="tanggalMeninggal"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Tanggal Meninggal</FormLabel>
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
                          selected={field.value || undefined}
                          onSelect={(date) => field.onChange(date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0 mt-5">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleDialogClose(false)}
                className="w-full sm:w-auto"
              >
                Batal
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full sm:w-auto"
              >
                {isSubmitting ? "Menyimpan..." : "Simpan"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 