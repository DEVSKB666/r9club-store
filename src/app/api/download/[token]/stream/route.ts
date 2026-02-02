import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { jwtVerify } from 'jose';
import { downloadFile, extractFileId } from '@/lib/google-drive';

// Verify the email verification token
async function verifyToken(token: string) {
  try {
    const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return payload as { email: string; type: string; relatedId?: string };
  } catch {
    return null;
  }
}

// GET - Stream download file from Google Drive
export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  const session = await auth();
  
  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    // Get download record
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

    // If download has verifiedEmail, require email verification
    if (download.verifiedEmail) {
      const verificationToken = request.nextUrl.searchParams.get('vt');
      
      if (!verificationToken) {
        return NextResponse.json(
          { error: 'ต้องยืนยันอีเมลก่อนดาวน์โหลด', requireVerification: true },
          { status: 403 }
        );
      }

      const tokenData = await verifyToken(verificationToken);
      
      if (!tokenData) {
        return NextResponse.json(
          { error: 'Token หมดอายุ กรุณายืนยันอีเมลใหม่', requireVerification: true },
          { status: 403 }
        );
      }

      if (tokenData.email !== download.verifiedEmail) {
        return NextResponse.json(
          { error: 'อีเมลไม่ตรงกับที่ใช้ตอนซื้อ' },
          { status: 403 }
        );
      }
    }

    // Extract Google Drive file ID
    const fileId = extractFileId(download.product.fullAudioUrl);

    if (!fileId) {
      // If not a Google Drive URL, redirect to the direct URL
      await prisma.download.update({
        where: { id: download.id },
        data: { downloadCount: { increment: 1 } },
      });
      return NextResponse.redirect(download.product.fullAudioUrl);
    }

    // Download from Google Drive
    const { stream, metadata } = await downloadFile(fileId);

    // Increment download count
    await prisma.download.update({
      where: { id: download.id },
      data: { downloadCount: { increment: 1 } },
    });

    // Create response with file stream
    const headers = new Headers();
    headers.set('Content-Type', metadata.mimeType);
    headers.set('Content-Disposition', `attachment; filename="${encodeURIComponent(metadata.name)}"`);
    
    if (metadata.size && metadata.size !== '0') {
      headers.set('Content-Length', metadata.size);
    }

    // Convert Node.js Readable to Web ReadableStream
    const webStream = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          controller.enqueue(chunk);
        }
        controller.close();
      },
    });

    return new Response(webStream, { headers });
  } catch (error) {
    console.error('Download stream error:', error);
    return NextResponse.json({ error: 'ดาวน์โหลดล้มเหลว' }, { status: 500 });
  }
}
