"use server";

import { KeluargaUmat, Pasangan, Tanggungan } from "@prisma/client";
import { ProfileData, Gender, Religion } from "../types";
import {
  mapAgamaToReligion,
  mapStatusToLivingStatus,
  mapStatusPernikahanToMaritalStatus,
  mapJenisTanggunganToDependentType,
  mapDbGenderToUiGender,
} from "../utils/type-adapter";

/**
 * Adapts data from database to UI data format
 */
export async function adaptProfileData(
  keluarga: KeluargaUmat & {
    pasangan: Pasangan | null;
    tanggungan: Tanggungan[];
  }
): Promise<ProfileData> {
  return {
    familyHead: {
      id: parseInt(keluarga.id),
      fullName: keluarga.namaKepalaKeluarga,
      gender:
        mapDbGenderToUiGender(
          keluarga?.jenisKelamin?.toUpperCase() as string
        ) || Gender.MALE,
      birthPlace: keluarga.tempatLahir || "",
      birthDate: keluarga.tanggalLahir || new Date(),
      nik: keluarga.nik || "",
      maritalStatus: mapStatusPernikahanToMaritalStatus(
        keluarga.statusPernikahan
      ),
      address: keluarga.alamat,
      city: keluarga.kotaDomisili || "",
      phoneNumber: keluarga.nomorTelepon || "",
      email: keluarga.email || "",
      occupation: keluarga.pekerjaan || "",
      education: keluarga.pendidikanTerakhir || "",
      religion: mapAgamaToReligion(keluarga.agama) || Religion.CATHOLIC,
      livingStatus: mapStatusToLivingStatus(keluarga.status),
      bidukNumber: keluarga.noBiduk || "",
      baptismDate: keluarga.tanggalBaptis || null,
      confirmationDate: keluarga.tanggalKrisma || null,
      deathDate: keluarga.tanggalMeninggal || null,
      imageUrl: "",
    },
    spouse: keluarga.pasangan
      ? {
          id: parseInt(keluarga.pasangan.id),
          fullName: keluarga.pasangan.nama,
          gender:
            mapDbGenderToUiGender(
              keluarga.pasangan?.jenisKelamin?.toUpperCase() as string
            ) || Gender.FEMALE,
          birthPlace: keluarga.pasangan.tempatLahir,
          birthDate: keluarga.pasangan.tanggalLahir,
          nik: keluarga.pasangan.nik || "",
          address: keluarga.pasangan.alamat || "",
          city: keluarga.pasangan.kotaDomisili || "",
          phoneNumber: keluarga.pasangan.nomorTelepon || "",
          email: keluarga.pasangan.email || "",
          occupation: keluarga.pasangan.pekerjaan || "",
          education: keluarga.pasangan.pendidikanTerakhir,
          religion:
            mapAgamaToReligion(keluarga.pasangan.agama) || Religion.CATHOLIC,
          livingStatus: mapStatusToLivingStatus(keluarga.pasangan.status),
          bidukNumber: keluarga.pasangan.noBiduk || "",
          baptismDate: keluarga.pasangan.tanggalBaptis || null,
          confirmationDate: keluarga.pasangan.tanggalKrisma || null,
          deathDate: keluarga.pasangan.tanggalMeninggal || null,
          imageUrl: "",
        }
      : null,
    dependents: keluarga.tanggungan.map((dependent) => ({
      id: dependent.id,
      name: dependent.nama,
      dependentType: mapJenisTanggunganToDependentType(
        dependent.jenisTanggungan
      ),
      gender: mapDbGenderToUiGender(
        dependent.jenisKelamin?.toUpperCase() as string
      ),
      birthPlace: dependent.tempatLahir,
      birthDate: dependent.tanggalLahir,
      education: dependent.pendidikanTerakhir,
      religion: mapAgamaToReligion(dependent.agama),
      maritalStatus: mapStatusPernikahanToMaritalStatus(
        dependent.statusPernikahan
      ),
      baptismDate: dependent.tanggalBaptis || null,
      confirmationDate: dependent.tanggalKrisma || null,
      imageUrl: "",
    })),
  };
}
