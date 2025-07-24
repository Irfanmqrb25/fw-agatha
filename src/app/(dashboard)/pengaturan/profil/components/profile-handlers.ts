import { toast } from "sonner";
import {
  updateFamilyHead,
  updateSpouse,
  addDependent,
  updateDependent,
  deleteDependent,
} from "../actions/profile-actions";

import type {
  FamilyHeadFormValues,
  SpouseFormValues,
  DependentFormValues,
  Dependent,
} from "../types";

import { convertDependentFormToDbData } from "../utils/type-adapter";

// Handler untuk menyimpan data Kepala Keluarga
export async function handleFamilyHeadSubmit(
  userId: string,
  values: FamilyHeadFormValues,
  setIsSaving: (value: boolean) => void,
  refreshProfileData: () => Promise<boolean>
) {
  try {
    setIsSaving(true);

    // Konversi nilai form ke format untuk database
    const { convertFamilyHeadFormToDbData } = await import(
      "../utils/type-adapter"
    );
    const familyHeadData = convertFamilyHeadFormToDbData(values);

    // Panggil API untuk memperbarui data kepala keluarga
    const response = await updateFamilyHead(userId, familyHeadData);

    if (!response.success) {
      throw new Error(response.error || "Gagal menyimpan data");
    }

    // Perbarui data profil setelah berhasil memperbarui
    await refreshProfileData();

    toast.success("Data Kepala Keluarga berhasil disimpan");
    return true;
  } catch (error) {
    toast.error("Gagal menyimpan data");
    console.error(error);
    return false;
  } finally {
    setIsSaving(false);
  }
}

// Handler untuk menyimpan data Pasangan
export async function handleSpouseSubmit(
  userId: string,
  values: SpouseFormValues,
  setIsSaving: (value: boolean) => void,
  refreshProfileData: () => Promise<boolean>
) {
  try {
    setIsSaving(true);

    // Konversi nilai form ke format untuk database
    const { convertSpouseFormToDbData } = await import("../utils/type-adapter");
    const spouseData = convertSpouseFormToDbData(values);

    // Panggil API untuk memperbarui data pasangan
    const response = await updateSpouse(userId, spouseData);

    if (!response.success) {
      throw new Error(response.error || "Gagal menyimpan data");
    }

    // Perbarui data profil setelah berhasil memperbarui
    await refreshProfileData();

    toast.success("Data Pasangan berhasil disimpan");
    return true;
  } catch (error) {
    toast.error("Gagal menyimpan data");
    console.error(error);
    return false;
  } finally {
    setIsSaving(false);
  }
}

// Handler untuk menambah tanggungan
export async function handleAddDependent(
  userId: string,
  values: DependentFormValues,
  setIsSaving: (value: boolean) => void,
  refreshProfileData: () => Promise<boolean>
) {
  try {
    setIsSaving(true);

    // Konversi nilai form ke format untuk database
    const { convertDependentFormToDbData } = await import(
      "../utils/type-adapter"
    );
    const dependentData = convertDependentFormToDbData(values);

    // Panggil API untuk menambah tanggungan
    const response = await addDependent(userId, dependentData);

    if (!response.success) {
      throw new Error(response.error || "Gagal menambah data tanggungan");
    }

    // Perbarui data profil setelah berhasil menambah tanggungan
    await refreshProfileData();

    toast.success("Data Tanggungan berhasil ditambahkan");
    return true;
  } catch (error) {
    toast.error("Gagal menambah data tanggungan");
    console.error(error);
    return false;
  } finally {
    setIsSaving(false);
  }
}

// Handler untuk mengupdate tanggungan
export async function handleUpdateDependent(
  userId: string,
  dependentId: string,
  values: DependentFormValues,
  setIsSaving: (value: boolean) => void,
  refreshProfileData: () => Promise<boolean>
) {
  try {
    setIsSaving(true);

    // Konversi nilai form ke format untuk database
    const dependentData = convertDependentFormToDbData(values);

    // Panggil API untuk mengupdate tanggungan
    const response = await updateDependent(
      dependentId.toString(),
      dependentData
    );

    if (!response.success) {
      toast.error(response.error || "Gagal memperbarui data tanggungan");
    }

    // Perbarui data profil setelah berhasil memperbarui
    await refreshProfileData();

    toast.success("Data Tanggungan berhasil diperbarui");
    return true;
  } catch (error) {
    toast.error("Gagal memperbarui data tanggungan");
    console.error(error);
    return false;
  } finally {
    setIsSaving(false);
  }
}

// Handler untuk menghapus tanggungan
export async function handleDeleteDependent(
  userId: string,
  dependent: Dependent,
  setIsSaving: (value: boolean) => void,
  refreshProfileData: () => Promise<boolean>
) {
  try {
    setIsSaving(true);

    // Panggil API untuk menghapus tanggungan
    const response = await deleteDependent(dependent.id.toString(), userId);

    if (!response.success) {
      throw new Error(response.error || "Gagal menghapus data tanggungan");
    }

    // Perbarui data profil setelah berhasil menghapus
    await refreshProfileData();

    toast.success("Data Tanggungan berhasil dihapus");
    return true;
  } catch (error) {
    toast.error("Gagal menghapus data tanggungan");
    console.error(error);
    return false;
  } finally {
    setIsSaving(false);
  }
}
