import {
  Gender,
  Religion,
  LivingStatus,
  MaritalStatus,
  DependentType,
  FamilyHeadFormValues,
  SpouseFormValues,
  DependentFormValues,
} from "../types";
import {
  Agama,
  StatusKehidupan,
  StatusPernikahan,
  JenisTanggungan,
} from "@prisma/client";

/**
 * Fungsi-fungsi konversi tipe data dari Prisma ke UI
 */

// Konversi Agama (database) ke Religion (UI)
export function mapAgamaToReligion(agama: Agama): Religion {
  const mapping: Record<Agama, Religion> = {
    KATOLIK: Religion.CATHOLIC,
    ISLAM: Religion.ISLAM,
    KRISTEN: Religion.PROTESTANT,
    HINDU: Religion.HINDU,
    BUDHA: Religion.BUDDHA,
  };
  return mapping[agama] || Religion.CATHOLIC;
}

// Konversi jenis kelamin (database) ke Gender (UI)
export function mapDbGenderToUiGender(dbGender: string): Gender {
  const mapping: Record<string, Gender> = {
    "LAKI-LAKI": Gender.MALE,
    PEREMPUAN: Gender.FEMALE,
  };
  return mapping[dbGender];
}

// Konversi Religion (UI) ke Agama (database)
export function mapReligionToAgama(religion: Religion): Agama {
  const mapping: Record<Religion, Agama> = {
    [Religion.CATHOLIC]: Agama.KATOLIK,
    [Religion.ISLAM]: Agama.ISLAM,
    [Religion.PROTESTANT]: Agama.KRISTEN,
    [Religion.HINDU]: Agama.HINDU,
    [Religion.BUDDHA]: Agama.BUDHA,
    [Religion.KONGHUCU]: Agama.BUDHA, // Konversi ke default karena tidak ada di database
  };
  return mapping[religion] || Agama.KATOLIK;
}

// Konversi StatusKehidupan (database) ke LivingStatus (UI)
export function mapStatusToLivingStatus(status: StatusKehidupan): LivingStatus {
  const mapping: Record<StatusKehidupan, LivingStatus> = {
    HIDUP: LivingStatus.ALIVE,
    PINDAH: LivingStatus.ALIVE, // Status pindah dianggap masih hidup dalam UI profil
    MENINGGAL: LivingStatus.DECEASED,
  };
  return mapping[status] || LivingStatus.ALIVE;
}

// Konversi LivingStatus (UI) ke StatusKehidupan (database)
export function mapLivingStatusToStatus(
  livingStatus: LivingStatus
): StatusKehidupan {
  const mapping: Record<LivingStatus, StatusKehidupan> = {
    [LivingStatus.ALIVE]: StatusKehidupan.HIDUP,
    [LivingStatus.DECEASED]: StatusKehidupan.MENINGGAL,
  };
  return mapping[livingStatus] || StatusKehidupan.HIDUP;
}

// Konversi StatusPernikahan (database) ke MaritalStatus (UI)
export function mapStatusPernikahanToMaritalStatus(
  statusPernikahan: StatusPernikahan
): MaritalStatus {
  const mapping: Record<StatusPernikahan, MaritalStatus> = {
    [StatusPernikahan.MENIKAH]: MaritalStatus.MARRIED,
    [StatusPernikahan.TIDAK_MENIKAH]: MaritalStatus.SINGLE,
    [StatusPernikahan.CERAI_HIDUP]: MaritalStatus.DIVORCED,
    [StatusPernikahan.CERAI_MATI]: MaritalStatus.WIDOWED,
  };
  return mapping[statusPernikahan] || MaritalStatus.SINGLE;
}

// Konversi MaritalStatus (UI) ke StatusPernikahan (database)
export function mapMaritalStatusToStatusPernikahan(
  maritalStatus: MaritalStatus
): StatusPernikahan {
  const mapping: Record<MaritalStatus, StatusPernikahan> = {
    [MaritalStatus.MARRIED]: StatusPernikahan.MENIKAH,
    [MaritalStatus.SINGLE]: StatusPernikahan.TIDAK_MENIKAH,
    [MaritalStatus.DIVORCED]: StatusPernikahan.CERAI_HIDUP,
    [MaritalStatus.WIDOWED]: StatusPernikahan.CERAI_MATI,
  };
  return mapping[maritalStatus] || StatusPernikahan.TIDAK_MENIKAH;
}

// Konversi JenisTanggungan (database) ke DependentType (UI)
export function mapJenisTanggunganToDependentType(
  jenis: JenisTanggungan
): DependentType {
  const mapping: Record<JenisTanggungan, DependentType> = {
    ANAK: DependentType.CHILD,
    KERABAT: DependentType.RELATIVE,
  };
  return mapping[jenis] || DependentType.CHILD;
}

// Konversi DependentType (UI) ke JenisTanggungan (database)
export function mapDependentTypeToJenisTanggungan(
  type: DependentType
): JenisTanggungan {
  const mapping: Record<DependentType, JenisTanggungan> = {
    [DependentType.CHILD]: JenisTanggungan.ANAK,
    [DependentType.RELATIVE]: JenisTanggungan.KERABAT,
  };
  return mapping[type] || JenisTanggungan.ANAK;
}

/**
 * Konversi data formulir untuk dikirim ke server action
 */

// Konversi data formulir Kepala Keluarga ke format database
export function convertFamilyHeadFormToDbData(formData: FamilyHeadFormValues) {
  return {
    fullName: formData.fullName,
    birthPlace: formData.birthPlace || "",
    birthDate: formData.birthDate,
    address: formData.address,
    city: formData.city || "",
    phoneNumber: formData.phoneNumber || "",
    education: formData.education || "",
    maritalStatus: mapMaritalStatusToStatusPernikahan(formData.maritalStatus),
    livingStatus: mapLivingStatusToStatus(formData.livingStatus),
    baptismDate: formData.baptismDate,
    confirmationDate: formData.confirmationDate,
    deathDate: formData.deathDate,
    email: formData.email || "",
    nik: formData.nik || "",
    occupation: formData.occupation || "",
    religion: mapReligionToAgama(formData.religion),
    bidukNumber: formData.bidukNumber || "",
    gender: formData.gender,
  };
}

// Konversi data formulir Pasangan ke format database
export function convertSpouseFormToDbData(formData: SpouseFormValues) {
  return {
    fullName: formData.fullName,
    birthPlace: formData.birthPlace,
    birthDate: formData.birthDate,
    phoneNumber: formData.phoneNumber || "",
    education: formData.education,
    religion: mapReligionToAgama(formData.religion),
    bidukNumber: formData.bidukNumber,
    livingStatus: mapLivingStatusToStatus(formData.livingStatus),
    baptismDate: formData.baptismDate,
    confirmationDate: formData.confirmationDate,
    deathDate: formData.deathDate,
    nik: formData.nik || "",
    occupation: formData.occupation || "",
    gender: formData.gender,
    address: formData.address || "",
    city: formData.city || "",
    email: formData.email || "",
  };
}

// Konversi data formulir Tanggungan ke format database
export function convertDependentFormToDbData(formData: DependentFormValues) {
  const formattedData = {
    name: formData.name,
    dependentType: mapDependentTypeToJenisTanggungan(formData.dependentType),
    birthPlace: formData.birthPlace,
    birthDate: formData.birthDate,
    education: formData.education,
    religion: mapReligionToAgama(formData.religion),
    maritalStatus: mapMaritalStatusToStatusPernikahan(formData.maritalStatus),
    baptismDate: formData.baptismDate,
    confirmationDate: formData.confirmationDate,
    gender: formData.gender,
  };

  return formattedData;
}
