"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, X, Loader2, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { id } from "date-fns/locale";

import {
  DependentFormValues,
  dependentFormSchema,
  Gender,
  Dependent,
  Religion,
  MaritalStatus,
  DependentType,
} from "../types";
import { formatDateForInput } from "../utils";

interface DependentFormProps {
  defaultValues?: Dependent;
  onSubmit: (values: DependentFormValues) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  readOnly?: boolean;
}

export function DependentForm({
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
  readOnly = false,
}: DependentFormProps) {
  // Initialize form with default values or data from prop
  const form = useForm<DependentFormValues>({
    resolver: zodResolver(dependentFormSchema),
    defaultValues: defaultValues || {
      name: "",
      gender: Gender.MALE,
      birthPlace: "",
      birthDate: new Date(2000, 0, 1), // Default to 2000-01-01
      education: "",
      religion: Religion.CATHOLIC,
      maritalStatus: MaritalStatus.SINGLE,
      dependentType: DependentType.CHILD,
      baptismDate: null,
      confirmationDate: null,
      imageUrl: null,
    },
  });

  // Form submission handler
  const handleSubmit = (values: DependentFormValues) => {
    onSubmit(values);
  };

  // Mode edit atau tambah
  const isEditMode = !!defaultValues;

  // Mengamati nilai agama untuk kondisional rendering
  const religion = form.watch("religion");

  return (
    <div className="bg-muted/40 p-4 rounded-lg mb-6">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-base font-medium">
          {isEditMode ? "Edit Data Tanggungan" : "Tambah Data Tanggungan"}
        </h4>
        <Button variant="ghost" size="icon" onClick={onCancel} type="button">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
            {/* Nama */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Lengkap</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nama Lengkap Tanggungan"
                      {...field}
                      disabled={readOnly}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Jenis Kelamin */}
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jenis Kelamin</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={readOnly}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih jenis kelamin" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={Gender.MALE}>{Gender.MALE}</SelectItem>
                      <SelectItem value={Gender.FEMALE}>
                        {Gender.FEMALE}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Tempat Lahir */}
            <FormField
              control={form.control}
              name="birthPlace"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tempat Lahir</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Tempat lahir"
                      {...field}
                      disabled={readOnly}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Tanggal Lahir */}
            <FormField
              control={form.control}
              name="birthDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Tanggal Lahir</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                          disabled={readOnly}
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
                        selected={field.value as Date | undefined}
                        onSelect={field.onChange}
                        initialFocus
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Jenis Tanggungan */}
            <FormField
              control={form.control}
              name="dependentType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jenis Tanggungan</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={readOnly}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih jenis tanggungan" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={DependentType.CHILD}>
                        {DependentType.CHILD}
                      </SelectItem>
                      <SelectItem value={DependentType.RELATIVE}>
                        {DependentType.RELATIVE}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Status Pernikahan */}
            <FormField
              control={form.control}
              name="maritalStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status Pernikahan</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={readOnly}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih status pernikahan" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={MaritalStatus.SINGLE}>
                        Belum Menikah
                      </SelectItem>
                      <SelectItem value={MaritalStatus.MARRIED}>
                        Menikah
                      </SelectItem>
                      <SelectItem value={MaritalStatus.DIVORCED}>
                        Cerai Hidup
                      </SelectItem>
                      <SelectItem value={MaritalStatus.WIDOWED}>
                        Cerai Mati
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Agama */}
            <FormField
              control={form.control}
              name="religion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Agama</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={readOnly}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih agama" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={Religion.CATHOLIC}>Katolik</SelectItem>
                      <SelectItem value={Religion.PROTESTANT}>
                        Protestan
                      </SelectItem>
                      <SelectItem value={Religion.ISLAM}>Islam</SelectItem>
                      <SelectItem value={Religion.HINDU}>Hindu</SelectItem>
                      <SelectItem value={Religion.BUDDHA}>Buddha</SelectItem>
                      <SelectItem value={Religion.KONGHUCU}>
                        Konghucu
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Pendidikan Terakhir */}
            <FormField
              control={form.control}
              name="education"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pendidikan</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={readOnly}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih pendidikan terakhir" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Belum Sekolah">
                        Belum Sekolah
                      </SelectItem>
                      <SelectItem value="SD">SD</SelectItem>
                      <SelectItem value="SMP">SMP</SelectItem>
                      <SelectItem value="SMA/SMK">SMA/SMK</SelectItem>
                      <SelectItem value="D1">D1</SelectItem>
                      <SelectItem value="D2">D2</SelectItem>
                      <SelectItem value="D3">D3</SelectItem>
                      <SelectItem value="D4/S1">D4/S1</SelectItem>
                      <SelectItem value="S2">S2</SelectItem>
                      <SelectItem value="S3">S3</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Tanggal Baptis - hanya untuk Katolik/Protestan */}
          {(religion === Religion.CATHOLIC ||
            religion === Religion.PROTESTANT) && (
            <FormField
              control={form.control}
              name="baptismDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Tanggal Baptis</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                          disabled={readOnly}
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
                        selected={field.value as Date | undefined}
                        onSelect={field.onChange}
                        initialFocus
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Tanggal Krisma - hanya untuk Katolik */}
          {religion === Religion.CATHOLIC && (
            <FormField
              control={form.control}
              name="confirmationDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Tanggal Krisma</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                          disabled={readOnly}
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
                        selected={field.value as Date | undefined}
                        onSelect={field.onChange}
                        initialFocus
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Form actions */}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
              className="w-full sm:w-auto"
              size="sm"
            >
              <span className="text-xs sm:text-sm">Batal</span>
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto"
              size="sm"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  <span className="text-xs sm:text-sm">Menyimpan...</span>
                </>
              ) : (
                <>
                  <Save className="mr-1.5 h-3.5 w-3.5" />
                  <span className="text-xs sm:text-sm">Simpan</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
