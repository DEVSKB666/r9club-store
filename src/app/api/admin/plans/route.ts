import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

// GET - List all plans (public)
export async function GET() {
  const plans = await prisma.plan.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
  });

  return NextResponse.json(plans);
}

// POST - Create new plan (admin only)
export async function POST(request: NextRequest) {
  const session = await auth();
  
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await request.json();

    const plan = await prisma.plan.create({
      data: {
        name: data.name,
        price: data.price,
        period: data.period || 'month',
        icon: data.icon,
        color: data.color || '#facc15',
        features: JSON.stringify(data.features || []),
        buttonText: data.buttonText,
        buttonUrl: data.buttonUrl,
        isPopular: data.isPopular || false,
        isActive: data.isActive ?? true,
        order: data.order || 0,
      },
    });

    revalidatePath('/admin/plans');
    revalidatePath('/');

    return NextResponse.json(plan);
  } catch (error) {
    console.error('Create plan error:', error);
    return NextResponse.json({ error: 'Failed to create plan' }, { status: 500 });
  }
}
