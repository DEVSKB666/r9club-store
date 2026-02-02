import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { sendDiscordNotification } from '@/lib/notifications/discord';

// GET - List all products (admin)
export async function GET() {
  const session = await auth();
  
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const products = await prisma.product.findMany({
    include: { category: true },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(products);
}

// POST - Create new product
export async function POST(request: NextRequest) {
  const session = await auth();
  
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await request.json();

    const product = await prisma.product.create({
      data: {
        title: data.title,
        artist: data.artist,
        description: data.description || null,
        price: data.price,
        coverImage: data.coverImage,
        sampleAudioUrl: data.sampleAudioUrl,
        fullAudioUrl: data.fullAudioUrl,
        categoryId: data.categoryId || null,
        isActive: data.isActive ?? true,
        isFeatured: data.isFeatured ?? false,
      },
    });

    // Send Discord notification (non-blocking)
    sendDiscordNotification({
      type: 'product_add',
      data: {
        productTitle: product.title,
        productArtist: product.artist,
        productPrice: product.price,
        productCover: product.coverImage,
      },
    }).catch(console.error);

    return NextResponse.json(product);
  } catch (error) {
    console.error('Create product error:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
