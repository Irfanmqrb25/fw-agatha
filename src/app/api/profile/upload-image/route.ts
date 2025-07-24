import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { uploadFile } from "@/lib/uploads"

export async function POST(request: NextRequest) {
  try {
    // Verifikasi session user
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Ambil ID user dari session
    const userId = session.user.id

    // Ambil formData dari request
    const formData = await request.formData()
    const file = formData.get('file') as File
    const entityType = formData.get('entityType') as string
    const id = formData.get('id') as string | null

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      )
    }

    // Verifikasi tipe file (harus gambar)
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: "File must be an image" },
        { status: 400 }
      )
    }

    // Validasi entityType
    if (!['familyHead', 'spouse', 'dependent'].includes(entityType)) {
      return NextResponse.json(
        { error: "Invalid entity type" },
        { status: 400 }
      )
    }

    // Baca file sebagai buffer
    const buffer = Buffer.from(await file.arrayBuffer())
    
    // Upload file ke storage dengan subfolder sesuai entityType
    const uploadResult = await uploadFile(
      buffer, 
      file.name, 
      `profile/${entityType}`
    )

    // Sekarang kita bisa memperbarui URL gambar di database jika diperlukan
    // Tetapi untuk saat ini, kita hanya mengembalikan URL gambar yang diupload

    return NextResponse.json({
      success: true,
      fileName: uploadResult.fileName,
      fileUrl: uploadResult.fileUrl
    })
  } catch (error) {
    console.error('Error uploading image:', error)
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 }
    )
  }
} 