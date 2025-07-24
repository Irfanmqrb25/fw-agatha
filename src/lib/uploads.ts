"use server"

//fungsi upload file ke folder uploads/assets/jenis-file
// akan mengembalikan nama file ( hasil generate supaya unik )

// fungsi update file ke folder uploads/assets/jenis-file
// file lama akan dihapus

// fungsi delete file dari folder uploads/assets/jenis-file
// hapus berdasarkan nama file

import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const UPLOADS_BASE_DIR = path.join(process.cwd(), 'src', 'uploads');

// Daftar ekstensi file yang diizinkan
const ALLOWED_EXTENSIONS = [
  'jpg', 'jpeg', 'png', 'gif', 'webp', // Image
  'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', // Documents
  'txt', 'csv' // Text files
];

// Membuat folder jika belum ada
const ensureDirectoryExists = (dirPath: string) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Sanitasi nama file untuk keamanan
export const sanitizeFileName = async (fileName: string): Promise<string> => {
  return fileName
    .replace(/[^a-zA-Z0-9-_.]/g, '_') // Ganti karakter tidak aman
    .replace(/_{2,}/g, '_'); // Menghindari multiple underscore
};

/**
 * Upload file ke folder uploads/assets/{folderType}
 * @param file File yang akan diupload (Buffer atau file dari FormData)
 * @param originalFilename Nama file asli
 * @param folderType Subolder tempat menyimpan file ('agenda', 'profile', etc.)
 * @returns Informasi file yang diupload {fileName, filePath, fileUrl}
 */
export const uploadFile = async (
  file: Buffer,
  originalFilename: string,
  folderType: string = 'general'
): Promise<{ fileName: string; filePath: string; fileUrl: string }> => {
  // Validasi nama folder
  const safeFolder = await sanitizeFileName(folderType);
  const uploadDir = path.join(UPLOADS_BASE_DIR, 'assets', safeFolder);
  
  // Buat direktori jika belum ada
  ensureDirectoryExists(uploadDir);
  
  // Ambil ekstensi file
  const extension = path.extname(originalFilename).toLowerCase().substring(1);
  
  // Validasi ekstensi file
  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    throw new Error(`File type not allowed. Allowed types: ${ALLOWED_EXTENSIONS.join(', ')}`);
  }
  
  // Generate nama file unik dengan UUID
  const uniqueFileName = `${uuidv4()}.${extension}`;
  const filePath = path.join(uploadDir, uniqueFileName);
  
  // Tulis file
  fs.writeFileSync(filePath, file);
  
  // URL yang dapat diakses dari browser
  const fileUrl = `/api/uploads/assets/${safeFolder}/${uniqueFileName}`;
  
  return {
    fileName: uniqueFileName,
    filePath,
    fileUrl
  };
};

/**
 * Update file yang sudah ada dengan file baru
 * @param file File baru yang akan menggantikan file lama
 * @param originalFilename Nama file asli
 * @param folderType Subfolder tujuan
 * @param oldFileName Nama file lama yang akan diganti (tanpa path)
 * @returns Informasi file yang diupload {fileName, filePath, fileUrl}
 */
export const updateFile = async (
  file: Buffer,
  originalFilename: string,
  folderType: string = 'general',
  oldFileName: string | null = null
): Promise<{ fileName: string; filePath: string; fileUrl: string }> => {
  // Upload file baru terlebih dahulu
  const newFileInfo = await uploadFile(file, originalFilename, folderType);
  
  // Jika ada file lama, hapus filenya
  if (oldFileName) {
    try {
      await deleteFile(oldFileName, folderType);
    } catch (error) {
      console.error('Error deleting old file:', error);
      // Tetap lanjutkan proses meskipun file lama gagal dihapus
    }
  }
  
  return newFileInfo;
};

/**
 * Hapus file berdasarkan nama file
 * @param fileName Nama file yang akan dihapus (tanpa path)
 * @param folderType Subfolder tempat file berada
 * @returns Promise<boolean> true jika berhasil dihapus
 */
export const deleteFile = async (
  fileName: string,
  folderType: string = 'general'
): Promise<boolean> => {
  // Sanitasi input untuk keamanan
  const safeFolder = await sanitizeFileName(folderType);
  const safeFileName = await sanitizeFileName(fileName);
  
  // Tentukan path lengkap file
  const filePath = path.join(UPLOADS_BASE_DIR, 'assets', safeFolder, safeFileName);
  
  // Verifikasi bahwa file benar-benar berada di folder yang diharapkan (mencegah path traversal)
  const normalizedPath = path.normalize(filePath);
  const expectedBasePath = path.join(UPLOADS_BASE_DIR, 'assets', safeFolder);
  
  if (!normalizedPath.startsWith(expectedBasePath)) {
    throw new Error('Invalid file path detected');
  }
  
  // Verifikasi file ada
  if (!fs.existsSync(filePath)) {
    throw new Error('File not found');
  }
  
  // Hapus file
  fs.unlinkSync(filePath);
  return true;
};

/**
 * Mendapatkan path lengkap file berdasarkan nama file
 * @param fileName Nama file
 * @param folderType Subfolder tempat file berada
 * @returns Object {filePath, fileUrl}
 */
export const getFilePath = async (
  fileName: string,
  folderType: string = 'general'
): Promise<{ filePath: string; fileUrl: string }> => {
  // Sanitasi input untuk keamanan
  const safeFolder = await sanitizeFileName(folderType);
  const safeFileName = await sanitizeFileName(fileName);
  
  const filePath = path.join(UPLOADS_BASE_DIR, 'assets', safeFolder, safeFileName);
  const fileUrl = `/api/uploads/assets/${safeFolder}/${safeFileName}`;
  
  return { filePath, fileUrl };
};
