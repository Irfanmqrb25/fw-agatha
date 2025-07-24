"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { CalendarIcon, Save, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { Textarea } from "@/components/ui/textarea"

import { 
  SpouseFormValues, 
  spouseFormSchema, 
  Gender, 
  Spouse,
  LivingStatus,
  Religion
} from "../types"
import { formatDateForInput } from "../utils"

interface SpouseFormProps {
  defaultValues?: Partial<SpouseFormValues>
  onSubmit: (values: SpouseFormValues) => void
  isSubmitting?: boolean
  readOnly?: boolean
}

export function SpouseForm({ 
  defaultValues, 
  onSubmit, 
  isSubmitting = false,
  readOnly = false
}: SpouseFormProps) {
  // Initialize form with default values or data from prop
  const form = useForm<SpouseFormValues>({
    resolver: zodResolver(spouseFormSchema),
    defaultValues: {
      fullName: "",
      gender: Gender.FEMALE,
      birthPlace: "",
      birthDate: new Date("1990-01-01"),
      nik: "",
      address: "",
      city: "",
      phoneNumber: "",
      email: "",
      occupation: "",
      education: "",
      religion: Religion.CATHOLIC,
      livingStatus: LivingStatus.ALIVE,
      baptismDate: null,
      confirmationDate: null,
      deathDate: null,
      ...defaultValues,
    }
  })

  // Ambil status hidup/meninggal untuk kondisional rendering
  const livingStatus = form.watch("livingStatus")
  // Ambil agama untuk kondisional rendering
  const religion = form.watch("religion")

  // Form submission handler
  const handleSubmit = (values: SpouseFormValues) => {
    onSubmit(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
          {/* Nama Lengkap */}
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama Lengkap</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Nama Lengkap"
                    {...field}
                    disabled={isSubmitting || readOnly}
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
                  disabled={isSubmitting || readOnly}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih jenis kelamin" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={Gender.MALE}>Laki-laki</SelectItem>
                    <SelectItem value={Gender.FEMALE}>Perempuan</SelectItem>
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
                    placeholder="Tempat Lahir"
                    {...field}
                    disabled={isSubmitting || readOnly}
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
                        className={`pl-3 text-left font-normal ${
                          !field.value ? "text-muted-foreground" : ""
                        }`}
                        disabled={isSubmitting || readOnly}
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
                      disabled={isSubmitting || readOnly}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* NIK */}
          <FormField
            control={form.control}
            name="nik"
            render={({ field }) => (
              <FormItem>
                <FormLabel>NIK</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Nomor Induk Kependudukan (16 digit)"
                    {...field}
                    disabled={isSubmitting || readOnly}
                    maxLength={16}
                  />
                </FormControl>
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
                  disabled={isSubmitting || readOnly}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih agama" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={Religion.CATHOLIC}>Katolik</SelectItem>
                    <SelectItem value={Religion.PROTESTANT}>Protestan</SelectItem>
                    <SelectItem value={Religion.ISLAM}>Islam</SelectItem>
                    <SelectItem value={Religion.HINDU}>Hindu</SelectItem>
                    <SelectItem value={Religion.BUDDHA}>Buddha</SelectItem>
                    <SelectItem value={Religion.KONGHUCU}>Konghucu</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* No Telepon */}
          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nomor Telepon / WA</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Contoh: 081234567890"
                    {...field}
                    disabled={isSubmitting || readOnly}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email (opsional)</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="contoh@email.com"
                    {...field}
                    disabled={isSubmitting || readOnly}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Pekerjaan */}
          <FormField
            control={form.control}
            name="occupation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pekerjaan</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Pekerjaan"
                    {...field}
                    disabled={isSubmitting || readOnly}
                  />
                </FormControl>
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
                <FormLabel>Pendidikan Terakhir</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isSubmitting || readOnly}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih pendidikan terakhir" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
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

          {/* Kota Domisili */}
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kota Domisili</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Kota Domisili"
                    {...field}
                    disabled={isSubmitting || readOnly}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Status Hidup/Meninggal */}
          <FormField
            control={form.control}
            name="livingStatus"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isSubmitting || readOnly}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={LivingStatus.ALIVE}>Hidup</SelectItem>
                    <SelectItem value={LivingStatus.DECEASED}>Meninggal</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* No. Biduk - hanya untuk Katolik */}
          {religion === Religion.CATHOLIC && (
            <FormField
              control={form.control}
              name="bidukNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nomor Biduk (opsional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nomor Biduk"
                      {...field}
                      value={field.value || ""}
                      disabled={isSubmitting || readOnly}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Tanggal Baptis - hanya untuk Katolik/Protestan */}
          {(religion === Religion.CATHOLIC || religion === Religion.PROTESTANT) && (
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
                          className={`pl-3 text-left font-normal ${
                            !field.value ? "text-muted-foreground" : ""
                          }`}
                          disabled={isSubmitting || readOnly}
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
                        disabled={isSubmitting || readOnly}
                        initialFocus
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
                          className={`pl-3 text-left font-normal ${
                            !field.value ? "text-muted-foreground" : ""
                          }`}
                          disabled={isSubmitting || readOnly}
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
                        disabled={isSubmitting || readOnly}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Tanggal Meninggal - hanya tampil jika status meninggal */}
          {livingStatus === LivingStatus.DECEASED && (
            <FormField
              control={form.control}
              name="deathDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Tanggal Meninggal</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={`pl-3 text-left font-normal ${
                            !field.value ? "text-muted-foreground" : ""
                          }`}
                          disabled={isSubmitting || readOnly}
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
                        disabled={isSubmitting || readOnly}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        {/* Alamat */}
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Alamat</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Alamat lengkap"
                  className="resize-none"
                  {...field}
                  disabled={isSubmitting || readOnly}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Form actions */}
        <div className="flex justify-end pt-2">
          <Button 
            type="submit" 
            disabled={isSubmitting || readOnly} 
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
  )
} 