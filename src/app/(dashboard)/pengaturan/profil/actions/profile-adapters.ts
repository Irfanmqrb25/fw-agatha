"use server";

import { KeluargaUmat, Pasangan, Tanggungan } from "@prisma/client";
import { ProfileData, Gender, Religion } from "../types";
import {
  mapAgamaToReligion,
  mapStatusToLivingStatus,
  mapStatusPernikahanToMaritalStatus,
  mapJenisTanggunganToDependentType,
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
      gender: Gender.MALE,
      birthPlace: keluarga.tempatLahir || "",
      birthDate: keluarga.tanggalLahir || new Date(),
      nik: "",
      maritalStatus: mapStatusPernikahanToMaritalStatus(
        keluarga.statusPernikahan
      ),
      address: keluarga.alamat,
      city: keluarga.kotaDomisili || "",
      phoneNumber: keluarga.nomorTelepon || "",
      email: "",
      occupation: "",
      education: keluarga.pendidikanTerakhir || "",
      religion: Religion.CATHOLIC,
      livingStatus: mapStatusToLivingStatus(keluarga.status),
      bidukNumber: "",
      baptismDate: keluarga.tanggalBaptis || null,
      confirmationDate: keluarga.tanggalKrisma || null,
      deathDate: keluarga.tanggalMeninggal || null,
      imageUrl: "",
    },
    spouse: keluarga.pasangan
      ? {
          id: parseInt(keluarga.pasangan.id),
          fullName: keluarga.pasangan.nama,
          gender: Gender.FEMALE,
          birthPlace: keluarga.pasangan.tempatLahir,
          birthDate: keluarga.pasangan.tanggalLahir,
          nik: "",
          address: keluarga.alamat,
          city: keluarga.kotaDomisili || "",
          phoneNumber: keluarga.pasangan.nomorTelepon || "",
          email: "",
          occupation: "",
          education: keluarga.pasangan.pendidikanTerakhir,
          religion: mapAgamaToReligion(keluarga.pasangan.agama),
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
      gender: Gender.MALE,
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
