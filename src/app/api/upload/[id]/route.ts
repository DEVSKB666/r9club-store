import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { unlink } from 'fs/promises';
import path from 'path';

const UPLOAD_DIR = process.env.UPLOAD_DIR || './public/uploads';

// DELETE - Remove media file
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const media = await prisma.media.findUnique({
      where: { id: params.id },
    });

    if (!media) {
      return NextResponse.json({ error: 'ไม่พบไฟล์' }, { status: 404 });
    }

    // Only admin or uploader can delete
    if (session.user.role !== 'ADMIN' && media.uploadedBy !== session.user.id) {
      return NextResponse.json({ error: 'ไม่มีสิทธิ์ลบ' }, { status: 403 });
    }

    // Delete file from disk
    try {
      const filePath = path.join(path.resolve(UPLOAD_DIR), media.filename);
      await unlink(filePath);
    } catch (e) {
      console.error('Error deleting file:', e);
    }

    // Delete from database
    await prisma.media.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting media:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 });
  }
}
