import { format, parse } from "date-fns";
import { 
  ProfileData, 
  Dependent,
} from "../types";

// Format tanggal untuk ditampilkan
export function formatDate(date: Date | null): string {
  if (!date) return "-";
  return format(date, "dd MMMM yyyy");
}

// Format tanggal untuk input date
export function formatDateForInput(date: Date | null): string {
  if (!date) return "";
  return format(date, "yyyy-MM-dd");
}

// Parse string date menjadi object Date
export function parseDate(dateString: string): Date {
  return parse(dateString, "yyyy-MM-dd", new Date());
}

// Convert form values menjadi objek profil data
export function convertFormValuesToProfileData(
  currentProfile: ProfileData,
  familyHeadData: any,
  spouseData: any | null,
  dependentsData: Dependent[]
): ProfileData {
  return {
    familyHead: {
      ...currentProfile.familyHead,
      ...familyHeadData
    },
    spouse: spouseData ? {
      ...(currentProfile.spouse || { id: 0 }),
      ...spouseData
    } : null,
    dependents: dependentsData.map((dependent, index) => ({
      ...(currentProfile.dependents[index] || { id: 0 }),
      ...dependent
    }))
  };
} 