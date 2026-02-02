import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

// GET - Get single product
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: { category: true },
  });

  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  return NextResponse.json(product);
}

// PUT - Update product
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await request.json();

    const product = await prisma.product.update({
      where: { id: params.id },
      data: {
        title: data.title,
        artist: data.artist,
        description: data.description || null,
        price: data.price,
        coverImage: data.coverImage,
        sampleAudioUrl: data.sampleAudioUrl,
        fullAudioUrl: data.fullAudioUrl,
        categoryId: data.categoryId || null,
        isActive: data.isActive,
        isFeatured: data.isFeatured,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error('Update product error:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

// DELETE - Delete product
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id },
    });

    if (!product) {
      return NextResponse.json({ error: 'ไม่พบสินค้า' }, { status: 404 });
    }

    // Check if product has any orders
    const orderCount = await prisma.orderItem.count({
      where: { productId: params.id },
    });

    if (orderCount > 0) {
      return NextResponse.json(
        { error: 'ไม่สามารถลบสินค้าที่มีคำสั่งซื้อแล้วได้' },
        { status: 400 }
      );
    }

    // Delete related cart items and downloads first
    await prisma.cartItem.deleteMany({ where: { productId: params.id } });
    await prisma.download.deleteMany({ where: { productId: params.id } });

    // Delete product
    await prisma.product.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการลบ' }, { status: 500 });
  }
}
