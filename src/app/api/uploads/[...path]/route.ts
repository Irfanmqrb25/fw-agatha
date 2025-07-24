import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Base directory untuk file uploads
const UPLOADS_BASE_DIR = path.join(process.cwd(), 'src', 'uploads');

// Handler untuk GET request
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
): Promise<NextResponse> {
  try {
    // Verifikasi session (opsional, tergantung apakah file perlu diproteksi)
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Ambil path dari parameter
    const { path: pathSegments } = await params;
    const fullPath = pathSegments.join('/');
    
    // Validasi path untuk mencegah path traversal
    const sanitizedPath = path.normalize(fullPath).replace(/^(\.\.(\/|\\|$))+/, '');
    
    // Gabungkan dengan direktori uploads
    const filePath = path.join(UPLOADS_BASE_DIR, sanitizedPath);
    
    // Verifikasi file exist
    if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }
    
    // Baca file
    const fileBuffer = fs.readFileSync(filePath);
    
    // Tentukan content type berdasarkan ekstensi file
    const ext = path.extname(filePath).toLowerCase();
    let contentType = 'application/octet-stream';
    
    // Map content type berdasarkan ekstensi
    const contentTypeMap: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.xls': 'application/vnd.ms-excel',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.ppt': 'application/vnd.ms-powerpoint',
      '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      '.txt': 'text/plain',
      '.csv': 'text/csv'
    };
    
    if (ext in contentTypeMap) {
      contentType = contentTypeMap[ext];
    }
    
    // Kembalikan file dengan header yang sesuai
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${path.basename(filePath)}"`
      }
    });
    
  } catch (error) {
    console.error('Error serving file:', error);
    return NextResponse.json(
      { error: 'Failed to serve file' },
      { status: 500 }
    );
  }
} 