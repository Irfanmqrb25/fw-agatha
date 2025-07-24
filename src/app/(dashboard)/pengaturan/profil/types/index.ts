import { z } from "zod";

// Gender enum
export enum Gender {
  MALE = "Laki-laki",
  FEMALE = "Perempuan",
}

// Marital status enum
export enum MaritalStatus {
  SINGLE = "Belum Menikah",
  MARRIED = "Menikah",
  DIVORCED = "Cerai Hidup",
  WIDOWED = "Cerai Mati",
}

// Status hidup enum
export enum LivingStatus {
  ALIVE = "Hidup",
  DECEASED = "Meninggal",
}

// Agama enum
export enum Religion {
  CATHOLIC = "Katolik",
  PROTESTANT = "Protestan",
  ISLAM = "Islam",
  HINDU = "Hindu",
  BUDDHA = "Buddha",
  KONGHUCU = "Konghucu",
}

// Jenis tanggungan enum
export enum DependentType {
  CHILD = "Anak",
  RELATIVE = "Kerabat Lain",
}

// Profile interfaces
export interface FamilyHead {
  id: number;
  fullName: string;
  gender: Gender;
  birthPlace: string;
  birthDate: Date;
  nik: string;
  maritalStatus: MaritalStatus;
  address: string;
  city: string; // Kota domisili
  phoneNumber: string;
  email: string;
  occupation: string;
  education: string; // Pendidikan terakhir
  religion: Religion; // Agama
  livingStatus: LivingStatus; // Status hidup/meninggal
  bidukNumber?: string | null; // No. Biduk jika Katolik
  baptismDate?: Date | null; // Tanggal baptis
  confirmationDate?: Date | null; // Tanggal krisma
  deathDate?: Date | null; // Tanggal meninggal jika status meninggal
  imageUrl?: string | null;
}

export interface Spouse {
  id: number;
  fullName: string;
  gender: Gender;
  birthPlace: string;
  birthDate: Date;
  nik: string;
  address: string;
  city: string; // Kota domisili
  phoneNumber: string;
  email: string;
  occupation: string;
  education: string; // Pendidikan terakhir
  religion: Religion; // Agama pasangan
  livingStatus: LivingStatus; // Status hidup/meninggal
  bidukNumber?: string | null; // No. Biduk jika Katolik
  baptismDate?: Date | null; // Tanggal baptis jika Katolik
  confirmationDate?: Date | null; // Tanggal krisma jika Katolik
  deathDate?: Date | null; // Tanggal meninggal jika status meninggal
  imageUrl?: string | null;
}

export interface Dependent {
  id: string | number; // ID bisa string atau number tergantung implementasi
  name: string;
  dependentType: DependentType; // Jenis tanggungan (anak/kerabat lain)
  gender: Gender;
  birthPlace: string;
  birthDate: Date;
  education: string; // Pendidikan terakhir
  religion: Religion; // Agama
  maritalStatus: MaritalStatus; // Status pernikahan
  baptismDate?: Date | null; // Tanggal baptis jika Katolik
  confirmationDate?: Date | null; // Tanggal krisma jika Katolik
  imageUrl?: string | null;
}

export interface ProfileData {
  familyHead: FamilyHead;
  spouse: Spouse | null;
  dependents: Dependent[];
}

// Validation schemas
export const familyHeadFormSchema = z
  .object({
    fullName: z.string().min(3, { message: "Nama lengkap minimal 3 karakter" }),
    gender: z.nativeEnum(Gender, {
      required_error: "Jenis kelamin wajib dipilih",
    }),
    birthPlace: z
      .string()
      .min(3, { message: "Tempat lahir minimal 3 karakter" })
      .optional()
      .or(z.literal("")),
    birthDate: z
      .date({
        required_error: "Tanggal lahir wajib diisi",
      })
      .optional()
      .nullable(),
    nik: z
      .string()
      .regex(/^\d{16}$/, { message: "NIK harus 16 digit angka" })
      .optional()
      .or(z.literal("")),
    maritalStatus: z.nativeEnum(MaritalStatus, {
      required_error: "Status pernikahan wajib dipilih",
    }),
    address: z.string().min(5, { message: "Alamat minimal 5 karakter" }),
    city: z
      .string()
      .min(3, { message: "Kota domisili minimal 3 karakter" })
      .optional()
      .or(z.literal("")),
    phoneNumber: z
      .string()
      .regex(/^08\d{8,11}$/, {
        message: "Nomor telepon harus dimulai dengan 08 dan minimal 10 digit",
      })
      .optional()
      .or(z.literal("")),
    email: z
      .string()
      .email({ message: "Format email tidak valid" })
      .optional()
      .or(z.literal("")),
    occupation: z
      .string()
      .min(3, { message: "Pekerjaan minimal 3 karakter" })
      .optional()
      .or(z.literal("")),
    education: z
      .string()
      .min(2, { message: "Pendidikan terakhir wajib diisi" })
      .optional()
      .or(z.literal("")),
    religion: z.nativeEnum(Religion, {
      required_error: "Agama wajib dipilih",
    }),
    livingStatus: z.nativeEnum(LivingStatus, {
      required_error: "Status hidup/meninggal wajib dipilih",
    }),
    bidukNumber: z.string().optional().nullable(),
    baptismDate: z.date().optional().nullable(),
    confirmationDate: z.date().optional().nullable(),
    deathDate: z.date().optional().nullable(),
    imageUrl: z.string().optional().nullable(),
  })
  .refine(
    (data) => {
      // Validasi: Jika status meninggal, tanggal meninggal harus diisi
      if (data.livingStatus === LivingStatus.DECEASED && !data.deathDate) {
        return false;
      }
      return true;
    },
    {
      message: "Tanggal meninggal harus diisi jika status meninggal",
      path: ["deathDate"],
    }
  )
  .refine(
    (data) => {
      // Validasi: Jika agama Katolik, data baptis dan krisma sebaiknya diisi
      if (data.religion === Religion.CATHOLIC) {
        // Tanggal baptis dan krisma opsional tapi disarankan
        return true;
      }
      return true;
    },
    {
      message: "Sebaiknya mengisi data baptis dan krisma untuk agama Katolik",
      path: ["baptismDate"],
    }
  );

export const spouseFormSchema = z
  .object({
    fullName: z.string().min(3, { message: "Nama lengkap minimal 3 karakter" }),
    gender: z.nativeEnum(Gender, {
      required_error: "Jenis kelamin wajib dipilih",
    }),
    birthPlace: z
      .string()
      .min(3, { message: "Tempat lahir minimal 3 karakter" }),
    birthDate: z.date({
      required_error: "Tanggal lahir wajib diisi",
    }),
    nik: z.string().regex(/^\d{16}$/, { message: "NIK harus 16 digit angka" }),
    address: z.string().min(5, { message: "Alamat minimal 5 karakter" }),
    city: z.string().min(3, { message: "Kota domisili minimal 3 karakter" }),
    phoneNumber: z.string().regex(/^08\d{8,11}$/, {
      message: "Nomor telepon harus dimulai dengan 08 dan minimal 10 digit",
    }),
    email: z
      .string()
      .email({ message: "Format email tidak valid" })
      .optional()
      .or(z.literal("")),
    occupation: z.string().min(3, { message: "Pekerjaan minimal 3 karakter" }),
    education: z
      .string()
      .min(2, { message: "Pendidikan terakhir wajib diisi" }),
    religion: z.nativeEnum(Religion, {
      required_error: "Agama wajib dipilih",
    }),
    livingStatus: z.nativeEnum(LivingStatus, {
      required_error: "Status hidup/meninggal wajib dipilih",
    }),
    bidukNumber: z.string().optional().nullable(),
    baptismDate: z.date().optional().nullable(),
    confirmationDate: z.date().optional().nullable(),
    deathDate: z.date().optional().nullable(),
    imageUrl: z.string().optional().nullable(),
  })
  .refine(
    (data) => {
      // Validasi: Jika status meninggal, tanggal meninggal harus diisi
      if (data.livingStatus === LivingStatus.DECEASED && !data.deathDate) {
        return false;
      }
      return true;
    },
    {
      message: "Tanggal meninggal harus diisi jika status meninggal",
      path: ["deathDate"],
    }
  )
  .refine(
    (data) => {
      // Validasi: Jika agama Katolik, data baptis dan krisma sebaiknya diisi
      if (data.religion === Religion.CATHOLIC) {
        // Tanggal baptis dan krisma opsional tapi disarankan
        return true;
      }
      return true;
    },
    {
      message: "Sebaiknya mengisi data baptis dan krisma untuk agama Katolik",
      path: ["baptismDate"],
    }
  );

export const dependentFormSchema = z
  .object({
    name: z.string().min(3, { message: "Nama lengkap minimal 3 karakter" }),
    dependentType: z.nativeEnum(DependentType, {
      required_error: "Jenis tanggungan wajib dipilih",
    }),
    gender: z.nativeEnum(Gender, {
      required_error: "Jenis kelamin wajib dipilih",
    }),
    birthPlace: z
      .string()
      .min(3, { message: "Tempat lahir minimal 3 karakter" }),
    birthDate: z.date({
      required_error: "Tanggal lahir wajib diisi",
    }),
    education: z
      .string()
      .min(2, { message: "Pendidikan terakhir wajib diisi" }),
    religion: z.nativeEnum(Religion, {
      required_error: "Agama wajib dipilih",
    }),
    maritalStatus: z.nativeEnum(MaritalStatus, {
      required_error: "Status pernikahan wajib dipilih",
    }),
    baptismDate: z.date().optional().nullable(),
    confirmationDate: z.date().optional().nullable(),
    imageUrl: z.string().optional().nullable(),
  })
  .refine(
    (data) => {
      // Validasi: Jika agama Katolik, data baptis dan krisma sebaiknya diisi
      if (data.religion === Religion.CATHOLIC) {
        // Tanggal baptis dan krisma opsional tapi disarankan
        return true;
      }
      return true;
    },
    {
      message: "Sebaiknya mengisi data baptis dan krisma untuk agama Katolik",
      path: ["baptismDate"],
    }
  );

// Types
export type FamilyHeadFormValues = z.infer<typeof familyHeadFormSchema>;
export type SpouseFormValues = z.infer<typeof spouseFormSchema>;
export type DependentFormValues = z.infer<typeof dependentFormSchema>;
