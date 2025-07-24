/**
 * Fungsi utilitas untuk profil
 */

// Helper untuk mendapatkan inisial nama
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// Simulasi upload gambar (contoh interface)
export interface UploadResponse {
  success: boolean
  fileUrl?: string
  error?: string
}

// Formatter nomor telepon
export function formatPhoneNumber(phoneNumber: string): string {
  if (!phoneNumber) return '';
  
  // Format 08xxxxxxxx to readable format
  if (phoneNumber.length > 8) {
    return phoneNumber.slice(0, 4) + '-' + phoneNumber.slice(4);
  }
  
  return phoneNumber;
} 