import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Get all slides (admin)
export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const slides = await prisma.slide.findMany({
      orderBy: { order: 'asc' },
    });

    return NextResponse.json(slides);
  } catch (error) {
    console.error('Error fetching slides:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 });
  }
}

// POST - Create new slide
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, imageUrl, linkUrl, buttonText, order, isActive } = body;

    if (!imageUrl) {
      return NextResponse.json({ error: 'กรุณาเลือกรูปภาพ' }, { status: 400 });
    }

    const slide = await prisma.slide.create({
      data: {
        title,
        description,
        imageUrl,
        linkUrl,
        buttonText,
        order: order || 0,
        isActive: isActive !== false,
      },
    });

    return NextResponse.json(slide);
  } catch (error) {
    console.error('Error creating slide:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 });
  }
}

// PUT - Update slide
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, title, description, imageUrl, linkUrl, buttonText, order, isActive } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing slide ID' }, { status: 400 });
    }

    const slide = await prisma.slide.update({
      where: { id },
      data: {
        title,
        description,
        imageUrl,
        linkUrl,
        buttonText,
        order,
        isActive,
      },
    });

    return NextResponse.json(slide);
  } catch (error) {
    console.error('Error updating slide:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 });
  }
}

// DELETE - Delete slide
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing slide ID' }, { status: 400 });
    }

    await prisma.slide.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting slide:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 });
  }
}
