import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';
import { sendDiscordNotification } from '@/lib/notifications/discord';

// Configure upload directory
const UPLOAD_DIR = process.env.UPLOAD_DIR || './public/uploads';
const MAX_IMAGE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '10485760'); // 10MB for images
const MAX_AUDIO_SIZE = 50 * 1024 * 1024; // 50MB for audio

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
const ALLOWED_AUDIO_TYPES = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/webm', 'audio/x-wav', 'audio/x-m4a', 'audio/mp4'];

// POST - Upload file (image or audio)
export async function POST(request: Request) {
  try {
    const session = await auth();
    
    // session check removed to allow registration upload
    // if (!session) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const alt = formData.get('alt') as string || '';
    const uploadType = formData.get('type') as string || 'image'; // 'image' or 'audio'

    if (!file) {
      return NextResponse.json({ error: 'ไม่พบไฟล์' }, { status: 400 });
    }

    // Determine file type category
    const isAudio = uploadType === 'audio' || file.type.startsWith('audio/');
    const allowedTypes = isAudio ? ALLOWED_AUDIO_TYPES : ALLOWED_IMAGE_TYPES;
    const maxSize = isAudio ? MAX_AUDIO_SIZE : MAX_IMAGE_SIZE;
    const typeLabel = isAudio ? 'audio' : 'image';
    const subDir = isAudio ? 'audio' : '';

    // Validate file type
    if (!allowedTypes.includes(file.type)) {
      const supportedFormats = isAudio 
        ? 'MP3, WAV, OGG, M4A' 
        : 'JPG, PNG, GIF, WebP, SVG';
      return NextResponse.json(
        { error: `รองรับเฉพาะไฟล์ ${supportedFormats}` },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `ไฟล์ใหญ่เกินไป (สูงสุด ${maxSize / 1024 / 1024}MB)` },
        { status: 400 }
      );
    }

    // Create upload directory if not exists
    const uploadPath = subDir 
      ? path.resolve(UPLOAD_DIR, subDir) 
      : path.resolve(UPLOAD_DIR);
      
    if (!existsSync(uploadPath)) {
      await mkdir(uploadPath, { recursive: true });
    }

    // Generate unique filename
    const ext = path.extname(file.name);
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const filename = `${timestamp}-${random}${ext}`;
    const filePath = path.join(uploadPath, filename);

    // Write file to disk
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Build URL
    const fileUrl = subDir 
      ? `/uploads/${subDir}/${filename}` 
      : `/uploads/${filename}`;

    // Save to database
    const media = await prisma.media.create({
      data: {
        filename,
        url: fileUrl,
        type: typeLabel,
        size: file.size,
        width: null,
        height: null,
        alt,
        uploadedBy: session?.user?.id || null,
      },
    });

    // Send Discord notification for admin uploads (non-blocking)
    if (session?.user?.role === 'ADMIN') {
      sendDiscordNotification({
        type: 'upload',
        data: {
          fileName: filename,
          fileType: typeLabel,
          fileUrl: fileUrl,
          userName: session.user.name || session.user.email,
        },
      }).catch(console.error);
    }

    return NextResponse.json({
      success: true,
      url: media.url,
      media: {
        id: media.id,
        url: media.url,
        filename: media.filename,
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'อัพโหลดไม่สำเร็จ' }, { status: 500 });
  }
}

// GET - List all uploaded images
export async function GET(request: Request) {
  try {
    const session = await auth();
    
    // Allow public read? Or restrict? 
    // ImageUpload fetches list. Public shouldn't see all uploads.
    // So GET requires session.
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const type = searchParams.get('type') || 'image';

    const [media, total] = await Promise.all([
      prisma.media.findMany({
        where: { type },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: (page - 1) * limit,
      }),
      prisma.media.count({ where: { type } }),
    ]);

    return NextResponse.json({
      media,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching media:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 });
  }
}
