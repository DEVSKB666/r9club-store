import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { extractFileId, downloadFile } from '@/lib/google-drive';

// GET - Download file with secure token
export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  const session = await auth();
  
  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    const download = await prisma.download.findUnique({
      where: { secureToken: params.token },
      include: { product: true },
    });

    if (!download) {
      return NextResponse.json({ error: 'ลิงก์ดาวน์โหลดไม่ถูกต้อง' }, { status: 404 });
    }

    // Verify user owns this download
    if (download.userId !== session.user.id) {
      return NextResponse.json({ error: 'ไม่มีสิทธิ์ดาวน์โหลด' }, { status: 403 });
    }

    // Check expiry
    if (new Date(download.expiresAt) < new Date()) {
      return NextResponse.json({ error: 'ลิงก์ดาวน์โหลดหมดอายุแล้ว' }, { status: 410 });
    }

    // Check download count
    if (download.downloadCount >= 5) {
      return NextResponse.json({ error: 'ครบจำนวนดาวน์โหลดแล้ว' }, { status: 410 });
    }

    // Increment download count
    await prisma.download.update({
      where: { id: download.id },
      data: { downloadCount: { increment: 1 } },
    });

    // Redirect to the full audio file or stream from Drive
    const fileUrl = download.product.fullAudioUrl;

    // Check if it's a Google Drive file
    const driveId = extractFileId(fileUrl);
    if (driveId) {
      try {
        const { stream, metadata } = await downloadFile(driveId);
        
        // Stream the file to the user
        return new NextResponse(stream as any, {
          headers: {
            'Content-Type': metadata.mimeType,
            'Content-Disposition': `attachment; filename="${encodeURIComponent(metadata.name)}"`,
            'Content-Length': metadata.size,
          },
        });
      } catch (err) {
        console.error('Google Drive download error:', err);
        return NextResponse.json({ error: 'ไฟล์ต้นฉบับมีปัญหา หรือไฟล์ถูกลบไปแล้ว' }, { status: 404 });
      }
    }

    // If local or other URL, redirect
    return NextResponse.redirect(fileUrl);
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json({ error: 'ดาวน์โหลดล้มเหลว' }, { status: 500 });
  }
}
