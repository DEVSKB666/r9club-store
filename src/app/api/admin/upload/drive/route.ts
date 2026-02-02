import { NextRequest, NextResponse } from 'next/server';
import { uploadFile } from '@/lib/google-drive';
import { auth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    console.log('Start Upload Drive API');
    const session = await auth();
    
    // Check authentication and admin role
    if (!session || (session.user as any).role !== 'ADMIN') {
      console.log('Unauthorized access');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      console.log('No file received');
      return NextResponse.json({ error: 'ไม่พบไฟล์' }, { status: 400 });
    }
    
    console.log(`Received file: ${file.name}, Size: ${file.size}, Type: ${file.type}`);

    // Checking file type (allow zip, rar, 7z, mp3, wav, flac)
    const allowedTypes = [
      'application/zip', 
      'application/x-zip-compressed', 
      'application/x-rar-compressed',
      'application/x-7z-compressed',
      'audio/mpeg', 
      'audio/wav', 
      'audio/flac',
      'audio/x-m4a'
    ];

    // Optional: Allow all types for flexibility, or strict check
    // if (!allowedTypes.includes(file.type)) { ... }

    const result = await uploadFile(file, file.name, file.type);
    console.log('Upload success:', result);

    return NextResponse.json({
      success: true,
      url: `gdrive://${result.id}`,
      ...result
    });
  } catch (error) {
    console.error('Upload error details:', error);
    return NextResponse.json(
      { error: `ไม่สามารถอัพโหลดไฟล์ได้: ${(error as Error).message}` }, 
      { status: 500 }
    );
  }
}
